import re

from db_connection import get_connection
from backend.auth.password_handler import hash_password
from backend.auth.permissions import VALID_ROLES


VALID_STATUSES = ["Active", "Inactive", "Locked"]


def _write_audit(cursor, user_id, actor_email, action, details):
    cursor.execute(
        """
        INSERT INTO audit_logs
            (user_id, actor_email, action, details)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (user_id, actor_email, action, details)
    )


def get_users(search="", role="", status=""):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                r.role_name,
                u.account_status,
                u.last_login,
                u.created_at
            FROM users u
            INNER JOIN roles r ON u.role_id = r.role_id
            WHERE 1 = 1
        """
        params = []

        if search:
            query += " AND (u.full_name LIKE %s OR u.email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        if role:
            query += " AND r.role_name = %s"
            params.append(role)

        if status:
            query += " AND u.account_status = %s"
            params.append(status)

        query += " ORDER BY u.created_at DESC"

        cursor.execute(query, tuple(params))
        return cursor.fetchall(), None

    except Exception:
        return None, "Unable to retrieve users."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_role_names():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT role_id, role_name, description FROM roles ORDER BY role_id"
        )

        return cursor.fetchall(), None

    except Exception:
        return None, "Unable to retrieve roles."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def create_user(full_name, email, password, role_name,
                actor_id, actor_email):
    full_name = (full_name or "").strip()
    email = (email or "").strip().lower()
    role_name = (role_name or "").strip()

    if not full_name:
        return None, "Full name is required."

    if len(full_name) > 150:
        return None, "Full name must not exceed 150 characters."

    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return None, "Enter a valid email address."

    if len(email) > 150:
        return None, "Email must not exceed 150 characters."

    if not password or len(password) < 8:
        return None, "Password must be at least 8 characters."

    if role_name not in VALID_ROLES:
        return None, "Invalid user role."

    connection = None
    cursor = None

    try:
        connection = get_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT role_id FROM roles WHERE role_name = %s",
            (role_name,)
        )
        role = cursor.fetchone()

        if not role:
            connection.rollback()
            return None, "The selected role does not exist."

        cursor.execute(
            """
            INSERT INTO users
                (role_id, full_name, email, password_hash, account_status)
            VALUES (%s, %s, %s, %s, 'Active')
            """,
            (
                role["role_id"],
                full_name,
                email,
                hash_password(password)
            )
        )

        new_user_id = cursor.lastrowid

        _write_audit(
            cursor,
            actor_id,
            actor_email,
            "Admin staff creation",
            f"Created user {email} with role {role_name}."
        )

        connection.commit()

        return {
            "user_id": new_user_id,
            "full_name": full_name,
            "email": email,
            "role": role_name,
            "account_status": "Active"
        }, None

    except Exception:
        if connection:
            connection.rollback()
        return None, "Unable to create user. Check whether the email is already registered."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



def update_user(user_id, full_name, email, role_name, account_status,
                actor_id, actor_email):

    full_name = (full_name or "").strip()
    email = (email or "").strip().lower()
    role_name = (role_name or "").strip()
    account_status = (account_status or "").strip()

    if not full_name or len(full_name) > 150:
        return None, "Enter a valid full name."

    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return None, "Enter a valid email address."

    if len(email) > 150:
        return None, "Email must not exceed 150 characters."

    if role_name not in VALID_ROLES:
        return None, "Invalid user role."

    if account_status not in VALID_STATUSES:
        return None, "Invalid account status."

    connection = None
    cursor = None

    try:
        connection = get_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.account_status,
                r.role_name
            FROM users u
            INNER JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = %s
            FOR UPDATE
            """,
            (user_id,)
        )
        existing = cursor.fetchone()

        if not existing:
            connection.rollback()
            return None, "User was not found."

        if int(user_id) == int(actor_id):
            if role_name != existing["role_name"]:
                connection.rollback()
                return None, "You cannot change your own Admin role."

            if account_status != existing["account_status"]:
                connection.rollback()
                return None, "You cannot change your own account status."

        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s AND user_id != %s",
            (email, user_id)
        )
        if cursor.fetchone():
            connection.rollback()
            return None, "That email address is already registered."

        is_active_admin = (
            existing["role_name"] == "Admin"
            and existing["account_status"] == "Active"
        )

        will_remain_active_admin = (
            role_name == "Admin" and account_status == "Active"
        )

        if is_active_admin and not will_remain_active_admin:
            cursor.execute(
                """
                SELECT u.user_id
                FROM users u
                INNER JOIN roles r ON u.role_id = r.role_id
                WHERE r.role_name = 'Admin'
                  AND u.account_status = 'Active'
                FOR UPDATE
                """
            )
            active_admins = cursor.fetchall()

            if len(active_admins) <= 1:
                connection.rollback()
                return None, "The system must retain at least one active Admin."

        cursor.execute(
            "SELECT role_id FROM roles WHERE role_name = %s",
            (role_name,)
        )
        role = cursor.fetchone()

        if not role:
            connection.rollback()
            return None, "The selected role does not exist."

        # ================= SAVE USER CHANGES =================
        cursor.execute(
            """
            UPDATE users
            SET full_name = %s,
                email = %s,
                role_id = %s,
                account_status = %s
            WHERE user_id = %s
            """,
            (full_name, email, role["role_id"], account_status, user_id)
        )

        # ================= BUILD AUDIT DETAILS =================
        changes = []

        if existing["full_name"] != full_name:
            changes.append(
                f"Name: {existing['full_name']} → {full_name}"
            )

        if existing["email"] != email:
            changes.append(
                f"Email: {existing['email']} → {email}"
            )

        if existing["role_name"] != role_name:
            changes.append(
                f"Role: {existing['role_name']} → {role_name}"
            )

        if existing["account_status"] != account_status:
            changes.append(
                f"Account Status: {existing['account_status']} → {account_status}"
            )

        # ================= WRITE AUDIT LOG =================
        if changes:
            detail = (
                f"Name: {full_name}\n"
                f"User ID: {user_id}\n"
                + "\n".join(changes)
            )

            _write_audit(
                cursor,
                actor_id,
                actor_email,
                "Admin user update",
                detail
            )

        connection.commit()

        return {
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "role": role_name,
            "account_status": account_status
        }, None

    except Exception:
        if connection:
            connection.rollback()
        return None, "Unable to update user."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def reset_user_password(user_id, new_password,
                        actor_id, actor_email):
    if not new_password or len(new_password) < 8:
        return False, "Password must be at least 8 characters."

    connection = None
    cursor = None

    try:
        connection = get_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT user_id, email FROM users WHERE user_id = %s FOR UPDATE",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            connection.rollback()
            return False, "User was not found."

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s
            WHERE user_id = %s
            """,
            (hash_password(new_password), user_id)
        )

        _write_audit(
            cursor,
            actor_id,
            actor_email,
            "Admin user password reset",
            f"Password reset for user ID {user_id} ({user['email']})."
        )

        connection.commit()
        return True, None

    except Exception:
        if connection:
            connection.rollback()
        return False, "Unable to reset the user's password."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_audit_logs(search="", action="", limit=100):
    connection = None
    cursor = None

    try:
        limit = max(1, min(int(limit), 200))
        search = (search or "").strip()
        action = (action or "").strip()

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                audit_id,
                user_id,
                actor_email,
                action,
                details,
                created_at
            FROM audit_logs
            WHERE 1 = 1
        """
        params = []

        if search:
            query += """
                AND (
                    actor_email LIKE %s
                    OR action LIKE %s
                    OR details LIKE %s
                )
            """
            term = f"%{search}%"
            params.extend([term, term, term])

        if action:
            query += " AND action = %s"
            params.append(action)

        query += " ORDER BY created_at DESC, audit_id DESC LIMIT %s"
        params.append(limit)

        cursor.execute(query, tuple(params))
        return cursor.fetchall(), None

    except Exception:
        return None, "Unable to retrieve audit logs."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_audit_actions():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT DISTINCT action
            FROM audit_logs
            WHERE action IS NOT NULL
              AND action <> ''
            ORDER BY action ASC
        """)

        rows = cursor.fetchall()

        return [row["action"] for row in rows], None

    except Exception:
        return None, "Unable to retrieve audit action types."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



def get_analytics_summary():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # ==========================================
        # 1. REQUEST TOTALS
        # ==========================================

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_requests,
                COALESCE(SUM(total_fee), 0) AS total_fees,
                SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) AS submitted,
                SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END) AS under_review,
                SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) AS processing,
                SUM(CASE WHEN status = 'Ready for Pickup' THEN 1 ELSE 0 END) AS ready_for_pickup,
                SUM(CASE WHEN status = 'Released' THEN 1 ELSE 0 END) AS released,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
                SUM(CASE WHEN status = 'On Hold' THEN 1 ELSE 0 END) AS on_hold
            FROM document_requests
            """
        )

        totals = cursor.fetchone()

        # ==========================================
        # 2. POPULAR DOCUMENTS
        # ==========================================

        cursor.execute(
            """
            SELECT
                d.document_name,
                COUNT(dr.request_id) AS request_count
            FROM document_requests dr
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            GROUP BY d.document_id, d.document_name
            ORDER BY request_count DESC, d.document_name ASC
            """
        )

        popular_documents = cursor.fetchall()

        # ==========================================
        # 3. MONTHLY REQUESTS
        # ==========================================

        cursor.execute(
            """
            SELECT
                DATE_FORMAT(submitted_at, '%Y-%m') AS month,
                COUNT(*) AS request_count,
                SUM(
                    CASE
                        WHEN status = 'Released' THEN 1
                        ELSE 0
                    END
                ) AS released_count
            FROM document_requests
            WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
            ORDER BY month ASC
            """
        )

        monthly_requests = cursor.fetchall()

        # ==========================================
        # 4. USERS BY ROLE
        # ==========================================

        cursor.execute(
            """
            SELECT
                r.role_name,
                COUNT(u.user_id) AS total_users
            FROM roles r
            LEFT JOIN users u
                ON u.role_id = r.role_id
            GROUP BY r.role_id, r.role_name
            ORDER BY r.role_id
            """
        )

        users_by_role = cursor.fetchall()

        # ==========================================
        # 5. AVERAGE TURNAROUND TIME
        # ==========================================

        cursor.execute(
            """
            SELECT
                AVG(
                    TIMESTAMPDIFF(
                        MINUTE,
                        submitted_at,
                        ready_at
                    )
                ) AS average_minutes
            FROM document_requests
            WHERE ready_at IS NOT NULL
            """
        )

        turnaround = cursor.fetchone()

        average_minutes = turnaround["average_minutes"]

        if average_minutes is not None:
            average_minutes = round(float(average_minutes), 1)

            if average_minutes >= 60:
                average_turnaround = (
                    f"{average_minutes / 60:.1f} hrs"
                )
            else:
                average_turnaround = f"{average_minutes:.0f} mins"
        else:
            average_turnaround = "No data"

        # ==========================================
        # 6. RETURN ANALYTICS SUMMARY
        # ==========================================

        return {
            "totals": totals,
            "popular_documents": popular_documents,
            "monthly_requests": monthly_requests,
            "users_by_role": users_by_role,
            "average_turnaround": average_turnaround
        }, None

    except Exception:
        return None, "Unable to retrieve analytics data."

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

ALLOWED_SETTINGS = {
    "system_name",
    "default_processing_preference",
    "demo_mode",
    "qr_token_validity_days"
}


def get_system_settings():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        placeholders = ", ".join(["%s"] * len(ALLOWED_SETTINGS))
        cursor.execute(
            f"""
            SELECT setting_key, setting_value, updated_at
            FROM system_settings
            WHERE setting_key IN ({placeholders})
            ORDER BY setting_key
            """,
            tuple(sorted(ALLOWED_SETTINGS))
        )

        return cursor.fetchall(), None

    except Exception:
        return None, "Unable to retrieve system settings."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def update_system_setting(setting_key, setting_value,
                          actor_id, actor_email):
    setting_key = (setting_key or "").strip()
    setting_value = str(setting_value).strip()

    if setting_key not in ALLOWED_SETTINGS:
        return False, "This setting cannot be modified."

    if not setting_value:
        return False, "Setting value is required."

    if setting_key == "system_name" and len(setting_value) > 100:
        return False, "System name must not exceed 100 characters."

    if setting_key == "default_processing_preference":
        allowed_preferences = {
            "Within 1 week",
            "Within 2 weeks",
            "Within 3 weeks"
        }
        if setting_value not in allowed_preferences:
            return False, "Invalid processing preference."

    if setting_key == "demo_mode" and setting_value.lower() not in {
        "true", "false"
    }:
        return False, "Demo mode must be true or false."

    if setting_key == "qr_token_validity_days":
        if not setting_value.isdigit():
            return False, "QR validity must be a whole number."
        if not 1 <= int(setting_value) <= 30:
            return False, "QR validity must be between 1 and 30 days."

    connection = None
    cursor = None

    try:
        connection = get_connection()
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT setting_value
            FROM system_settings
            WHERE setting_key = %s
            FOR UPDATE
            """,
            (setting_key,)
        )
        existing = cursor.fetchone()

        if not existing:
            connection.rollback()
            return False, "Setting was not found."

        old_value = existing["setting_value"]

        cursor.execute(
            """
            UPDATE system_settings
            SET setting_value = %s
            WHERE setting_key = %s
            """,
            (setting_value, setting_key)
        )

        _write_audit(
            cursor,
            actor_id,
            actor_email,
            "Admin setting update",
            (
                f"Updated setting {setting_key}: "
                f"{old_value} -> {setting_value}."
            )
        )

        connection.commit()
        return True, None

    except Exception:
        if connection:
            connection.rollback()
        return False, "Unable to update system setting."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()




def get_all_requests():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                dr.*,
                d.document_name
            FROM document_requests dr
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            ORDER BY dr.submitted_at DESC
        """)

        requests = cursor.fetchall()

        # Convert date/time values into JSON-compatible strings
        for record in requests:
            for key, value in record.items():
                if hasattr(value, "isoformat"):
                    record[key] = value.isoformat()

                elif hasattr(value, "as_tuple"):
                    record[key] = float(value)

        return requests, None

    except Exception as e:
        print("Error retrieving admin requests:", e)
        return None, "Unable to retrieve request records."

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()




def get_admin_live_feed(limit=10):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                dr.request_id,
                dr.status,
                dr.submitted_at,
                d.document_name,
                u.full_name AS student_name
            FROM document_requests dr
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            INNER JOIN students s
                ON dr.student_id = s.student_id
            INNER JOIN users u
                ON s.user_id = u.user_id
            WHERE dr.submitted_at IS NOT NULL
            ORDER BY dr.submitted_at DESC;
            LIMIT %s
        """, (limit,))

        activities = cursor.fetchall()

        for activity in activities:
            if activity.get("submitted_at"):
                activity["submitted_at"] = (
                    activity["submitted_at"].isoformat()
                )

        return activities, None

    except Exception as e:
        print("Error retrieving admin live feed:", e)
        return None, "Unable to retrieve admin activity."

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()



def get_report_data():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                dr.request_id,
                dr.reference_number,
                dr.status,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at,
                dr.total_fee,
                dr.quantity,
                d.document_name,
                s.student_number,
                s.program,
                s.year_level,
                u.full_name AS student_name
            FROM document_requests dr
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            INNER JOIN students s
                ON dr.student_id = s.student_id
            INNER JOIN users u
                ON s.user_id = u.user_id
            ORDER BY dr.submitted_at DESC
        """)

        requests = cursor.fetchall()

        for r in requests:
            if r.get("submitted_at"):
                r["submitted_at"] = r["submitted_at"].isoformat()

            if r.get("ready_at"):
                r["ready_at"] = r["ready_at"].isoformat()

            if r.get("released_at"):
                r["released_at"] = r["released_at"].isoformat()

            r["total_fee"] = float(r["total_fee"] or 0)

        return requests, None

    except Exception as e:
        print("Error retrieving report data:", e)
        return None, "Unable to retrieve report data."

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()
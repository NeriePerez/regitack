from db_connection import get_connection
from backend.auth.password_handler import verify_password
from flask_login import UserMixin


class AuthUser(UserMixin):

    def __init__(self, user_data):
        self.id = user_data["user_id"]
        self.user_id = user_data["user_id"]
        self.full_name = user_data["full_name"]
        self.email = user_data["email"]
        self.role = user_data["role_name"]
        self.account_status = user_data["account_status"]

    @property
    def is_active(self):
        return self.account_status == "Active"


def get_user_by_id(user_id):
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
                u.account_status,
                r.role_name
            FROM users u
            INNER JOIN roles r
                ON u.role_id = r.role_id
            WHERE u.user_id = %s
        """

        cursor.execute(query, (user_id,))
        user_data = cursor.fetchone()

        if user_data:
            return AuthUser(user_data)

        return None

    except Exception as error:
        print(f"User retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

def _write_audit(cursor, user_id, actor_email, action, details):
    cursor.execute(
        """
        INSERT INTO audit_logs
            (user_id, actor_email, action, details)
        VALUES (%s, %s, %s, %s)
        """,
        (user_id, actor_email, action, details)
    )

def authenticate_user(email, password):
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
                u.password_hash,
                u.account_status,
                r.role_name
            FROM users u
            INNER JOIN roles r
                ON u.role_id = r.role_id
            WHERE u.email = %s
            LIMIT 1
        """

        cursor.execute(query, (email,))
        user_data = cursor.fetchone()

        if not user_data:
            return None

        if user_data["account_status"] != "Active":
            return None

        if not verify_password(
            password,
            user_data["password_hash"]
        ):
            return None

        # Update last login
        update_query = """
            UPDATE users
            SET last_login = NOW()
            WHERE user_id = %s
        """

        cursor.execute(
            update_query,
            (user_data["user_id"],)
        )

         # =====================================
        # 2. WRITE LOGIN AUDIT LOG
        # =====================================

        detail = (
            f"{user_data['full_name']}({user_data['role_name']}) logged in successfully."
        )

        _write_audit(
            cursor,
            user_data["user_id"],
            user_data["email"],
            "User login",
            detail
        )

        connection.commit()

        return AuthUser(user_data)

    except Exception as error:
        if connection:
            connection.rollback()

        print(f"Authentication error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

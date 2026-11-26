
from datetime import date, timedelta

from db_connection import get_connection


def get_registrar_dashboard(user_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Verify that the logged-in account is Registrar Staff.
        cursor.execute(
            """
            SELECT r.role_name
            FROM users u
            INNER JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = %s
              AND u.account_status = 'Active'
            LIMIT 1
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user or user["role_name"] != "Registrar Staff":
            return None, "You are not authorized to access the registrar dashboard."

        # ==========================================
        # 1. REQUEST STATISTICS
        # ==========================================

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_requests,

                COALESCE(SUM(status = 'Submitted'), 0)
                    AS pending_requests,

                COALESCE(SUM(status = 'Under Review'), 0)
                    AS under_review_requests,

                COALESCE(SUM(status = 'Processing'), 0)
                    AS processing_requests,

                COALESCE(SUM(status = 'Ready for Pickup'), 0)
                    AS ready_requests,

                COALESCE(SUM(status = 'Released'), 0)
                    AS released_requests,

                COALESCE(SUM(status = 'Rejected'), 0)
                    AS rejected_requests,

                COALESCE(SUM(status = 'Cancelled'), 0)
                    AS cancelled_requests,

                COALESCE(SUM(status = 'On Hold'), 0)
                    AS on_hold_requests

            FROM document_requests
            """
        )

        statistics = cursor.fetchone()

        total = int(statistics["total_requests"] or 0)

        pending = int(statistics["pending_requests"] or 0)
        under_review = int(statistics["under_review_requests"] or 0)
        processing = int(statistics["processing_requests"] or 0)
        ready = int(statistics["ready_requests"] or 0)
        released = int(statistics["released_requests"] or 0)
        rejected = int(statistics["rejected_requests"] or 0)
        cancelled = int(statistics["cancelled_requests"] or 0)
        on_hold = int(statistics["on_hold_requests"] or 0)

        # Requests considered cleared:
        # Ready for Pickup + Released
        cleared = ready + released

        completion_rate = (
            round((cleared / total) * 100)
            if total > 0 else 0
        )

        statistics = {
            "total_requests": total,
            "pending_requests": pending,
            "under_review_requests": under_review,
            "processing_requests": processing,
            "ready_requests": ready,
            "released_requests": released,
            "rejected_requests": rejected,
            "cancelled_requests": cancelled,
            "on_hold_requests": on_hold,
            "cleared_requests": cleared,
            "completion_rate": completion_rate
        }

        # ==========================================
        # 2. RECENT REQUESTS
        # ==========================================

        cursor.execute(
            """
            SELECT
                dr.request_id,
                dr.reference_number,
                dr.status,
                dr.quantity,
                dr.submitted_at,
                s.student_number,
                u.full_name AS student_name,
                d.document_name

            FROM document_requests dr

            INNER JOIN students s
                ON dr.student_id = s.student_id

            INNER JOIN users u
                ON s.user_id = u.user_id

            INNER JOIN documents d
                ON dr.document_id = d.document_id

            ORDER BY
                dr.submitted_at DESC,
                dr.request_id DESC

            LIMIT 6
            """
        )

        recent_requests = cursor.fetchall()

        for request in recent_requests:
            submitted_at = request.get("submitted_at")

            if submitted_at:
                request["submitted_at"] = submitted_at.strftime(
                    "%Y-%m-%d %H:%M:%S"
                )

        # ==========================================
        # 3. WEEKLY THROUGHPUT
        # ==========================================

        today = date.today()

        # Monday of the current week.
        monday = today - timedelta(days=today.weekday())

        sunday = monday + timedelta(days=6)

        # Incoming requests grouped by submission date.
        cursor.execute(
            """
            SELECT
                DATE(submitted_at) AS request_date,
                COUNT(*) AS incoming

            FROM document_requests

            WHERE submitted_at >= %s
              AND submitted_at < %s

            GROUP BY DATE(submitted_at)
            """,
            (
                monday,
                sunday + timedelta(days=1)
            )
        )

        incoming_rows = cursor.fetchall()

        # Approved requests grouped by the date they reached
        # Ready for Pickup or Released.
        cursor.execute(
            """
            SELECT
                DATE(changed_at) AS approval_date,
                COUNT(DISTINCT request_id) AS approved

            FROM request_status_history

            WHERE new_status IN (
                'Ready for Pickup',
                'Released'
            )

              AND changed_at >= %s
              AND changed_at < %s

            GROUP BY DATE(changed_at)
            """,
            (
                monday,
                sunday + timedelta(days=1)
            )
        )

        approved_rows = cursor.fetchall()

        incoming_map = {
            row["request_date"]: int(row["incoming"])
            for row in incoming_rows
        }

        approved_map = {
            row["approval_date"]: int(row["approved"])
            for row in approved_rows
        }

        weekly_throughput = []

        for day_offset in range(7):
            current_day = monday + timedelta(days=day_offset)

            weekly_throughput.append({
                "date": current_day.isoformat(),
                "day": current_day.strftime("%a"),
                "incoming": incoming_map.get(current_day, 0),
                "approved": approved_map.get(current_day, 0)
            })

        # ==========================================
        # 4. AVERAGE TURNAROUND TIME
        # ==========================================

        cursor.execute(
            """
            SELECT
                AVG(
                    TIMESTAMPDIFF(
                        MINUTE,
                        submitted_at,
                        released_at
                    )
                ) AS average_minutes

            FROM document_requests

            WHERE status = 'Released'
              AND released_at IS NOT NULL
              AND submitted_at IS NOT NULL
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

        return {
            "statistics": statistics,
            "recent_requests": recent_requests,
            "weekly_throughput": weekly_throughput,
            "average_turnaround": average_turnaround
        }, None

    except Exception as error:
        print("Registrar dashboard service error:", error)

        return None, "Unable to retrieve dashboard information."

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

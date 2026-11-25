
from db_connection import get_connection


# =========================================
# GET STUDENT INFORMATION
# =========================================

def get_student_by_user_id(user_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                s.student_id,
                s.student_number,
                s.program,
                s.year_level,
                u.user_id,
                u.full_name,
                u.email
            FROM students s
            INNER JOIN users u
                ON s.user_id = u.user_id
            WHERE u.user_id = %s
        """

        cursor.execute(query, (user_id,))
        return cursor.fetchone()

    except Exception as error:
        print(f"Student retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# =========================================
# GET STUDENT DASHBOARD STATISTICS
# =========================================

def get_student_dashboard(user_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                COUNT(*) AS total_requests,

                SUM(status = 'Submitted') AS submitted,
                SUM(status = 'Under Review') AS under_review,
                SUM(status = 'Processing') AS processing,
                SUM(status = 'Ready for Pickup') AS ready_for_pickup,
                SUM(status = 'Released') AS released,
                SUM(status = 'Rejected') AS rejected,
                SUM(status = 'Cancelled') AS cancelled,
                SUM(status = 'On Hold') AS on_hold

            FROM document_requests dr
            INNER JOIN students s
                ON dr.student_id = s.student_id

            WHERE s.user_id = %s
        """

        cursor.execute(query, (user_id,))
        statistics = cursor.fetchone()

        if not statistics:
            return {}

        for key, value in statistics.items():
            statistics[key] = int(value or 0)

        statistics["pending_requests"] = (
            statistics["submitted"]
            + statistics["under_review"]
            + statistics["processing"]
            + statistics["on_hold"]
        )

        return statistics

    except Exception as error:
        print(f"Dashboard retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



def get_recent_requests(user_id, limit=5):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                dr.request_id,
                dr.reference_number,
                dr.document_id,
                d.document_name,
                dr.status,
                dr.total_fee,
                dr.quantity,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at
            FROM document_requests dr
            INNER JOIN students s ON dr.student_id = s.student_id
            INNER JOIN documents d ON dr.document_id = d.document_id
            WHERE s.user_id = %s
            ORDER BY dr.submitted_at DESC, dr.request_id DESC
            LIMIT %s
        """

        cursor.execute(query, (user_id, limit))
        requests_list = cursor.fetchall()

        for item in requests_list:
            item["total_fee"] = float(item["total_fee"] or 0)

        return requests_list

    except Exception as error:
        print(f"Recent requests error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# =========================================
# GET ACTIVE STUDENT REQUEST
# =========================================


def get_active_request(user_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                dr.request_id,
                dr.reference_number,
                d.document_name,
                dr.status,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at,
                dr.quantity,
                dr.total_fee

            FROM document_requests dr

            INNER JOIN students s
                ON dr.student_id = s.student_id

            INNER JOIN documents d
                ON dr.document_id = d.document_id

            WHERE s.user_id = %s

              AND dr.status IN (
                  'Submitted',
                  'Under Review',
                  'Processing',
                  'On Hold'
              )

            ORDER BY
                dr.submitted_at DESC,
                dr.request_id DESC

            LIMIT 1
        """

        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            result["total_fee"] = float(result["total_fee"] or 0)

        return result

    except Exception as error:
        print(f"Active request retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# =========================================
# GET READY-FOR-PICKUP REQUEST
# =========================================


def get_ready_request(user_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                dr.request_id,
                dr.reference_number,
                d.document_name,
                dr.status,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at,
                dr.quantity,
                dr.total_fee

            FROM document_requests dr

            INNER JOIN students s
                ON dr.student_id = s.student_id

            INNER JOIN documents d
                ON dr.document_id = d.document_id

            WHERE s.user_id = %s
              AND dr.status = 'Ready for Pickup'

            ORDER BY
                dr.ready_at DESC,
                dr.request_id DESC

            LIMIT 1
        """

        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            result["total_fee"] = float(result["total_fee"] or 0)

        return result

    except Exception as error:
        print(f"Ready request retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_dashboard_highlights(user_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        
        query = """
            SELECT
                dr.request_id,
                dr.reference_number,
                d.document_name,
                dr.status,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at

            FROM document_requests dr

            INNER JOIN students s
                ON dr.student_id = s.student_id

            INNER JOIN documents d
                ON dr.document_id = d.document_id

            WHERE s.user_id = %s

            ORDER BY
                dr.submitted_at DESC,
                dr.request_id DESC
        """

        cursor.execute(query, (user_id,))
        requests_list = cursor.fetchall()

        active_statuses = [
            "Submitted",
            "Under Review",
            "Processing",
            "On Hold"
        ]

        active_request = next(
            (
                item for item in requests_list
                if item["status"] in active_statuses
            ),
            None
        )

        ready_request = next(
            (
                item for item in requests_list
                if item["status"] == "Ready for Pickup"
            ),
            None
        )

        return {
            "active_request": active_request,
            "ready_request": ready_request
        }

    except Exception as error:
        print(f"Dashboard highlights error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


from backend.requests.request_service import (
    submit_request,
    get_request_by_id
)
from backend.requests.request_history_service import (
    get_request_status_history
)
from db_connection import get_connection


def submit_document_request(user_id, data):
    if not isinstance(data, dict):
        return None, "Invalid request data."

    document_id = data.get("document_id")
    purpose = data.get("purpose")
    quantity = data.get("quantity", 1)

    try:
        document_id = int(document_id)
        quantity = int(quantity)
    except (TypeError, ValueError):
        return None, "Invalid document or quantity."

    if document_id <= 0:
        return None, "Please select a valid document."

    if quantity < 1 or quantity > 20:
        return None, "Quantity must be between 1 and 20."

    if not isinstance(purpose, str) or not purpose.strip():
        return None, "Please provide the purpose of the request."

    if len(purpose.strip()) > 255:
        return None, "Purpose must not exceed 255 characters."

    return submit_request(
        user_id=user_id,
        document_id=document_id,
        purpose=purpose.strip(),
        quantity=quantity
    )


def get_student_requests(user_id):
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
                dr.purpose,
                dr.quantity,
                dr.status,
                dr.total_fee,
                dr.remarks,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at
            FROM document_requests dr
            INNER JOIN students s
                ON dr.student_id = s.student_id
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            WHERE s.user_id = %s
            ORDER BY dr.submitted_at DESC, dr.request_id DESC
        """

        cursor.execute(query, (user_id,))
        requests = cursor.fetchall()

        for item in requests:
            item["total_fee"] = float(item["total_fee"] or 0)

        return requests

    except Exception as error:
        print(f"Student requests error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_request_details(user_id, request_id):
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
                d.document_code,
                dr.purpose,
                dr.quantity,
                dr.status,
                dr.total_fee,
                dr.remarks,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at
            FROM document_requests dr
            INNER JOIN students s
                ON dr.student_id = s.student_id
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            WHERE dr.request_id = %s
              AND s.user_id = %s
            LIMIT 1
        """

        cursor.execute(query, (request_id, user_id))
        request = cursor.fetchone()

        if request:
            request["total_fee"] = float(request["total_fee"] or 0)
            request["status_history"] = (
                get_request_status_history(request_id) or []
            )

        return request

    except Exception as error:
        print(f"Student request details error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

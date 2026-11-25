from db_connection import get_connection


def add_status_history(
    connection,
    request_id,
    previous_status,
    new_status,
    changed_by,
    remarks=None
):
    cursor = None

    try:
        cursor = connection.cursor()

        query = """
            INSERT INTO request_status_history (
                request_id,
                previous_status,
                new_status,
                changed_by,
                remarks,
                changed_at
            )
            VALUES (%s, %s, %s, %s, %s, NOW())
        """

        cursor.execute(
            query,
            (
                request_id,
                previous_status,
                new_status,
                changed_by,
                remarks
            )
        )

        return True

    except Exception as error:
        print(f"Status history insertion error: {error}")
        raise

    finally:
        if cursor:
            cursor.close()


def get_request_status_history(request_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                h.history_id,
                h.request_id,
                h.previous_status,
                h.new_status,
                h.changed_by,
                h.remarks,
                h.changed_at,
                u.full_name AS changed_by_name
            FROM request_status_history h
            LEFT JOIN users u
                ON h.changed_by = u.user_id
            WHERE h.request_id = %s
            ORDER BY h.changed_at ASC, h.history_id ASC
        """

        cursor.execute(query, (request_id,))
        return cursor.fetchall()

    except Exception as error:
        print(f"Request history retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

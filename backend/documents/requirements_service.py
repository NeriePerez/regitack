from db_connection import get_connection


def get_requirements_by_document(document_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                requirement_id,
                document_id,
                requirement_text,
                is_required,
                created_at
            FROM document_requirements
            WHERE document_id = %s
            ORDER BY requirement_id ASC
        """

        cursor.execute(query, (document_id,))
        return cursor.fetchall()

    except Exception as error:
        print(f"Requirements retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

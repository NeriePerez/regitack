
from db_connection import get_connection


def get_available_documents():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                d.document_id,
                d.document_name,
                d.document_code,
                d.description,
                d.processing_days,
                COALESCE(
                    (
                        SELECT df.amount
                        FROM document_fees df
                        WHERE df.document_id = d.document_id
                          AND df.is_active = 1
                          AND df.effective_date <= CURDATE()
                        ORDER BY df.effective_date DESC, df.fee_id DESC
                        LIMIT 1
                    ),
                    0.00
                ) AS fee
            FROM documents d
            WHERE d.is_active = 1
            ORDER BY d.document_name ASC
        """

        cursor.execute(query)
        return cursor.fetchall()

    except Exception as error:
        print(f"Available documents error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_document_by_id(document_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                d.document_id,
                d.document_name,
                d.document_code,
                d.description,
                d.processing_days,
                COALESCE(
                    (
                        SELECT df.amount
                        FROM document_fees df
                        WHERE df.document_id = d.document_id
                          AND df.is_active = 1
                          AND df.effective_date <= CURDATE()
                        ORDER BY df.effective_date DESC, df.fee_id DESC
                        LIMIT 1
                    ),
                    0.00
                ) AS fee
            FROM documents d
            WHERE d.document_id = %s
              AND d.is_active = 1
            LIMIT 1
        """

        cursor.execute(query, (document_id,))
        return cursor.fetchone()

    except Exception as error:
        print(f"Document retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_document_requirements(document_id):
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
                is_required
            FROM document_requirements
            WHERE document_id = %s
            ORDER BY requirement_id ASC
        """

        cursor.execute(query, (document_id,))
        return cursor.fetchall()

    except Exception as error:
        print(f"Document requirements error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

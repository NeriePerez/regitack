from db_connection import get_connection


def get_document_fee(document_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                fee_id,
                document_id,
                amount,
                effective_date
            FROM document_fees
            WHERE document_id = %s
              AND is_active = 1
              AND effective_date <= CURDATE()
            ORDER BY effective_date DESC, fee_id DESC
            LIMIT 1
        """

        cursor.execute(query, (document_id,))
        fee = cursor.fetchone()

        if fee:
            fee["amount"] = float(fee["amount"])

        return fee

    except Exception as error:
        print(f"Document fee error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_document_fee_history(document_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                fee_id,
                document_id,
                amount,
                effective_date,
                is_active,
                created_at
            FROM document_fees
            WHERE document_id = %s
            ORDER BY effective_date DESC, fee_id DESC
        """

        cursor.execute(query, (document_id,))
        fees = cursor.fetchall()

        for fee in fees:
            fee["amount"] = float(fee["amount"])

        return fees

    except Exception as error:
        print(f"Fee history error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

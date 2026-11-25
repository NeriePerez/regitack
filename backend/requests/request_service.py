import re

from db_connection import get_connection
from backend.requests.reference_generator import generate_reference_number
from backend.requests.request_status_service import validate_status_transition
from backend.requests.request_history_service import add_status_history



def submit_request(user_id, document_id, purpose, quantity):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        connection.start_transaction()

        cursor = connection.cursor(dictionary=True)

        # =========================================
        # 1. FIND THE STUDENT
        # =========================================

        cursor.execute(
            """
            SELECT student_id
            FROM students
            WHERE user_id = %s
            LIMIT 1
            """,
            (user_id,)
        )

        student = cursor.fetchone()

        if not student:
            connection.rollback()
            return None, "Student account was not found."

        # =========================================
        # 1.1 CHECK FOR AN EXISTING IDENTICAL REQUEST
        # =========================================

        cursor.execute(
            """
            SELECT
                request_id,
                reference_number,
                document_id,
                quantity,
                total_fee,
                status,
                submitted_at
            FROM document_requests
            WHERE student_id = %s
            AND document_id = %s
            AND TRIM(purpose) = TRIM(%s)
            AND quantity = %s
            AND submitted_at >= NOW() - INTERVAL 30 SECOND
            ORDER BY submitted_at DESC
            LIMIT 1
            """,
            (
                student["student_id"],
                document_id,
                purpose,
                quantity
            )
        )

        existing_request = cursor.fetchone()

        if existing_request:
            connection.rollback()

            total_fee = float(existing_request["total_fee"] or 0)
            existing_quantity = int(existing_request["quantity"])

            return {
                "request_id": existing_request["request_id"],
                "reference_number": existing_request["reference_number"],
                "document_id": existing_request["document_id"],
                "quantity": existing_quantity,
                "unit_fee": (
                    total_fee / existing_quantity
                    if existing_quantity > 0 else 0
                ),
                "total_fee": total_fee,
                "processing_days": None,
                "status": existing_request["status"],
                "already_submitted": True
            }, None

        # =========================================
        # 2. VERIFY DOCUMENT AND GET PROCESSING DAYS
        # =========================================

        cursor.execute(
            """
            SELECT document_id, processing_days
            FROM documents
            WHERE document_id = %s
              AND is_active = 1
            LIMIT 1
            """,
            (document_id,)
        )

        document = cursor.fetchone()

        if not document:
            connection.rollback()
            return None, "The selected document is unavailable."

        # Extract the maximum processing days.
        # Examples:
        # "3-5 days" -> 5
        # "5 days"   -> 5
        # "3–5 days" -> 5

        processing_values = re.findall(
            r"\d+",
            str(document["processing_days"] or "")
        )

        if not processing_values:
            connection.rollback()
            return None, "Processing days are not properly configured for this document."

        processing_days = max(map(int, processing_values))

        # =========================================
        # 3. GET THE CURRENT DOCUMENT FEE
        # =========================================

        cursor.execute(
            """
            SELECT amount
            FROM document_fees
            WHERE document_id = %s
              AND is_active = 1
              AND effective_date <= CURDATE()
            ORDER BY effective_date DESC, fee_id DESC
            LIMIT 1
            """,
            (document_id,)
        )

        fee = cursor.fetchone()

        if not fee:
            connection.rollback()
            return None, "No active fee is configured for this document."

        unit_fee = float(fee["amount"])
        total_fee = unit_fee * quantity

        # =========================================
        # 4. GENERATE A UNIQUE REFERENCE NUMBER
        # =========================================

        reference_number = None

        for attempt in range(5):
            candidate = generate_reference_number()

            cursor.execute(
                """
                SELECT request_id
                FROM document_requests
                WHERE reference_number = %s
                LIMIT 1
                """,
                (candidate,)
            )

            if not cursor.fetchone():
                reference_number = candidate
                break

        if not reference_number:
            connection.rollback()
            return None, "Unable to generate a request reference number."

        # =========================================
        # 5. INSERT INTO DOCUMENT_REQUESTS
        # =========================================

        cursor.execute(
            """
            INSERT INTO document_requests (
                reference_number,
                student_id,
                document_id,
                purpose,
                quantity,
                status,
                total_fee,
                remarks,
                submitted_at,
                ready_at,
                released_at
            )
            VALUES (
                %s, %s, %s, %s, %s,
                'Submitted', %s, NULL, NOW(), NULL, NULL
            )
            """,
            (
                reference_number,
                student["student_id"],
                document_id,
                purpose,
                quantity,
                total_fee
            )
        )

        request_id = cursor.lastrowid

        # =========================================
        # 6. INSERT INTO REQUEST_DETAILS
        # =========================================

        cursor.execute("""
            INSERT INTO request_details (
                details_id,
                reference_code,
                pickup_date,
                progress_step
            )
            VALUES (
                %s,
                %s,
                DATE_ADD(CURDATE(), INTERVAL %s DAY),
                1
            )
        """, (
            request_id,
            reference_number,
            processing_days
        ))
        
        # =========================================
        # 7. RECORD INITIAL STATUS HISTORY
        # =========================================

        add_status_history(
            connection=connection,
            request_id=request_id,
            previous_status=None,
            new_status="Submitted",
            changed_by=user_id,
            remarks="Request submitted by student."
        )

        # =========================================
        # 8. COMMIT BOTH INSERTS
        # =========================================

        connection.commit()

        return {
            "request_id": request_id,
            "reference_number": reference_number,
            "document_id": document_id,
            "quantity": quantity,
            "unit_fee": unit_fee,
            "total_fee": total_fee,
            "processing_days": processing_days,
            "status": "Submitted"
        }, None

    except Exception as error:
        if connection:
            connection.rollback()

        print("=" * 50)
        print("REQUEST SUBMISSION FAILED")
        print(f"ERROR TYPE: {type(error).__name__}")
        print(f"ERROR MESSAGE: {error}")
        print("=" * 50)

        return None, "An error occurred while submitting the request."

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()



def update_request_status(
    request_id,
    new_status,
    changed_by,
    remarks=None
):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        connection.start_transaction()

        cursor = connection.cursor(dictionary=True)

        # Lock the request while updating it.
        cursor.execute(
            """
            SELECT request_id, status
            FROM document_requests
            WHERE request_id = %s
            FOR UPDATE
            """,
            (request_id,)
        )

        request = cursor.fetchone()

        if not request:
            connection.rollback()
            return False, "Request was not found."

        previous_status = request["status"]

        valid, message = validate_status_transition(
            previous_status,
            new_status
        )

        if not valid:
            connection.rollback()
            return False, message

        cursor.execute(
            """
            UPDATE document_requests
            SET
                status = %s,
                remarks = %s,
                ready_at = CASE
                    WHEN %s = 'Ready for Pickup' THEN NOW()
                    ELSE ready_at
                END
            WHERE request_id = %s
            """,
            (
                new_status,
                remarks,
                new_status,
                request_id
            )
        )

        add_status_history(
            connection=connection,
            request_id=request_id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by=changed_by,
            remarks=remarks
        )

        connection.commit()
        return True, "Request status updated successfully."

    except Exception as error:
        if connection:
            connection.rollback()

        print(f"Request status update error: {error}")
        return False, "Unable to update request status."

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


def get_request_by_id(request_id):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                dr.request_id,
                dr.reference_number,
                dr.student_id,
                dr.document_id,
                d.document_name,
                dr.purpose,
                dr.quantity,
                dr.status,
                dr.total_fee,
                dr.remarks,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at,
                s.student_number,
                u.full_name AS student_name,
                u.email AS student_email
            FROM document_requests dr
            INNER JOIN students s
                ON dr.student_id = s.student_id
            INNER JOIN users u
                ON s.user_id = u.user_id
            INNER JOIN documents d
                ON dr.document_id = d.document_id
            WHERE dr.request_id = %s
            LIMIT 1
        """

        cursor.execute(query, (request_id,))
        result = cursor.fetchone()

        if result and result["total_fee"] is not None:
            result["total_fee"] = float(result["total_fee"])

        return result

    except Exception as error:
        print(f"Request retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()





def get_all_requests(search=None, status=None, page=1, per_page=10):
    connection = None
    cursor = None

    try:
        page = max(int(page), 1)
        per_page = min(max(int(per_page), 1), 100)
        offset = (page - 1) * per_page

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        conditions = []
        parameters = []

        if status:
            conditions.append("dr.status = %s")
            parameters.append(status)

        if search:
            search_term = f"%{search.strip()}%"
            conditions.append("""
                (
                    dr.reference_number LIKE %s
                    OR s.student_number LIKE %s
                    OR u.full_name LIKE %s
                    OR d.document_name LIKE %s
                )
            """)
            parameters.extend([search_term] * 4)

        where_clause = (
            "WHERE " + " AND ".join(conditions)
            if conditions else ""
        )

        count_query = f"""
            SELECT COUNT(*) AS total
            FROM document_requests dr
            INNER JOIN students s ON dr.student_id = s.student_id
            INNER JOIN users u ON s.user_id = u.user_id
            INNER JOIN documents d ON dr.document_id = d.document_id
            {where_clause}
        """

        cursor.execute(count_query, tuple(parameters))
        total = cursor.fetchone()["total"]

        data_query = f"""
            SELECT
                dr.request_id,
                dr.reference_number,
                dr.status,
                dr.quantity,
                dr.total_fee,
                dr.submitted_at,
                dr.ready_at,
                dr.released_at,
                s.student_number,
                u.full_name AS student_name,
                d.document_name
            FROM document_requests dr
            INNER JOIN students s ON dr.student_id = s.student_id
            INNER JOIN users u ON s.user_id = u.user_id
            INNER JOIN documents d ON dr.document_id = d.document_id
            {where_clause}
            ORDER BY dr.submitted_at DESC, dr.request_id DESC
            LIMIT %s OFFSET %s
        """

        cursor.execute(
            data_query,
            tuple(parameters) + (per_page, offset)
        )

        records = cursor.fetchall()

        for record in records:
            record["total_fee"] = float(record["total_fee"] or 0)

        return {
            "records": records,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_records": total,
                "total_pages": (total + per_page - 1) // per_page
            }
        }

    except Exception as error:
        print(f"All requests retrieval error: {error}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

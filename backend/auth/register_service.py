import re

from db_connection import get_connection
from backend.auth.password_handler import hash_password


def register_student(full_name, student_number, program, year_level, email, password):

    connection = None
    cursor = None

    try:
        # =====================================
        # 1. BASIC VALIDATION
        # =====================================

        full_name = full_name.strip()
        student_number = student_number.strip()
        email = email.strip().lower()
        program = program.strip()
        year_level = year_level.strip()

        if not all([full_name, student_number, program, year_level, email, password]):
            return None, "All fields are required."

        # Validate Student ID format: YYYY-NNNN
        if not re.fullmatch(r"\d{4}-\d{4}", student_number):
            return None, "Invalid Student ID format. Use YYYY-NNNN (e.g., 2024-0000)."

        if len(full_name) > 255:
            return None, "Full name is too long."

        if len(password) < 8:
            return None, "Password must be at least 8 characters."

        if len(password) > 128:
            return None, "Password is too long."

        if len(program) > 150:
            return None, "Program name is too long."

        if len(year_level) > 50:
            return None, "Invalid year level."

        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            return None, "Please enter a valid email address."

        # =====================================
        # 2. DATABASE CONNECTION
        # =====================================

        connection = get_connection()
        connection.start_transaction()

        cursor = connection.cursor(dictionary=True)

        # =====================================
        # 3. CHECK DUPLICATE STUDENT ID
        # =====================================

        cursor.execute(
            """
            SELECT student_id
            FROM students
            WHERE student_number = %s
            LIMIT 1
            """,
            (student_number,)
        )

        if cursor.fetchone():
            connection.rollback()
            return None, "This Student ID is already registered."

        # =====================================
        # 4. CHECK DUPLICATE EMAIL
        # =====================================

        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE email = %s
            LIMIT 1
            """,
            (email,)
        )

        if cursor.fetchone():
            connection.rollback()
            return None, "This email is already registered."

        # =====================================
        # 5. GET STUDENT ROLE
        # =====================================

        cursor.execute(
            """
            SELECT role_id
            FROM roles
            WHERE role_name = %s
            LIMIT 1
            """,
            ("Student",)
        )

        role = cursor.fetchone()

        if not role:
            connection.rollback()
            return None, "Student role is not configured."

        # =====================================
        # 6. HASH PASSWORD
        # =====================================

        password_hash = hash_password(password)

        # =====================================
        # 7. INSERT INTO USERS TABLE
        # =====================================

        cursor.execute(
            """
            INSERT INTO users (
                full_name,
                email,
                password_hash,
                role_id
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                full_name,
                email,
                password_hash,
                role["role_id"]
            )
        )

        user_id = cursor.lastrowid

        # =====================================
        # 8. INSERT INTO STUDENTS TABLE
        # =====================================

        cursor.execute(
            """
            INSERT INTO students (
                user_id,
                student_number,
                program,
                year_level
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                user_id,
                student_number,
                program,
                year_level
            )
        )

        student_id = cursor.lastrowid

        # =====================================
        # 9. COMMIT BOTH INSERTIONS
        # =====================================

        connection.commit()

        return {
            "user_id": user_id,
            "student_id": student_id,
            "student_number": student_number,
            "full_name": full_name,
            "email": email,
            "program": program,
            "year_level": year_level
        }, None

    except Exception as error:

        if connection:
            connection.rollback()

        print(f"Student registration error: {error}")

        return None, "An error occurred during registration."

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()

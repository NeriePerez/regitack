import mysql.connector
import bcrypt

from config import Config
from db_connection import get_connection


def seed_roles(cursor):
    roles = [
        ("Student", "Student account"),
        ("Registrar Staff", "Registrar personnel"),
        ("Admin", "System administrator")
    ]

    for role_name, description in roles:
        cursor.execute("""
            INSERT INTO roles (role_name, description)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE
                description = VALUES(description)
        """, (role_name, description))


def seed_documents(cursor):
    documents = [
        (
            "Transcript of Records (TOR)",
            "TOR",
            "Official academic transcript",
            7,
            150.00
        ),
        (
            "Form 137",
            "F137",
            "Permanent academic record",
            7,
            100.00
        ),
        (
            "Certificate of Enrollment",
            "COE",
            "Certification of current enrollment",
            3,
            50.00
        ),
        (
            "Certificate of Grades",
            "COG",
            "Certification of academic grades",
            3,
            50.00
        ),
        (
            "Certificate of Good Moral",
            "CGM",
            "Certification of good moral standing",
            5,
            50.00
        )
    ]

    for name, code, description, days, fee in documents:
        cursor.execute("""
            INSERT INTO documents (
                document_name,
                document_code,
                description,
                processing_days
            )
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                document_name = VALUES(document_name),
                description = VALUES(description),
                processing_days = VALUES(processing_days)
        """, (name, code, description, days))

        cursor.execute("""
            SELECT document_id
            FROM documents
            WHERE document_code = %s
        """, (code,))

        document_id = cursor.fetchone()[0]

        cursor.execute("""
            SELECT fee_id
            FROM document_fees
            WHERE document_id = %s
              AND is_active = TRUE
        """, (document_id,))

        existing_fee = cursor.fetchone()

        if existing_fee is None:
            cursor.execute("""
                INSERT INTO document_fees (
                    document_id,
                    amount,
                    effective_date,
                    is_active
                )
                VALUES (%s, %s, CURDATE(), TRUE)
            """, (document_id, fee))


def seed_admin(cursor):
    admin_email = Config.ADMIN_EMAIL.strip().lower()
    admin_password = Config.ADMIN_PASSWORD

    if not admin_password:
        raise ValueError(
            "ADMIN_PASSWORD must be set in your .env file."
        )

    cursor.execute("""
        SELECT user_id
        FROM users
        WHERE email = %s
    """, (admin_email,))

    if cursor.fetchone():
        print("Admin account already exists.")
        return

    cursor.execute("""
        SELECT role_id
        FROM roles
        WHERE role_name = 'Admin'
    """)

    role = cursor.fetchone()

    if not role:
        raise RuntimeError("Admin role was not found.")

    role_id = role[0]

    password_hash = bcrypt.hashpw(
        admin_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    cursor.execute("""
        INSERT INTO users (
            role_id,
            full_name,
            email,
            password_hash,
            account_status
        )
        VALUES (%s, %s, %s, %s, 'Active')
    """, (
        role_id,
        Config.ADMIN_NAME,
        admin_email,
        password_hash
    ))

    print("Admin account created successfully.")


def main():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        seed_roles(cursor)
        seed_documents(cursor)
        seed_admin(cursor)

        connection.commit()

        print("Initial system data inserted successfully.")

    except Exception as error:
        if connection:
            connection.rollback()

        print(f"Seeding failed: {error}")
        raise

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":
    main()

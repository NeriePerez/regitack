import mysql.connector
from mysql.connector import Error

from config import Config


def get_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )

        if connection.is_connected():
            return connection

    except Error as error:
        print(f"Database connection error: {error}")
        raise

    return None


def test_connection():
    connection = None

    try:
        connection = get_connection()

        if connection and connection.is_connected():
            print("Database connected successfully!")
            return True

    except Error as error:
        print(f"Database connection failed: {error}")
        return False

    finally:
        if connection and connection.is_connected():
            connection.close()

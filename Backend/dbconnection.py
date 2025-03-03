# dbconnection.py

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        print("Connected to MySQL database successfully")
        return connection
    except Error as e:
        print(f"Error: '{e}' occurred")
        return None

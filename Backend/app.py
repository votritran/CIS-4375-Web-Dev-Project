import flask
from flask import jsonify
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Flask app instance
app = flask.Flask(__name__)
app.config["DEBUG"] = True

# database connection
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

# Route to check connection
@app.route('/test_connection', methods=['GET'])
def test_connection():
    connection = create_connection()
    if connection:
        return jsonify({"message": "Connection successful!"}), 200
    else:
        return jsonify({"message": "Connection failed!"}), 500


@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the Bakery API!"})


if __name__ == '__main__':
    app.run()
import flask
from flask import jsonify
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
load_dotenv()


# Flask app instance
app = flask.Flask(__name__)
app.config["DEBUG"] = True

from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app)


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

# Route to check connection http://127.0.0.1:5000/test_connection
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


# hashing password
from flask import request
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

@app.route('/register', methods=['POST'])
def register():
    data = flask.request.get_json()
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']
    password = data['password']
    phone = data['phone']
    
    bcrypt = Bcrypt(app)
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    connection = create_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database connection failed"}), 500
    
    cursor = connection.cursor()

    # Insert new customer into the database
    try:
        cursor.execute("""
            INSERT INTO Customer (CustomerFullName, CustomerEmail, CustomerPhone, CustomerPassword)
            VALUES (%s, %s, %s, %s)
        """, (f"{first_name} {last_name}", email, phone, hashed_password))
        
        connection.commit()
        
        return jsonify({"success": True, "message": "Account created successfully!"}), 200
    
    except Exception as e:
        connection.rollback()
        print(f"Error occurred: {e}")
        return jsonify({"success": False, "message": "Failed to create account"}), 500
    finally:
        cursor.close()
        connection.close()
        
# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email_or_username = data.get("email_or_username")
    password = data.get("password")

    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)

        # Check if user is an admin 
        cursor.execute("SELECT * FROM Owner WHERE OwnerEmail = %s", (email_or_username,))
        owner = cursor.fetchone()
        if owner and bcrypt.check_password_hash(owner["OwnerPassword"], password):
            return jsonify({"role": "admin", "redirect": "menu.html"}), 200

        # Check if user is a customer
        cursor.execute("SELECT * FROM Customer WHERE CustomerEmail = %s", (email_or_username,))
        customer = cursor.fetchone()
        if customer and bcrypt.check_password_hash(customer["CustomerPassword"], password):
            return jsonify({"role": "customer", "redirect": "menu.html"}), 200

        cursor.close()
        connection.close()
    
    return jsonify({"message": "Invalid credentials"}), 401



if __name__ == '__main__':
    app.run()
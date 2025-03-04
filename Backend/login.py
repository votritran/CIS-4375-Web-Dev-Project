from flask import Blueprint, jsonify, request
from flask_bcrypt import Bcrypt
import jwt 
from datetime import datetime, timedelta
from app import create_connection
import os
from dotenv import load_dotenv


login_blueprint = Blueprint("login", __name__)
bcrypt = Bcrypt()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

@login_blueprint.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    connection = create_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Owner WHERE OwnerEmail = %s", (email,))
        owner = cursor.fetchone()
        cursor.close()
        connection.close()

        if owner and bcrypt.check_password_hash(owner["OwnerPassword"], password):
            # Generate a token
            token = jwt.encode(
                {
                    "email": email,
                    "exp": datetime.utcnow() + timedelta(hours=1)  
                },
                SECRET_KEY,
                algorithm="HS256"
            )
            return jsonify({"success": True, "token": token, "redirect": "../admin view/admin_menu.html"}), 200

    return jsonify({"success": False, "message": "Invalid credentials"}), 401
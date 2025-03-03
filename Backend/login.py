# login.py

from flask import request, jsonify
from flask_bcrypt import Bcrypt
from dbconnection import create_connection

bcrypt = Bcrypt()

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
            return jsonify({"role": "admin", "redirect": "home.html"}), 200

        # Check if user is a customer
        cursor.execute("SELECT * FROM Customer WHERE CustomerEmail = %s", (email_or_username,))
        customer = cursor.fetchone()
        if customer and bcrypt.check_password_hash(customer["CustomerPassword"], password):
            return jsonify({"role": "customer", "redirect": "menu.html"}), 200

        cursor.close()
        connection.close()
    
    return jsonify({"message": "Invalid credentials"}), 401

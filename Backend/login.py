from flask import Blueprint, jsonify, request

login_blueprint = Blueprint("login", __name__)

@login_blueprint.route('/login', methods=['POST'])
def login():
    from app import create_connection, bcrypt  

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
            return jsonify({"role": "admin", "redirect": "../admin view/admin_menu.html"}), 200

    return jsonify({"message": "Invalid credentials"}), 401

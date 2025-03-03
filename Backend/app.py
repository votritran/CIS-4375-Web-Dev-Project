import flask
from flask import render_template,jsonify #New stuff added for Menu Updation Feauture
from mysql.connector import Error
from dotenv import load_dotenv
from dbconnection import create_connection
from login import login
app = flask.Flask(__name__, template_folder='../Frontend')
from db_operations import get_menu_items, add_product, add_product_route
from flask import request

app.config["DEBUG"] = True

from flask_cors import CORS

CORS(app)
load_dotenv()


# Route to check connection http://127.0.0.1:5000/test_connection
@app.route('/test_connection', methods=['GET'])
def test_connection():
    connection = create_connection()
    if connection:
        return jsonify({"message": "Connection successful!"}), 200
    else:
        return jsonify({"message": "Connection failed!"}), 500


# Add the login route
@app.route('/login', methods=['POST'])
def login_route():
    return login()

# Route to serve menu items
@app.route('/api/get_menu', methods=['GET'])
def get_menu_items_route():
    menu_items = get_menu_items()  # Fetch menu items from the database
    
    if not menu_items:
        return jsonify({"success": False, "message": "Failed to fetch menu items."}), 500
    
    return jsonify({"success": True, "menu_items": menu_items}), 200


# Register the add_product_route from db_operations
add_product_route(app)  # Register the route with the app



if __name__ == '__main__':
    app.run(debug=True)

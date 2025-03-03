import flask
from flask import render_template,jsonify #New stuff added for Menu Updation Feauture
from mysql.connector import Error
from dotenv import load_dotenv
from dbconnection import create_connection
from login import login
app = flask.Flask(__name__, template_folder='../Frontend')
from db_operations import get_menu_items, update_product 
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



@app.route('/menu/update', methods=['GET', 'POST'])
def update_menu():
    connection = create_connection()
    
    if request.method == 'GET':  # Handle GET request (fetching products)
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT ProductID, ProductName, ProductPrice, ProductDescription FROM Products")
            products = cursor.fetchall()
            return render_template('dbmenu.html', products=products)
        except Error as e:
            print(f"Error fetching products: {e}")
            return jsonify({"success": False, "message": "Failed to fetch products."}), 500
        finally:
            cursor.close()
            connection.close()
    
    # Handle POST request (updating product)
    elif request.method == 'POST':
        product_id = request.form.get('product_id')
        new_name = request.form.get('new_name')
        new_price = request.form.get('new_price')
        new_description = request.form.get('new_description')

        if not product_id:
            return jsonify({"success": False, "message": "Product ID is required."}), 400

        # Call the update_product function from db_operations.py
        success = update_product(product_id, new_name, new_price, new_description)
        
        if success:
            return jsonify({"success": True, "message": "Menu item updated successfully!"}), 200
        else:
            return jsonify({"success": False, "message": "Failed to update menu item."}), 500



if __name__ == '__main__':
    app.run(debug=True)

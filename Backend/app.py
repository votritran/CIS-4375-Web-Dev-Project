import flask
from flask import render_template
from flask import jsonify
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
load_dotenv()
from flask import redirect, url_for


# Flask app instance
#app = flask.Flask(__name__)
app = flask.Flask(__name__, template_folder='../Frontend/templates')

app.config["DEBUG"] = True

from flask_cors import CORS

#app = flask.Flask(__name__)
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


#New: Working for getting all menu item directly from the database
@app.route('/api/get_menu', methods=['GET'])
def get_menu_items():
    # This is to establish a connection to the database
    connection = create_connection()
    # If the connection fails, return an error response
    if not connection:
        return jsonify({"success": False, "message": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()

        # This is get all products from the Products table in the database
        cursor.execute("""
            SELECT ProductID, ProductName, ProductDescription, ProductPrice, ProductSize, CategoryName
            FROM Products
        """)
        products = cursor.fetchall()
        
        # If we find no products, return an error response
        if not products:
            return jsonify({"success": False, "message": "No products found"}), 404

        # This is to convert the database result into a structured JSON response
        menu_items = []
        for product in products:
            menu_items.append({
                "ProductID": product[0], # Unique identifier for the product
                "ProductName": product[1], # Name of the product
                "ProductDescription": product[2],  # Description of the product
                "ProductPrice": product[3], # Price of the product
                "ProductSize": product[4], # Size of the product
                "CategoryName": product[5] # Category under which the product falls
            })
        # Return the list of menu items as a JSON response
        return jsonify({"success": True, "menu_items": menu_items}), 200

    except Error as e:
        # Log the database error and return a failure response
        print(f"Database error: {e}")
        return jsonify({"message": "Failed to fetch menu items due to database error."}), 500

    finally:
        # Ensure the database connection is closed
        cursor.close()
        connection.close()

#Endpoint for updating price of menu items
@app.route('/menu/update', methods=['GET', 'POST'])
def update_menu():
    if request.method == 'GET':
        # Establish a database connection
        connection = create_connection()
        try:
            # Create a cursor to execute SQL queries
            cursor = connection.cursor()
            cursor.execute("SELECT ProductID, ProductName FROM Products")
            products = cursor.fetchall() # Retrieve the result of the query
            # Render the 'update-menu.html' template and pass the list of products
            return render_template('update-menu.html', products=products)
        except Error as e:
            # If an error occurs during the database operation, print the error and return a failure response
            print(f"Error fetching products: {e}")
            return jsonify({"success": False, "message": "Failed to fetch products."}), 500
        finally:
            # Ensure the cursor and connection are closed to avoid database connection issues
            cursor.close()
            connection.close()

    elif request.method == 'POST':
        # When the request is a POST request, handle form submission for updating a menu item price
        # Get the product ID and new price from the form data
        product_id = request.form.get('product_id')
        new_price = request.form.get('new_price')

        # Check if product ID and new price are provided; if not, return an error
        if not product_id or not new_price:
            return jsonify({"success": False, "message": "Invalid input."})

        # Establish a new database connection
        connection = create_connection()
        try:
            # Create a cursor to execute SQL queries
            cursor = connection.cursor()
            # SQL query to update the price of the selected product in the database
            cursor.execute("UPDATE Products SET ProductPrice = %s WHERE ProductID = %s", (new_price, product_id))
            # Commit to save the changes
            connection.commit()
            # Return a success response if the update was successful
            return jsonify({"success": True, "message": "Price updated successfully!"})

        except Error as e:
            # If an error occurs during the database operation, print the error and return a failure response
            print(f"Error updating product price: {e}")
            connection.rollback() # Rollback the transaction in case of error
            return jsonify({"success": False, "message": "Failed to update price."}), 500
        finally:
            # Make sure the cursor and connection are closed after the operation
            cursor.close()
            connection.close()









if __name__ == '__main__':
    app.run()


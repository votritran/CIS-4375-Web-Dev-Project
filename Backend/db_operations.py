from dbconnection import create_connection
from mysql.connector import Error
from flask import jsonify, request

# Function to get menu items from the database
def get_menu_items():
    connection = create_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT ProductID, ProductName, ProductDescription, ProductPrice, ProductSize, CategoryName, ProductImage

            FROM Products
        """)
        products = cursor.fetchall()
        
        menu_items = []
        for product in products:
            menu_items.append({
                "ProductID": product[0],
                "ProductName": product[1],
                "ProductDescription": product[2],
                "ProductPrice": product[3],
                "ProductSize": product[4],
                "CategoryName": product[5],
                "ProductImage": product[6]
            })
        return menu_items

    except Error as e:
        print(f"Database error: {e}")
        return None
    
    finally:
        cursor.close()
        connection.close()


def add_product(product_name, product_price, product_description, product_size, category_name, product_image):
    connection = create_connection()
    if not connection:
        return False, "Database connection failed."

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO Products (ProductName, ProductPrice, ProductDescription, ProductSize, CategoryName, ProductImage)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (product_name, product_price, product_description, product_size, category_name, product_image))
        connection.commit()
        return True, "Product added successfully!"
    except Error as e:
        print(f"Error: {e}")
        return False, "Failed to add product."
    finally:
        cursor.close()
        connection.close()


# Function to add product route (this will be registered in app.py)
def add_product_route(app):
    @app.route('/menu/add', methods=['POST'])
    def add_product_route():
        # Get the data from the request
        data = request.get_json()
        
        # Log the incoming data to check
        print("Received data:", data)

        # Extract the data
        product_name = data.get('product_name')
        product_price = data.get('product_price')
        product_description = data.get('product_description')
        product_size = data.get('product_size')
        category_name = data.get('category_name')
        product_image = data.get('product_image')

        # Check for required fields
        if not product_name or not product_price or not product_description or not category_name:
            return jsonify({"success": False, "message": "Missing required fields."}), 400

        # Call the add_product function to add the product to the DB
        success, message = add_product(product_name, product_price, product_description, product_size, category_name, product_image)

        if success:
            return jsonify({"success": True, "message": message}), 200
        else:
            return jsonify({"success": False, "message": message}), 500
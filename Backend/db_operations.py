# db_operations.py

from dbconnection import create_connection, Error

def get_menu_items():
    # Establish a connection to the database
    connection = create_connection()
    
    if not connection:
        return None
    
    try:
        cursor = connection.cursor()
        # Fetch all products from the database
        cursor.execute("""
            SELECT ProductID, ProductName, ProductDescription, ProductPrice, ProductSize, CategoryName
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
                "CategoryName": product[5]
            })
        return menu_items

    except Error as e:
        print(f"Database error: {e}")
        return None
    
    finally:
        cursor.close()
        connection.close()


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

# Function to update a product in the database
def update_product(product_id, new_name, new_price, new_description, new_category):
    connection = create_connection()
    
    update_fields = []
    values = []
    
    # Ensure we are updating only the fields that are not None
    if new_name:
        update_fields.append("ProductName = %s")
        values.append(new_name)

    if new_price:
        update_fields.append("ProductPrice = %s")
        values.append(new_price)

    if new_description:
        update_fields.append("ProductDescription = %s")
        values.append(new_description)

    if new_category:
        update_fields.append("CategoryName = %s")
        values.append(new_category)

    # If no fields to update, return False
    if not update_fields:
        return False
    
    values.append(product_id)

    query = f"UPDATE Products SET {', '.join(update_fields)} WHERE ProductID = %s"
    
    try:
        cursor = connection.cursor()
        cursor.execute(query, values)
        connection.commit()
        return True

    except Error as e:
        print(f"Error updating product: {e}")
        connection.rollback()
        return False
    
    finally:
        cursor.close()
        connection.close()
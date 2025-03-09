const express = require('express');
const router = express.Router();  // Use Express Router for modular routes
const connection = require('../../config/dbconnection');  // Import the DB connection
const path = require('path');

// Route to fetch menu items from the database and render them in 'adminmenu.ejs'
router.get('/adminmenu', (req, res) => {
    // Fetch menu items from the database
    connection.query('SELECT * FROM Products', (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).send('Error fetching menu items');
        }

        // Group menu items by category
        const menuItems = results.reduce((categories, item) => {
            const category = item.CategoryName || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(item);
            return categories;
        }, {});

        // Render 'menu' view and pass grouped menu items
        res.render(path.join(__dirname, '../../views', 'adminview', 'adminmenu'), { menuItems });
    });
});

// POST route to handle updating menu items
router.post('/update-product', (req, res) => {
    // Destructure the required fields from the request body
    const { productID, newName, newPrice, newDescription, newSize } = req.body;

    // Check if productID is provided, which is necessary to update a product
    if (!productID) {
        // If no productID is provided, send a 400 error response
        return res.status(400).json({ message: 'Product ID is required' });
    }

    // Initialize arrays to hold the fields to be updated and their corresponding values
    let updates = [];
    let values = [];

    // Check if the new product name is provided and add it to the update query
    if (newName) {
        updates.push('ProductName = ?');  // Add the SQL field to be updated
        values.push(newName);  // Add the new value for the field
    }

    // Check if the new product price is provided and add it to the update query
    if (newPrice) {
        updates.push('ProductPrice = ?');  // Add the SQL field to be updated
        values.push(newPrice);  // Add the new value for the field
    }

    // Check if the new product description is provided and add it to the update query
    if (newDescription) {
        updates.push('ProductDescription = ?');  // Add the SQL field to be updated
        values.push(newDescription);  // Add the new value for the field
    }

    // Check if the new size is provided and add it to the update query
    if (newSize) {
        updates.push('ProductSize = ?');  // Add the SQL field to be updated
        values.push(newSize);  // Add the new value for the field
    }

    // If no fields are provided for updating, return a 400 error with a message
    if (updates.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Construct the SQL query dynamically by joining the updated fields
    let query = `UPDATE Products SET ${updates.join(', ')} WHERE ProductID = ?`;
    values.push(productID);  // Add the productID to the end of the values array for the WHERE clause

    // Execute the query to update the product in the database
    connection.query(query, values, (err, result) => {
        if (err) {
            // If an error occurs while executing the query, log it and return a 500 error
            console.error('Error updating product:', err);
            return res.status(500).json({ message: 'Error updating product' });
        }

        // If the update is successful, send a success response with a message
        res.json({ message: 'Product updated successfully' });
    });
});


module.exports = router;  // Export the router to be used in server.js

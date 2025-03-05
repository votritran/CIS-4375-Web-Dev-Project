const express = require('express');
const router = express.Router();  // Use Express Router for modular routes
const connection = require('../config/dbconnection');  // Import the DB connection

// Route to fetch menu items from the database and render them in 'menu.ejs'
router.get('/menu', (req, res) => {
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
        res.render('menu', { menuItems });
    });
});

module.exports = router;  // Export the router to be used in server.js

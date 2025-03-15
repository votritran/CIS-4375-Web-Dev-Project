// Route to fetch menu items from the database and render them in 'menu.ejs'
const express = require('express');
const router = express.Router();  // Use Express Router for modular routes
const connection = require('../../config/dbconnection');  // Import the DB connection

// Route to fetch menu items from the database and render them in 'menu.ejs'
router.get('/menu', (req, res) => {
    if (req.session && req.session.owner) {
        // If the user is logged in, redirect to the admin home page
        return res.redirect('/adminmenu');  // Redirect to the admin menu (admin home page)
    }
    // Fetch menu items from the database
    connection.query('SELECT * FROM Products', (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).send('Error fetching menu items');
        }

        // Group menu items by category and product name
        const menuItems = results.reduce((categories, item) => {
            const category = item.CategoryName || 'Uncategorized';
            const productName = item.ProductName;

            // If category doesn't exist, create it
            if (!categories[category]) {
                categories[category] = {};
            }

            // If product name doesn't exist in this category, create it
            if (!categories[category][productName]) {
                categories[category][productName] = {
                    ProductID: item.ProductID,
                    ProductDescription: item.ProductDescription,
                    ProductImage: item.ProductImage,
                    ProductPrice: item.ProductPrice,
                    Sizes: []  // Array to store sizes and prices
                };
            }

            // Add the size and price to the product (if size exists)
            if (item.ProductSize) {
                categories[category][productName].Sizes.push({
                    size: item.ProductSize,
                    price: item.ProductPrice
                });
            }

            return categories;
        }, {});

        // Convert the grouped data back into an array of categories and products
        const groupedMenuItems = Object.keys(menuItems).map(category => ({
            categoryName: category,
            products: Object.keys(menuItems[category]).map(productName => ({
                productName: productName,
                ...menuItems[category][productName]
            }))
        }));

        // Render the 'adminmenu' view and pass grouped menu items
        res.render('menu', { menuItems: groupedMenuItems });
    });
});

module.exports = router;  // Export the router to be used in server.js




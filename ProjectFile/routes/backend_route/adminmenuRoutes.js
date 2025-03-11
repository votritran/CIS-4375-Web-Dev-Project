const express = require('express');
const router = express.Router();  // Use Express Router for modular routes
const connection = require('../../config/dbconnection');  // Import the DB connection
const path = require('path');
const multer = require('multer');  // For handling file uploads
const AWS = require('aws-sdk');    // For AWS S3

AWS.config.update({
    accessKeyId: 'AKIAXFG5L4NB7TWHTIMP',
    secretAccessKey: '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',
    region: 'us-east-1',
});

const s3 = new AWS.S3();

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to fetch menu items from the database and render them in 'menu.ejs'
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

router.post('/adminmenu/add', upload.single('productImage'), (req, res) => {
    const { productName, productDescription, productPrice, productSize, categoryName } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    // Upload image to S3
    const params = {
        Bucket: 'cis4375tv', // Your S3 bucket name
        Key: `menu-items/${Date.now()}-${file.originalname}`, // Unique file name
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' // Make it publicly readable
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading image to S3:', err);
            return res.status(500).send('Error uploading image to S3');
        }

        // Image URL from S3
        const imageUrl = data.Location;

        // Save the menu item to the database
        const query = `
            INSERT INTO Products (ProductName, ProductDescription, ProductPrice, ProductSize, CategoryName, ProductImage)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        connection.query(query, [productName, productDescription, productPrice, productSize, categoryName, imageUrl], (err, result) => {
            if (err) {
                console.error('Error adding menu item:', err);
                return res.status(500).send('Error adding menu item');
            }
            res.redirect('/adminmenu');
        });
    });
});
module.exports = router;  // Export the router to be used in server.js

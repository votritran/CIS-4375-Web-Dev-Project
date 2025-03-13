const express = require('express');
const router = express.Router();  // Use Express Router for modular routes
const connection = require('../../config/dbconnection');  // Import the DB connection
const path = require('path');
const AWS = require('aws-sdk');
const multer = require('multer');  // For handling file uploads

// AWS S3 setup
AWS.config.update({
    accessKeyId: 'AKIAXFG5L4NB7TWHTIMP',
    secretAccessKey: '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',
    region: 'us-east-1',
});

const s3 = new AWS.S3();

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


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
router.post('/update-product', upload.single('productImage'), (req, res) => {
    // Destructure the required fields from the request body
    const { productID, newName, newPrice, newDescription, newSize, newCategory } = req.body;
    const file = req.file;

    // Check if productID is provided, which is necessary to update a product
    if (!productID) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    let updates = [];
    let values = [];
    let imageUrl = null;

    // Check if the new product name is provided and add it to the update query
    if (newName) {
        updates.push('ProductName = ?');
        values.push(newName);
    }

    // Check if the new product price is provided and add it to the update query
    if (newPrice) {
        updates.push('ProductPrice = ?');
        values.push(newPrice);
    }

    // Check if the new product description is provided and add it to the update query
    if (newDescription) {
        updates.push('ProductDescription = ?');
        values.push(newDescription);
    }

    // Check if the new size is provided and add it to the update query
    if (newSize) {
        updates.push('ProductSize = ?');
        values.push(newSize);
    }

    // Check if the new category is provided and add it to the update query
    if (newCategory) {
        updates.push('CategoryName = ?');
        values.push(newCategory);
    }

    // If a new image file is provided, upload it to S3
    if (file) {
        const params = {
            Bucket: 'cis4375tv',  // Your S3 bucket name
            Key: `menu-items/${Date.now()}-${file.originalname}`, // Unique file name
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',  // Make it publicly readable
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading image to S3:', err);
                return res.status(500).send('Error uploading image to S3');
            }

            // Get the new image URL from the S3 response
            imageUrl = data.Location;
            updates.push('ProductImage = ?');
            values.push(imageUrl);

            // Now proceed with updating the product in the database
            updateProductInDatabase();
        });
    } else {
        // If no new image is provided, just proceed with updating the product
        updateProductInDatabase();
    }

    
    function updateProductInDatabase() {
        // If the product has an image, fetch and delete the old image from S3
        if (imageUrl) {
            connection.query('SELECT ProductImage FROM Products WHERE ProductID = ?', [productID], (err, result) => {
                if (err) {
                    console.error('Error fetching product image:', err);
                    return res.status(500).send('Error fetching product image');
                }

                if (result.length === 0) {
                    return res.status(404).send('Product not found');
                }

                const oldImageUrl = result[0].ProductImage;
                if (oldImageUrl) {
                    const imageKey = oldImageUrl.split('amazonaws.com/')[1];
                    const s3Params = {
                        Bucket: 'cis4375tv', // Your S3 bucket name
                        Key: imageKey,
                    };

                    s3.deleteObject(s3Params, (err, data) => {
                        if (err) {
                            console.error('Error deleting image from S3:', err);
                        } else {
                            console.log('Old image deleted successfully');
                        }
                    });
                }
            });
        }

        // Construct the SQL query dynamically by joining the updated fields
        let query = `UPDATE Products SET ${updates.join(', ')} WHERE ProductID = ?`;
        values.push(productID);  // Add the productID to the end of the values array for the WHERE clause

        // Execute the query to update the product in the database
        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating product:', err);
                return res.status(500).json({ message: 'Error updating product' });
            }

            // If the update is successful, send a success response with a message
            res.json({ message: 'Product updated successfully' });
        });
    }
});

module.exports = router;  // Export the router to be used in server.js




module.exports = router;  // Export the router to be used in server.js

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

// Upload image to S3 and insert new product into the database
// POST route to handle updating menu items
router.post('/update-product', upload.single('productImage'), (req, res) => {
    // Extract the required fields from the request body, including the product ID and new values
    const { productID, newName, newPrice, newDescription, newSize, newCategory } = req.body;
    const file = req.file;  // Extract the uploaded file from the request

    // Ensure that the request includes a product ID; otherwise, return a 400 Bad Request error
    if (!productID) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    // Initialize an array to store update queries and their corresponding values
    let updates = [];
    let values = [];
    let imageUrl = null;  // Variable to store the new image URL if an image is uploaded

    // If a new product name is provided, add it to the update query and values array
    if (newName) {
        updates.push('ProductName = ?');
        values.push(newName);
    }

    // If a new price is provided, add it to the update query and values array
    if (newPrice) {
        updates.push('ProductPrice = ?');
        values.push(newPrice);
    }

    // If a new description is provided, add it to the update query and values array
    if (newDescription) {
        updates.push('ProductDescription = ?');
        values.push(newDescription);
    }

    // If a new size is provided, add it to the update query and values array
    if (newSize) {
        updates.push('ProductSize = ?');
        values.push(newSize);
    }

    // If a new category is provided, add it to the update query and values array
    if (newCategory) {
        updates.push('CategoryName = ?');
        values.push(newCategory);
    }

    // Check if a new image file is provided in the request
    if (file) {
        // Define parameters for uploading the image to AWS S3
        const params = {
            Bucket: 'cis4375tv',  // The name of the S3 bucket
            Key: `menu-items/${Date.now()}-${file.originalname}`, // Unique filename based on timestamp
            Body: file.buffer,  // The image data
            ContentType: file.mimetype,  // The content type of the image (e.g., image/jpeg)
            ACL: 'public-read',  // Set the file to be publicly readable
        };

        // Upload the image to S3
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading image to S3:', err);
                return res.status(500).send('Error uploading image to S3');  // Return an error response if upload fails
            }

            // Store the new image URL from the S3 response
            imageUrl = data.Location;
            updates.push('ProductImage = ?');  // Add the image update to the SQL query
            values.push(imageUrl);  // Store the new image URL in the values array

            // Proceed with updating the product in the database after the image is uploaded
            updateProductInDatabase();
        });
    } else {
        // If no new image is provided, proceed with updating the product without modifying the image
        updateProductInDatabase();
    }

    // Function to update the product in the database
    function updateProductInDatabase() {
        // If a new image was uploaded, fetch and delete the old image from S3
        if (imageUrl) {
            connection.query('SELECT ProductImage FROM Products WHERE ProductID = ?', [productID], (err, result) => {
                if (err) {
                    console.error('Error fetching product image:', err);
                    return res.status(500).send('Error fetching product image');
                }

                // If no product is found, return a 404 error
                if (result.length === 0) {
                    return res.status(404).send('Product not found');
                }

                // Extract the old image URL from the database result
                const oldImageUrl = result[0].ProductImage;
                if (oldImageUrl) {
                    // Extract the image key from the S3 URL
                    const imageKey = oldImageUrl.split('amazonaws.com/')[1];

                    // Define parameters for deleting the image from S3
                    const s3Params = {
                        Bucket: 'cis4375tv', // The S3 bucket name
                        Key: imageKey,  // The unique key for the image in S3
                    };

                    // Delete the old image from S3
                    s3.deleteObject(s3Params, (err, data) => {
                        if (err) {
                            console.error('Error deleting image from S3:', err);
                        } else {
                            console.log('Old image deleted successfully');  // Log success if deletion is successful
                        }
                    });
                }
            });
        }

        // Construct the SQL query dynamically using the fields to be updated
        let query = `UPDATE Products SET ${updates.join(', ')} WHERE ProductID = ?`;
        values.push(productID);  // Append the product ID to the values array for the WHERE clause

        // Execute the SQL query to update the product in the database
        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating product:', err);
                return res.status(500).json({ message: 'Error updating product' }); // Return an error if the update fails
            }

            // If the update is successful, send a success response
            res.json({ message: 'Product updated successfully' });
        });
    }
});


module.exports = router;  // Export the router to be used in server.js
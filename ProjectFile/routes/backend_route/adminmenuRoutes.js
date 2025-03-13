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
    const { productID, newName, newPrice, newDescription, newSize, newCategory } = req.body;
    const file = req.file;

    if (!productID) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    let updates = [];
    let values = [];
    let imageUrl = null;

    if (newName) updates.push('ProductName = ?'), values.push(newName);
    if (newPrice) updates.push('ProductPrice = ?'), values.push(newPrice);
    if (newDescription) updates.push('ProductDescription = ?'), values.push(newDescription);
    if (newSize) updates.push('ProductSize = ?'), values.push(newSize);
    if (newCategory) updates.push('CategoryName = ?'), values.push(newCategory);

    if (file) {
        const params = {
            Bucket: 'cis4375tv',
            Key: `menu-items/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading image to S3:', err);
                return res.status(500).send('Error uploading image to S3');
            }

            imageUrl = data.Location;
            updates.push('ProductImage = ?');
            values.push(imageUrl);

            updateProductInDatabase();
        });
    } else {
        updateProductInDatabase();
    }
});

function updateProductInDatabase() {
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
                const s3Params = { Bucket: 'cis4375tv', Key: imageKey };

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

    let query = `UPDATE Products SET ${updates.join(', ')} WHERE ProductID = ?`;
    values.push(productID);

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ message: 'Error updating product' });
        }

        res.json({ message: 'Product updated successfully' });
    });
}



module.exports = router;  // Export the router to be used in server.js

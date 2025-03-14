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
        res.render(path.join(__dirname, '../../views', 'adminview', 'adminmenu'), { menuItems: groupedMenuItems });
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

router.post('/adminmenu/delete/:productId', (req, res) => {
    const productId = req.params.productId;

    // Fetch product image URL from the database
    connection.query('SELECT ProductImage FROM Products WHERE ProductID = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product image:', err);
            return res.status(500).send('Error fetching product image');
        }

        if (result.length === 0) {
            return res.status(404).send('Product not found');
        }

        const imageUrl = result[0].ProductImage;

        // Extract the S3 object key (path after 'amazonaws.com/')
        const imageKey = imageUrl.split('amazonaws.com/')[1];

        // Ensure the image key is extracted correctly
        if (!imageKey) {
            console.error('No valid image key found in URL:', imageUrl);
            return res.status(500).send('Error: Invalid image URL');
        }

        // Delete the image from S3
        const s3Params = {
            Bucket: 'cis4375tv', // Your S3 bucket name
            Key: imageKey // Extracted key from image URL
        };

        s3.deleteObject(s3Params, (err, data) => {
            if (err) {
                console.error('Error deleting image from S3:', err);
                return res.status(500).send('Error deleting image from S3');
            }

            // After successfully deleting the image, delete the product from the database
            connection.query('DELETE FROM Products WHERE ProductID = ?', [productId], (err, result) => {
                if (err) {
                    console.error('Error deleting product from database:', err);
                    return res.status(500).send('Error deleting product from database');
                }

                // Redirect back to the menu page after successful deletion
                res.redirect('/adminmenu');
            });
        });
    });
});

router.post('/adminmenu/update/:productId', upload.single('newImage'), (req, res) => {
    const { productId } = req.params;
    const { newName, newDescription, newPrice, newSize, newCategory } = req.body;
    const newImage = req.file;

    // Get the current product details before update
    connection.query('SELECT * FROM Products WHERE ProductID = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            return res.status(500).send('Error fetching product details');
        }

        if (result.length === 0) {
            return res.status(404).send('Product not found');
        }

        const currentProduct = result[0];
        const updatedName = newName || currentProduct.ProductName;
        const updatedDescription = newDescription || currentProduct.ProductDescription;
        const updatedPrice = newPrice || currentProduct.ProductPrice;
        const updatedSize = newSize || currentProduct.ProductSize;
        const updatedCategory = newCategory || currentProduct.CategoryName;
        let updatedImageUrl = currentProduct.ProductImage;  // Keep the existing image URL by default

        // If a new image is uploaded, upload it to S3 and delete the old one
        if (newImage) {
            // Upload the new image to S3
            const params = {
                Bucket: 'cis4375tv',
                Key: `menu-items/${Date.now()}-${newImage.originalname}`,
                Body: newImage.buffer,
                ContentType: newImage.mimetype,
                ACL: 'public-read'
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.error('Error uploading image to S3:', err);
                    return res.status(500).send('Error uploading image to S3');
                }

                updatedImageUrl = data.Location;

                // Delete the old image from S3
                const imageKey = currentProduct.ProductImage.split('amazonaws.com/')[1];
                const s3Params = {
                    Bucket: 'cis4375tv',
                    Key: imageKey
                };

                s3.deleteObject(s3Params, (err) => {
                    if (err) {
                        console.error('Error deleting old image from S3:', err);
                        return res.status(500).send('Error deleting old image');
                    }

                    // Proceed to update product details in the database
                    const updateQuery = `
                        UPDATE Products
                        SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = ?, CategoryName = ?, ProductImage = ?
                        WHERE ProductID = ?
                    `;
                    connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedSize, updatedCategory, updatedImageUrl, productId], (err, result) => {
                        if (err) {
                            console.error('Error updating product:', err);
                            return res.status(500).send('Error updating product');
                        }

                        res.redirect('/adminmenu');
                    });
                });
            });
        } else {
            // No new image, just update the other fields
            const updateQuery = `
                UPDATE Products
                SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = ?, CategoryName = ?
                WHERE ProductID = ?
            `;
            connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedSize, updatedCategory, productId], (err, result) => {
                if (err) {
                    console.error('Error updating product:', err);
                    return res.status(500).send('Error updating product');
                }

                res.redirect('/adminmenu');
            });
        }
    });
});



module.exports = router;  // Export the router to be used in server.js

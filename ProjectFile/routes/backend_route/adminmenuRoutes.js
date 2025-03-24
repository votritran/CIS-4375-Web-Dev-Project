const express = require('express');
const router = express.Router();  // Use Express Router for modular routes
const connection = require('../../config/dbconnection');  // Import the DB connection
const path = require('path');
const multer = require('multer');  // For handling file uploads
const AWS = require('aws-sdk');    // For AWS S3
const isAuthenticated = require('../../middleware/auth');

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
router.get('/adminmenu', isAuthenticated, (req, res) => {
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


router.post('/adminmenu/add', isAuthenticated, upload.single('productImage'), (req, res) => {
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

router.post('/adminmenu/delete/:productId', isAuthenticated, (req, res) => {
    const productId = req.params.productId;
    const productSize = req.body.productSize; // Get product size from the form

    // Fetch product details from the database
    connection.query('SELECT ProductImage, ProductName, ProductSize FROM Products WHERE ProductID = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            return res.status(500).send('Error fetching product details');
        }

        if (result.length === 0) {
            return res.status(404).send('Product not found');
        }

        const productName = result[0].ProductName;
        const storedProductSize = result[0].ProductSize;
        const imageUrl = result[0].ProductImage;

        let deleteQuery;
        let queryParams;

        if (!productSize || storedProductSize == null) {
            // If no size was provided OR the product has no sizes in the database, delete by ProductID
            deleteQuery = 'DELETE FROM Products WHERE ProductID = ?';
            queryParams = [productId];
        } else {
            // If a size was selected, delete only that specific size
            deleteQuery = 'DELETE FROM Products WHERE ProductName = ? AND ProductSize = ?';
            queryParams = [productName, productSize];
        }

        // Execute deletion from database
        connection.query(deleteQuery, queryParams, (err, result) => {
            if (err) {
                console.error('Error deleting product from database:', err);
                return res.status(500).send('Error deleting product from database');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('No matching product found to delete.');
            }

            // If the whole product was deleted, remove the image from S3
            if (!productSize || storedProductSize == null) {
                if (!imageUrl) {
                    console.error('No image URL found for product:', productId);
                    return res.redirect('/adminmenu'); // Skip S3 deletion if no image
                }

                const imageKey = imageUrl.split('amazonaws.com/')[1];

                if (!imageKey) {
                    console.error('No valid image key found in URL:', imageUrl);
                    return res.status(500).send('Error: Invalid image URL');
                }

                // Delete the image from S3
                const s3Params = {
                    Bucket: 'cis4375tv', // Your S3 bucket name
                    Key: imageKey
                };

                s3.deleteObject(s3Params, (err, data) => {
                    if (err) {
                        console.error('Error deleting image from S3:', err);
                        return res.status(500).send('Error deleting image from S3');
                    }

                    res.redirect('/adminmenu'); // Redirect after successful deletion
                });
            } else {
                if (!imageUrl) {
                    console.error('No image URL found for product:', productId);
                    return res.redirect('/adminmenu'); // Skip S3 deletion if no image
                }

                const imageKey = imageUrl.split('amazonaws.com/')[1];

                if (!imageKey) {
                    console.error('No valid image key found in URL:', imageUrl);
                    return res.status(500).send('Error: Invalid image URL');
                }

                // Delete the image from S3
                const s3Params = {
                    Bucket: 'cis4375tv', // Your S3 bucket name
                    Key: imageKey
                };

                s3.deleteObject(s3Params, (err, data) => {
                    if (err) {
                        console.error('Error deleting image from S3:', err);
                        return res.status(500).send('Error deleting image from S3');
                    }
                
                    res.redirect('/adminmenu'); 
            })};
        });
    });
});


router.post('/adminmenu/update/:productId', isAuthenticated, upload.single('newImage'), (req, res) => {
    const { productId } = req.params;
    const { newName, newDescription, newPrice, newSize, newCategory } = req.body;
    const newImage = req.file;
    const currentproductSize = req.body.currentSize;

    // Get the current product details before update
    connection.query('SELECT * FROM Products WHERE ProductID = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product details:', err);
            return res.status(500).send('Error fetching product details');
        }

        if (result.length === 0) {
            return res.status(404).send('Product not found');
        }
        const storedProductSize = result[0].currentproductSize;
        const productName = result[0].ProductName;
        
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

                    if (storedProductSize == null) {

                        if (updatedSize.toLowerCase() === 'null'|| updatedSize.toLowerCase() === 'none') {
                        // Proceed to update product details in the database
                            const updateQuery = `
                                UPDATE Products
                                SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = NULL, CategoryName = ?, ProductImage = ?
                                WHERE ProductID = ?
                            `;
                            connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedCategory, updatedImageUrl, productId], (err, result) => {
                                if (err) {
                                    console.error('Error updating product:', err);
                                    return res.status(500).send('Error updating product');
                                }

                                res.redirect('/adminmenu');
                        });
                        }
                        else {
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
                        }
                    }
                    else {
                        // Proceed to update product details in the database
                        if (updatedSize.toLowerCase() === 'null'|| updatedSize.toLowerCase() === 'none') {
                            const updateQuery = `
                                UPDATE Products
                                SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = NULL, CategoryName = ?, ProductImage = ?
                                WHERE ProductName = ? AND ProductSize = ?
                            `;
                            connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedCategory, updatedImageUrl, productName, currentproductSize], (err, result) => {
                                if (err) {
                                    console.error('Error updating product:', err);
                                    return res.status(500).send('Error updating product');
                                }

                                res.redirect('/adminmenu');
                        });
                        }
                        else {
                            const updateQuery = `
                                UPDATE Products
                                SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = ?, CategoryName = ?, ProductImage = ?
                                WHERE ProductName = ? AND ProductSize = ?
                            `;
                            connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedSize ,updatedCategory, updatedImageUrl, productName, currentproductSize], (err, result) => {
                                if (err) {
                                    console.error('Error updating product:', err);
                                    return res.status(500).send('Error updating product');
                                }

                                res.redirect('/adminmenu');
                        });
                        }

                }
                });
            });
        } else {


            // No new image, just update the other fields
            if (storedProductSize == null) {

                // Proceed to update product details in the database
                if (updatedSize.toLowerCase() === 'null'|| updatedSize.toLowerCase() === 'none') {
                    // Proceed to update product details in the database
                        const updateQuery = `
                            UPDATE Products
                            SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = NULL, CategoryName = ?, ProductImage = ?
                            WHERE ProductID = ?
                        `;
                        connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedCategory, updatedImageUrl, productId], (err, result) => {
                            if (err) {
                                console.error('Error updating product:', err);
                                return res.status(500).send('Error updating product');
                            }

                            res.redirect('/adminmenu');
                    });
                    }
                    else {
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
                    }
            }
            else {
                // Proceed to update product details in the database
                if (updatedSize.toLowerCase() === 'null'|| updatedSize.toLowerCase() === 'none') {
                    const updateQuery = `
                        UPDATE Products
                        SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = NULL, CategoryName = ?, ProductImage = ?
                        WHERE ProductName = ? AND ProductSize = ?
                    `;
                    connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedCategory, updatedImageUrl, productName, currentproductSize], (err, result) => {
                        if (err) {
                            console.error('Error updating product:', err);
                            return res.status(500).send('Error updating product');
                        }

                        res.redirect('/adminmenu');
                });
                }
                else {
                    const updateQuery = `
                        UPDATE Products
                        SET ProductName = ?, ProductDescription = ?, ProductPrice = ?, ProductSize = ?, CategoryName = ?, ProductImage = ?
                        WHERE ProductName = ? AND ProductSize = ?
                    `;
                    connection.query(updateQuery, [updatedName, updatedDescription, updatedPrice, updatedSize ,updatedCategory, updatedImageUrl, productName, currentproductSize], (err, result) => {
                        if (err) {
                            console.error('Error updating product:', err);
                            return res.status(500).send('Error updating product');
                        }

                        res.redirect('/adminmenu');
                });
                }
            }
        }
    });
});

module.exports = router;  // Export the router to be used in server.js

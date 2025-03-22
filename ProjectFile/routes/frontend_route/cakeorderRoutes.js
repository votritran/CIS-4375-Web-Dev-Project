const express = require('express');
const router = express.Router();
const db = require('../../config/dbconnection');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

// AWS S3 configuration (using your hardcoded credentials)
AWS.config.update({
    accessKeyId: 'AKIAXFG5L4NB7TWHTIMP',
    secretAccessKey: 'uZ47L7iiABXYvIKKR0M86LbleaOPUGbXKFjbC/1j',
    region: 'us-east-1'
});

const s3 = new AWS.S3();

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to render the Cake Order page
router.get('/cakeorder', (req, res) => {
    res.render('cakeorder');  // Render cakeorder.ejs
});

// Route to handle form submission
router.post('/cakeorder', upload.single('image'), (req, res) => {
    const { name, email, phone, needByDate, cakeType, frosting, size, shape, description } = req.body;

    // Fetch the latest OwnerID from the Owner table
    const getOwnerIdQuery = 'SELECT OwnerID FROM Owner ORDER BY OwnerID DESC LIMIT 1';

    db.query(getOwnerIdQuery, (err, result) => {
        if (err) {
            console.error('Error fetching latest OwnerID:', err);
            return res.status(500).send('Error fetching latest OwnerID');
        }

        const ownerID = result[0]?.OwnerID;

        if (!ownerID) {
            return res.status(500).send('No Owner found in the Owner table');
        }

        let CakeImage = null;

        if (req.file) {
            const params = {
                Bucket: 'cis4375tv',  // Your hardcoded bucket name
                Key: `cakeImages/${Date.now()}_${req.file.originalname}`,  // Unique file name
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'public-read',  // Make it publicly readable
            };

            // Upload image to S3
            s3.upload(params, (err, data) => {
                if (err) {
                    console.error('Error uploading image to S3:', err);
                    return res.status(500).send('Error uploading image');
                }

                CakeImage = data.Location;  // Image URL from S3

                // Insert order details into the database including OwnerID and Image URL
                const sql = `
                    INSERT INTO CakeOrder (name, email, phone, needByDate, cakeType, frosting, size, shape, description, status, OwnerID, CakeImage)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?)`;
                db.query(sql, [name, email, phone, needByDate, cakeType, frosting, size, shape, description, ownerID, CakeImage], (err, result) => {
                    if (err) {
                        console.error('Error inserting order:', err);
                        return res.status(500).send('An error occurred. Please try again later.');
                    }

                    console.log('Cake order saved successfully with OwnerID:', ownerID);
                    res.json({ success: true, message: 'Order received' });
                });
            });
        } else {
            // If no image is uploaded, just insert the order without an image
            const sql = `
                INSERT INTO CakeOrder (name, email, phone, needByDate, cakeType, frosting, size, shape, description, status, OwnerID)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)`;
            db.query(sql, [name, email, phone, needByDate, cakeType, frosting, size, shape, description, ownerID], (err, result) => {
                if (err) {
                    console.error('Error inserting order:', err);
                    return res.status(500).send('An error occurred. Please try again later.');
                }

                console.log('Cake order saved successfully with OwnerID:', ownerID);
                res.json({ success: true, message: 'Order received' });
            });
        }
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../../config/dbconnection');
const multer = require('multer');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

// AWS S3 configuration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1'
});

const s3 = new AWS.S3();

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Nodemailer email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

// Function to send order notification email
async function sendOrderEmail(orderDetails, imageBuffer, imageName) {
    try {
        let emailText = `
        New Cake Order Received!
        
        Name: ${orderDetails.name}
        Email: ${orderDetails.email}
        Phone: ${orderDetails.phone}
        Preferred Contact: ${orderDetails.preferredContact}
        Need By: ${orderDetails.needByDate}
        
        Cake Details:
        - Type: ${orderDetails.cakeType || orderDetails.customCakeType}
        - Frosting: ${orderDetails.frosting || orderDetails.customFrosting}
        - Size: ${orderDetails.size || orderDetails.customSize}
        - Shape: ${orderDetails.shape || orderDetails.customShape}

        Additional Details:
        ${orderDetails.description || "No additional details provided."}
        `;

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'parissweetorder1@gmail.com',
            subject: 'New Cake Order Received!',
            text: emailText,
            attachments: imageBuffer ? [{ filename: imageName, content: imageBuffer }] : []
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Route to render Cake Order page
router.get('/cakeorder', (req, res) => {
    res.render('cakeorder');
});

// Route to handle form submission
router.post('/cakeorder', upload.single('image'), (req, res) => {
    const { name, email, phone, preferredContact, needByDate, cakeType, frosting, size, shape, description } = req.body;

    // Fetch the latest OwnerID from the Owner table
    const getOwnerIdQuery = 'SELECT OwnerID FROM Owner ORDER BY OwnerID DESC LIMIT 1';

    db.query(getOwnerIdQuery, (err, result) => {
        if (err) {
            console.error('Error fetching latest OwnerID:', err);
            return res.status(500).send('Error fetching latest OwnerID');
        }

        const ownerID = result[0]?.OwnerID;
        if (!ownerID) return res.status(500).send('No Owner found in the Owner table');

        let CakeImage = null;
        let imageBuffer = null;
        let imageName = null;

        if (req.file) {
            const params = {
                Bucket: 'cis4375tv',
                Key: `cakeImages/${Date.now()}_${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
                ACL: 'public-read',
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.error('Error uploading image to S3:', err);
                    return res.status(500).send('Error uploading image');
                }

                CakeImage = data.Location;
                imageBuffer = req.file.buffer;
                imageName = req.file.originalname;

                // Save to database and send email
                saveOrderAndSendEmail();
            });
        } else {
            // No image uploaded
            saveOrderAndSendEmail();
        }

        function saveOrderAndSendEmail() {
            const sql = `
                INSERT INTO CakeOrder (name, email, phone, preferredContact, needByDate, cakeType, frosting, size, shape, description, status, OwnerID, CakeImage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?)`;
            
            db.query(sql, [name, email, phone, preferredContact, needByDate, cakeType, frosting, size, shape, description, ownerID, CakeImage], (err, result) => {
                if (err) {
                    console.error('Error inserting order:', err);
                    return res.status(500).send('An error occurred. Please try again later.');
                }

                console.log('Cake order saved successfully with OwnerID:', ownerID);

                // Call the sendOrderEmail function
                sendOrderEmail({ name, email, phone, preferredContact, needByDate, cakeType, frosting, size, shape, description }, imageBuffer, imageName);

                res.json({ success: true, message: 'Order received and email sent!' });
            });
        }
    });
});

module.exports = router;

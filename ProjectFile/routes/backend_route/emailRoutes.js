const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const connection = require('../../config/dbconnection');
require('dotenv').config();

// Email Configuration
const EMAIL_SENDER = process.env.EMAIL_SENDER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_RECEIVER = "parissweet08@gmail.com";

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_SENDER,
        pass: EMAIL_PASSWORD
    }
});

// POST route to handle email form submission
router.post('/send_email', async (req, res) => {
    try {
        const { name, email, phone, contactType, Language, Subject, message } = req.body;

        if (!name || !email || !phone || !contactType || !Language || !Subject || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Email content
        const mailOptions = {
            from: EMAIL_SENDER,
            to: EMAIL_RECEIVER,
            subject: `New Contact Form Submission: ${Subject}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone: ${phone}
                Preferred Contact Method: ${contactType}
                Preferred Language: ${Language}
                Subject: ${Subject}
                Message: ${message}
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        // Save to Database
        const sql = `INSERT INTO contact_requests (name, email, phone, contactType, Language, Subject, message) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(sql, [name, email, phone, contactType, Language, Subject, message], (err, result) => {
            if (err) {
                console.error('Error saving contact request:', err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json({ message: "Your message has been sent and saved successfully!" });
        });


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

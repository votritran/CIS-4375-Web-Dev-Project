const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const connection = require('../../config/dbconnection');
require('dotenv').config(); // Load email credentials from .env

router.get('/login', (req, res) => {
    res.render('login');
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to send password expiration email
function sendExpirationEmail(email, daysUntilExpiration) {
    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: 'Your Password is Expiring Soon',
        text: `Hello, your password will expire in ${daysUntilExpiration} days. Please update it to maintain account security.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return;
        }
    });
}


// Define login route
router.post('/login', async (req, res) => {
    const { email_or_username, password } = req.body;

    connection.query(
        'SELECT * FROM Owner WHERE OwnerEmail = ?',
        [email_or_username],
        async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length > 0) {
                const owner = results[0];
                const validPassword = await bcrypt.compare(password, owner.OwnerPassword);

                if (validPassword) {
                    req.session.owner = { 
                        OwnerID: owner.OwnerID, 
                        OwnerEmail: owner.OwnerEmail, 
                        passwordLastChanged: owner.password_last_changed 
                    };
                    req.session.role = 'admin';

                    const passwordLastChanged = new Date(owner.password_last_changed);
                    const passwordExpiration = new Date(passwordLastChanged);
                    passwordExpiration.setDate(passwordExpiration.getDate() + 90);
                    
                    const now = new Date();
                    const daysUntilExpiration = Math.floor((passwordExpiration - now) / (1000 * 60 * 60 * 24));

                    // If password has expired, force user to change it
                    if (now > passwordExpiration) {
                        return res.status(200).json({
                            role: 'admin',
                            message: 'Your password has expired. Please update it.',
                            redirect: '/forgot-password-email'
                        });
                    }

                    // If password expires in 15 days, send an email
                    if (daysUntilExpiration <= 15) {
                        sendExpirationEmail(owner.OwnerEmail, daysUntilExpiration);
                    }

                    return res.status(200).json({
                        role: 'admin',
                        redirect: '/adminmenu'
                    });
                }
            }

            res.status(401).json({ message: "Invalid credentials" });
        }
    );
});

module.exports = router;


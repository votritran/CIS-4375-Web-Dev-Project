require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const connection = require('../../config/dbconnection');

// Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_SENDER,  
        pass: process.env.EMAIL_PASSWORD 
    }
});

// Render email input page
router.get('/forgot-password-email', (req, res) => {
    const emailSent = req.query.emailSent || false;
    res.render('forgot_password_email', { emailSent });  
});


// Handle the email submission to send a password reset link
router.post('/forgot-password-email', (req, res) => {
    const { email } = req.body;

    connection.query('SELECT * FROM Owner WHERE OwnerEmail = ?', [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found" });
        }

        // If email found, send reset link
        const resetLink = `http://localhost:3000/forgot-password?email=${encodeURIComponent(email)}`;

        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: "Reset Your Password",
            text: `Click the link below to reset your password:\n${resetLink}`,
            html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error sending email" });
            }
            
            return res.redirect(`/forgot-password-email?emailSent=true`);
        });
    });
});

// Render the forgot password page where the user can enter a new password
router.get('/forgot-password', (req, res) => {
    res.render('forgotpassword', { email: req.query.email }); 
});

const bcrypt = require('bcrypt');

router.post('/forgot-password', (req, res) => {
    const { email, newPassword } = req.body;  

    
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // Validate the password before proceeding
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: "Password must be at least 8 characters long, contain 1 number, and 1 special character." });
    }

    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Update the password and password_last_changed in the database
        connection.query(
            'UPDATE Owner SET OwnerPassword = ?, password_last_changed = NOW() WHERE OwnerEmail = ?',
            [hashedPassword, email],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Email not found' });
                }

                res.json({ message: 'Password updated successfully!' });
            }
        );
    });
});



module.exports = router;



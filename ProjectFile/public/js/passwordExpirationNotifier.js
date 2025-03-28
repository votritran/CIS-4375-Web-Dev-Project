const connection = require('../../config/dbconnection');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cron = require('node-cron');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to send expiration email
function sendExpirationEmail(email, daysUntilExpiration) {
    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: 'Your Password is Expiring Soon',
        text: `Hello, your password will expire in ${daysUntilExpiration} days. Please update it to maintain account security.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending email to ${email}:`, error);
        }
    });
}

// Function to check password expiration and send emails
function checkPasswordExpirations() {
    const now = new Date();
    
    connection.query('SELECT OwnerEmail, password_last_changed FROM Owner', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return;
        }

        results.forEach(owner => {
            const passwordLastChanged = new Date(owner.password_last_changed);
            const passwordExpiration = new Date(passwordLastChanged);
            passwordExpiration.setDate(passwordExpiration.getDate() + 90);

            const daysUntilExpiration = Math.floor((passwordExpiration - now) / (1000 * 60 * 60 * 24));

            // Check if the password expiration is exactly 15, 10, or 5 days away
            if ([15, 10, 5].includes(daysUntilExpiration)) {
                sendExpirationEmail(owner.OwnerEmail, daysUntilExpiration);
            }
        });
    });
}

// Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running password expiration check...');
    checkPasswordExpirations();
}, {
    timezone: 'America/Chicago' 
});




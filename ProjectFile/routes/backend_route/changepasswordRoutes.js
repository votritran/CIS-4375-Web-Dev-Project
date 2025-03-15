const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../../config/dbconnection');

router.post('/change-password', async (req, res) => {
    if (!req.session.owner) {
        return res.redirect('/login'); // Ensure user is logged in
    }

    const { newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = req.session.owner;  // Get user from session

    try {
        

        // Set password expiration to 90 days from the current date
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90); // 90 days expiration

        

        // Update the password in the database and update password_last_changed
        connection.query(
            `UPDATE Owner SET OwnerPassword = ?, password_last_changed = NOW() WHERE OwnerID = ?`,
            [hashedPassword, user.OwnerID],
            (err, results) => {
                if (err) {
        
                    return res.status(500).json({ message: 'Failed to update password', error: err });
                }

                // Check if the update was successful
                if (results.affectedRows === 0) {
                    
                    return res.status(400).json({ message: 'Failed to update password: Owner not found' });
                }

                

                // Update session with new expiration date
                req.session.owner.passwordExpiration = expirationDate;

                return res.redirect('/'); // Redirect to dashboard after success
            }
        );
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

module.exports = router;



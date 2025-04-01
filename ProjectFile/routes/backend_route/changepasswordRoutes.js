const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../../config/dbconnection');

router.post('/change-password', async (req, res) => {
    if (!req.session.owner) {
        return res.redirect('/login');
    }

    const { newPassword, confirmPassword } = req.body;

    // password rules
    const passwordRegex = /^(?=.*\d)(?=.*[\W_]).{8,}$/; 

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Both password fields are required' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters, contain 1 number, and 1 special character.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = req.session.owner;

    try {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);

        connection.query(
            `UPDATE Owner SET OwnerPassword = ?, password_last_changed = NOW() WHERE OwnerID = ?`,
            [hashedPassword, user.OwnerID],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to update password', error: err });
                }

                if (results.affectedRows === 0) {
                    return res.status(400).json({ message: 'Failed to update password: Owner not found' });
                }

                req.session.owner.passwordExpiration = expirationDate;

                return res.redirect('/');
            }
        );
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});


module.exports = router;



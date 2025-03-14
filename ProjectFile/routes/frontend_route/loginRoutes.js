const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../../config/dbconnection');

router.get('/login', (req, res) => {
    res.render('login');
});

// Define POST route for login
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
                        passwordLastChanged: owner.password_last_changed 
                    };
                    req.session.role = 'admin';
                
                    const passwordLastChanged = new Date(owner.password_last_changed);
                    const passwordExpiration = new Date(passwordLastChanged);
                    passwordExpiration.setDate(passwordExpiration.getDate() + 90);
                
                    const now = new Date();
                    
                    if (now > passwordExpiration) {
                        return res.status(200).json({
                            role: 'admin',
                            message: 'Your password has expired. Please update it.',
                            redirect: '/account'
                        });
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



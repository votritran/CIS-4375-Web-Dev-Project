const express = require('express');
const router = express.Router(); // This was 'route' in your code, change it to 'router'

// Assuming you have bcrypt and connection set up already
const bcrypt = require('bcrypt');
const connection = require('../config/dbconnection'); // Import your database connection

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
                    return res.status(200).json({
                        role: 'admin',
                        redirect: '/'
                    });
                }
            }

            connection.query(
                'SELECT * FROM Customer WHERE CustomerEmail = ?',
                [email_or_username],
                async (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Database error" });
                    }

                    if (results.length > 0) {
                        const customer = results[0];
                        const validPassword = await bcrypt.compare(password, customer.CustomerPassword);

                        if (validPassword) {
                            return res.status(200).json({
                                role: 'customer',
                                redirect: '/menu'
                            });
                        }
                    }

                    res.status(401).json({ message: "Invalid credentials" });
                }
            ); 
        }
    );
});

module.exports = router;

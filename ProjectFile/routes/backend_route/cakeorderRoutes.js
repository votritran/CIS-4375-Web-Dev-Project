const express = require('express');
const router = express.Router();
const db = require('../../config/dbconnection'); // Import database connection

// Handle Cake Order Form Submission
router.post('/cakeorder', (req, res) => {
    const { name, email, phone, needByDate, cakeType, frosting, size, shape, description } = req.body;

    // Insert order details into the database
    const sql = `INSERT INTO CakeOrder (name, email, phone, needByDate, cakeType, frosting, size, shape, description, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`;

    db.query(sql, [name, email, phone, needByDate, cakeType, frosting, size, shape, description], (err, result) => {
        if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).json({ error: 'Database error. Please try again later.' });
        }

        console.log('New Cake Order Added with ID:', result.insertId);
        res.status(200).json({ message: 'Order placed successfully!' });
    });
});

// Export the router
module.exports = router;

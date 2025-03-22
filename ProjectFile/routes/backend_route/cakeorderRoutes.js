const express = require('express');
const router = express.Router();
const db = require('../../config/dbconnection'); // Import database connection

// Handle Cake Order Form Submission
router.post('/cakeorder', (req, res) => {
    const { name, email, phone, needByDate, cakeType, frosting, size, shape, description } = req.body;

    // Fetch the latest OwnerID from the Owner table
    const getOwnerIdQuery = 'SELECT OwnerID FROM Owner ORDER BY OwnerID DESC LIMIT 1';

    db.query(getOwnerIdQuery, (err, result) => {
        if (err) {
            console.error('Error fetching latest OwnerID:', err);
            return res.status(500).send('Error fetching latest OwnerID');
        }

        const ownerID = result[0]?.OwnerID;

        if (!ownerID) {
            return res.status(500).send('No Owner found in the Owner table');
        }

        // Insert order details into the database including OwnerID
        const sql = `
            INSERT INTO CakeOrder (name, email, phone, needByDate, cakeType, frosting, size, shape, description, status, OwnerID) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)`;

        db.query(sql, [name, email, phone, needByDate, cakeType, frosting, size, shape, description, ownerID], (err, result) => {
            if (err) {
                console.error('Database insertion error:', err);
                return res.status(500).json({ error: 'Database error. Please try again later.' });
            }

            console.log('New Cake Order Added with ID:', result.insertId, 'OwnerID:', ownerID);
            res.status(200).json({ message: 'Order placed successfully!' });
        });
    });
});

// Export the router
module.exports = router;

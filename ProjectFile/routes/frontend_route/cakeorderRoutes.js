const express = require('express');
const router = express.Router();
const db = require('../../config/dbconnection');

// Route to render the Cake Order page
router.get('/cakeorder', (req, res) => {
    res.render('cakeorder');  // Render cakeorder.ejs
});

// Route to handle form submission
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
                console.error('Error inserting order:', err);
                return res.status(500).send('An error occurred. Please try again later.');
            }

            console.log('Cake order saved successfully with OwnerID:', ownerID);
            res.json({ success: true, message: 'Order received' });
        });
    });
});

module.exports = router;

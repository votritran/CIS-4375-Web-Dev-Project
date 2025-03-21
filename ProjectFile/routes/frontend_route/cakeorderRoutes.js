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

    // Insert query
    const sql = `INSERT INTO CakeOrder (name, email, phone, needByDate, cakeType, frosting, size, shape, description, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`;

    // Execute query
    db.query(sql, [name, email, phone, needByDate, cakeType, frosting, size, shape, description], (err, result) => {
        if (err) {
            console.error("Error inserting order:", err);
            return res.status(500).send("An error occurred. Please try again later.");
        }
        console.log("Cake order saved successfully!");
        res.json({ success: true, message: "Order received" });
    });
});

module.exports = router;

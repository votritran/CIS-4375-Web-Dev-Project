const express = require('express');
const isAuthenticated = require('../../middleware/auth'); // Ensure authentication works
const router = express.Router();
const db = require('../../config/dbconnection');

// Route to fetch Cake Orders and render CakeReq.ejs
router.get('/cakereq', isAuthenticated, (req, res) => {
    const query = "SELECT * FROM CakeOrder ORDER BY needByDate ASC";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching Cake Orders:", err);
            return res.status(500).send("Database Error");
        }

        console.log("Fetched Cake Orders:", results); // Debugging

        // Render CakeReq.ejs and pass cakeOrders data
        res.render('CakeReq', { cakeOrders: results });
    });
});

module.exports = router;
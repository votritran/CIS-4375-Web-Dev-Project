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

// Update Order Status in Database
router.post('/update_order_status', (req, res) => {
    const { orderID, status } = req.body;

    // Ensure valid status values
    const validStatuses = ["New", "Pending", "Completed"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const query = "UPDATE CakeOrder SET status = ? WHERE OrderID = ?";
    db.query(query, [status, orderID], (err, result) => {
        if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).json({ success: false, error: "Database Error" });
        }

        console.log(`Order ${orderID} status updated to ${status}`);
        res.json({ success: true });
    });
});


module.exports = router;
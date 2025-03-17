const express = require('express');
const isAuthenticated = require('../../middleware/auth');
const router = express.Router();

router.get('/cakereq', isAuthenticated, (req, res) => {
    console.log("Rendering CakeReq.ejs"); // Debugging log
    res.render('adminview/CakeReq', { testMessage: "Cake Request Page Loaded" });
});

module.exports = router;

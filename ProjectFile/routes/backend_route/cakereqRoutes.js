const express = require('express');
const isAuthenticated = require('../../middleware/auth'); // Ensure authentication works
const router = express.Router();

router.get('/cakereq', isAuthenticated, (req, res) => {
    res.render('CakeReq');
});

module.exports = router;

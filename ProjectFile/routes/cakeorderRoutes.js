// routes/cakeorderRoutes.js
const express = require('express');
const router = express.Router();

// Route to render the Cake Order page
router.get('/cakeorder', (req, res) => {
    res.render('cakeorder');  // Render cakeOrder.ejs
});

module.exports = router;

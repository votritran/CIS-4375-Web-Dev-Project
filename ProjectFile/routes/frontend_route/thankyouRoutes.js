const express = require('express');
const router = express.Router();

// Route to render the Thank You page
router.get('/thankyou', (req, res) => {
    res.render('thankyou'); // Ensure the correct path to your EJS file
});

module.exports = router;

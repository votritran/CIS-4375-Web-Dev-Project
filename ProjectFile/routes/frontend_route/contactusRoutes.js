const express = require('express');
const router = express.Router();
router.get('/contactus', (req, res) => {
    res.render('contactus', {
        title: 'Paris Sweet Patisserie',
        contactNumber: '(281) 498-0887'
    });
});

module.exports = router;
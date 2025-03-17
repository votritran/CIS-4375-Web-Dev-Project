const express = require('express');
const router = express.Router();
router.get('/contactus', (req, res) => {

    if (req.session && req.session.owner) {
        // If the user is logged in, redirect to the admin event page
        return res.redirect('/admincontact');  // Redirect to the admin event (admin event page)
    }
    res.render('contactus', {
        title: 'Paris Sweet Patisserie',
        contactNumber: '(281) 498-0887'
    });
});

module.exports = router;
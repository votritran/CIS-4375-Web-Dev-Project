const express = require('express');
const router = express.Router();
const connection = require('../../config/dbconnection');
router.get('/event', (req, res) => {

    if (req.session && req.session.owner) {
        // If the user is logged in, redirect to the admin event page
        return res.redirect('/adminevent');  // Redirect to the admin event (admin event page)
    }
    
    connection.query('SELECT * FROM Events', (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).send('Error fetching menu items');
        }

    

    res.render('event', { events: results });

    });
});


module.exports = router;
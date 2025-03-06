const express = require('express');
const router = express.Router();
const connection = require('../config/dbconnection');
router.get('/event', (req, res) => {
    
    connection.query('SELECT * FROM Events', (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).send('Error fetching menu items');
        }

    

    res.render('event', { events: results });

    });
});


module.exports = router;
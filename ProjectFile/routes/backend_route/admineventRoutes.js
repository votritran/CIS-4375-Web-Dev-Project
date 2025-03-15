const express = require('express');
const router = express.Router();
const connection = require('../../config/dbconnection');
const isAuthenticated = require('../../middleware/auth');
const path = require('path');
router.get('/adminevent', isAuthenticated, (req, res) => {
    
    connection.query('SELECT * FROM Events', (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).send('Error fetching menu items');
        }

    

    res.render(path.join(__dirname, '../../views', 'adminview', 'adminevent'), { events: results });

    });
});


module.exports = router;
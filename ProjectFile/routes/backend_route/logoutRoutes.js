const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid'); 
            return res.redirect('/login'); 
        });
    } else {
        return res.redirect('/login'); 
    }
});

module.exports = router;


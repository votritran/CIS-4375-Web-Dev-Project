const express = require('express');
const isAuthenticated = require('../../middleware/auth');
const router = express.Router();
const path = require('path');
router.get('/adminhome', isAuthenticated,(req, res) => {
    // Corrected slideshow images array
    const slideshowImages = [
        '/photo/slideshow/france.jpg',
        '/photo/slideshow/macaron.jpg',
        '/photo/slideshow/coffee.jpg',
        '/photo/slideshow/pastry.jpg',
        '/photo/slideshow/onionsoup.jpg'
    ];

    // Render the 'home' view with the slideshow images array
    res.render(path.join(__dirname, '../../views', 'adminview', 'adminhome'), { slideshowImages });
});

module.exports = router;
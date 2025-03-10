const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Corrected slideshow images array
    const slideshowImages = [
        '/photo/slideshow/france.jpg',
        '/photo/slideshow/macaron.jpg',
        '/photo/slideshow/coffee.jpg',
        '/photo/slideshow/pastry.jpg',
        '/photo/slideshow/onionsoup.jpg'
    ];

    // Render the 'home' view with the slideshow images array
    res.render('home', { slideshowImages });
});

module.exports = router;
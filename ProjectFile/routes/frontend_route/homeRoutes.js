const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

    if (req.session && req.session.owner) {
        // If the user is logged in, redirect to the admin home page
        return res.redirect('/adminhome');  // Redirect to the admin (admin home page)
    }
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
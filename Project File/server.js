// Import required modules
const express = require('express');
const path = require('path');
const connection = require('./config/dbconnection'); // Import the database connection
require('dotenv').config();  // Load environment variables from .env file
//Import menu routes
const menuRoutes = require('./routes/menuRoutes');
const cakeorderRoutes = require('./routes/cakeorderRoutes');
// Initialize Express app
const app = express();

// Set the port from environment variables or default to 3000
const port = process.env.PORT || 3000;

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views', 'userview'));
app.set('view engine', 'ejs');

// Define static folder for serving CSS, images, and JS files
app.use(express.static(path.join(__dirname, 'public')));
app.use(menuRoutes);
app.use(cakeorderRoutes);

// Route to render the Home page
app.get('/', (req, res) => {
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

// Route to render the Cake Order page


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

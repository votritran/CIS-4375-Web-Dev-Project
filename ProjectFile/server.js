const express = require('express');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Import routes
const homeRoutes = require('./routes/frontend_route/homeRoutes');
const menuRoutes = require('./routes/frontend_route/menuRoutes');
const cakeorderRoutes = require('./routes/frontend_route/cakeorderRoutes');
const eventRoutes = require('./routes/frontend_route/eventRoutes');
const contactusRoutes = require('./routes/frontend_route/contactusRoutes');
const loginRoutes = require('./routes/frontend_route/loginRoutes');


//backend routes
const adminmenuRoutes = require('./routes/backend_route/adminmenuRoutes');
// Initialize Express app
const app = express();

// Set the port from environment variables or default to 3000
const port = process.env.PORT || 3000;

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views', 'userview'));
app.set('view engine', 'ejs');

// Define static folder for serving CSS, images, and JS files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON request bodies
app.use(express.json()); // This is required for POST requests with JSON data

// Use imported routes
app.use(homeRoutes);
app.use(menuRoutes);
app.use(cakeorderRoutes);
app.use(eventRoutes);
app.use(contactusRoutes);
app.use(loginRoutes);
app.use(adminmenuRoutes);

// Add a catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

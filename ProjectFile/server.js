const express = require('express'); 
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // Load environment variables from .env file

// Import routes
const homeRoutes = require('./routes/frontend_route/homeRoutes');
const menuRoutes = require('./routes/frontend_route/menuRoutes');
const cakeorderRoutes = require('./routes/frontend_route/cakeorderRoutes');
const eventRoutes = require('./routes/frontend_route/eventRoutes');
const contactusRoutes = require('./routes/frontend_route/contactusRoutes');
const loginRoutes = require('./routes/frontend_route/loginRoutes');
const forgotPasswordRoutes = require('./routes/frontend_route/forgotpasswordRoutes');
const logoutRoutes = require('./routes/backend_route/logoutRoutes');


//backend routes
const adminmenuRoutes = require('./routes/backend_route/adminmenuRoutes');
const emailRoutes = require('./routes/backend_route/emailRoutes')
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Required for handling POST requests

// Middleware for sessions 
app.use(session({
    secret: process.env.SECRET_KEY || 'default_secret', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));

// Use imported routes
app.use(homeRoutes);
app.use(menuRoutes);
app.use(cakeorderRoutes);
app.use(eventRoutes);
app.use(contactusRoutes);
app.use(loginRoutes);
app.use(emailRoutes); //Added email routes
app.use(adminmenuRoutes);
app.use(forgotPasswordRoutes);
app.use(logoutRoutes);

// Add a catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

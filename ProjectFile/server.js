const express = require('express'); 
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // Load environment variables from .env file
const cookieParser = require('cookie-parser');
// Import routes
const homeRoutes = require('./routes/frontend_route/homeRoutes');
const menuRoutes = require('./routes/frontend_route/menuRoutes');
const cakeorderRoutes = require('./routes/frontend_route/cakeorderRoutes');
const eventRoutes = require('./routes/frontend_route/eventRoutes');
const contactusRoutes = require('./routes/frontend_route/contactusRoutes');
const loginRoutes = require('./routes/frontend_route/loginRoutes');
const forgotPasswordRoutes = require('./routes/frontend_route/forgotpasswordRoutes');

//backend routes
const adminmenuRoutes = require('./routes/backend_route/adminmenuRoutes');
const emailRoutes = require('./routes/backend_route/emailRoutes')
const logoutRoutes = require('./routes/backend_route/logoutRoutes');
const accountRoutes = require('./routes/backend_route/accountRoutes');
const changepasswordRoutes = require('./routes/backend_route/changepasswordRoutes');
const adminhomeRoutes = require('./routes/backend_route/adminhomeRoutes');
const admineventRoutes = require('./routes/backend_route/admineventRoutes');
const cakeorderBackendRoutes = require('./routes/backend_route/cakeorderRoutes');

// Initialize Express app
const app = express();
// Use cookie-parser middleware to parse cookies
app.use(cookieParser());
// Set the port from environment variables or default to 3000
const port = process.env.PORT || 3000;

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views', 'userview'));
app.set('view engine', 'ejs');

// Define static folder for serving CSS, images, and JS files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// Middleware for sessions 
app.use(session({
    secret: process.env.SECRET_KEY || 'default_secret', 
    resave: false,
    saveUninitialized: false,  
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1-hour session
}));


// Use imported routes
//Frontend routes
app.use(homeRoutes);
app.use(menuRoutes);
app.use(cakeorderRoutes);
app.use(eventRoutes);
app.use(contactusRoutes);
app.use(loginRoutes);
//Backend
app.use(emailRoutes); //Added email routes
app.use(adminmenuRoutes);
app.use(forgotPasswordRoutes);
app.use(logoutRoutes);
app.use(accountRoutes);
app.use(changepasswordRoutes);
app.use(adminhomeRoutes)
app.use(admineventRoutes); 
app.use(cakeorderBackendRoutes);
// Add a catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

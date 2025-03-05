const mysql = require('mysql');
require('dotenv').config();  // Load environment variables from .env file

// Create a MySQL connection using environment variables
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Export the connection so it can be used in other files
module.exports = connection;

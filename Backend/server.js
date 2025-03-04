const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env file
require("dotenv").config();

const app = express();
const SECRET_KEY = process.env.SECRET_KEY; 

// Middleware
app.use(cookieParser());
app.use(express.json());

// Serve user view files 
app.use("/user%20view", express.static(path.join(__dirname, "../Frontend/user view")));

// Serve CSS, JS, and photos
// Serve the content folder for CSS, JS
app.use("/content", express.static(path.join(__dirname, "../Frontend/content")));

app.use("/js", express.static(path.join(__dirname, "../Frontend/js")));
app.use("/photo", express.static(path.join(__dirname, "../Frontend/photo")));

// Middleware to verify the token for admin access
function verifyToken(req, res, next) {
    const token = req.cookies.token;
    
    console.log("Received Token:", token); 
  
    if (!token) {
      return res.status(403).send("Access denied. Please log in.");
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log("Decoded Token:", decoded); 
  
      req.user = decoded;
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      res.status(401).send("Invalid token.");
    }
  }
  

// Serve admin view files only if authenticated
app.use("/admin%20view", verifyToken, express.static(path.join(__dirname, "../Frontend/admin view")));

// Login route (communicates with Flask backend)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post("http://127.0.0.1:5000/login", {
      email,
      password,
    });

    if (response.data.success) {
      // Set the token as a cookie
      res.cookie("token", response.data.token, { httpOnly: true });
      res.json({ success: true, redirect: "/admin%20view/admin_menu.html" });
    } else {
      res.status(401).json({ success: false, message: response.data.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the token cookie
  res.json({ success: true, redirect: "/user%20view/login.html" });
});

// Route to check authentication
app.get("/check-auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    jwt.verify(token, SECRET_KEY);
    res.json({ isAuthenticated: true });
  } catch (err) {
    res.json({ isAuthenticated: false });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


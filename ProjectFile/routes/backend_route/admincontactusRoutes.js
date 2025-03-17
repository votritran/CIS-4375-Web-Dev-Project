
/*
const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../../config/dbconnection');

// Fetch Contact Requests
router.get('/admincontact', (req, res) => {
    connection.query('SELECT * FROM contact_requests ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error('Error fetching contact requests:', err);
            return res.status(500).json({ error: "Database error" });
        }
        res.render(path.join(__dirname, '../../views', 'adminview', 'admincontact'), { events: results });
    });
});

module.exports = router; */
const express = require('express');
const router = express.Router();
const path = require('path'); // ✅ Ensure path is imported
const connection = require('../../config/dbconnection');

// Admin Contact Page Route
router.get('/admincontact', (req, res) => {
    connection.query('SELECT * FROM contact_requests ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error('Error fetching contact requests:', err);
            return res.status(500).send("Database error occurred");
        }
        res.render(path.join(__dirname, '../../views', 'adminview', 'admincontact'), { contacts: results });
    });
});

// Delete Contact Request
router.delete('/delete_contact/:id', (req, res) => {
    const contactId = req.params.id;
    
    connection.query('DELETE FROM contact_requests WHERE id = ?', [contactId], (err, result) => {
        if (err) {
            console.error('Error deleting contact request:', err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true });
    });
});

// Mark Contact as Seen
router.put('/toggle_seen/:id', (req, res) => {
    const contactId = req.params.id;

    // Get current seen status
    connection.query('SELECT seen FROM contact_requests WHERE id = ?', [contactId], (err, results) => {
        if (err) {
            console.error('Error fetching contact:', err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Contact not found" });
        }

        const newSeenStatus = !results[0].seen; // Toggle true/false

        // Update the seen status in the database
        connection.query('UPDATE contact_requests SET seen = ? WHERE id = ?', [newSeenStatus, contactId], (err, result) => {
            if (err) {
                console.error('Error updating seen status:', err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ success: true, seen: newSeenStatus });
        });
    });
});

module.exports = router;



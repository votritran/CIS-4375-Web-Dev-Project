const express = require('express');
const router = express.Router();
const connection = require('../../config/dbconnection');
const isAuthenticated = require('../../middleware/auth');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

//AWS S3
AWS.config.update({
    accessKeyId: 'AKIAXFG5L4NB7TWHTIMP',
    secretAccessKey: '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',
    region: 'us-east-1',
});

const s3 = new AWS.S3();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/adminevent', isAuthenticated, (req, res) => {
    
    connection.query('SELECT * FROM Events', (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).send('Error fetching menu items');
        }

    

    res.render(path.join(__dirname, '../../views', 'adminview', 'adminevent'), { events: results });

    });
});

// Route to handle adding a new event
router.post('/adminevent/add', upload.single('eventImage'), (req, res) => {
    const { eventName, eventDescription, eventDate, eventTime } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    // Upload the image to AWS S3
    const s3Params = {
        Bucket: 'cis4375tv', 
        Key: `events/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
    };

    s3.upload(s3Params, (err, data) => {
        if (err) {
            console.error('Error uploading image to S3:', err);
            return res.status(500).send('Error uploading image to S3');
        }

        const eventImageUrl = data.Location; // Get the public URL of the uploaded image

        // Save the event details to the database
        const query = `INSERT INTO Events (EventName, EventDescription, EventDate, EventTime, EventImage) 
                        VALUES (?, ?, ?, ?, ?)`;

        connection.query(query, [eventName, eventDescription, eventDate, eventTime, eventImageUrl], (err, result) => {
            if (err) {
                console.error('Error adding event:', err);
                return res.status(500).send('Error adding event');
            }

            // Redirect back to the events page
            res.redirect('/adminevent');
        });
    });
});


module.exports = router;
const express = require('express');
const router = express.Router();
const connection = require('../../config/dbconnection');
const isAuthenticated = require('../../middleware/auth');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

//AWS S3
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,  
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  
    region: process.env.AWS_REGION

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
        results.forEach(event => {
            event.EventDate = new Date(event.EventDate).toISOString().split('T')[0];
        });

    

    res.render(path.join(__dirname, '../../views', 'adminview', 'adminevent'), { events: results });

    });
});

// Route to handle adding a new event
router.post('/adminevent/add', isAuthenticated, upload.single('eventImage'), (req, res) => {
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


// Get event data for updating
router.get('/adminevent/getEvent/:id', isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
    const query = 'SELECT * FROM Events WHERE EventID = ?';

    connection.query(query, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event:', err);
            return res.status(500).send('Error fetching event');
        }

        if (results.length === 0) {
            return res.status(404).send('Event not found');
        }

        res.json(results[0]);  // Send the event data to populate the form
    });
});


router.post('/adminevent/update', isAuthenticated, upload.single('eventImage'), async (req, res) => {
    const { eventId, eventName, eventDescription, eventDate, eventTime } = req.body;
    let updatedData = {};

    try {
        // Fetch the current event's details from the database
        const query = 'SELECT * FROM Events WHERE EventID = ?';
        connection.query(query, [eventId], async (err, results) => {
            if (err) {
                console.error('Error fetching event:', err);
                return res.status(500).send('Error fetching event');
            }

            if (results.length === 0) {
                return res.status(404).send('Event not found');
            }

            const currentEvent = results[0];

            // Check each field and update it if it's not empty
            updatedData.EventName = eventName || currentEvent.EventName;
            updatedData.EventDescription = eventDescription || currentEvent.EventDescription;
            updatedData.EventDate = eventDate || currentEvent.EventDate;
            updatedData.EventTime = eventTime || currentEvent.EventTime;

            // If a new image is uploaded, delete the old one and upload the new one to S3
            if (req.file) {
                const oldImageUrl = currentEvent.EventImage;
                const oldImageKey = oldImageUrl.split('/').pop(); // Extract the file name from the URL

                // Delete the old image from S3
                await s3.deleteObject({ Bucket: 'cis4375tv', Key: oldImageKey }).promise();

                // Upload the new image to S3
                const newImage = await s3.upload({
                    Bucket: 'cis4375tv',
                    Key: `events/${Date.now()}-${req.file.originalname}`, // Use Date.now() for unique file names
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                }).promise();

                updatedData.EventImage = newImage.Location; // Set the new image URL
            } else {
                updatedData.EventImage = currentEvent.EventImage; // Keep the old image if none is uploaded
            }

            // Update the event in the database
            const updateQuery = `
                UPDATE Events 
                SET EventName = ?, EventDescription = ?, EventDate = ?, EventTime = ?, EventImage = ? 
                WHERE EventID = ?
            `;
            connection.query(updateQuery, [
                updatedData.EventName,
                updatedData.EventDescription,
                updatedData.EventDate,
                updatedData.EventTime,
                updatedData.EventImage,
                eventId
            ], (err, result) => {
                if (err) {
                    console.error('Error updating event:', err);
                    return res.status(500).send('Error updating event');
                }

                res.redirect('/adminevent'); // Redirect back to the events page after the update
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating event');
    }
});

// Delete Event Route
router.post('/adminevent/delete/:eventId', isAuthenticated, (req, res) => {
    const eventId = req.params.eventId;

    // Query to get the image URL of the event
    const query = 'SELECT EventImage FROM Events WHERE EventID = ?';
    connection.query(query, [eventId], (err, results) => {
        if (err) {
            console.error('Error retrieving event image:', err);
            return res.status(500).send('Error retrieving event image');
        }

        if (results.length === 0) {
            return res.status(404).send('Event not found');
        }

        // Get the S3 key (image name) from the result
        const imageUrl = results[0].EventImage;
        const s3Key = imageUrl.split('/').pop(); // Assuming the S3 key is the image filename

        // Set up parameters for deleting the image from S3
        const deleteParams = {
            Bucket: 'cis4375tv',  
            Key: s3Key  // The key (filename) of the image you want to delete
        };

        // Delete the image from S3
        s3.deleteObject(deleteParams, (err, data) => {
            if (err) {
                console.error('Error deleting image from S3:', err);
                return res.status(500).send('Error deleting image from S3');
            }

            // Proceed to delete the event from the database
            const deleteEventQuery = 'DELETE FROM Events WHERE EventID = ?';
            connection.query(deleteEventQuery, [eventId], (err, result) => {
                if (err) {
                    console.error('Error deleting event:', err);
                    return res.status(500).send('Error deleting event');
                }

                // Redirect to the event page after deletion
                res.redirect('/adminevent');
            });
        });
    });
});



module.exports = router;
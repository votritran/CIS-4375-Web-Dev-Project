const express = require('express');
const router = express.Router();
router.get('/event', (req, res) => {
    const events = [
        {
            image: '../photo/event/bdaycake.jpg',
            title: 'Chocolate Cake Making Workshop',
            date: 'March 12, 2025',
            time: '2:00 PM - 4:00 PM',
            description: 'Join us for a hands-on chocolate cake making workshop. Learn tips and tricks from expert bakers!'
        },
        {
            image: '../photo/event/bdaycake.jpg',
            title: 'Macaron Tasting',
            date: 'March 20, 2025',
            time: '1:00 PM - 3:00 PM',
            description: 'A delightful event to taste a variety of macarons. Come indulge your taste buds!'
        },
        // Add more event objects as needed
    ];

    res.render('event', { events });
});


module.exports = router;
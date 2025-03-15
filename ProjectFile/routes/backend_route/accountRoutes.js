const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../../config/dbconnection'); 

router.get('/account', (req, res) => {
    if (!req.session.owner) {
        return res.redirect('/login'); 
    }

    
    const passwordLastChanged = req.session.owner.passwordLastChanged 
        ? new Date(req.session.owner.passwordLastChanged)
        : new Date();

    const passwordExpiration = new Date(passwordLastChanged);
    passwordExpiration.setDate(passwordExpiration.getDate() + 90);

    const now = new Date();
    const timeLeft = Math.max(0, Math.floor((passwordExpiration - now) / (1000 * 60 * 60 * 24)));

    res.render('../adminview/account', { timeLeft });
});



router.get('/change-password', (req, res) => {
    if (!req.session.owner || !req.session.owner.OwnerID) {  
        console.log("No valid session, redirecting...");
        return res.redirect('/login'); 
    }
    res.render('../adminview/change-password'); 
});


// Route to handle password update
router.post('/update-password', async (req, res) => {
    if (!req.session.ownerID) {
        return res.redirect('/login'); 
    }

    const newPassword = req.body.newPassword;
    if (!newPassword) {
        return res.status(400).send("Password is required.");
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        connection.query(
            "UPDATE Owner SET OwnerPassword = ? WHERE OwnerID = ?",
            [hashedPassword, req.session.ownerID],
            (err, result) => {
                if (err) {
                    console.error("Error updating password:", err);
                    return res.status(500).send("An error occurred while updating the password.");
                }

                console.log("Password updated successfully:", result);
                res.redirect('/account'); 
            }
        );
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

module.exports = router;


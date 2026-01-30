const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get chat history with a specific user
router.get('/history/:otherUserId', auth(), (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const query = `
        SELECT * FROM messages 
        WHERE (senderId = ? AND receiverId = ?) 
           OR (senderId = ? AND receiverId = ?)
        ORDER BY timestamp ASC
    `;
    
    db.all(query, [userId, otherUserId, otherUserId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Search staff by name or email
router.get('/search/staff', auth(), (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) {
        return res.json([]);
    }

    const sql = `
        SELECT id, name, email, department, role 
        FROM users 
        WHERE status = 'Active' 
        AND (name LIKE ? OR email LIKE ?)
        LIMIT 10
    `;
    const searchParam = `%${query}%`;
    
    db.all(sql, [searchParam, searchParam], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

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

// Get unread message count
router.get('/unread/count', auth(), (req, res) => {
    const userId = req.user.id;
    db.get(
        "SELECT COUNT(*) as count FROM messages WHERE receiverId = ? AND isRead = 0",
        [userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ count: row.count });
        }
    );
});

// Get unread counts by sender
router.get('/unread/senders', auth(), (req, res) => {
    const userId = req.user.id;
    db.all(
        "SELECT senderId, COUNT(*) as count FROM messages WHERE receiverId = ? AND isRead = 0 GROUP BY senderId",
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Mark messages from a specific sender as read
router.put('/mark-read/:senderId', auth(), (req, res) => {
    const userId = req.user.id;
    const { senderId } = req.params;

    db.run(
        "UPDATE messages SET isRead = 1 WHERE receiverId = ? AND senderId = ? AND isRead = 0",
        [userId, senderId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Messages marked as read", changes: this.changes });
        }
    );
});

module.exports = router;
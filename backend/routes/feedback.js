const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Submit Feedback (Employee/Manager)
router.post('/', auth(), (req, res) => {
    const { type, content, rating } = req.body;
    const userId = req.headers.userid;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    db.run(`
        INSERT INTO feedback (userId, type, content, rating, status)
        VALUES (?, ?, ?, ?, 'New')
    `, [userId, type, content, rating], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Feedback submitted', id: this.lastID });
    });
});

// Get My Feedback (Employee)
router.get('/my', auth(), (req, res) => {
    const userId = req.headers.userid;
    db.all("SELECT * FROM feedback WHERE userId = ? ORDER BY createdAt DESC", [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get All Feedback (Admin/Manager)
router.get('/', auth('Manager'), (req, res) => {
    db.all(`
        SELECT f.*, u.name as userName, u.department 
        FROM feedback f
        LEFT JOIN users u ON f.userId = u.id
        ORDER BY f.createdAt DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update Status (Admin/Manager)
router.put('/:id', auth('Manager'), (req, res) => {
    const { status } = req.body;
    db.run("UPDATE feedback SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated' });
    });
});

module.exports = router;
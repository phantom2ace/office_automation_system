const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get all published articles (for employees)
router.get('/', (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT kb.*, u.name as authorName FROM knowledge_base kb LEFT JOIN users u ON kb.authorId = u.id WHERE kb.isPublished = 1";
    let params = [];

    if (category) {
        query += " AND kb.category = ?";
        params.push(category);
    }

    if (search) {
        query += " AND (kb.title LIKE ? OR kb.content LIKE ?)";
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }

    query += " ORDER BY kb.createdAt DESC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single article
router.get('/:id', (req, res) => {
    const query = "SELECT kb.*, u.name as authorName FROM knowledge_base kb LEFT JOIN users u ON kb.authorId = u.id WHERE kb.id = ?";
    db.get(query, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Article not found' });
        
        // Increment view count
        db.run("UPDATE knowledge_base SET views = views + 1 WHERE id = ?", [req.params.id]);
        
        res.json(row);
    });
});

// Create article (Manager/Admin)
router.post('/', auth("Manager"), (req, res) => {
    const { title, content, category } = req.body;
    const authorId = req.user.id;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    db.run(`
        INSERT INTO knowledge_base (title, content, category, authorId, isPublished)
        VALUES (?, ?, ?, ?, 1)
    `, [title, content, category, authorId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Article created successfully' });
    });
});

// Update article
router.put('/:id', auth(), (req, res) => {
    const { title, content, category, isPublished } = req.body;
    
    db.run(`
        UPDATE knowledge_base 
        SET title = ?, content = ?, category = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [title, content, category, isPublished, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Article updated successfully' });
    });
});

// Delete article
router.delete('/:id', auth(), (req, res) => {
    db.run("DELETE FROM knowledge_base WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Article deleted successfully' });
    });
});

// Get categories
router.get('/meta/categories', (req, res) => {
    db.all("SELECT DISTINCT category FROM knowledge_base WHERE category IS NOT NULL", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => r.category));
    });
});

module.exports = router;
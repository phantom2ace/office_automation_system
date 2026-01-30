const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// ================= DEALS (Kanban) =================

// Get all deals
router.get('/deals', auth('Staff'), (req, res) => {
  db.all(`
    SELECT d.*, c.name as customerName 
    FROM deals d
    LEFT JOIN customers c ON d.customerId = c.id
    ORDER BY d.updatedAt DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create deal
router.post('/deals', auth('Staff'), (req, res) => {
  const { title, value, customerId, stage, expectedCloseDate, assignedTo } = req.body;
  
  db.run(`
    INSERT INTO deals (title, value, customerId, stage, expectedCloseDate, assignedTo, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [title, value, customerId, stage || 'Prospecting', expectedCloseDate, assignedTo || req.headers.userid],
  function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Deal created successfully' });
  });
});

// Update deal stage
router.patch('/deals/:id/stage', auth('Staff'), (req, res) => {
  const { stage } = req.body;
  
  db.run(`
    UPDATE deals 
    SET stage = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [stage, req.params.id],
  (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deal stage updated' });
  });
});

// ================= LEADS =================

// Get all leads
router.get('/leads', auth('Staff'), (req, res) => {
  db.all(`
    SELECT l.*, u.name as assignedToName 
    FROM leads l
    LEFT JOIN users u ON l.assignedTo = u.id
    ORDER BY l.createdAt DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create lead
router.post('/leads', auth('Staff'), (req, res) => {
  const { name, email, phone, company, source, assignedTo, notes } = req.body;
  
  db.run(`
    INSERT INTO leads (name, email, phone, company, source, assignedTo, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, email, phone, company, source, assignedTo || req.headers.userid, notes], 
  function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Lead created successfully' });
  });
});

// Update lead
router.put('/leads/:id', auth('Staff'), (req, res) => {
  const { name, email, phone, company, source, status, assignedTo, notes } = req.body;
  
  db.run(`
    UPDATE leads 
    SET name = ?, email = ?, phone = ?, company = ?, source = ?, status = ?, assignedTo = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, email, phone, company, source, status, assignedTo, notes, req.params.id],
  (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Lead updated successfully' });
  });
});

// Convert Lead to Customer (Optional automation)
router.post('/leads/:id/convert', auth('Staff'), (req, res) => {
  const leadId = req.params.id;
  
  // 1. Get lead details
  db.get('SELECT * FROM leads WHERE id = ?', [leadId], (err, lead) => {
    if (err || !lead) return res.status(404).json({ error: 'Lead not found' });
    
    // 2. Insert into customers
    db.run(`
      INSERT INTO customers (name, email, phone, company, assignedTo)
      VALUES (?, ?, ?, ?, ?)
    `, [lead.name, lead.email, lead.phone, lead.company, lead.assignedTo], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const customerId = this.lastID;
      
      // 3. Update lead status to Converted
      db.run("UPDATE leads SET status = 'Converted' WHERE id = ?", [leadId]);
      
      res.json({ message: 'Lead converted to customer', customerId });
    });
  });
});

// ================= CUSTOMERS =================

// Get all customers
router.get('/customers', auth('Staff'), (req, res) => {
  db.all(`
    SELECT c.*, u.name as assignedToName 
    FROM customers c
    LEFT JOIN users u ON c.assignedTo = u.id
    ORDER BY c.name ASC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create customer
router.post('/customers', auth('Staff'), (req, res) => {
  const { name, email, phone, company, address, industry, assignedTo } = req.body;
  
  db.run(`
    INSERT INTO customers (name, email, phone, company, address, industry, assignedTo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, email, phone, company, address, industry, assignedTo || req.headers.userid], 
  function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Customer created successfully' });
  });
});

// ================= DEALS (PIPELINE) =================

// Get all deals
router.get('/deals', auth('Staff'), (req, res) => {
  db.all(`
    SELECT d.*, c.name as customerName, u.name as assignedToName
    FROM deals d
    LEFT JOIN customers c ON d.customerId = c.id
    LEFT JOIN users u ON d.assignedTo = u.id
    ORDER BY d.expectedCloseDate ASC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create deal
router.post('/deals', auth('Staff'), (req, res) => {
  const { title, customerId, value, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;
  
  db.run(`
    INSERT INTO deals (title, customerId, value, stage, probability, expectedCloseDate, assignedTo, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, customerId, value, stage || 'Prospecting', probability || 10, expectedCloseDate, assignedTo || req.headers.userid, notes], 
  function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Deal created successfully' });
  });
});

// Update deal stage (Kanban move)
router.patch('/deals/:id/stage', auth('Staff'), (req, res) => {
  const { stage } = req.body;
  
  // Auto-update probability based on stage
  let probability = 10;
  if (stage === 'Qualification') probability = 30;
  if (stage === 'Proposal') probability = 60;
  if (stage === 'Negotiation') probability = 80;
  if (stage === 'Closed Won') probability = 100;
  if (stage === 'Closed Lost') probability = 0;

  db.run(`
    UPDATE deals 
    SET stage = ?, probability = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [stage, probability, req.params.id],
  (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deal stage updated', probability });
  });
});

// Analytics: Sales Pipeline
router.get('/analytics/pipeline', auth('Manager'), (req, res) => {
  db.all(`
    SELECT stage, COUNT(*) as count, SUM(value) as totalValue
    FROM deals
    GROUP BY stage
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

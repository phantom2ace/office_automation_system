const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ================= SYSTEM CONFIGURATION =================

// Get all system settings
router.get('/config', auth('Admin'), (req, res) => {
  db.all('SELECT * FROM system_settings', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Convert rows to object
    const settings = {};
    rows.forEach(row => settings[row.key] = row.value);
    res.json(settings);
  });
});

// Update system settings
router.post('/config', auth('Admin'), (req, res) => {
  const settings = req.body;
  const keys = Object.keys(settings);
  
  // Use transaction for multiple updates
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)');
    
    keys.forEach(key => {
      stmt.run(key, settings[key]);
    });
    
    stmt.finalize();
    
    db.run('COMMIT', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Log audit
      db.run(`INSERT INTO audit_logs (userId, action, module, details) VALUES (?, 'UPDATE', 'SETTINGS', 'Updated system configuration')`, 
        [req.user.id]);
        
      res.json({ message: 'Settings updated successfully' });
    });
  });
});

// ================= DATABASE BACKUP =================

// Trigger manual backup
router.post('/backup', auth('Admin'), (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `../backups/office_backup_${timestamp}.db`);
  const dbPath = path.join(__dirname, '../office.db');
  
  // Ensure backup directory exists
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Copy file
  fs.copyFile(dbPath, backupPath, (err) => {
    if (err) return res.status(500).json({ error: 'Backup failed: ' + err.message });
    
    res.json({ 
      message: 'Backup created successfully', 
      filename: `office_backup_${timestamp}.db`,
      path: backupPath 
    });
  });
});

// List backups
router.get('/backups', auth('Admin'), (req, res) => {
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    return res.json([]);
  }

  fs.readdir(backupDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const backups = files
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return {
          filename: f,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          created: stats.birthtime
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created)); // Newest first
      
    res.json(backups);
  });
});

// Restore backup (Caution!)
router.post('/restore', auth('Admin'), (req, res) => {
  const { filename } = req.body;
  const backupPath = path.join(__dirname, `../backups/${filename}`);
  const dbPath = path.join(__dirname, '../office.db');

  if (!fs.existsSync(backupPath)) {
    return res.status(404).json({ error: 'Backup file not found' });
  }

  // Simple copy back
  fs.copyFile(backupPath, dbPath, (err) => {
    if (err) return res.status(500).json({ error: 'Restore failed: ' + err.message });
    
    res.json({ message: 'Database restored successfully. Please restart the server.' });
  });
});

// ================= AUDIT LOGS =================

// Get audit logs
router.get('/audit-logs', auth('Admin'), (req, res) => {
  db.all(`
    SELECT a.*, u.name as userName, u.email 
    FROM audit_logs a
    LEFT JOIN users u ON a.userId = u.id
    ORDER BY a.createdAt DESC
    LIMIT 100
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

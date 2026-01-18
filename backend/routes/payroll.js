const express = require('express');
const db = require('../database');

const router = express.Router();

// Initialize payroll tables
db.run(`
  CREATE TABLE IF NOT EXISTS payroll_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER UNIQUE,
    baseSalary REAL,
    allowances REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    taxPercentage REAL DEFAULT 0,
    bankAccount TEXT,
    bankName TEXT,
    accountHolder TEXT,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS payroll_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    paymentMonth TEXT,
    baseSalary REAL,
    allowances REAL,
    grossSalary REAL,
    taxAmount REAL,
    otherDeductions REAL,
    netSalary REAL,
    status TEXT DEFAULT 'Draft',
    processedBy INTEGER,
    processedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(processedBy) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    date TEXT,
    status TEXT,
    checkIn TIMESTAMP,
    checkOut TIMESTAMP,
    hoursWorked REAL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

// Get payroll config for an employee
router.get('/config/:userId', (req, res) => {
  db.get(
    'SELECT * FROM payroll_config WHERE userId = ?',
    [req.params.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || {});
    }
  );
});

// Set or update payroll config
router.post('/config/:userId', (req, res) => {
  const { baseSalary, allowances, deductions, taxPercentage, bankAccount, bankName, accountHolder } = req.body;
  const userId = req.params.userId;

  db.run(
    `INSERT OR REPLACE INTO payroll_config (userId, baseSalary, allowances, deductions, taxPercentage, bankAccount, bankName, accountHolder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, baseSalary, allowances || 0, deductions || 0, taxPercentage || 0, bankAccount, bankName, accountHolder],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Payroll configuration updated' });
    }
  );
});

// Get payroll records for an employee
router.get('/records/:userId', (req, res) => {
  db.all(
    `SELECT pr.*, u.name as processedByName 
     FROM payroll_records pr
     LEFT JOIN users u ON pr.processedBy = u.id
     WHERE pr.userId = ?
     ORDER BY pr.paymentMonth DESC`,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Calculate and create payroll record
router.post('/calculate', (req, res) => {
  const { userId, paymentMonth } = req.body;
  const processedBy = req.headers.userid;

  // Get payroll config
  db.get(
    'SELECT * FROM payroll_config WHERE userId = ?',
    [userId],
    (err, config) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!config) return res.status(404).json({ error: 'Payroll config not found' });

      const baseSalary = config.baseSalary || 0;
      const allowances = config.allowances || 0;
      const otherDeductions = config.deductions || 0;
      const taxPercentage = config.taxPercentage || 0;

      const grossSalary = baseSalary + allowances;
      const taxAmount = (grossSalary * taxPercentage) / 100;
      const netSalary = grossSalary - taxAmount - otherDeductions;

      db.run(
        `INSERT INTO payroll_records (userId, paymentMonth, baseSalary, allowances, grossSalary, taxAmount, otherDeductions, netSalary, status, processedBy, processedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, paymentMonth, baseSalary, allowances, grossSalary, taxAmount, otherDeductions, netSalary, 'Processed', processedBy],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            id: this.lastID,
            baseSalary,
            allowances,
            grossSalary,
            taxAmount,
            otherDeductions,
            netSalary,
            message: 'Payroll record created'
          });
        }
      );
    }
  );
});

// Get all payroll records for HR (for processing)
router.get('/', (req, res) => {
  const role = req.headers.role;
  const department = req.headers.department;

  if (role !== 'Admin' && department !== 'HR') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all(
    `SELECT pr.*, u.name, u.email, u.department
     FROM payroll_records pr
     JOIN users u ON pr.userId = u.id
     ORDER BY pr.paymentMonth DESC, u.name ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Get attendance record
router.get('/attendance/:userId/:month', (req, res) => {
  const userId = req.params.userId;
  const month = req.params.month; // Format: YYYY-MM

  db.all(
    `SELECT * FROM attendance_records 
     WHERE userId = ? AND date LIKE ?
     ORDER BY date DESC`,
    [userId, `${month}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Mark attendance
router.post('/attendance/checkin', (req, res) => {
  const userId = req.headers.userid;
  const date = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO attendance_records (userId, date, status, checkIn)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [userId, date, 'Present'],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Checked in' });
    }
  );
});

router.post('/attendance/checkout', (req, res) => {
  const userId = req.headers.userid;
  const date = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT * FROM attendance_records WHERE userId = ? AND date = ?`,
    [userId, date],
    (err, record) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!record) return res.status(404).json({ error: 'Check-in record not found' });

      const checkInTime = new Date(record.checkIn);
      const checkOutTime = new Date();
      const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);

      db.run(
        `UPDATE attendance_records 
         SET checkOut = CURRENT_TIMESTAMP, hoursWorked = ?
         WHERE id = ?`,
        [hoursWorked, record.id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Checked out', hoursWorked: hoursWorked.toFixed(2) });
        }
      );
    }
  );
});

// Get payroll summary for dashboard
router.get('/summary/:userId', (req, res) => {
  const userId = req.params.userId;

  db.get(
    `SELECT 
      SUM(grossSalary) as totalGross,
      SUM(netSalary) as totalNet,
      COUNT(*) as recordCount,
      AVG(netSalary) as avgSalary
     FROM payroll_records
     WHERE userId = ? AND status = 'Processed'`,
    [userId],
    (err, summary) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(summary || {});
    }
  );
});

module.exports = router;

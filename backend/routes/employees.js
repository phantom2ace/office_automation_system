const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Middleware to check if user is authorized to view employees (Admin or HR only)
const authorizeEmployeeAccess = (req, res, next) => {
  const role = req.headers.role;
  const userDept = req.headers.department;
  
  if ((role && role.toLowerCase() === 'admin') || (userDept && userDept.toLowerCase() === 'hr')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Only Admin and HR staff can view employees.' });
  }
};

// Check if user is authorized to view employees
router.get("/auth/check", (req, res) => {
  const role = req.headers.role;
  const department = req.headers.department;
  
  const authorized = (role && role.toLowerCase() === 'admin') || (department && department.toLowerCase() === 'hr');
  res.json({ authorized });
});

// Add new employee
router.post("/", authorizeEmployeeAccess, async (req, res) => {
  const { name, email, password, department, role, designation, phone, reportingManager } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    db.run(
      `INSERT INTO users (name, email, password, department, role, designation, phone, reportingManager, status, availability, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'Available', datetime('now'))`,
      [name, email, hashedPassword, department, role, designation, phone, reportingManager],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Employee added successfully", id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Error creating employee" });
  }
});

// Get all employees
router.get("/", authorizeEmployeeAccess, (req, res) => {
  db.all(
    "SELECT id, name, email, department, role, phone, reportingManager, status, availability FROM users WHERE id != 1",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Get employee by ID
router.get("/:id", authorizeEmployeeAccess, (req, res) => {
  db.get(
    "SELECT * FROM users WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Employee not found" });
      res.json(row);
    }
  );
});

// Update employee
router.put("/:id", authorizeEmployeeAccess, (req, res) => {
  const { name, email, department, role, phone, reportingManager } = req.body;

  db.run(
    `UPDATE users SET name = ?, email = ?, department = ?, role = ?, phone = ?, reportingManager = ?
     WHERE id = ?`,
    [name, email, department, role, phone, reportingManager, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Employee updated" });
    }
  );
});

// Deactivate employee
router.put("/:id/deactivate", authorizeEmployeeAccess, (req, res) => {
  db.run(
    "UPDATE users SET status = 'Inactive', isActive = 0 WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Employee deactivated" });
    }
  );
});

// Get employees by department
router.get("/department/:dept", auth("Manager"), (req, res) => {
  db.all(
    "SELECT id, name, email, role, designation, phone FROM users WHERE department = ? AND status = 'Active'",
    [req.params.dept],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get team members (direct reports)
router.get("/:id/team", auth("Manager"), (req, res) => {
  db.all(
    "SELECT id, name, email, designation, department FROM users WHERE reportingManager = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get HR statistics
router.get("/analytics/summary", auth("Manager"), (req, res) => {
  const stats = {};

  db.get("SELECT COUNT(*) as count FROM users WHERE status = 'Active' AND id != 1", (err, row) => {
    stats.totalEmployees = row?.count || 0;

    db.get("SELECT COUNT(DISTINCT department) as count FROM users WHERE status = 'Active'", (err, row) => {
      stats.totalDepartments = row?.count || 0;

      db.all(
        "SELECT department, COUNT(*) as count FROM users WHERE status = 'Active' GROUP BY department",
        (err, rows) => {
          stats.byDepartment = rows || [];

          db.get("SELECT COUNT(*) as count FROM leaves WHERE status = 'Approved' AND startDate <= DATE('now') AND endDate >= DATE('now')", (err, row) => {
            stats.onLeaveToday = row?.count || 0;
            res.json(stats);
          });
        }
      );
    });
  });
});

// Update employee availability status
router.put("/:id/availability", auth("Staff"), (req, res) => {
  const { availability } = req.body;
  const allowedStatuses = ['Available', 'Busy', 'On Leave', 'Away'];
  
  if (!allowedStatuses.includes(availability)) {
    return res.status(400).json({ error: "Invalid availability status" });
  }

  db.run(
    "UPDATE users SET availability = ? WHERE id = ?",
    [availability, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Availability updated", availability });
    }
  );
});

// Get employee workload (task count)
router.get("/:id/workload", (req, res) => {
  db.get(
    `SELECT u.id, u.name, u.availability, COUNT(t.id) as pendingTasks
     FROM users u
     LEFT JOIN tasks t ON u.id = t.assignedTo AND t.status = 'Pending'
     WHERE u.id = ?
     GROUP BY u.id`,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Employee not found" });
      res.json(row);
    }
  );
});

// Get department availability summary
router.get("/department/:dept/availability", auth("Manager"), (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.availability, COUNT(t.id) as pendingTasks
     FROM users u
     LEFT JOIN tasks t ON u.id = t.assignedTo AND t.status = 'Pending'
     WHERE u.department = ? AND u.status = 'Active'
     GROUP BY u.id
     ORDER BY u.availability ASC, pendingTasks ASC`,
    [req.params.dept],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const summary = {
        totalEmployees: rows.length,
        available: rows.filter(r => r.availability === 'Available').length,
        busy: rows.filter(r => r.availability === 'Busy').length,
        onLeave: rows.filter(r => r.availability === 'On Leave').length,
        employees: rows
      };
      res.json(summary);
    }
  );
});

module.exports = router;

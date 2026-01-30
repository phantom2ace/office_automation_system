const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Task statistics
router.get("/tasks", auth("Manager"), (req, res) => {
  db.all(
    `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// Department performance
router.get("/departments", auth("Manager"), (req, res) => {
  db.all(
    `SELECT department, 
            COUNT(*) as taskCount,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedTasks
     FROM tasks 
     WHERE department IS NOT NULL
     GROUP BY department`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// User activity and performance
router.get("/activity", auth("Manager"), (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.department,
            COUNT(t.id) as taskCount,
            SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completedTasks,
            ROUND(AVG(CASE WHEN t.status = 'Completed' THEN 100 ELSE 0 END), 2) as efficiency
     FROM users u
     LEFT JOIN tasks t ON u.id = t.assignedTo
     WHERE u.status = 'Active'
     GROUP BY u.id`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// Financial analytics
router.get("/finance", auth("Manager"), (req, res) => {
  db.all(
    `SELECT type, 
            SUM(amount) as total,
            COUNT(*) as count
     FROM finance
     WHERE createdAt >= datetime('now', '-30 days')
     GROUP BY type`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// Leave analytics
router.get("/leaves", auth("Manager"), (req, res) => {
  db.all(
    `SELECT 
            leaveType,
            COUNT(*) as total,
            SUM(days) as totalDays
     FROM leaves
     WHERE status = 'Approved'
     GROUP BY leaveType`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// Overall dashboard metrics
router.get("/metrics", auth("Manager"), (req, res) => {
  const metrics = {};

  // Total employees
  db.get(
    "SELECT COUNT(*) as count FROM users WHERE status = 'Active'",
    (err, row) => {
      metrics.totalEmployees = row?.count || 0;

      // Total tasks
      db.get(
        "SELECT COUNT(*) as count FROM tasks",
        (err, row) => {
          metrics.totalTasks = row?.count || 0;

          // Pending tasks
          db.get(
            "SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending'",
            (err, row) => {
              metrics.pendingTasks = row?.count || 0;

              // Average task completion
              db.get(
                `SELECT ROUND(AVG(CASE WHEN status = 'Completed' THEN 100 ELSE 0 END), 2) as avg 
                 FROM tasks`,
                (err, row) => {
                  metrics.completionRate = row?.avg || 0;
                  res.json(metrics);
                }
              );
            }
          );
        }
      );
    }
  );
});

// System Logs (Combined recent activity)
router.get("/logs", auth("Admin"), (req, res) => {
  const query = `
    SELECT 'Task' as type, title as description, updatedAt as timestamp, assignedTo as userId FROM tasks
    UNION ALL
    SELECT 'User' as type, name || ' joined' as description, createdAt as timestamp, id as userId FROM users
    UNION ALL
    SELECT 'Message' as type, 'New message sent' as description, timestamp, senderId as userId FROM messages
    ORDER BY timestamp DESC
    LIMIT 50
  `;
  
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;


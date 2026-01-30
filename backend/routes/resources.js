const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all resources
router.get("/", auth(), (req, res) => {
  db.all(
    `SELECT r.*, u.name as assignedToName 
     FROM resources r
     LEFT JOIN users u ON r.assignedTo = u.id
     ORDER BY r.name`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add resource
router.post("/add", auth("Manager"), (req, res) => {
  const { name, type, cost, location } = req.body;

  db.run(
    `INSERT INTO resources (name, type, status, cost, location, createdAt)
     VALUES (?, ?, 'Available', ?, ?, datetime('now'))`,
    [name, type, cost, location],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Resource added", resourceId: this.lastID });
    }
  );
});

// Assign resource to employee
router.put("/assign/:id", auth("Manager"), (req, res) => {
  const { assignedTo } = req.body;

  db.run(
    `UPDATE resources SET assignedTo = ?, status = 'Assigned', assignedDate = datetime('now')
     WHERE id = ?`,
    [assignedTo, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Create notification
      db.run(
        `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
         VALUES (?, 'resource_assignment', 'Resource Assigned', 'A resource has been assigned to you', ?, datetime('now'))`,
        [assignedTo, req.params.id]
      );

      res.json({ message: "Resource assigned" });
    }
  );
});

// Release resource
router.put("/release/:id", auth("Manager"), (req, res) => {
  db.run(
    "UPDATE resources SET assignedTo = NULL, status = 'Available' WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Resource released" });
    }
  );
});

// Get resources assigned to user
router.get("/user/:userId", auth(), (req, res) => {
  // Allow if requesting own resources or if Manager/Admin
  if (req.user.id != req.params.userId && req.user.role !== 'Admin' && req.user.role !== 'Manager') {
    return res.status(403).json({ error: "Access denied" });
  }

  db.all(
    "SELECT * FROM resources WHERE assignedTo = ?",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get resource analytics
router.get("/analytics/summary", auth("Manager"), (req, res) => {
  const analytics = {};

  db.get("SELECT COUNT(*) as count FROM resources", (err, row) => {
    analytics.totalResources = row?.count || 0;

    db.get("SELECT COUNT(*) as count FROM resources WHERE status = 'Assigned'", (err, row) => {
      analytics.assignedResources = row?.count || 0;

      db.get("SELECT SUM(cost) as total FROM resources", (err, row) => {
        analytics.totalCost = row?.total || 0;

        db.all(
          "SELECT type, COUNT(*) as count, SUM(cost) as cost FROM resources GROUP BY type",
          (err, rows) => {
            analytics.byType = rows || [];
            res.json(analytics);
          }
        );
      });
    });
  });
});

module.exports = router;

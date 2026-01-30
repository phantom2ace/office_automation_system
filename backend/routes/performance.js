const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Get performance review for user
router.get("/user/:userId", auth("Manager"), (req, res) => {
  db.all(
    "SELECT * FROM performance WHERE userId = ? ORDER BY period DESC",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get all performance reviews
router.get("/all", auth("Manager"), (req, res) => {
  db.all(
    `SELECT p.*, u.name as employeeName, u.department, r.name as reviewerName
     FROM performance p
     JOIN users u ON p.userId = u.id
     LEFT JOIN users r ON p.reviewedBy = r.id
     ORDER BY p.period DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create performance review
router.post("/create", auth("Manager"), (req, res) => {
  const { userId, period, tasksCompleted, tasksOverdue, efficiency, attendance, rating, comments } = req.body;
  const reviewedBy = req.user.id;

  db.run(
    `INSERT INTO performance (userId, period, tasksCompleted, tasksOverdue, efficiency, attendance, rating, comments, reviewedBy, reviewDate, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [userId, period, tasksCompleted, tasksOverdue, efficiency, attendance, rating, comments, reviewedBy],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Create notification
      db.run(
        `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
         VALUES (?, 'performance_review', 'Performance Review', 'Your performance review has been completed', ?, datetime('now'))`,
        [userId, this.lastID]
      );

      res.json({ message: "Performance review created", reviewId: this.lastID });
    }
  );
});

// Update performance review
router.put("/:id", auth("Manager"), (req, res) => {
  const { tasksCompleted, tasksOverdue, efficiency, attendance, rating, comments } = req.body;

  db.run(
    `UPDATE performance SET tasksCompleted = ?, tasksOverdue = ?, efficiency = ?, attendance = ?, rating = ?, comments = ?
     WHERE id = ?`,
    [tasksCompleted, tasksOverdue, efficiency, attendance, rating, comments, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Performance review updated" });
    }
  );
});

// Get department performance
router.get("/department/:department", auth("Manager"), (req, res) => {
  db.all(
    `SELECT AVG(rating) as avgRating,
            AVG(efficiency) as avgEfficiency,
            AVG(attendance) as avgAttendance,
            COUNT(*) as reviewCount
     FROM performance p
     JOIN users u ON p.userId = u.id
     WHERE u.department = ?
     AND p.period >= date('now', '-6 months')`,
    [req.params.department],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Apply for leave
router.post("/apply", auth("Staff"), (req, res) => {
  const { leaveType, startDate, endDate, days, reason } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO leaves (userId, leaveType, startDate, endDate, days, reason, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, 'Pending', datetime('now'))`,
    [userId, leaveType, startDate, endDate, days, reason],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Leave request submitted", leaveId: this.lastID });
    }
  );
});

// Get leaves for user
router.get("/my", auth(), (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT * FROM leaves WHERE userId = ? ORDER BY startDate DESC",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get all leaves for approval
router.get("/all", auth("Manager"), (req, res) => {
  db.all(
    `SELECT l.*, u.name as employeeName, u.department
     FROM leaves l
     JOIN users u ON l.userId = u.id
     ORDER BY l.createdAt DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Approve/Reject leave
router.post("/approve", auth("Manager"), (req, res) => {
  const { leaveId, status, comments } = req.body;
  const approvedBy = req.user.id;

  db.run(
    `UPDATE leaves SET status = ?, approvedBy = ?, approvedAt = datetime('now')
     WHERE id = ?`,
    [status, approvedBy, leaveId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Create notification
      db.get("SELECT userId FROM leaves WHERE id = ?", [leaveId], (err, leave) => {
        if (leave) {
          db.run(
            `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
             VALUES (?, 'leave_approval', 'Leave ' + ?, 'Your leave request has been ' + ?, ?, datetime('now'))`,
            [leave.userId, status, status, leaveId]
          );
        }
      });

      res.json({ message: `Leave ${status}` });
    }
  );
});

// Cancel leave (by user)
router.post("/cancel", auth(), (req, res) => {
  const { leaveId } = req.body;
  const userId = req.user.id;

  db.run(
    `UPDATE leaves SET status = 'Cancelled' 
     WHERE id = ? AND userId = ? AND status = 'Pending'`,
    [leaveId, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(400).json({ error: "Cannot cancel leave. Either it's not yours, not found, or already processed." });
      
      res.json({ message: "Leave cancelled successfully" });
    }
  );
});

module.exports = router;

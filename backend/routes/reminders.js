const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Get reminders for user
router.get("/my", auth(), (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT * FROM reminders WHERE userId = ? AND isCompleted = 0 ORDER BY reminderDate, reminderTime`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create reminder
router.post("/create", auth(), (req, res) => {
  const { title, description, reminderDate, reminderTime, type, relatedId } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO reminders (userId, title, description, reminderDate, reminderTime, type, relatedId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [userId, title, description, reminderDate, reminderTime, type, relatedId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Reminder created", reminderId: this.lastID });
    }
  );
});

// Complete reminder
router.put("/:id/complete", auth(), (req, res) => {
  // Verify ownership
  db.get("SELECT userId FROM reminders WHERE id = ?", [req.params.id], (err, reminder) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });
    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    db.run(
      "UPDATE reminders SET isCompleted = 1 WHERE id = ?",
      [req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Reminder completed" });
      }
    );
  });
});

// Delete reminder
router.delete("/:id", auth(), (req, res) => {
  // Verify ownership
  db.get("SELECT userId FROM reminders WHERE id = ?", [req.params.id], (err, reminder) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });
    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    db.run("DELETE FROM reminders WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Reminder deleted" });
    });
  });
});

// Get upcoming reminders for department
router.get("/department/:department", auth("Manager"), (req, res) => {
  db.all(
    `SELECT r.*, u.name as userName
     FROM reminders r
     JOIN users u ON r.userId = u.id
     WHERE u.department = ? AND r.isCompleted = 0
     AND datetime(r.reminderDate || ' ' || COALESCE(r.reminderTime, '00:00')) <= datetime('now', '+7 days')
     ORDER BY r.reminderDate`,
    [req.params.department],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

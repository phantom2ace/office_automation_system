const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Get calendar events
router.get("/:userId", auth(), (req, res) => {
  // Users can only view their own events unless they are Admin/Manager
  if (req.user.id != req.params.userId && req.user.role !== 'Admin' && req.user.role !== 'Manager') {
    return res.status(403).json({ error: "Access denied" });
  }
  
  db.all(
    `SELECT * FROM events WHERE userId = ? ORDER BY eventDate, startTime`,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create event
router.post("/create", auth(), (req, res) => {
  const { title, description, eventDate, startTime, endTime, eventType, location, attendees, reminder } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO events (title, description, userId, eventDate, startTime, endTime, eventType, location, attendees, reminder, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [title, description, userId, eventDate, startTime, endTime, eventType, location, JSON.stringify(attendees), reminder],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Event created", eventId: this.lastID });
    }
  );
});

// Update event
router.put("/update/:id", auth(), (req, res) => {
  const { title, description, eventDate, startTime, endTime, location, reminder } = req.body;
  
  // Verify ownership
  db.get("SELECT userId FROM events WHERE id = ?", [req.params.id], (err, event) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.userId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    db.run(
      `UPDATE events SET title = ?, description = ?, eventDate = ?, startTime = ?, endTime = ?, location = ?, reminder = ?
       WHERE id = ?`,
      [title, description, eventDate, startTime, endTime, location, reminder, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Event updated" });
      }
    );
  });
});

// Delete event
router.delete("/:id", auth(), (req, res) => {
  // Verify ownership
  db.get("SELECT userId FROM events WHERE id = ?", [req.params.id], (err, event) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.userId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    db.run("DELETE FROM events WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Event deleted" });
    });
  });
});

// Get team calendar
router.get("/team/:department", auth("Manager"), (req, res) => {
  db.all(
    `SELECT e.*, u.name as userName 
     FROM events e
     JOIN users u ON e.userId = u.id
     WHERE u.department = ?
     ORDER BY e.eventDate`,
    [req.params.department],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

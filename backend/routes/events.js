const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/add", auth(), (req, res) => {
  const { title, eventDate, reminder } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO events (title, userId, eventDate, reminder)
     VALUES (?, ?, ?, ?)`,
    [title, userId, eventDate, reminder],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Event added" });
    }
  );
});

router.get("/:userId", auth(), (req, res) => {
  // Users can only view their own events
  if (req.user.id != req.params.userId && req.user.role !== 'Admin') {
    return res.status(403).json({ error: "Access denied" });
  }

  db.all(
    `SELECT * FROM events WHERE userId = ?`,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

module.exports = router;

const express = require("express");
const db = require("../database");

const router = express.Router();

router.post("/add", (req, res) => {
  const { title, userId, eventDate, reminder } = req.body;

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

router.get("/:userId", (req, res) => {
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

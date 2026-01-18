const express = require("express");
const db = require("../database");

const router = express.Router();

// Add transaction
router.post("/add", (req, res) => {
  const { description, amount, type } = req.body;

  db.run(
    `INSERT INTO finance (description, amount, type, createdAt)
     VALUES (?, ?, ?, datetime('now'))`,
    [description, amount, type],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Recorded" });
    }
  );
});

// Get summary
router.get("/summary", (req, res) => {
  db.all(
    `
    SELECT type, SUM(amount) as total
    FROM finance
    GROUP BY type
    `,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

module.exports = router;

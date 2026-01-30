const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Auto check tasks
router.get("/run", auth("Admin"), (req, res) => {

  // Mark overdue tasks
  db.run(`
    UPDATE tasks
    SET status = 'Overdue'
    WHERE status = 'Pending'
    AND datetime(createdAt) <= datetime('now', '-3 days')
  `);

  res.json({ message: "Workflow automation executed" });
});

module.exports = router;

const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:userId", auth(), (req, res) => {
  if (req.user.id != req.params.userId) {
    return res.status(403).json({ error: "Access denied" });
  }
  
  db.all(
    "SELECT * FROM notifications WHERE userId = ?",
    [req.params.userId],
    (err, rows) => res.json(rows)
  );
});

module.exports = router;

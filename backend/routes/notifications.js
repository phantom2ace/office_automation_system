const express = require("express");
const db = require("../database");

const router = express.Router();

router.get("/:userId", (req, res) => {
  db.all(
    "SELECT * FROM notifications WHERE userId = ?",
    [req.params.userId],
    (err, rows) => res.json(rows)
  );
});

module.exports = router;

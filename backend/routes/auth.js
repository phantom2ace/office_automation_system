const express = require("express");
const db = require("../database");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      let isMatch = false;
      
      // 1. Try bcrypt comparison first (assuming stored password might be a hash)
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        // If error (e.g. not a hash), isMatch remains false
      }

      // 2. Fallback: Check plain text (Legacy support / Migration)
      if (!isMatch && user.password === password) {
        isMatch = true;
        // MIGRATION: Update to hash for next time
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        db.run("UPDATE users SET password = ? WHERE id = ?", [hash, user.id]);
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    }
  );
});

module.exports = router;

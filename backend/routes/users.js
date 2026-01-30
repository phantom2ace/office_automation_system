const express = require("express");
const router = express.Router();
const db = require("../database");
const auth = require("../middleware/auth");

// Get all users (Simplified for Chat/Staff view)
router.get("/", auth(), (req, res) => {
  // req.user is populated by auth middleware
  db.all(
    `SELECT id, name, email, department, role, status FROM users WHERE status = 'Active' ORDER BY name`,
    (err, users) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json(users);
    }
  );
});

// Create new user (Admin only)
router.post("/create", auth("Admin"), (req, res) => {
  const { name, email, password, department, role } = req.body;
  // Admin check handled by middleware

  // Validate required fields
  if (!name || !email || !password || !department || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Check if email already exists
  db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (user) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Insert new user
    db.run(
      `INSERT INTO users (name, email, password, department, role, status, availability, createdAt)
       VALUES (?, ?, ?, ?, ?, 'Active', 'Available', datetime('now'))`,
      [name, email, password, department, role],
      function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        res.json({
          success: true,
          message: "User created successfully",
          userId: this.lastID,
          user: {
            id: this.lastID,
            name,
            email,
            department,
            role,
            status: "Active",
            availability: "Available",
          },
        });
      }
    );
  });
});

// Get all users (Admin only)
router.get("/all", auth("Admin"), (req, res) => {
  // Admin check handled by middleware

  db.all(
    `SELECT id, name, email, department, role, status, availability, createdAt FROM users ORDER BY id`,
    (err, users) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({
        success: true,
        count: users.length,
        users,
      });
    }
  );
});

// Update user (Admin only)
router.put("/:userId", auth("Admin"), (req, res) => {
  const { userId } = req.params;
  const { name, email, password, department, role, status, availability } =
    req.body;
  // Admin check handled by middleware

  // Build dynamic update query
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }
  if (email !== undefined) {
    updates.push("email = ?");
    values.push(email);
  }
  if (password !== undefined) {
    updates.push("password = ?");
    values.push(password);
  }
  if (department !== undefined) {
    updates.push("department = ?");
    values.push(department);
  }
  if (role !== undefined) {
    updates.push("role = ?");
    values.push(role);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }
  if (availability !== undefined) {
    updates.push("availability = ?");
    values.push(availability);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No fields to update",
    });
  }

  values.push(userId);

  const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

  db.run(query, values, function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
    });
  });
});

// Delete user (Admin only)
router.delete("/:userId", auth("Admin"), (req, res) => {
  const { userId } = req.params;
  // Admin check handled by middleware

  // Prevent deleting the only admin
  db.get(
    `SELECT COUNT(*) as count FROM users WHERE role = 'Admin'`,
    (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (result.count <= 1) {
        // Check if this is the last admin
        db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, user) => {
          if (user && user.role === "Admin") {
            return res.status(400).json({
              success: false,
              message: "Cannot delete the only admin user",
            });
          }

          deleteUser(userId);
        });
      } else {
        deleteUser(userId);
      }
    }
  );

  function deleteUser(id) {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    });
  }
});

module.exports = router;

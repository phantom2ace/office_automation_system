const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// Submit for approval
router.post("/submit", (req, res) => {
  const { taskId, level } = req.body;
  const submittedBy = req.headers.userid;

  db.run(
    `INSERT INTO approvals (taskId, level, status, createdAt)
     VALUES (?, ?, 'Pending', datetime('now'))`,
    [taskId, level || 1],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Create notification for manager
      db.get(
        `SELECT assignedBy FROM tasks WHERE id = ?`,
        [taskId],
        (err, task) => {
          if (task) {
            db.run(
              `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
               VALUES (?, 'approval_request', 'Approval Required', 'A task requires your approval', ?, datetime('now'))`,
              [task.assignedBy, taskId]
            );
          }
        }
      );

      res.json({ message: "Submitted for approval", approvalId: this.lastID });
    }
  );
});

// Get pending approvals
router.get("/pending", auth("Manager"), (req, res) => {
  const userId = req.headers.userid;

  db.all(
    `SELECT a.*, t.title, t.description, u.name as submittedByName
     FROM approvals a
     JOIN tasks t ON a.taskId = t.id
     JOIN users u ON t.assignedTo = u.id
     WHERE a.status = 'Pending'
     AND a.approvedBy IS NULL
     ORDER BY a.createdAt DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Approve/Reject
router.post("/:id/respond", auth("Manager"), (req, res) => {
  const { status, comments } = req.body;
  const approvedBy = req.headers.userid;

  db.run(
    `UPDATE approvals SET status = ?, approvedBy = ?, comments = ?, approvedAt = datetime('now')
     WHERE id = ?`,
    [status, approvedBy, comments, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // If approved, update task status
      if (status === "Approved") {
        db.get("SELECT taskId FROM approvals WHERE id = ?", [req.params.id], (err, approval) => {
          if (approval) {
            db.run("UPDATE tasks SET status = 'Approved' WHERE id = ?", [approval.taskId]);
          }
        });
      }

      res.json({ message: `Approval ${status}` });
    }
  );
});

// Get approval history for task
router.get("/task/:taskId", (req, res) => {
  db.all(
    `SELECT a.*, u.name as approverName
     FROM approvals a
     LEFT JOIN users u ON a.approvedBy = u.id
     WHERE a.taskId = ?
     ORDER BY a.level, a.approvedAt`,
    [req.params.taskId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

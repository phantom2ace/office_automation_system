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

      // Create notification for manager (Task Creator)
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

// Get pending approvals (My Approvals + Delegated)
router.get("/pending", auth("Manager"), (req, res) => {
  const userId = req.headers.userid;

  // 1. Find who has delegated to me
  db.all(
    `SELECT managerId FROM delegations 
     WHERE delegateId = ? AND status = 'Active' 
     AND (startDate IS NULL OR startDate <= date('now'))
     AND (endDate IS NULL OR endDate >= date('now'))`,
    [userId],
    (err, delegations) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const approverIds = [userId, ...delegations.map(d => d.managerId)];
        const placeholders = approverIds.map(() => '?').join(',');

        // 2. Find pending approvals where task creator is in approverIds
        const query = `
            SELECT a.*, t.title, t.description, u.name as submittedByName, t.assignedBy as approverId
            FROM approvals a
            JOIN tasks t ON a.taskId = t.id
            JOIN users u ON t.assignedTo = u.id
            WHERE a.status = 'Pending'
            AND a.approvedBy IS NULL
            AND t.assignedBy IN (${placeholders})
            ORDER BY a.createdAt DESC
        `;

        db.all(query, approverIds, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Mark which ones are delegated
            const results = rows.map(row => ({
                ...row,
                isDelegated: row.approverId != userId
            }));
            
            res.json(results);
        });
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

// Set Delegation
router.post("/delegate", auth("Manager"), (req, res) => {
    const { delegateId, startDate, endDate } = req.body;
    const managerId = req.headers.userid;

    db.run(`
        INSERT INTO delegations (managerId, delegateId, startDate, endDate)
        VALUES (?, ?, ?, ?)
    `, [managerId, delegateId, startDate, endDate], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Delegation active', id: this.lastID });
    });
});

// Get My Delegations
router.get("/delegations", auth("Manager"), (req, res) => {
    const userId = req.headers.userid;
    db.all(`
        SELECT d.*, u.name as delegateName 
        FROM delegations d
        JOIN users u ON d.delegateId = u.id
        WHERE d.managerId = ?
    `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
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
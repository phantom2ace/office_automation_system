const express = require("express");
const db = require("../database");

const router = express.Router();

// Create task - ADMIN ONLY
router.post("/create", (req, res) => {
  const { title, description, department, assignedTo } = req.body;
  const userRole = req.headers.role;

  // Only Admin can create tasks
  if (userRole !== "Admin") {
    return res.json({ error: "Only Admin can create tasks" });
  }

  if (!title || !department) {
    return res.json({ error: "Title and department are required" });
  }

  db.run(
    `INSERT INTO tasks (title, description, department, assignedTo, status, createdAt)
     VALUES (?, ?, ?, ?, 'Pending', datetime('now'))`,
    [title, description, department, assignedTo],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Create notification for assigned employee
      if (assignedTo) {
        db.run(
          `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`,
          [
            assignedTo,
            'task_assigned',
            'New Task Assigned',
            `Task "${title}" has been assigned to you`,
            this.lastID
          ]
        );
      }
      
      res.json({ message: "Task created", taskId: this.lastID });
    }
  );
});

// Auto-assign task to best available employee in department
router.post("/auto-assign", (req, res) => {
  const { title, description, department, priority = 'Normal' } = req.body;

  // Find available employees in the department with fewest pending tasks
  db.get(
    `SELECT u.id, u.name, COUNT(t.id) as taskCount
     FROM users u
     LEFT JOIN tasks t ON u.id = t.assignedTo AND t.status = 'Pending'
     WHERE u.department = ? 
     AND u.availability = 'Available'
     AND u.role IN ('Staff', 'Manager')
     AND u.status = 'Active'
     GROUP BY u.id
     ORDER BY taskCount ASC, u.id ASC
     LIMIT 1`,
    [department],
    (err, employee) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (!employee) {
        return res.status(404).json({ error: "No available employees in this department" });
      }

      // Create and assign task
      db.run(
        `INSERT INTO tasks (title, description, department, assignedTo, priority, status, createdAt)
         VALUES (?, ?, ?, ?, ?, 'Pending', datetime('now'))`,
        [title, description, department, employee.id, priority],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          // Create notification for assigned employee
          db.run(
            `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [
              employee.id,
              'task_assigned',
              'New Task Assigned',
              `Task "${title}" has been assigned to you`,
              this.lastID
            ]
          );

          res.json({ 
            message: "Task auto-assigned",
            taskId: this.lastID,
            assignedTo: employee.name,
            employeeId: employee.id,
            currentWorkload: employee.taskCount
          });
        }
      );
    }
  );
});

// Get tasks for employee
router.get("/:userId", (req, res) => {
  db.all(
    "SELECT * FROM tasks WHERE assignedTo = ?",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Accept or decline task - with AUTO-REASSIGN on decline
router.post("/respond", (req, res) => {
  const { taskId, status, reason } = req.body;
  const userId = req.headers.userid;

  // First, get the task details
  db.get(
    `SELECT * FROM tasks WHERE id = ?`,
    [taskId],
    (err, task) => {
      if (err || !task) {
        return res.json({ error: "Task not found" });
      }

      if (status === "Declined") {
        // Task was declined - auto-reassign to next available person
        db.get(
          `SELECT u.id, u.name, COUNT(t.id) as taskCount
           FROM users u
           LEFT JOIN tasks t ON u.id = t.assignedTo AND t.status = 'Pending'
           WHERE u.department = ? 
           AND u.availability = 'Available'
           AND u.role IN ('Staff', 'Manager')
           AND u.status = 'Active'
           AND u.id != ?
           GROUP BY u.id
           ORDER BY taskCount ASC, u.id ASC
           LIMIT 1`,
          [task.department, userId],
          (err, nextPerson) => {
            if (err) {
              return res.json({ error: "Error finding next available person" });
            }

            if (nextPerson) {
              // Auto-assign to next available person
              db.run(
                `UPDATE tasks SET assignedTo = ?, status = 'Pending', responseReason = ? WHERE id = ?`,
                [nextPerson.id, `Declined by user ${userId}. Reassigned to ${nextPerson.name}`, taskId],
                (err) => {
                  if (err) {
                    return res.json({ error: "Error reassigning task" });
                  }

                  // Create notification for new assignee
                  db.run(
                    `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
                     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                    [
                      nextPerson.id,
                      'task_reassigned',
                      'Task Reassigned to You',
                      `Task "${task.title}" has been reassigned to you (previous person declined)`,
                      taskId
                    ]
                  );

                  // Notify admin
                  db.run(
                    `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
                     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                    [
                      1, // Admin
                      'task_declined_reassigned',
                      'Task Declined & Auto-Reassigned',
                      `Task "${task.title}" was declined by user ${userId} and auto-reassigned to ${nextPerson.name}`,
                      taskId
                    ]
                  );

                  res.json({
                    message: "Task declined and auto-reassigned",
                    reassignedTo: nextPerson.name,
                    reassignedToId: nextPerson.id
                  });
                }
              );
            } else {
              // No one else available - just mark as declined
              db.run(
                `UPDATE tasks SET status = 'Declined', responseReason = ? WHERE id = ?`,
                [reason || `Declined by user ${userId}. No other available staff to reassign to.`, taskId],
                (err) => {
                  if (err) {
                    return res.json({ error: "Error updating task" });
                  }

                  // Notify admin
                  db.run(
                    `INSERT INTO notifications (userId, type, title, message, relatedId, createdAt)
                     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                    [
                      1, // Admin
                      'task_declined_no_reassign',
                      'Task Declined - No Available Staff',
                      `Task "${task.title}" was declined and no other available staff to reassign to`,
                      taskId
                    ]
                  );

                  res.json({
                    message: "Task declined - no available staff to reassign",
                    needsAdminAction: true
                  });
                }
              );
            }
          }
        );
      } else if (status === "Accepted") {
        // Task was accepted - just update status
        db.run(
          `UPDATE tasks SET status = 'Accepted' WHERE id = ?`,
          [taskId],
          (err) => {
            if (err) return res.json({ error: "Error accepting task" });
            res.json({ message: "Task accepted" });
          }
        );
      } else {
        // Any other status update
        db.run(
          `UPDATE tasks SET status = ?, responseReason = ? WHERE id = ?`,
          [status, reason, taskId],
          (err) => {
            if (err) return res.json({ error: "Error updating task" });
            res.json({ message: "Task updated" });
          }
        );
      }
    }
  );
});

module.exports = router;

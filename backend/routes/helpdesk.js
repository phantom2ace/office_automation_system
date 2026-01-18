const express = require("express");
const router = express.Router();
const db = require("../database");
const auth = require("../middleware/auth");

// Create help desk ticket
router.post("/tickets/create", auth("Staff"), (req, res) => {
  const { title, description, category, priority = "Medium" } = req.body;
  const userId = req.headers.userid;

  if (!title) {
    return res.json({ error: "Title is required" });
  }

  // Generate ticket number
  const ticketNumber = `TKT-${Date.now()}`;

  db.run(
    `INSERT INTO helpdesk_tickets (ticketNumber, userId, title, description, category, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
    [ticketNumber, userId, title, description, category, priority],
    function (err) {
      if (err) {
        return res.json({ error: "Error creating ticket" });
      }
      res.json({
        ticketId: this.lastID,
        ticketNumber,
        message: "Ticket created successfully"
      });
    }
  );
});

// Accept ticket by agent
router.put("/tickets/:ticketId/accept", auth("Staff"), (req, res) => {
  const { ticketId } = req.params;
  const agentId = req.headers.userid;
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can accept tickets" });
  }

  db.run(
    `UPDATE helpdesk_tickets 
     SET assignedTo = ?, status = 'Accepted', acceptedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [agentId, ticketId],
    function (err) {
      if (err) {
        return res.json({ error: "Error accepting ticket" });
      }
      res.json({ message: "Ticket accepted successfully" });
    }
  );
});

// Start working on ticket
router.put("/tickets/:ticketId/work", auth("Staff"), (req, res) => {
  const { ticketId } = req.params;
  const { workNotes } = req.body;
  const agentId = req.headers.userid;
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can work on tickets" });
  }

  db.run(
    `UPDATE helpdesk_tickets 
     SET status = 'In Progress', workNotes = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ? AND assignedTo = ?`,
    [workNotes, ticketId, agentId],
    function (err) {
      if (err) {
        return res.json({ error: "Error updating ticket" });
      }
      if (this.changes === 0) {
        return res.json({ error: "Ticket not found or not assigned to you" });
      }
      res.json({ message: "Ticket work started" });
    }
  );
});

// Escalate ticket to another agent or supervisor
router.put("/tickets/:ticketId/escalate", auth("Staff"), (req, res) => {
  const { ticketId } = req.params;
  const { escalateTo, escalationReason } = req.body;
  const agentId = req.headers.userid;
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can escalate tickets" });
  }

  db.run(
    `UPDATE helpdesk_tickets 
     SET assignedTo = ?, escalatedBy = ?, escalationReason = ?, status = 'Escalated', 
         updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [escalateTo, agentId, escalationReason, ticketId],
    function (err) {
      if (err) {
        return res.json({ error: "Error escalating ticket" });
      }
      res.json({ message: "Ticket escalated successfully" });
    }
  );
});

// Complete and resolve ticket
router.put("/tickets/:ticketId/complete", auth("Staff"), (req, res) => {
  const { ticketId } = req.params;
  const { resolutionNotes, solution } = req.body;
  const agentId = req.headers.userid;
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can complete tickets" });
  }

  db.run(
    `UPDATE helpdesk_tickets 
     SET status = 'Completed', resolutionNotes = ?, solution = ?, 
         completedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ? AND assignedTo = ?`,
    [resolutionNotes, solution, ticketId, agentId],
    function (err) {
      if (err) {
        return res.json({ error: "Error completing ticket" });
      }
      if (this.changes === 0) {
        return res.json({ error: "Ticket not found or not assigned to you" });
      }
      res.json({ message: "Ticket completed successfully" });
    }
  );
});

// Get user's help desk tickets
router.get("/tickets/:userId", auth("Staff"), (req, res) => {
  const userId = req.params.userId;

  db.all(
    `SELECT * FROM helpdesk_tickets WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
    (err, tickets) => {
      if (err) {
        return res.json([]);
      }
      res.json(tickets || []);
    }
  );
});

// Get all tickets (for IT staff to manage)
router.get("/tickets", auth("Manager"), (req, res) => {
  const userDept = req.headers.department;
  
  // Only IT staff can see all tickets
  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can access this" });
  }

  db.all(
    `SELECT t.*, u.name as userName, u.email as userEmail, 
            a.name as assignedToName, a.email as assignedToEmail,
            e.name as escalatedByName
     FROM helpdesk_tickets t
     LEFT JOIN users u ON t.userId = u.id
     LEFT JOIN users a ON t.assignedTo = a.id
     LEFT JOIN users e ON t.escalatedBy = e.id
     ORDER BY 
       CASE WHEN t.priority = 'Urgent' THEN 1
            WHEN t.priority = 'High' THEN 2
            WHEN t.priority = 'Medium' THEN 3
            ELSE 4 END,
       CASE WHEN t.status = 'Open' THEN 1
            WHEN t.status = 'Accepted' THEN 2
            WHEN t.status = 'In Progress' THEN 3
            WHEN t.status = 'Escalated' THEN 4
            ELSE 5 END,
       t.createdAt DESC`,
    (err, tickets) => {
      if (err) {
        return res.json([]);
      }
      res.json(tickets || []);
    }
  );
});

// Get single ticket details
router.get("/ticket/:ticketId", auth("Staff"), (req, res) => {
  const ticketId = req.params.ticketId;

  db.get(
    `SELECT t.*, u.name as userName, u.email as userEmail, 
            a.name as assignedToName, a.email as assignedToEmail,
            e.name as escalatedByName
     FROM helpdesk_tickets t
     LEFT JOIN users u ON t.userId = u.id
     LEFT JOIN users a ON t.assignedTo = a.id
     LEFT JOIN users e ON t.escalatedBy = e.id
     WHERE t.id = ?`,
    [ticketId],
    (err, ticket) => {
      if (err || !ticket) {
        return res.json({ error: "Ticket not found" });
      }
      res.json(ticket);
    }
  );
});

// Get IT staff list for escalation
router.get("/staff/list", auth("Staff"), (req, res) => {
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can access this" });
  }

  db.all(
    `SELECT id, name, email, role, designation FROM users 
     WHERE department = 'IT' AND status = 'Active' 
     ORDER BY role DESC, name ASC`,
    (err, staff) => {
      if (err) {
        return res.json([]);
      }
      res.json(staff || []);
    }
  );
});

// Assign ticket to IT staff
router.put("/tickets/:ticketId/assign", auth("Manager"), (req, res) => {
  const { ticketId } = req.params;
  const { assignedTo } = req.body;
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can assign tickets" });
  }

  db.run(
    `UPDATE helpdesk_tickets SET assignedTo = ?, status = 'In Progress', updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [assignedTo, ticketId],
    function (err) {
      if (err) {
        return res.json({ error: "Error assigning ticket" });
      }
      res.json({ message: "Ticket assigned successfully" });
    }
  );
});

// Update ticket status and add resolution notes
router.put("/tickets/:ticketId/resolve", auth("Staff"), (req, res) => {
  const { ticketId } = req.params;
  const { status, resolutionNotes } = req.body;
  const userRole = req.headers.role;
  const userDept = req.headers.department;

  // Only IT staff can resolve tickets
  if (userDept !== "IT" && userRole !== "Admin") {
    return res.json({ error: "Only IT staff can resolve tickets" });
  }

  const closedAt = status === "Closed" ? new Date().toISOString() : null;

  db.run(
    `UPDATE helpdesk_tickets 
     SET status = ?, resolutionNotes = ?, updatedAt = CURRENT_TIMESTAMP${closedAt ? ", closedAt = ?" : ""}
     WHERE id = ?`,
    closedAt ? [status, resolutionNotes, closedAt, ticketId] : [status, resolutionNotes, ticketId],
    function (err) {
      if (err) {
        return res.json({ error: "Error updating ticket" });
      }
      res.json({ message: `Ticket ${status.toLowerCase()}` });
    }
  );
});

// Get help desk statistics (for IT dashboard)
router.get("/stats", auth("Manager"), (req, res) => {
  const userDept = req.headers.department;

  if (userDept !== "IT") {
    return res.json({ error: "Only IT staff can access this" });
  }

  db.all(
    `SELECT 
       COUNT(*) as totalTickets,
       SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as openTickets,
       SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgressTickets,
       SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closedTickets,
       SUM(CASE WHEN priority = 'Urgent' THEN 1 ELSE 0 END) as urgentTickets
     FROM helpdesk_tickets`,
    (err, stats) => {
      if (err) {
        return res.json({
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          closedTickets: 0,
          urgentTickets: 0
        });
      }
      res.json(stats[0] || {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        closedTickets: 0,
        urgentTickets: 0
      });
    }
  );
});

module.exports = router;

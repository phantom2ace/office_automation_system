const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize workflow automation tables if they don't exist
db.run(`
  CREATE TABLE IF NOT EXISTS workflow_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    trigger TEXT NOT NULL,
    triggerValue TEXT,
    action TEXT NOT NULL,
    actionParams TEXT,
    isActive INTEGER DEFAULT 1,
    createdBy INTEGER,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS automation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruleId INTEGER,
    trigger TEXT,
    action TEXT,
    status TEXT,
    details TEXT,
    executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ruleId) REFERENCES workflow_rules(id)
  )
`);

// Get all workflow rules
router.get('/', (req, res) => {
  db.all('SELECT * FROM workflow_rules ORDER BY createdAt DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Create a new workflow rule
router.post('/', auth('Admin'), (req, res) => {
  const { name, description, trigger, triggerValue, action, actionParams } = req.body;
  const createdBy = req.user.id;

  db.run(
    `INSERT INTO workflow_rules (name, description, trigger, triggerValue, action, actionParams, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description, trigger, triggerValue, action, JSON.stringify(actionParams), createdBy],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Workflow rule created' });
    }
  );
});

// Update a workflow rule
router.put('/:id', (req, res) => {
  const { name, description, trigger, triggerValue, action, actionParams, isActive } = req.body;

  db.run(
    `UPDATE workflow_rules 
     SET name = ?, description = ?, trigger = ?, triggerValue = ?, action = ?, actionParams = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, trigger, triggerValue, action, JSON.stringify(actionParams), isActive, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Workflow rule updated' });
    }
  );
});

// Delete a workflow rule
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM workflow_rules WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Workflow rule deleted' });
  });
});

// Get automation logs
router.get('/logs', auth('Admin'), (req, res) => {
  db.all(
    'SELECT * FROM automation_logs ORDER BY executedAt DESC LIMIT 100',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Execute workflow automation (called internally)
async function executeWorkflowAutomation(trigger, data) {
  db.all(
    'SELECT * FROM workflow_rules WHERE trigger = ? AND isActive = 1',
    [trigger],
    async (err, rules) => {
      if (err) {
        console.error('Error executing workflow:', err);
        return;
      }

      for (const rule of rules || []) {
        try {
          await executeAction(rule.action, JSON.parse(rule.actionParams || '{}'), data, rule.id);
        } catch (error) {
          console.error(`Error executing rule ${rule.id}:`, error);
          logAutomation(rule.id, trigger, rule.action, 'failed', error.message);
        }
      }
    }
  );
}

// Execute automation action
async function executeAction(action, params, data, ruleId) {
  switch (action) {
    case 'send_email':
      console.log('Sending email:', params.to, params.subject);
      logAutomation(ruleId, 'task_assigned', action, 'completed', `Email sent to ${params.to}`);
      break;
      
    case 'assign_task':
      console.log('Assigning task:', params.title, 'to user', params.assigneeId);
      logAutomation(ruleId, 'workflow_trigger', action, 'completed', `Task assigned: ${params.title}`);
      break;
      
    case 'escalate':
      console.log('Escalating to:', params.escalateTo);
      logAutomation(ruleId, 'task_overdue', action, 'completed', `Escalated to ${params.escalateTo}`);
      break;
      
    case 'update_status':
      console.log('Updating status to:', params.newStatus);
      logAutomation(ruleId, 'approval_approved', action, 'completed', `Status updated to ${params.newStatus}`);
      break;
      
    case 'create_reminder':
      console.log('Creating reminder:', params.reminderText);
      logAutomation(ruleId, 'task_due_soon', action, 'completed', `Reminder created: ${params.reminderText}`);
      break;
      
    default:
      console.log('Unknown action:', action);
      logAutomation(ruleId, 'unknown', action, 'failed', 'Unknown action');
  }
}

// Log automation execution
function logAutomation(ruleId, trigger, action, status, details) {
  db.run(
    'INSERT INTO automation_logs (ruleId, trigger, action, status, details) VALUES (?, ?, ?, ?, ?)',
    [ruleId, trigger, action, status, details],
    (err) => {
      if (err) console.error('Error logging automation:', err);
    }
  );
}

module.exports = {
  router,
  executeWorkflowAutomation,
  executeAction
};

const sqlite3 = require("sqlite3").verbose();
const path = require('path');

// Use environment variable for DB path (useful for Render Disks) or default to local file
const dbPath = process.env.DB_PATH || path.join(__dirname, "office.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log("Database connection error:", err);
  } else {
    console.log("Connected to SQLite database");
    initDb();
  }
});

const initDb = () => {
  db.serialize(() => {
    // Create users table with all fields
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      department TEXT,
      role TEXT,
      designation TEXT,
      reportingManager INTEGER,
      phone TEXT,
      joiningDate TEXT,
      status TEXT DEFAULT 'Active',
      availability TEXT DEFAULT 'Available',
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Enhanced tasks table with workflow
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      department TEXT,
      category TEXT,
      priority TEXT DEFAULT 'Normal',
      assignedTo INTEGER,
      assignedBy INTEGER,
      status TEXT DEFAULT 'Pending',
      responseReason TEXT,
      dueDate TEXT,
      startDate TEXT,
      completionDate TEXT,
      estimatedHours REAL,
      attachments TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT
    )`);

    // Task approvals workflow
    db.run(`CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER,
      approvedBy INTEGER,
      status TEXT DEFAULT 'Pending',
      comments TEXT,
      level INTEGER,
      createdAt TEXT,
      approvedAt TEXT,
      FOREIGN KEY (taskId) REFERENCES tasks(id)
    )`);

    // Messages with thread support
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      threadId INTEGER,
      subject TEXT,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      attachments TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (senderId) REFERENCES users(id),
      FOREIGN KEY (receiverId) REFERENCES users(id)
    )`);

    // Events and calendar
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      userId INTEGER NOT NULL,
      eventDate TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      eventType TEXT,
      location TEXT,
      attendees TEXT,
      reminder TEXT,
      color TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Leave management
    db.run(`CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      leaveType TEXT,
      startDate TEXT,
      endDate TEXT,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      approvedBy INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Sales Deals
    db.run(`CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      value REAL,
      customerId INTEGER,
      stage TEXT DEFAULT 'Prospecting',
      expectedCloseDate TEXT,
      assignedTo INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    // Leads table
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      leaveType TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      days REAL,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      approvedBy INTEGER,
      approvedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    )`);

    // Finance and budgeting
    db.run(`CREATE TABLE IF NOT EXISTS finance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT,
      category TEXT,
      department TEXT,
      reference TEXT,
      approvedBy INTEGER,
      status TEXT DEFAULT 'Approved',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy INTEGER,
      FOREIGN KEY (approvedBy) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`);

    // Inventory management
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      category TEXT,
      quantity INTEGER NOT NULL,
      minQuantity INTEGER,
      unitPrice REAL,
      supplier TEXT,
      location TEXT,
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedBy INTEGER,
      FOREIGN KEY (updatedBy) REFERENCES users(id)
    )`);

    // Inventory transactions
    db.run(`CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventoryId INTEGER NOT NULL,
      transactionType TEXT,
      quantity INTEGER,
      reference TEXT,
      reason TEXT,
      processedBy INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inventoryId) REFERENCES inventory(id),
      FOREIGN KEY (processedBy) REFERENCES users(id)
    )`);

    // Resource allocation
    db.run(`CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      status TEXT DEFAULT 'Available',
      assignedTo INTEGER,
      assignedDate TEXT,
      location TEXT,
      cost REAL,
      maintenanceDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    // Notifications
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT,
      title TEXT,
      message TEXT NOT NULL,
      relatedId INTEGER,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Performance tracking
    db.run(`CREATE TABLE IF NOT EXISTS performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      period TEXT,
      tasksCompleted INTEGER DEFAULT 0,
      tasksOverdue INTEGER DEFAULT 0,
      efficiency REAL DEFAULT 0,
      attendance REAL DEFAULT 0,
      rating REAL,
      comments TEXT,
      reviewedBy INTEGER,
      reviewDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (reviewedBy) REFERENCES users(id)
    )`);

    // Document management
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      fileUrl TEXT,
      fileSize INTEGER,
      mimeType TEXT,
      category TEXT,
      uploadedBy INTEGER NOT NULL,
      department TEXT,
      isPublic INTEGER DEFAULT 0,
      version INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    )`);

    // Reminders
    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      reminderDate TEXT NOT NULL,
      reminderTime TEXT,
      type TEXT,
      relatedId INTEGER,
      isCompleted INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Reports
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT,
      generatedBy INTEGER NOT NULL,
      content TEXT,
      filters TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generatedBy) REFERENCES users(id)
    )`);

    // Audit logs
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      action TEXT,
      module TEXT,
      details TEXT,
      ipAddress TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // System Settings (Key-Value Store)
    db.run(`CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Help Desk Tickets (for IT department support)
    db.run(`CREATE TABLE IF NOT EXISTS helpdesk_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketNumber TEXT UNIQUE,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      assignedTo INTEGER,
      escalatedBy INTEGER,
      escalationReason TEXT,
      workNotes TEXT,
      resolutionNotes TEXT,
      solution TEXT,
      acceptedAt TEXT,
      completedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      closedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (assignedTo) REFERENCES users(id),
      FOREIGN KEY (escalatedBy) REFERENCES users(id)
    )`);

    // ================= CRM / SALES MODULE =================

    // Leads (Potential Clients)
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      source TEXT,
      status TEXT DEFAULT 'New', -- New, Contacted, Qualified, Lost, Converted
      assignedTo INTEGER,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    // Customers (Converted Leads / Active Clients)
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      address TEXT,
      industry TEXT,
      status TEXT DEFAULT 'Active',
      assignedTo INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    // Deals (Sales Pipeline)
    db.run(`CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      customerId INTEGER,
      value REAL,
      currency TEXT DEFAULT 'USD',
      stage TEXT DEFAULT 'Prospecting', -- Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
      probability INTEGER DEFAULT 10,
      expectedCloseDate TEXT,
      assignedTo INTEGER,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    // Knowledge Base (Articles / FAQ)
    db.run(`CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      authorId INTEGER,
      isPublished INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (authorId) REFERENCES users(id)
    )`);

    // Delegations (Manager -> Delegate)
    db.run(`CREATE TABLE IF NOT EXISTS delegations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      managerId INTEGER NOT NULL,
      delegateId INTEGER NOT NULL,
      startDate TEXT,
      endDate TEXT,
      status TEXT DEFAULT 'Active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (managerId) REFERENCES users(id),
      FOREIGN KEY (delegateId) REFERENCES users(id)
    )`);

    // System Feedback (Improvement Loop)
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      type TEXT, -- Workflow, Usability, Feature Request
      content TEXT NOT NULL,
      rating INTEGER,
      status TEXT DEFAULT 'New',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Sample data - inserted after all tables created
    db.run(`INSERT OR IGNORE INTO users 
    (id, name, email, password, department, role, designation, joiningDate, status)
    VALUES 
    (1, 'Admin User', 'admin@office.com', 'admin', 'IT', 'Admin', 'System Admin', '2023-01-01', 'Active'),
    (2, 'John Smith', 'john@office.com', 'jsmith', 'IT', 'Manager', 'IT Manager', '2023-06-15', 'Active'),
    (3, 'Mary Johnson', 'mary@office.com', 'mjohnson', 'HR', 'Manager', 'HR Manager', '2023-05-20', 'Active'),
    (4, 'Robert Davis', 'robert@office.com', 'rdavis', 'Sales', 'Staff', 'Sales Executive', '2024-01-10', 'Active'),
    (5, 'Sarah Wilson', 'sarah@office.com', 'swilson', 'Finance', 'Manager', 'Finance Manager', '2023-03-15', 'Active'),
    (6, 'Michael Brown', 'michael@office.com', 'mbrown', 'IT', 'Staff', 'Developer', '2024-02-01', 'Active')
    `);
  });
};

initDb();

module.exports = db;

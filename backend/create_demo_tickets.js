const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'office.db');
const db = new sqlite3.Database(dbPath);

console.log("Creating Demo Tickets...");

const demoTickets = [
    {
        title: "Printer on 2nd Floor Jammed",
        description: "The HP LaserJet on the 2nd floor keeps showing 'Paper Jam' error even though tray is empty.",
        category: "Hardware",
        priority: "High",
        userId: 1 // Assuming Admin ID 1 exists, or we can use another valid ID
    },
    {
        title: "Need Access to Figma",
        description: "I need a license for Figma for the new design project.",
        category: "Software",
        priority: "Medium",
        userId: 1
    }
];

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT INTO helpdesk_tickets (ticketNumber, userId, title, description, category, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Open')
    `);

    demoTickets.forEach(t => {
        const ticketNum = `TKT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        stmt.run(ticketNum, t.userId, t.title, t.description, t.category, t.priority, (err) => {
            if (err) console.error("Error inserting ticket:", err);
            else console.log(`✅ Created ticket: ${t.title}`);
        });
    });

    stmt.finalize();
});

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('backend/office.db');

db.all("SELECT id, name, email, department, role FROM users WHERE department = 'IT'", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("IT Users:", JSON.stringify(rows, null, 2));
    }
});

db.all("SELECT * FROM helpdesk_tickets LIMIT 5", (err, rows) => {
    if (err) {
        console.error("Error reading tickets:", err.message); // Will fail if table doesn't exist
    } else {
        console.log("Existing Tickets:", JSON.stringify(rows, null, 2));
    }
});

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'office.db');
const db = new sqlite3.Database(dbPath);

console.log("Checking Help Desk System Status...");

db.serialize(() => {
    // 1. Check if table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='helpdesk_tickets'", (err, table) => {
        if (err) console.error("Error checking table:", err);
        if (table) {
            console.log("✅ Table 'helpdesk_tickets' exists.");
            
            // 2. Count tickets
            db.get("SELECT COUNT(*) as count FROM helpdesk_tickets", (err, row) => {
                console.log(`📊 Total Tickets: ${row ? row.count : 0}`);
            });
        } else {
            console.log("❌ Table 'helpdesk_tickets' MISSING!");
        }
    });

    // 3. Check for IT Staff (needed for Agent view)
    db.all("SELECT id, name, email, department, role FROM users WHERE department = 'IT' OR role = 'Admin'", (err, rows) => {
        if (err) console.error("Error checking users:", err);
        if (rows && rows.length > 0) {
            console.log(`✅ Found ${rows.length} potential Help Desk Agents (IT/Admin):`);
            rows.forEach(r => console.log(`   - ${r.name} (${r.role}, ${r.department})`));
        } else {
            console.log("⚠️ No IT Department users found! Help Desk Agent view might not be accessible.");
        }
    });
});

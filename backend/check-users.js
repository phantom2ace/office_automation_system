const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./office.db');

db.all('SELECT id, name, email, password, department, role FROM users ORDER BY id', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('\n📋 CURRENT USERS IN DATABASE:\n');
    console.table(rows);
  }
  db.close();
});

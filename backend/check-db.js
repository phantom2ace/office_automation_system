// backend/check-db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to SQLite database');
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err);
      db.close();
      return;
    }
    
    console.log('\nFound Tables:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Show first few rows from each table
    tables.forEach(table => {
      console.log(`\nFirst 5 rows from ${table.name}:`);
      db.all(`SELECT * FROM ${table.name} LIMIT 5`, (err, rows) => {
        if (err) {
          console.error(`Error reading from ${table.name}:`, err.message);
          return;
        }
        console.log(rows);
      });
    });
    
    // Close after a short delay
    setTimeout(() => {
      db.close();
      console.log('\nDatabase connection closed');
    }, 2000);
  });
});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://office-automation-30c8b-default-rtdb.firebaseio.com/'
});

// SQLite database path
const dbPath = path.join(__dirname, 'database.sqlite');
console.log('🔍 Database path:', dbPath);

// Create SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Progress indicator
function showProgress(current, total, type = 'Processing') {
  const percentage = Math.floor((current / total) * 100);
  process.stdout.write(`\r${type}: ${current}/${total} (${percentage}%)`);
  if (current === total) console.log();
}

// Get database schema
async function getDbSchema() {
  return new Promise((resolve) => {
    db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Error getting schema:', err);
        resolve({});
        return;
      }
      
      const schema = {};
      tables.forEach(table => {
        schema[table.name] = table.sql;
      });
      resolve(schema);
    });
  });
}

// Migrate Users
async function migrateUsers() {
  console.log('\n===== USER MIGRATION =====');
  
  try {
    // Get users with proper error handling
    const users = await new Promise((resolve, reject) => {
      // First, check what columns exist in the users table
      const query = `
        SELECT id, name, email, role, department, status
        FROM users
        WHERE status = 'Active' OR status IS NULL
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          console.error('❌ Error fetching users:', err.message);
          resolve([]);
          return;
        }
        resolve(rows || []);
      });
    });

    if (!users.length) {
      console.log('⚠️ No active users found');
      return [];
    }

    console.log(`📊 Found ${users.length} users to migrate`);
    
    const userBatch = {};
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      showProgress(i + 1, users.length, 'Migrating users');
      
      userBatch[user.id] = {
        id: String(user.id),
        name: user.name || `User ${user.id}`,
        email: user.email || `user${user.id}@office.com`,
        role: user.role || 'Staff',
        department: user.department || 'General',
        status: user.status || 'Active'
      };
    }

    console.log('\n📤 Uploading users to Firebase...');
    await admin.database().ref('users').set(userBatch);
    console.log(`✅ Successfully migrated ${Object.keys(userBatch).length} users`);

    return users;
  } catch (error) {
    console.error('\n❌ Error migrating users:', error);
    return [];
  }
}

// Migrate Messages
async function migrateMessages() {
  console.log('\n===== MESSAGE MIGRATION =====');
  
  try {
    // First, check if messages table exists
    const messagesExist = await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'", (err, row) => {
        resolve(!!row);
      });
    });
    
    if (!messagesExist) {
      console.log('⚠️ Messages table does not exist');
      return 0;
    }

    // Check what columns are available in the messages table
    const messageColumns = await new Promise((resolve) => {
      db.get("PRAGMA table_info(messages)", (err, columns) => {
        if (err) {
          console.error('❌ Error getting message columns:', err);
          resolve([]);
          return;
        }
        resolve(columns.map(col => col.name));
      });
    });

    console.log('🔍 Available columns in messages:', messageColumns);

    // Build query based on available columns
    let selectColumns = ['m.id', 'm.senderId', 'm.receiverId', 'm.content'];
    if (messageColumns.includes('timestamp')) selectColumns.push('m.timestamp');
    if (messageColumns.includes('read')) selectColumns.push('m.read');
    if (messageColumns.includes('subject')) selectColumns.push('m.subject');
    
    const query = `
      SELECT ${selectColumns.join(', ')}
      FROM messages m
      WHERE EXISTS (SELECT 1 FROM users WHERE id = m.senderId AND (status = 'Active' OR status IS NULL))
        AND EXISTS (SELECT 1 FROM users WHERE id = m.receiverId AND (status = 'Active' OR status IS NULL))
      ORDER BY m.timestamp ASC
    `;

    const messages = await new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) {
          console.error('❌ Error fetching messages:', err.message);
          resolve([]);
          return;
        }
        resolve(rows || []);
      });
    });

    if (!messages.length) {
      console.log('⚠️ No valid messages to migrate');
      return 0;
    }

    console.log(`📬 Found ${messages.length} messages to migrate`);

    // Process messages in batches
    const batchSize = 100;
    let processedCount = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batchMessages = messages.slice(i, i + batchSize);
      const batch = {};
      let batchProcessed = 0;

      for (const msg of batchMessages) {
        try {
          const messageId = `msg_${msg.id || Date.now() + i + Math.random().toString(36).substr(2, 9)}`;
          const participants = {
            [msg.senderId]: true,
            [msg.receiverId]: true
          };

          const messageData = {
            id: messageId,
            senderId: String(msg.senderId),
            receiverId: String(msg.receiverId),
            content: msg.content || '[No content]',
            timestamp: msg.timestamp || new Date().toISOString(),
            read: !!msg.read,
            participants: participants,
            migrated: true
          };

          // Add optional fields if they exist
          if (msg.subject) messageData.subject = msg.subject;
          if (msg.threadId) messageData.threadId = msg.threadId;

          batch[`messages/${messageId}`] = messageData;
          batch[`user-messages/${msg.senderId}/${messageId}`] = true;
          batch[`user-messages/${msg.receiverId}/${messageId}`] = true;

          processedCount++;
          batchProcessed++;
          showProgress(i + batchProcessed, messages.length, 'Migrating messages');
        } catch (error) {
          console.error('\n❌ Error processing message:', error);
          continue;
        }
      }

      // Upload batch
      if (Object.keys(batch).length > 0) {
        try {
          await admin.database().ref().update(batch);
        } catch (error) {
          console.error('\n❌ Error uploading batch:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
    }

    console.log(`\n✅ Successfully migrated ${processedCount} messages`);
    return processedCount;
  } catch (error) {
    console.error('\n❌ Error migrating messages:', error);
    return 0;
  }
}

// Main Function
async function runMigration() {
  console.log('\n🚀 STARTING MIGRATION TO FIREBASE');
  console.log('================================');
  
  try {
    // Get database schema
    const schema = await getDbSchema();
    console.log('🔍 Detected tables:', Object.keys(schema).join(', '));

    // Start migration
    console.log('\n⏰ Migration started at:', new Date().toISOString());
    
    // Migrate users
    console.log('\n=== MIGRATING USERS ===');
    const users = await migrateUsers();
    
    // Migrate messages
    console.log('\n=== MIGRATING MESSAGES ===');
    const messageCount = await migrateMessages();

    // Summary
    console.log('\n🎉 MIGRATION COMPLETED');
    console.log('====================');
    console.log(`👥 Users migrated: ${users.length}`);
    console.log(`✉️  Messages migrated: ${messageCount}`);

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error.stack);
  } finally {
    // Clean up
    db.close();
    console.log('\n🛑 Database connections closed');
    process.exit(0);
  }
}

// Run the migration

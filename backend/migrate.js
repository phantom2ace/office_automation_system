// backend/migrate.js
require('dotenv').config();
const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Firebase Admin
// Try to use environment variable for service account if available, otherwise fallback to file
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('./service-account-key.json');
  }
} catch (error) {
  console.warn('⚠️  Could not load service account credentials. Firebase migration may fail.');
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://oas-trial-default-rtdb.firebaseio.com'
  });
}

// SQLite database file path
const dbPath = path.join(__dirname, 'office.db');

// Create SQLite database connection
console.log('🔍 Connecting to SQLite database:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database successfully');
});

// Utility to get user by ID (cached)
const userCache = {};
async function getUser(id) {
  if (!id) return null;
  if (userCache[id]) return userCache[id];
  
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      if (err || !user) {
        console.warn(`⚠️ User not found: ${id}`);
        resolve(null);
        return;
      }
      
      const userData = {
        id: String(user.id),
        name: user.name || `User ${user.id}`,
        email: user.email || `user${user.id}@office.com`,
        role: user.role || 'Staff',
        department: user.department || 'General'
      };
      
      userCache[user.id] = userData;
      resolve(userData);
    });
  });
}

// Migrate Users
async function migrateUsers() {
  console.log('\n===== USER MIGRATION =====');
  
  try {
    const users = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, email, role, department, designation, status 
        FROM users 
        WHERE status = 'Active'
      `, [], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching users:', err);
          reject([]);
          return;
        }
        resolve(rows || []);
      });
    });

    if (!users.length) {
      console.log('⚠️  No active users found');
      return [];
    }

    console.log(`📊 Found ${users.length} active users`);

    const userBatch = {};
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`🔄 Processing user ${i + 1}/${users.length}: ${user.email}`);
      
      userCache[user.id] = {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role || 'Staff',
        department: user.department || 'General',
        designation: user.designation,
        status: user.status || 'Active'
      };
      
      userBatch[user.id] = userCache[user.id];
    }

    console.log('📤 Uploading users to Firebase...');
    await admin.database().ref('users').set(userBatch);
    console.log(`✅ Successfully migrated ${Object.keys(userBatch).length} users`);

    return users;
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    return [];
  }
}

// Migrate Messages
async function migrateMessages() {
  console.log('\n===== MESSAGE MIGRATION =====');
  
  try {
    const messages = await new Promise((resolve, reject) => {
      const query = `
        SELECT m.id, m.senderId, m.receiverId, m.content, 
               m.timestamp, m.isRead, m.threadId, m.subject
        FROM messages m
        JOIN users u1 ON m.senderId = u1.id AND u1.status = 'Active'
        JOIN users u2 ON m.receiverId = u2.id AND u2.status = 'Active'
        ORDER BY m.timestamp ASC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('❌ Error fetching messages:', err);
          resolve([]);
          return;
        }
        resolve(rows || []);
      });
    });

    if (!messages.length) {
      console.log('⚠️  No messages found');
      return 0;
    }

    console.log(`📬 Found ${messages.length} messages to migrate`);

    // Process messages in batches
    const baseRef = admin.database().ref();
    let batchCount = 0;
    let processedCount = 0;
    const batchSize = 200;
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const updates = {};

      console.log(`⏳ Processing batch ${++batchCount}/${Math.ceil(messages.length / batchSize)}`);
      
      for (const msg of batch) {
        try {
          // Get sender and receiver data
          const sender = await getUser(msg.senderId);
          const receiver = await getUser(msg.receiverId);
          
          if (!sender || !receiver) {
            console.warn(`⚠️  Skipping message ${msg.id}: Invalid sender or receiver`);
            continue;
          }

          const messageId = `msg_${msg.id}`;
          const participants = {
            [sender.id]: true,
            [receiver.id]: true
          };

          const messageData = {
            id: messageId,
            senderId: sender.id,
            senderName: sender.name,
            senderEmail: sender.email,
            receiverId: receiver.id,
            receiverName: receiver.name,
            receiverEmail: receiver.email,
            content: msg.content || '',
            timestamp: msg.timestamp || new Date().toISOString(),
            read: Boolean(msg.isRead),
            type: 'regular',
            participants: participants
          };

          // Add subject if exists
          if (msg.subject) {
            messageData.subject = msg.subject;
          }

          // Handle threaded messages
          if (msg.threadId) {
            messageData.threadId = `thread_${msg.threadId}`;
          }

          // Add to updates
          updates[`messages/${messageId}`] = messageData;
          updates[`user-messages/${sender.id}/${messageId}`] = messageId;
          updates[`user-messages/${receiver.id}/${messageId}`] = messageId;

          processedCount++;
        } catch (error) {
          console.error(`❌ Error processing message ${msg.id}:`, error);
        }
      }

      // Upload batch
      if (Object.keys(updates).length > 0) {
        await baseRef.update(updates);
        console.log(`✅ Uploaded ${Object.keys(updates.messages || {}).length} messages`);
      }
    }

    console.log(`✅ Successfully migrated ${processedCount} messages`);
    return processedCount;
  } catch (error) {
    console.error('❌ Error migrating messages:', error);
    return 0;
  }
}

// Verify Migration
async function verifyMigration() {
  console.log('\n===== VERIFICATION =====');
  
  try {
    // Verify Users
    const users = await admin.database().ref('users').once('value');
    const userCount = users.numChildren();
    console.log(`👥 Users in Firebase: ${userCount}`);

    // Verify Messages
    const messages = await admin.database().ref('messages').orderByKey().limitToFirst(1).once('value');
    const hasMessages = messages.exists();
    console.log(`✉️  Messages in Firebase: ${hasMessages ? 'Yes' : 'No'}`);
    
    if (hasMessages) {
      const messagesCount = (await admin.database().ref('messages').once('value')).numChildren();
      console.log(`   Total messages: ${messagesCount}`);
    }

    console.log('✅ Verification completed');
    return { users: userCount, hasMessages };
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return { users: 0, hasMessages: false };
  }
}

// Main Migration Function
async function runMigration() {
  console.log('\n🚀 STARTING DATABASE MIGRATION TO FIREBASE');
  console.log('===========================================');
  
  try {
    // Show warning about clearing existing data
    console.log('\n⚠️  WARNING: This will overwrite existing data in Firebase Realtime Database.');
    
    // Confirm with user
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('Do you want to continue? (Y/n) ', resolve);
    });

    readline.close();

    if (answer.toLowerCase() !== 'y' && answer !== '') {
      console.log('❌ Migration cancelled by user');
      process.exit(0);
    }

    // Start migration timer
    const startTime = new Date();
    console.log(`\n⏰ Migration started at: ${startTime.toISOString()}`);

    // Migrate users
    console.log('\n=== MIGRATING USERS ===');
    await migrateUsers();

    // Migrate messages
    console.log('\n=== MIGRATING MESSAGES ===');
    await migrateMessages();

    // Verify migration
    console.log('\n=== VERIFYING MIGRATION ===');
    await verifyMigration();

    // Show completion message
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('==========================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📅 Started at: ${startTime.toISOString()}`);
    console.log(`📅 Finished at: ${endTime.toISOString()}`);
    console.log('\n⚠️  PLEASE NOTE:');
    console.log('1. Check your Firebase Realtime Database for the migrated data');
    console.log('2. You can now update your frontend to use Firebase');
    console.log('3. Remember to remove the old message-related API endpoints');
    console.log('4. Update your frontend code to use the Firebase SDK for messaging');

    // Close database connections
    db.close();
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    console.error(error.stack);
  } finally {
    // Clean up
    db.close();
    admin.app().delete();
    console.log('\n🛑 Database connections closed');
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('❌ Unhandled error in migration:', error);
  process.exit(1);
});
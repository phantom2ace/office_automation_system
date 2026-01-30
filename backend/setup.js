// backend/setup.js
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('./service-account-key.json');
  }
} catch (error) {
  console.error('❌ Could not load service account credentials.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://oas-trial-default-rtdb.firebaseio.com'
});

const db = admin.database();

// Create database structure
function setupDatabase() {
  const defaultData = {
    users: {},
    messages: {},
    'user-messages': {}
  };

  return db.ref().set(defaultData)
    .then(() => console.log('✅ Database structure created'))
    .catch(error => console.error('Error creating database structure:', error));
}

// Run setup
setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
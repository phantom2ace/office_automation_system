// backend/setup.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://office-automation-30c8b-default-rtdb.firebaseio.com'
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
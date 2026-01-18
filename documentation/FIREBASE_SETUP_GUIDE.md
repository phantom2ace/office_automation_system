# Firebase Realtime Database Setup Guide

## Overview
Your messaging system has been converted from Node.js/Express backend to **Firebase Realtime Database** for true real-time messaging without polling.

---

## Step 1: Create Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Click **"Add project"**
3. Enter project name: `office-automation` (or your preferred name)
4. Uncheck "Enable Google Analytics" (optional)
5. Click **"Create project"** and wait for initialization

---

## Step 2: Enable Realtime Database

1. In Firebase Console, click on your project
2. Go to **Build → Realtime Database** (left menu)
3. Click **"Create Database"**
4. Select **US** as your database location
5. Choose **Start in test mode** (for development)
   - ⚠️ For production, set proper security rules
6. Click **"Enable"**

---

## Step 3: Get Your Firebase Config

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Under **"Your apps"**, click the **Web icon** (</> symbol)
3. Register your app: Name it `office-automation-web`
4. Copy the entire `firebaseConfig` object

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxx...",
  authDomain: "office-automation-123.firebaseapp.com",
  databaseURL: "https://office-automation-123.firebaseio.com",
  projectId: "office-automation-123",
  storageBucket: "office-automation-123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 4: Update messages.html

1. Open `frontend/messages.html`
2. Find the `firebaseConfig` object (around line 630)
3. Replace with your actual Firebase config from Step 3

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",  // Replace
  authDomain: "your-actual-domain.firebaseapp.com",  // Replace
  databaseURL: "your-actual-database-url",  // Replace
  projectId: "your-actual-project-id",  // Replace
  storageBucket: "your-actual-bucket",  // Replace
  messagingSenderId: "your-actual-sender-id",  // Replace
  appId: "your-actual-app-id"  // Replace
};
```

---

## Step 5: Set Up Firebase Database Structure

Firebase uses a JSON structure. You need to create two main sections:

### A. Create **messages** node

In Firebase Console, under **Realtime Database**:

1. Click on the root and add a new child called `messages`
2. Each message will be auto-generated with structure:

```json
{
  "messages": {
    "-NX1a2b3c4d5e6f7g8h": {
      "senderId": "user1",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverId": "user2",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "content": "Hello!",
      "timestamp": "2026-01-17T10:30:00Z",
      "read": false
    }
  }
}
```

### B. Create **users** node

```json
{
  "users": {
    "user1": {
      "id": "user1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Manager",
      "department": "Finance"
    },
    "user2": {
      "id": "user2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Staff",
      "department": "HR"
    }
  }
}
```

---

## Step 6: Sync Existing Users to Firebase

### Option A: Manual Entry
1. In Firebase Console, go to **Realtime Database**
2. Click the **"+" button** next to `users`
3. Add each user with their ID as the key

### Option B: Import from Node.js Database
If you have existing users in SQLite:

1. Create a small Node.js script to migrate:
```javascript
const sqlite3 = require('sqlite3');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project.firebaseio.com"
});

const db = new sqlite3.Database('./database.js');
const realtimeDb = admin.database();

// Get all users and add to Firebase
db.all('SELECT * FROM users', (err, rows) => {
  rows.forEach(user => {
    realtimeDb.ref(`users/${user.id}`).set({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  });
});
```

---

## Step 7: Test the Connection

1. Open `http://localhost:5500/frontend/messages.html` (using Live Server)
2. Login with a test user
3. Try sending a message
4. Check Firebase Console → **Realtime Database** to see messages in real-time

---

## Features Now Available

✅ **Real-time Updates** - Messages appear instantly without polling  
✅ **Role-Based Access** - Admin/Manager/Staff filtering built-in  
✅ **No Backend Server Needed** - Firebase handles all data  
✅ **Scalable** - Firebase auto-scales with your users  
✅ **Dark Theme UI** - Modern WhatsApp-style interface  
✅ **Search** - Find conversations and contacts  
✅ **Timestamps** - All messages timestamped  

---

## Database Security Rules (for Production)

When ready for production, update your Firebase Security Rules:

```json
{
  "rules": {
    "messages": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$message": {
        ".read": "root.child('messages').child($message).child('senderId').val() == auth.uid || root.child('messages').child($message).child('receiverId').val() == auth.uid",
        ".write": "root.child('messages').child($message).child('senderId').val() == auth.uid || !data.exists()"
      }
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## Troubleshooting

### Messages not loading?
- ✓ Check Firebase config is correct
- ✓ Verify database URL matches your project
- ✓ Check browser console for errors (F12)
- ✓ Ensure Firebase SDKs are loaded

### Can't send messages?
- ✓ Check Firebase rules (should be test mode or custom)
- ✓ Verify user data exists in `users` node
- ✓ Check receiverId is valid

### Database empty?
- ✓ Make sure `messages` and `users` nodes exist
- ✓ Manually add test data via Firebase Console
- ✓ Run migration script to import from old database

---

## Migrating from Node.js Backend

The system has been updated to:

**Before (Old):**
- ❌ Node.js server polling every 5 seconds
- ❌ SQLite database queries
- ❌ Manual refresh needed

**After (Firebase):**
- ✅ Real-time listeners (instant updates)
- ✅ Cloud-hosted database (Firebase)
- ✅ Automatic sync across devices
- ✅ Serverless architecture

---

## Next Steps

1. ✓ Create Firebase project (5 min)
2. ✓ Get Firebase config (2 min)
3. ✓ Update messages.html config (1 min)
4. ✓ Set up database structure (5 min)
5. ✓ Sync existing users (5-10 min)
6. ✓ Test messaging (2 min)

**Total time: ~20-30 minutes**

---

## Support

For Firebase help:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Realtime Database Guide](https://firebase.google.com/docs/database)
- [Security Rules](https://firebase.google.com/docs/rules)

---

**Date:** January 17, 2026  
**Status:** Ready for Firebase integration

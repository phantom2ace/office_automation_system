# 🔐 User Management Guide

## How to Change Passwords & Usernames WITHOUT Deleting Database

You can modify user credentials while the system is running using the `manage-users.js` script.

---

## ⚡ Quick Start

### Step 1: Update the Script
Edit `backend/manage-users.js` and uncomment the examples at the bottom:

```javascript
// Go to the bottom of the file and uncomment:

// Example: Update password
const result = await updatePassword('john@office.com', 'newPassword123');
console.log(result);

// Example: Update name
const result = await updateUsername('mary@office.com', 'Mary New Name');
console.log(result);

// Example: Update multiple fields
const result = await updateUser('sarah@office.com', {
  password: 'sarah123',
  name: 'Sarah Wilson'
});
console.log(result);
```

### Step 2: Run the Script
```bash
cd backend
node manage-users.js
```

### Step 3: Verify Changes
The script will show all users before and after changes.

---

## 📖 Functions Available

### 1️⃣ Update Password
```javascript
updatePassword('email@office.com', 'newPassword')
```
**Example:**
```javascript
await updatePassword('john@office.com', 'john2025');
// Output: ✓ Password updated for john@office.com
```

### 2️⃣ Update Name/Username
```javascript
updateUsername('email@office.com', 'New Name')
```
**Example:**
```javascript
await updateUsername('mary@office.com', 'Mary Jane Johnson');
// Output: ✓ Name updated for mary@office.com
```

### 3️⃣ Update Email
```javascript
updateEmail(userId, 'newemail@office.com')
```
**Example:**
```javascript
await updateEmail(2, 'john.smith@office.com');
// Output: ✓ Email updated for user ID 2
```

### 4️⃣ Update Multiple Fields at Once
```javascript
updateUser('email@office.com', {
  password: 'newPassword',
  name: 'New Name',
  department: 'Finance',
  role: 'Manager'
})
```
**Example:**
```javascript
await updateUser('robert@office.com', {
  password: 'robert2025',
  name: 'Robert Andrew Davis',
  department: 'Sales'
});
```

### 5️⃣ View All Users
```javascript
viewAllUsers()
```
Shows all users in a table format

### 6️⃣ View Specific User
```javascript
viewUser('email@office.com')
```

---

## 🔍 Current Users (Default)

| ID | Name | Email | Password | Department | Role |
|----|------|-------|----------|-----------|------|
| 1 | Admin User | admin@office.com | admin | IT | Admin |
| 2 | John Smith | john@office.com | jsmith | IT | Manager |
| 3 | Mary Johnson | mary@office.com | mjohnson | HR | Manager |
| 4 | Robert Davis | robert@office.com | rdavis | Sales | Staff |
| 5 | Sarah Wilson | sarah@office.com | swilson | Finance | Manager |
| 6 | Michael Brown | michael@office.com | mbrown | IT | Staff |

---

## 📝 Example: Batch Update All Passwords

Create a file called `update-all-passwords.js`:

```javascript
const { 
  updatePassword, 
  viewAllUsers 
} = require('./manage-users.js');

async function batchUpdate() {
  const updates = [
    { email: 'admin@office.com', password: 'admin2025' },
    { email: 'john@office.com', password: 'john2025' },
    { email: 'mary@office.com', password: 'mary2025' },
    { email: 'robert@office.com', password: 'robert2025' },
    { email: 'sarah@office.com', password: 'sarah2025' },
    { email: 'michael@office.com', password: 'michael2025' }
  ];

  console.log('🔄 Updating all passwords...\n');
  
  for (const update of updates) {
    try {
      const result = await updatePassword(update.email, update.password);
      console.log(result);
    } catch (error) {
      console.error(`❌ ${error}`);
    }
  }

  console.log('\n✅ All passwords updated!\n');
}

batchUpdate();
```

Then run:
```bash
node update-all-passwords.js
```

---

## 🛠️ How to Integrate Into System (Advanced)

### Create an Admin API Endpoint

Add this to `routes/admin.js`:

```javascript
const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Update user password - ADMIN ONLY
router.put('/users/:userId/password', auth('Admin'), (req, res) => {
  const { newPassword } = req.body;
  const { userId } = req.params;

  if (!newPassword) {
    return res.json({ error: 'New password required' });
  }

  db.run(
    `UPDATE users SET password = ? WHERE id = ?`,
    [newPassword, userId],
    function (err) {
      if (err) {
        return res.json({ error: 'Error updating password' });
      }
      if (this.changes === 0) {
        return res.json({ error: 'User not found' });
      }
      res.json({ message: 'Password updated successfully' });
    }
  );
});

// Update user details - ADMIN ONLY
router.put('/users/:userId', auth('Admin'), (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  values.push(userId);

  const setClause = fields.map(f => `${f} = ?`).join(', ');

  db.run(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    values,
    function (err) {
      if (err) {
        return res.json({ error: 'Error updating user' });
      }
      if (this.changes === 0) {
        return res.json({ error: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

module.exports = router;
```

Then use it:
```
PUT http://localhost:3000/api/admin/users/2/password
Body: { "newPassword": "john2025" }

PUT http://localhost:3000/api/admin/users/2
Body: { "name": "John New", "password": "john2025" }
```

---

## ⚙️ Alternative: SQLite CLI

Use SQLite directly from command line:

```bash
sqlite3 office.db
```

Then in SQLite prompt:

```sql
-- View all users
SELECT id, name, email, password FROM users;

-- Update password
UPDATE users SET password = 'newpass123' WHERE email = 'john@office.com';

-- Update name
UPDATE users SET name = 'John New Name' WHERE email = 'john@office.com';

-- Update multiple fields
UPDATE users SET password = 'newpass123', name = 'John New' WHERE id = 2;

-- Exit
.exit
```

---

## 🚨 Safety Tips

✅ **Always backup before bulk updates**
- Copy `office.db` before making changes

✅ **Test with one user first**
- Update one password, test login
- Then do batch updates

✅ **Keep track of changes**
- Write down new passwords somewhere safe
- Don't lose admin credentials!

✅ **Verify after updates**
- Try logging in with new credentials
- Check if system still works

---

## 📋 Checklists

### Changing All Staff Passwords

- [ ] Backup `office.db`
- [ ] Stop running server (if needed)
- [ ] Use `manage-users.js` or SQLite
- [ ] Update each password
- [ ] Test login with one account
- [ ] Verify all features work
- [ ] Share new passwords securely with staff

### Adding New User

```javascript
// Use SQL INSERT
INSERT INTO users (name, email, password, department, role, designation, status)
VALUES ('New Person', 'new@office.com', 'newpass123', 'IT', 'Staff', 'Developer', 'Active');
```

### Removing User

```javascript
// Soft delete (set status to Inactive)
UPDATE users SET status = 'Inactive' WHERE email = 'old@office.com';

// Hard delete (careful!)
DELETE FROM users WHERE email = 'old@office.com';
```

---

## ❓ FAQ

**Q: Do I need to stop the server to change passwords?**
A: No! You can change passwords while server is running using the script.

**Q: What if I forget the admin password?**
A: Delete `office.db` and restart server - it will recreate with defaults.

**Q: Can I update passwords through the web interface?**
A: Not yet - use the script. You could add an Admin panel later.

**Q: How do I change password while logged in?**
A: Create a "Change Password" feature in the user's dashboard (todo).

**Q: Are passwords encrypted?**
A: Currently NO - they're plain text. Should add hashing (bcrypt) later for security!

---

## 🔒 Security Note

⚠️ **Current passwords are stored in PLAIN TEXT!**

For production, add password hashing:

```javascript
const bcrypt = require('bcrypt');

// When creating user:
const hashedPassword = await bcrypt.hash(password, 10);

// When checking password:
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

**Last Updated:** January 16, 2026

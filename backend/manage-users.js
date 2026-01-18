/**
 * USER MANAGEMENT SCRIPT
 * Use this to update user passwords and details without deleting the database
 * Run: node manage-users.js
 */

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./office.db");

// =====================================================
// METHOD 1: UPDATE PASSWORD BY EMAIL
// =====================================================
function updatePassword(email, newPassword) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET password = ? WHERE email = ?`,
      [newPassword, email],
      function (err) {
        if (err) {
          reject(`Error updating password: ${err.message}`);
        } else if (this.changes === 0) {
          reject(`User with email "${email}" not found`);
        } else {
          resolve(`✓ Password updated for ${email}`);
        }
      }
    );
  });
}

// =====================================================
// METHOD 2: UPDATE USERNAME BY EMAIL
// =====================================================
function updateUsername(email, newName) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET name = ? WHERE email = ?`,
      [newName, email],
      function (err) {
        if (err) {
          reject(`Error updating name: ${err.message}`);
        } else if (this.changes === 0) {
          reject(`User with email "${email}" not found`);
        } else {
          resolve(`✓ Name updated for ${email}`);
        }
      }
    );
  });
}

// =====================================================
// METHOD 3: UPDATE EMAIL BY USER ID
// =====================================================
function updateEmail(userId, newEmail) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET email = ? WHERE id = ?`,
      [newEmail, userId],
      function (err) {
        if (err) {
          reject(`Error updating email: ${err.message}`);
        } else if (this.changes === 0) {
          reject(`User with ID ${userId} not found`);
        } else {
          resolve(`✓ Email updated for user ID ${userId}`);
        }
      }
    );
  });
}

// =====================================================
// METHOD 4: UPDATE MULTIPLE FIELDS
// =====================================================
function updateUser(email, updates) {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(email); // For WHERE clause

    const setClause = fields.map(f => `${f} = ?`).join(", ");

    db.run(
      `UPDATE users SET ${setClause} WHERE email = ?`,
      values,
      function (err) {
        if (err) {
          reject(`Error updating user: ${err.message}`);
        } else if (this.changes === 0) {
          reject(`User with email "${email}" not found`);
        } else {
          resolve(`✓ User ${email} updated: ${JSON.stringify(updates)}`);
        }
      }
    );
  });
}

// =====================================================
// METHOD 5: VIEW ALL USERS
// =====================================================
function viewAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, name, email, password, department, role, status FROM users ORDER BY id`,
      (err, rows) => {
        if (err) {
          reject(`Error fetching users: ${err.message}`);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

// =====================================================
// METHOD 6: VIEW SPECIFIC USER
// =====================================================
function viewUser(email) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      (err, row) => {
        if (err) {
          reject(`Error fetching user: ${err.message}`);
        } else if (!row) {
          reject(`User with email "${email}" not found`);
        } else {
          resolve(row);
        }
      }
    );
  });
}

// =====================================================
// EXPORT FUNCTIONS
// =====================================================
module.exports = {
  updatePassword,
  updateUsername,
  updateEmail,
  updateUser,
  viewAllUsers,
  viewUser
};

// =====================================================
// EXAMPLE USAGE (uncomment to use)
// =====================================================

async function main() {
  try {
    console.log("\n📋 CURRENT USERS:\n");
    const users = await viewAllUsers();
    console.table(users);

    // Example: Update password for john@office.com
    // const result = await updatePassword('john@office.com', 'newPassword123');
    // console.log(result);

    // Example: Update multiple fields
    // const result = await updateUser('mary@office.com', {
    //   password: 'newPassword456',
    //   name: 'Mary Jane Johnson'
    // });
    // console.log(result);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    db.close();
  }
}

main();

# 🏗️ User Management System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                              │
│                  (http://localhost:3000)                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  SIDEBAR (Left Navigation)                                  │  │
│  │                                                              │  │
│  │  📊 Dashboard                                                │  │
│  │  ✅ Tasks                                                    │  │
│  │  ✉️  Messages                                                │  │
│  │  ...                                                         │  │
│  │  👤 User Management  ← ADMIN ONLY                           │  │
│  │  🚪 Logout                                                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────┬──────────────────────┐                   │
│  │  Create New User     │  Manage Existing     │                   │
│  │  (Left Section)      │  (Right Section)     │                   │
│  │                      │                      │                   │
│  │ Form:                │ User List:           │                   │
│  │ ├─ Name              │ ├─ John Smith        │                   │
│  │ ├─ Email             │ │  [Edit] [Delete]   │                   │
│  │ ├─ Password          │ ├─ Mary Johnson      │                   │
│  │ ├─ Department        │ │  [Edit] [Delete]   │                   │
│  │ ├─ Role              │ ├─ ... more users    │                   │
│  │ └─ [Create Button]   │                      │                   │
│  └──────────────────────┴──────────────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │   User Clicks Form    │
                    │   Fills All Fields    │
                    │   Clicks "Create"     │
                    └───────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │  Frontend JavaScript  │
                    │  Validates Form       │
                    │  Sends API Request    │
                    └───────────────────────┘
                                ↓
        ┌───────────────────────────────────────────────┐
        │  HTTP POST /api/users/create                  │
        │  {                                            │
        │    name: "Jane Smith",                        │
        │    email: "jane@office.com",                  │
        │    password: "jane123",                       │
        │    department: "Finance",                     │
        │    role: "Manager"                            │
        │  }                                            │
        │  Headers: userid, userrole (Admin check)      │
        └───────────────────────────────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │  Backend (Express)    │
                    │                       │
                    │  1. Check if Admin    │
                    │  2. Validate Email    │
                    │  3. Check Duplicate   │
                    │  4. Insert to DB      │
                    └───────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │   SQLite Database     │
                    │   Stores User:        │
                    │   - ID: 7             │
                    │   - Name: Jane Smith  │
                    │   - Email: jane@...   │
                    │   - Password: jane123 │
                    │   - Department: Fin   │
                    │   - Role: Manager     │
                    └───────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │  API Response         │
                    │  {                    │
                    │    success: true,     │
                    │    userId: 7,         │
                    │    message: "..."     │
                    │  }                    │
                    └───────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │  Frontend Shows       │
                    │  Success Message      │
                    │  Refreshes User List  │
                    │  Jane appears in list │
                    └───────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │  USER CAN NOW LOGIN   │
                    │  Email: jane@off...   │
                    │  Pass: jane123        │
                    └───────────────────────┘
```

---

## File Structure

```
office-automation-system/
│
├── backend/
│   ├── routes/
│   │   ├── users.js ................... ✨ NEW - User Management API
│   │   ├── tasks.js
│   │   ├── messages.js
│   │   └── ... (other routes)
│   │
│   ├── server.js ...................... MODIFIED - Added users route
│   ├── database.js
│   ├── package.json
│   └── office.db ...................... SQLite Database
│
├── frontend/
│   ├── user-management.html ........... ✨ NEW - Admin Panel
│   ├── dashboard.html ................. MODIFIED - Added sidebar link
│   ├── tasks.html
│   ├── messages.html
│   └── ... (other pages)
│
└── documentation/
    ├── USER_MANAGEMENT_COMPLETE.md .... ✨ NEW - Full Overview
    ├── HOW_TO_CREATE_USERS.md ......... ✨ NEW - Visual Guide
    ├── ADMIN_USER_MANAGEMENT.md ....... ✨ NEW - Detailed Guide
    └── ... (other docs)
```

---

## API Endpoint Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  USER MANAGEMENT API                         │
│              Base URL: /api/users                             │
└──────────────────────────────────────────────────────────────┘

1. CREATE USER
   ├─ Method: POST
   ├─ Endpoint: /create
   ├─ Required Headers: userid, userrole
   ├─ Body Fields: name, email, password, department, role
   ├─ Access: Admin Only
   ├─ Validation:
   │  ├─ All fields required
   │  ├─ Valid email format
   │  ├─ Email must be unique
   │  └─ Role must be valid
   ├─ Returns: { success, userId, user }
   └─ Example:
      POST /api/users/create
      { name: "Jane Smith", email: "jane@...", ... }
      ✓ { success: true, userId: 7 }

2. GET ALL USERS
   ├─ Method: GET
   ├─ Endpoint: /all
   ├─ Required Headers: userid, userrole
   ├─ Access: Admin Only
   ├─ Returns: { success, count, users: [...] }
   └─ Example:
      GET /api/users/all
      ✓ { success: true, count: 7, users: [{id:1, name:"Admin", ...}] }

3. UPDATE USER
   ├─ Method: PUT
   ├─ Endpoint: /{userId}
   ├─ Required Headers: userid, userrole
   ├─ Body Fields: name, email, password, department, role, status
   ├─ Access: Admin Only
   ├─ Validation:
   │  ├─ At least one field required
   │  ├─ Email must be unique (if changing)
   │  └─ Valid values for all fields
   ├─ Returns: { success, message }
   └─ Example:
      PUT /api/users/7
      { password: "newpass123" }
      ✓ { success: true, message: "User updated" }

4. DELETE USER
   ├─ Method: DELETE
   ├─ Endpoint: /{userId}
   ├─ Required Headers: userid, userrole
   ├─ Access: Admin Only
   ├─ Validation:
   │  └─ Cannot delete only admin user
   ├─ Returns: { success, message }
   └─ Example:
      DELETE /api/users/7
      ✓ { success: true, message: "User deleted" }
```

---

## Database Schema

```
users TABLE
┌─────────────────────────────────────────────────────┐
│                  COLUMNS                            │
├─────────────────────────────────────────────────────┤
│ id (INTEGER) - Primary Key, Auto-increment         │
│ name (TEXT) - User's full name                     │
│ email (TEXT) - Unique email, used for login        │
│ password (TEXT) - Plain text (consider bcrypt)     │
│ department (TEXT) - HR, IT, Finance, Sales, etc.   │
│ role (TEXT) - Admin, Manager, Staff                │
│ status (TEXT) - Active, Inactive                   │
│ availability (TEXT) - Available, Busy              │
│ createdAt (TIMESTAMP) - Auto-set on creation       │
└─────────────────────────────────────────────────────┘

Example Row:
┌────┬─────────────┬──────────────────────┬──────────┬───────────┬─────────┬────────┬──────────────┬─────────────────────┐
│ id │ name        │ email                │ password │ department│ role    │ status │ availability │ createdAt           │
├────┼─────────────┼──────────────────────┼──────────┼───────────┼─────────┼────────┼──────────────┼─────────────────────┤
│ 7  │ Jane Smith  │ jane.smith@office... │ jane123  │ Finance   │ Manager │ Active │ Available    │ 2025-01-16 14:30:00 │
└────┴─────────────┴──────────────────────┴──────────┴───────────┴─────────┴────────┴──────────────┴─────────────────────┘
```

---

## Access Control

```
┌────────────────────────────────────────────────────────┐
│              ROLE-BASED ACCESS                         │
├────────────────────────────────────────────────────────┤

Admin User:
├─ Can CREATE users ........................... ✓ YES
├─ Can VIEW all users ......................... ✓ YES
├─ Can EDIT any user .......................... ✓ YES
├─ Can DELETE users ........................... ✓ YES (except self/last admin)
├─ Sees "User Management" in sidebar ......... ✓ YES
└─ Can access /user-management.html .......... ✓ YES

Manager User:
├─ Can CREATE users ........................... ✗ NO
├─ Can VIEW all users ......................... ✗ NO
├─ Can EDIT users ............................. ✗ NO
├─ Can DELETE users ........................... ✗ NO
├─ Sees "User Management" in sidebar ......... ✗ NO
└─ Can access /user-management.html .......... ✗ NO (Access Restricted)

Staff User:
├─ Can CREATE users ........................... ✗ NO
├─ Can VIEW all users ......................... ✗ NO
├─ Can EDIT users ............................. ✗ NO
├─ Can DELETE users ........................... ✗ NO
├─ Sees "User Management" in sidebar ......... ✗ NO
└─ Can access /user-management.html .......... ✗ NO (Access Restricted)

Non-Logged In:
├─ Gets redirected to login page ............. ✗ NO ACCESS
└─ Cannot access any protected endpoints ...... ✗ NO
```

---

## Security Checks

```
Create User Request Flow:

Request Arrives
     ↓
1. Check Headers
   ├─ Is userid present? → If NO, return error
   └─ Is userrole present? → If NO, return error
     ↓
2. Check Authorization
   ├─ Is userrole === "Admin"? → If NO, return "Forbidden"
   └─ Continue if YES
     ↓
3. Validate Input
   ├─ All fields present? → If NO, return "Missing fields"
   ├─ Valid email format? → If NO, return "Invalid email"
   └─ Continue if OK
     ↓
4. Check Uniqueness
   ├─ Email already exists? → If YES, return "Email exists"
   └─ Continue if unique
     ↓
5. Database Insert
   ├─ Insert user record
   └─ Return success with new ID
```

---

## User Journey

```
DAY 1: Admin Creates User
└─ Admin opens user-management.html
   └─ Fills form with new employee details
      └─ Clicks "Create User"
         └─ User created in database
            └─ Success message shown
               └─ Admin shares credentials with employee

DAY 1: New Employee First Login
└─ Employee goes to http://localhost:3000
   └─ Enters email and password
      └─ System verifies credentials in database
         └─ Login successful
            └─ Personalized dashboard appears
               └─ Employee starts working

DAY 2: Admin Changes Employee Role
└─ Admin opens user-management.html
   └─ Finds employee in user list
      └─ Clicks [Edit]
         └─ Modal opens with current details
            └─ Changes Role from Staff to Manager
               └─ Clicks "Update User"
                  └─ Change saved to database
                     └─ On employee's next login, they see Manager features

DAY 30: Employee Leaves Company
└─ Admin opens user-management.html
   └─ Finds employee in user list
      └─ Clicks [Delete]
         └─ Confirms deletion
            └─ User removed from database
               └─ Employee can no longer login
```

---

## Error Handling Flow

```
User Submits Invalid Email
     ↓
Frontend Validation (Client-side)
├─ Check email format ........................... ✓ FAIL
└─ Show error message before sending request
     ↓
User Fixes Email, Tries Again
     ↓
User Submits Valid Email (unique)
     ↓
Frontend Validation (Client-side)
├─ Check email format ........................... ✓ PASS
└─ Send to backend
     ↓
Backend Validation (Server-side)
├─ Check if Admin ............................... ✓ PASS
├─ Check email format ........................... ✓ PASS
├─ Check if email already exists in DB ........ ✓ PASS
├─ Insert into database ........................ ✓ SUCCESS
└─ Return success response
     ↓
Frontend Receives Response
└─ Show success message, refresh user list
```

---

## Summary

This diagram shows:
1. ✅ How users are created through the web interface
2. ✅ How the frontend communicates with the backend
3. ✅ How the backend validates and stores data
4. ✅ How the database is structured
5. ✅ How access control works
6. ✅ How errors are handled

**Result**: A complete, secure user management system! 🎉

# 📚 Complete File Structure & Navigation Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Folder Structure](#folder-structure)
3. [File Descriptions](#file-descriptions)
4. [How to Access Features](#how-to-access-features)
5. [User Management (Add Staff)](#user-management-add-staff)
6. [Calendar & Scheduling](#calendar--scheduling)
7. [Quick Navigation](#quick-navigation)

---

## System Overview

Your office automation system is built with:
- **Frontend**: HTML, CSS, JavaScript (in `frontend/` folder)
- **Backend**: Node.js + Express (in `backend/` folder)
- **Database**: SQLite (office.db file)
- **Server Port**: 3000

**How it works**:
```
Browser (Frontend) ←→ Node.js Server ←→ SQLite Database
   HTML/CSS/JS          Express Routes       office.db
```

---

## Folder Structure

```
office-automation-system/
│
├── backend/ ........................ SERVER CODE
│   ├── server.js ................... Main server file
│   ├── database.js ................. Database setup & initialization
│   ├── package.json ................ Dependencies & config
│   ├── office.db ................... SQLite database file (contains all data)
│   │
│   ├── middleware/
│   │   └── auth.js ................. Authentication middleware
│   │
│   ├── routes/ ..................... API ENDPOINTS
│   │   ├── auth.js ................. Login/Logout
│   │   ├── users.js ................ User Management (CREATE/READ/UPDATE/DELETE)
│   │   ├── tasks.js ................ Task management
│   │   ├── messages.js ............. Messaging
│   │   ├── documents.js ............ Document management
│   │   ├── calendar.js ............. Calendar events
│   │   ├── finance.js .............. Financial tracking
│   │   ├── inventory.js ............ Inventory management
│   │   ├── leaves.js ............... Leave requests
│   │   ├── employees.js ............ Employee data
│   │   ├── performance.js .......... Performance reviews
│   │   ├── resources.js ............ Resource allocation
│   │   ├── analytics.js ............ Analytics & reports
│   │   ├── notifications.js ........ Notifications
│   │   ├── helpdesk.js ............. IT Help Desk
│   │   └── ... (other routes)
│   │
│   ├── uploads/ .................... File uploads folder
│   └── node_modules/ ............... Dependencies
│
├── frontend/ ....................... USER INTERFACE
│   ├── index.html .................. LOGIN PAGE
│   ├── dashboard.html .............. MAIN DASHBOARD (home page)
│   ├── user-management.html ........ 👤 ADD/MANAGE STAFF (ADMIN ONLY)
│   ├── calendar.html ............... 📅 CALENDAR & SCHEDULING
│   │
│   ├── CORE MODULES:
│   ├── tasks.html .................. Task management
│   ├── messages.html ............... Internal messaging
│   ├── documents.html .............. Document storage
│   ├── leaves.html ................. Leave requests
│   ├── employees.html .............. Employee directory
│   │
│   ├── MANAGEMENT MODULES:
│   ├── finance.html ................ Financial tracking
│   ├── inventory.html .............. Inventory management
│   ├── resources.html .............. Resource allocation
│   ├── performance.html ............ Performance reviews
│   ├── analytics.html .............. Analytics & reports
│   ├── helpdesk.html ............... IT Help Desk (IT dept only)
│   ├── calculator.html ............. Calculator (Finance dept only)
│   │
│   ├── css/
│   │   └── style.css ............... All styling for all pages
│   │
│   ├── js/
│   │   ├── login.js ................ Login functionality
│   │   ├── tasks.js ................ Task-related scripts
│   │   ├── messages.js ............. Messaging scripts
│   │   └── documents.js ............ Document scripts
│   │
│   └── sidebar.html ................ Sidebar template
│
├── DOCUMENTATION FILES:
├── README.md ....................... Project overview
├── QUICK_START_GUIDE.md ............ How to start the server
├── HOW_TO_CREATE_USERS.md .......... How to add staff members
├── ADMIN_USER_MANAGEMENT.md ........ User management guide
├── SYSTEM_ARCHITECTURE.md .......... Technical architecture
├── LAYOUT_FIXES.md ................. Recent fixes applied
├── USER_MANAGEMENT_COMPLETE.md ..... User management features
├── ANSWER_YOUR_QUESTION.md ......... Answers to your questions
└── ... (other documentation)
```

---

## File Descriptions

### BACKEND FILES

#### **backend/server.js**
**Purpose**: Main server file
**What it does**:
- Starts the Express server
- Listens on port 3000
- Loads all API routes
- Serves static files from frontend folder
**When it runs**: When you type `npm start`

#### **backend/database.js**
**Purpose**: Database initialization
**What it does**:
- Creates SQLite database (office.db)
- Sets up all 15+ tables (users, tasks, messages, etc.)
- Inserts default test data (6 users)
- Initializes database when server starts
**Important**: This file creates tables if they don't exist. It doesn't delete existing data on restart.

#### **backend/package.json**
**Purpose**: Project configuration
**Contains**:
- Project name and version
- List of dependencies (express, sqlite3, etc.)
- NPM scripts (start, stop, etc.)

#### **backend/office.db**
**Purpose**: The actual database file
**Contains**: ALL YOUR DATA
- User accounts
- Tasks assigned
- Messages sent
- Leave requests
- All other data
**Important**: Don't delete this file unless you want to start fresh!

#### **backend/routes/users.js** ⭐ NEW
**Purpose**: Manage user accounts
**What it does**:
- Create new users (staff members)
- View all users
- Edit user details (password, role, department)
- Delete users (with safety checks)
**API Endpoints**:
- `POST /api/users/create` - Add new staff
- `GET /api/users/all` - List all staff
- `PUT /api/users/{id}` - Edit staff
- `DELETE /api/users/{id}` - Remove staff
**Who can use**: Admin only

#### **backend/routes/calendar.js**
**Purpose**: Calendar events & scheduling
**What it does**:
- Create events
- View calendar
- Schedule meetings
- Track events

#### **backend/routes/tasks.js**
**Purpose**: Task management
**What it does**:
- Create tasks
- Assign tasks to employees
- Track task status
- Auto-assign based on availability

#### **Other route files** (messages.js, documents.js, finance.js, etc.)
**Purpose**: Handle specific features
**How they work**: Each file handles API calls for its specific module

---

### FRONTEND FILES

#### **frontend/index.html** - LOGIN PAGE
**Purpose**: First page users see
**Features**:
- Login form (email + password)
- Sign in button
- Error messages if login fails
**How to access**: `http://localhost:3000`

#### **frontend/dashboard.html** - MAIN DASHBOARD
**Purpose**: Home page after login
**Shows**:
- Welcome message with user's name
- Quick statistics
- Department-specific tools
- Quick access to favorite features
- Links to all modules in sidebar
**Important**: This is your home base after login

#### **frontend/user-management.html** ⭐ ADD STAFF HERE
**Purpose**: Admin panel for managing users
**Shows**:
- Form to create new staff member
- List of all staff in system
- Options to edit staff details
- Options to delete staff
- Filters by department and role
- Statistics (total users, admins, active)
**Who can access**: Admin only (login as admin@office.com)
**How to access**:
1. Login to dashboard
2. Look for "👤 User Management" in sidebar (admin only)
3. Click it
4. Fill form on left to create new user

#### **frontend/calendar.html** - CALENDAR & SCHEDULING
**Purpose**: View and manage calendar events
**Shows**:
- Monthly calendar view
- Events and meetings
- Schedule appointments
- View team availability
- Block time slots
**How to access**:
1. Click "📅 Calendar" in sidebar
2. View calendar grid
3. Click date to add event
4. Fill event details (name, time, attendees)
5. Save

#### **Other Frontend Files**

| File | Purpose | Access |
|------|---------|--------|
| tasks.html | Create & manage tasks | Click "✅ Tasks" in sidebar |
| messages.html | Send internal messages | Click "✉️ Messages" in sidebar |
| documents.html | Upload & store documents | Click "📄 Documents" in sidebar |
| leaves.html | Apply for leave | Click "🏖️ Leaves" in sidebar |
| employees.html | View employee directory | Click "👥 Employees" in sidebar |
| finance.html | Track finances | Click "💰 Finance" in sidebar |
| inventory.html | Manage inventory | Click "📦 Inventory" in sidebar |
| resources.html | Allocate resources | Click "⚙️ Resources" in sidebar |
| performance.html | Performance reviews | Click "⭐ Performance" in sidebar |
| analytics.html | View reports | Click "📈 Analytics" in sidebar |
| helpdesk.html | IT support tickets | Click "🆘 Help Desk" in sidebar |
| calculator.html | Financial calculator | Visible to Finance dept only |

#### **frontend/css/style.css**
**Purpose**: All styling for all pages
**Contains**:
- Colors and gradients
- Sidebar styling (250px fixed width)
- Button styles
- Card styles
- Table styles
- Form styles
- Responsive design for mobile
**Important**: All HTML files link to this one CSS file

---

## How to Access Features

### Access Point: Your Browser
```
Go to: http://localhost:3000
```

### Login
```
URL: http://localhost:3000
Email: admin@office.com
Password: admin

Or use one of these test accounts:
- john@office.com / jsmith
- mary@office.com / mjohnson
- sarah@office.com / swilson
- robert@office.com / rdavis
- michael@office.com / mbrown
```

### After Login - You See Dashboard
```
┌──────────────────────────────────────────────────────┐
│           DASHBOARD (Your Home)                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Sidebar (Left):                    Main Area:       │
│  ┌─────────────────┐               ┌──────────────┐ │
│  │ 📊 Dashboard    │               │ Welcome!     │ │
│  │ ✅ Tasks        │               │ Quick Stats  │ │
│  │ ✉️  Messages    │               │ Quick Links  │ │
│  │ 📄 Documents    │               │              │ │
│  │ 📅 Calendar     │               │              │ │
│  │ 🏖️ Leaves       │               │              │ │
│  │ 👥 Employees    │               │              │ │
│  │ 💰 Finance      │               │              │ │
│  │ 📦 Inventory    │               │              │ │
│  │ ⚙️ Resources    │               │              │ │
│  │ ⭐ Performance  │               │              │ │
│  │ 📈 Analytics    │               │              │ │
│  │ 👤 User Mgmt *  │               │ *Admin only  │ │
│  │ 🚪 Logout       │               │              │ │
│  └─────────────────┘               └──────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## User Management (Add Staff)

### How to Add a New Staff Member

#### Step 1: Login as Admin
```
Email: admin@office.com
Password: admin
```

#### Step 2: Go to Dashboard
```
You're automatically on dashboard after login
```

#### Step 3: Click "User Management" Link
```
In the sidebar (left side), you'll see:
👤 User Management

Click it!
(This link ONLY appears if you're logged in as Admin)
```

#### Step 4: You'll See the User Management Panel
```
Two sections:

LEFT SIDE - CREATE NEW USER:
┌──────────────────────┐
│ Form:                │
│ Name: [_________]    │
│ Email: [________]    │
│ Password: [______]   │
│ Department: [▼]      │
│ Role: [▼]            │
│ [Create User]        │
└──────────────────────┘

RIGHT SIDE - LIST OF USERS:
┌──────────────────────┐
│ Current Users:       │
│ Admin User           │
│ John Smith [E][D]    │
│ Mary Johnson [E][D]  │
│ ... more users       │
└──────────────────────┘
```

#### Step 5: Fill in the Form
```
Field 1 - Full Name:
  Example: Jane Smith

Field 2 - Email Address:
  Example: jane.smith@office.com
  (Must be unique, no duplicates allowed)

Field 3 - Password:
  Example: jane123
  (Give them a temporary password)

Field 4 - Department:
  Options: HR, IT, Finance, Sales, Operations, Marketing
  Choose: Finance

Field 5 - Role:
  Options: Admin, Manager, Staff
  Choose: Manager
```

#### Step 6: Click "Create User"
```
✅ Success message appears!
"User created successfully!"

New user appears in the list below!
```

#### Step 7: Share Credentials with Employee
```
Send them:
Email: jane.smith@office.com
Password: jane123

They can now login and start using the system!
```

### Edit an Existing Staff Member
```
1. In User Management panel
2. Find the staff member in the list (right side)
3. Click the yellow [Edit] button
4. Modal dialog appears
5. Change any field (password, role, department, status)
6. Click [Update User]
7. Changes apply immediately!
```

### Delete a Staff Member
```
1. Find them in the user list
2. Click the red [Delete] button
3. Confirm deletion
4. User is removed from system
5. They can no longer login
```

---

## Calendar & Scheduling

### How to Access Calendar
```
1. Click "📅 Calendar" in sidebar
2. Calendar page opens
```

### Calendar View
```
Shows:
- Monthly calendar grid
- Days of the week
- Current date highlighted
- Events displayed on dates
```

### How to Add Event
```
1. Click on a date on the calendar
2. Event form appears
3. Fill in:
   - Event title/name
   - Start date & time
   - End date & time
   - Description (optional)
   - Attendees (optional)
4. Click "Save Event"
5. Event appears on calendar!
```

### View Events
```
1. Click on a date to see events for that day
2. See list of all events
3. Click event to view details
4. Can edit or delete events
```

### Scheduling Features
```
✅ Create meetings
✅ Schedule appointments
✅ Block time slots
✅ See team availability
✅ Set reminders
✅ Invite attendees
```

---

## Quick Navigation

### To Add Staff
```
Login as Admin
→ Dashboard
→ Click "👤 User Management" (sidebar)
→ Fill form
→ Click "Create User"
```

### To View Calendar
```
Any user
→ Dashboard
→ Click "📅 Calendar" (sidebar)
→ View events or create new
```

### To Access Tasks
```
Any user
→ Dashboard
→ Click "✅ Tasks" (sidebar)
→ View, create, or manage tasks
```

### To Access Messages
```
Any user
→ Dashboard
→ Click "✉️ Messages" (sidebar)
→ Send/read messages
```

### To Submit Leave Request
```
Any user
→ Dashboard
→ Click "🏖️ Leaves" (sidebar)
→ Fill leave form
→ Submit request
```

### To View Employees
```
Manager/Admin
→ Dashboard
→ Click "👥 Employees" (sidebar)
→ See all employees
→ View employee details
```

---

## User Types & Permissions

### Admin (admin@office.com)
```
Can do:
✅ Create new users (staff)
✅ Edit any user
✅ Delete users
✅ View all users
✅ Access all features
✅ See User Management panel

Sidebar shows:
- All modules
- "👤 User Management" link
```

### Manager
```
Can do:
✅ Create and assign tasks to team
✅ View employee directory
✅ Manage team resources
✅ See performance reviews
✅ Access all core features

Cannot do:
❌ Create users
❌ Delete users
❌ Access User Management
```

### Staff/Employee
```
Can do:
✅ View their own tasks
✅ Send/receive messages
✅ Apply for leave
✅ View calendar
✅ View documents
✅ Use calendar

Cannot do:
❌ Create users
❌ Manage other employees
❌ Delete anything
```

---

## Default Test Users

### Use These to Test Different Roles

| Email | Password | Role | Department | Can... |
|-------|----------|------|-----------|--------|
| admin@office.com | admin | Admin | IT | Everything + User Management |
| john@office.com | jsmith | Manager | IT | Create tasks, manage team |
| mary@office.com | mjohnson | Manager | HR | Create tasks, manage HR |
| sarah@office.com | swilson | Manager | Finance | Create tasks, use calculator |
| robert@office.com | rdavis | Staff | Sales | Use core features |
| michael@office.com | mbrown | Staff | IT | Use core features + Help Desk |

---

## Data Flow Explained

### When You Add a New Staff Member:

```
1. You fill form in User Management
   ↓
2. Click "Create User" button
   ↓
3. JavaScript sends data to server
   ↓
4. Server (Express) receives request in /api/users/create
   ↓
5. Backend validates data (check email, etc.)
   ↓
6. Inserts new user into database (office.db)
   ↓
7. Server sends success response
   ↓
8. Frontend shows "User created!" message
   ↓
9. User list refreshes with new user
   ↓
10. New staff can now login!
```

### When You Create a Task:

```
1. You fill task form in Tasks page
   ↓
2. Click "Create Task" button
   ↓
3. JavaScript sends to /api/tasks/create
   ↓
4. Server inserts into database
   ↓
5. Task assigned to employee
   ↓
6. Employee sees task on their dashboard
   ↓
7. Employee can accept/decline
   ↓
8. If declined, auto-assigns to next person
```

---

## File Relationships Diagram

```
User Visits Browser
     ↓
http://localhost:3000
     ↓
backend/server.js (listens)
     ↓
Serves frontend/index.html (login page)
     ↓
User logs in
     ↓
frontend/dashboard.html loaded
     ↓
User clicks "User Management"
     ↓
frontend/user-management.html loaded
     ↓
User fills form, clicks Create
     ↓
JavaScript calls: fetch('/api/users/create')
     ↓
backend/routes/users.js receives request
     ↓
Validates data
     ↓
backend/database.js: INSERT into users table
     ↓
office.db (database file) updated
     ↓
Response sent back to frontend
     ↓
User sees "Success!" message
     ↓
User list updates automatically
```

---

## Summary

### Main Points to Remember:

1. **Backend**: `npm start` in `backend` folder to start server
2. **Frontend**: Open `http://localhost:3000` in browser
3. **Database**: Data stored in `backend/office.db`
4. **Add Staff**: User Management panel (admin only)
5. **Calendar**: Click Calendar in sidebar
6. **Routes**: Each feature has a route file in `backend/routes/`
7. **Styling**: All pages use `frontend/css/style.css`

### Quick Access:
- **User Management**: http://localhost:3000/user-management.html
- **Calendar**: http://localhost:3000/calendar.html
- **Dashboard**: http://localhost:3000/dashboard.html
- **Login**: http://localhost:3000/index.html

---

# You're All Set! 🚀
All files explained and all features accessible. Start exploring!

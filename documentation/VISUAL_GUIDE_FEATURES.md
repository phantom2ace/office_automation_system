# 🎯 Quick Visual Guide - Add Staff & Calendar

## PROBLEM: Can't See Where to Add Staff

### SOLUTION: User Management Panel

#### Step-by-Step Visual Guide

### Step 1️⃣: Go to Homepage
```
Open your browser and type:
http://localhost:3000

You see the LOGIN PAGE:
┌─────────────────────────────┐
│   Office Automation System  │
│                             │
│   📧 Email: [___________]  │
│   🔑 Password: [_______]   │
│                             │
│      [Sign In Button]       │
└─────────────────────────────┘
```

### Step 2️⃣: Login as Admin
```
Email:    admin@office.com
Password: admin

Click "Sign In"
```

### Step 3️⃣: See Dashboard
```
You're now on the DASHBOARD:

┌─────────────────────────────────────────────┐
│ Welcome, Admin User! 👋                     │
│ Department: IT | Role: Admin                │
├─────────────────────────────────────────────┤
│                                             │
│ SIDEBAR (Left)      │    MAIN CONTENT       │
│ ═════════════════   │    (Right)            │
│                     │                       │
│ 📊 Dashboard        │  Welcome card         │
│ ✅ Tasks            │  Quick stats          │
│ ✉️  Messages        │  Department tools     │
│ 📄 Documents        │                       │
│ 📅 Calendar         │                       │
│ 🏖️ Leaves           │                       │
│ 👥 Employees        │                       │
│ 💰 Finance          │                       │
│ 📦 Inventory        │                       │
│ ⚙️ Resources        │                       │
│ ⭐ Performance      │                       │
│ 📈 Analytics        │                       │
│                     │                       │
│ 👤 User Management  │  ⬅️ THIS APPEARS     │
│    (Admin only)     │     ONLY FOR ADMINS  │
│                     │                       │
│ 🚪 Logout           │                       │
│                     │                       │
└─────────────────────────────────────────────┘
```

### Step 4️⃣: Click "User Management" Link
```
In the sidebar, look for:

👤 User Management

⬇️ CLICK IT
```

### Step 5️⃣: See User Management Panel
```
You're now in User Management Panel:

┌──────────────────────────────────────────────────┐
│        👤 User Management                        │
│     Create, update, and manage users             │
├──────────────────────────────────────────────────┤
│                                                  │
│  📊 STATISTICS AT TOP:                           │
│  ┌─────────────┬──────────┬─────────────┐       │
│  │Total: 6     │Admins: 1 │Active: 6    │       │
│  └─────────────┴──────────┴─────────────┘       │
│                                                  │
│  LEFT SIDE                │  RIGHT SIDE         │
│  ═══════════════════      │  ═════════════      │
│                           │                     │
│  ➕ CREATE NEW USER       │  👥 SYSTEM USERS    │
│  ────────────────         │  ───────────────    │
│                           │                     │
│  Full Name:               │  Filters:           │
│  [________________]       │  Dept: [▼] All      │
│                           │  Role: [▼] All     │
│  Email:                   │                     │
│  [________________]       │  Current Users:     │
│                           │  ┌─────────────┐   │
│  Password:                │  │ Admin User  │   │
│  [________________]       │  │ IT, Admin   │   │
│                           │  │ [E] [D]     │   │
│  Department:              │  │             │   │
│  [Select ▼]               │  │ John Smith  │   │
│  HR|IT|Finance|...        │  │ IT, Manager │   │
│                           │  │ [E] [D]     │   │
│  Role:                    │  │             │   │
│  [Select ▼]               │  │ Mary John   │   │
│  Admin|Manager|Staff      │  │ HR, Manager │   │
│                           │  │ [E] [D]     │   │
│  [Create User Button]     │  │             │   │
│                           │  │ ... more    │   │
│                           │  └─────────────┘   │
│                           │                     │
└──────────────────────────────────────────────────┘
```

### Step 6️⃣: Fill the Form to Add New Staff

```
EXAMPLE: Adding a Finance Manager named Jane Smith

╔════════════════════════════════════╗
║  ➕ CREATE NEW USER                ║
╠════════════════════════════════════╣
║                                    ║
║  Full Name:                        ║
║  [Jane Smith____________]          ║
║                                    ║
║  Email Address:                    ║
║  [jane.smith@office.com___]        ║
║                                    ║
║  Password:                         ║
║  [jane123______________]           ║
║                                    ║
║  Department:                       ║
║  [▼ Finance ◀── SELECT THIS]       ║
║   HR                               ║
║   IT                               ║
║   Finance ◀── CLICK THIS           ║
║   Sales                            ║
║   Operations                       ║
║   Marketing                        ║
║                                    ║
║  Role:                             ║
║  [▼ Manager ◀── SELECT THIS]       ║
║   Admin                            ║
║   Manager ◀── CLICK THIS           ║
║   Staff                            ║
║                                    ║
║  ┌──────────────────────────────┐  ║
║  │  [Create User Button]        │  ║
║  └──────────────────────────────┘  ║
║                                    ║
╚════════════════════════════════════╝
```

### Step 7️⃣: Click "Create User"
```
✅ Success Message Appears:

┌──────────────────────────┐
│ ✅ User created success- │
│    fully!                │
└──────────────────────────┘

Jane Smith now appears in 
the users list on the right!
```

### Step 8️⃣: Share Credentials with Employee
```
Send to Jane Smith:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: jane.smith@office.com
🔑 Password: jane123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

She can now login and use the system!
```

---

## CALENDAR & SCHEDULING

### How to Access Calendar

#### Step 1️⃣: From Dashboard
```
In the sidebar, click:
📅 Calendar
```

#### Step 2️⃣: Calendar Page Opens
```
You see:

┌────────────────────────────────────┐
│      📅 January 2026               │
├────────────────────────────────────┤
│                                    │
│  SUN  MON  TUE  WED  THU  FRI  SAT │
│                       1    2    3  │
│   4    5    6    7    8    9   10  │
│  11   12   13   14   15   16   17  │
│  18   19   20   21   22   23   24  │
│  25   26   27   28   29   30   31  │
│                                    │
│  Today: January 16, 2026           │
│                                    │
│  Upcoming Events:                  │
│  • Team Meeting - Jan 20           │
│  • Review Session - Jan 22         │
│  • Training - Jan 25               │
│                                    │
└────────────────────────────────────┘
```

### How to Add Event on Calendar

#### Method 1: Click a Date
```
1. Click on any date on calendar
   Example: Click "20" (January 20)

2. Event creation form appears:
   ┌────────────────────────────┐
   │ Create Event               │
   ├────────────────────────────┤
   │ Event Name:                │
   │ [________________]         │
   │                            │
   │ Date:                      │
   │ [January 20, 2026]         │
   │                            │
   │ Start Time:                │
   │ [10:00 AM]                 │
   │                            │
   │ End Time:                  │
   │ [11:00 AM]                 │
   │                            │
   │ Description:               │
   │ [_________________]        │
   │ [_________________]        │
   │                            │
   │ Attendees:                 │
   │ [+ Add Attendee]           │
   │                            │
   │ [Create Event] [Cancel]    │
   │                            │
   └────────────────────────────┘

3. Fill in event details:
   - Name: Team Meeting
   - Time: 10:00 AM - 11:00 AM
   - Description: Discuss Q1 plans
   - Add team members if needed

4. Click "Create Event"

5. Event appears on calendar!
```

#### Method 2: View Event Details
```
1. Click on an existing event
2. Details popup appears:
   ┌──────────────────────────┐
   │ Team Meeting             │
   │ January 20, 10:00-11:00  │
   │                          │
   │ Description:             │
   │ Discuss Q1 plans         │
   │                          │
   │ Attendees:               │
   │ • Admin User             │
   │ • John Smith             │
   │ • Mary Johnson           │
   │                          │
   │ [Edit] [Delete] [Close]  │
   │                          │
   └──────────────────────────┘

3. Options:
   - Edit: Change details
   - Delete: Remove event
   - Close: Go back
```

### Calendar Features Available

```
✅ View monthly calendar
✅ Create events
✅ Schedule meetings
✅ Set reminders
✅ Invite attendees
✅ Block time slots
✅ Track team availability
✅ Add descriptions
✅ Edit events
✅ Delete events
✅ View event details
✅ Change calendar view (month/week/day)
```

---

## WHERE TO FIND THINGS

### To Add New Staff Member
```
Dashboard 
  → Click "👤 User Management" (sidebar)
  → Fill form on left
  → Click "Create User"
```

### To View Calendar
```
Dashboard
  → Click "📅 Calendar" (sidebar)
  → View events or create new
```

### To Manage Tasks
```
Dashboard
  → Click "✅ Tasks" (sidebar)
  → Create, view, or assign tasks
```

### To Send Messages
```
Dashboard
  → Click "✉️ Messages" (sidebar)
  → Send internal messages
```

### To Apply for Leave
```
Dashboard
  → Click "🏖️ Leaves" (sidebar)
  → Fill leave request form
```

### To View Employees
```
Dashboard
  → Click "👥 Employees" (sidebar)
  → See all employees in system
```

### To Track Finance
```
Dashboard
  → Click "💰 Finance" (sidebar)
  → Track expenses and transactions
```

---

## Important Notes

### User Management (Add Staff)
```
✅ Only ADMIN can see "User Management" link
✅ Only ADMIN can create users
❌ Managers CANNOT see this feature
❌ Staff CANNOT see this feature

To add staff, you MUST login as:
Email: admin@office.com
Password: admin
```

### Calendar
```
✅ All users can view calendar
✅ All users can create events
✅ All users can schedule
✅ Managers can see team calendar
✅ Admin can see all calendars
```

### When You Create a User
```
The new user:
✅ Can login immediately with given email/password
✅ Sees personalized dashboard
✅ Can use all features for their role
✅ Sees department-specific tools
✅ Can change their own password after first login
```

---

# You Now Know Everything! 🎉

### Remember:
1. **Add Staff**: User Management panel (admin only)
2. **Calendar**: Click Calendar in sidebar (everyone)
3. **Other Features**: Click appropriate link in sidebar
4. **Admin Features**: Only visible when logged in as Admin

Ready to proceed? 🚀

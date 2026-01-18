# Office Automation System - Personalization & Department-Specific Features

## Overview
The system has been enhanced with **role-based personalization** and **department-specific modules**. Admins oversee everything, while other users see only role/department-relevant content.

---

## 🎯 Key Features Implemented

### 1. **Role-Based Personalization**
- **Admin Users**: See all modules and can oversee all activities
- **Department Managers/Staff**: See only their department-specific tools and features
- **Dashboard**: Personalized welcome and quick-access department tools

### 2. **Department-Specific Modules**

#### 💰 **Finance Department**
- **Finance Calculator** (`calculator.html`)
  - Basic arithmetic calculator
  - GST Calculator (5%, 12%, 18%, 28%)
  - Discount Calculator
  - Profit/Loss Calculator
  - Percentage Change Calculator
- **Finance Module** (`finance.html`)
  - Expense tracking and reporting
  - Budget management

#### 🆘 **IT Department**
- **Help Desk Service** (`helpdesk.html`)
  - **For IT Managers**: 
    - View all support tickets
    - Assign tickets to IT staff
    - Track ticket status
    - Add resolution notes
    - Monitor ticket statistics
  - **For Regular Users**:
    - Submit IT support tickets
    - Track ticket status
    - View ticket history
  - **Ticket Categories**: Hardware, Software, Network, Email/Account, Printer, VPN, Other
  - **Priority Levels**: Low, Medium, High, Urgent
  - **Ticket Statuses**: Open, In Progress, Closed
  - Auto-generated ticket numbers (TKT-TIMESTAMP)

#### 👥 **HR Department**
- Employee Management (`employees.html`)
- Leave Management (`leaves.html`)
- Performance Reviews (`performance.html`)

#### 📊 **Sales Department**
- Analytics (`analytics.html`)
- Performance Tracking (`performance.html`)

---

## 🗄️ Database Changes

### New Table: `helpdesk_tickets`
```sql
CREATE TABLE helpdesk_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticketNumber TEXT UNIQUE,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  assignedTo INTEGER,
  resolutionNotes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT,
  closedAt TEXT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (assignedTo) REFERENCES users(id)
)
```

---

## 📡 Backend API Routes

### Help Desk Endpoints (`/api/helpdesk`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/tickets/create` | Staff | Create new support ticket |
| GET | `/tickets/:userId` | Staff | Get user's own tickets |
| GET | `/tickets` | Manager (IT) | Get all tickets (IT only) |
| PUT | `/tickets/:ticketId/assign` | Manager (IT) | Assign ticket to staff |
| PUT | `/tickets/:ticketId/resolve` | Manager/Admin (IT) | Resolve ticket |
| GET | `/stats` | Manager (IT) | Get help desk statistics |

---

## 🎨 Frontend Files Added/Modified

### New Pages
- **`helpdesk.html`** - IT Help Desk (dual view for IT staff and users)
- **`calculator.html`** - Finance Calculator with financial tools

### Modified Pages
- **`dashboard.html`** - Added personalized department tools panel
- **`server.js`** - Added helpdesk route registration

---

## 🔐 Access Control

### IT Help Desk
- **Managers/Admins**: Can view all tickets, assign to staff, resolve issues
- **Staff**: Can submit tickets and view their own
- **Others**: Cannot access

### Finance Calculator
- **Finance Department**: Full access
- **Others**: Can view but primarily designed for Finance

---

## 📊 Dashboard Personalization

The dashboard now shows department-specific quick-access buttons:

**Finance Employees**:
- 🧮 Finance Calculator
- 💰 Expense Tracking

**IT Employees**:
- 🆘 Help Desk
- 🖥️ Resources

**HR Employees**:
- 👥 Employee Management
- 🏖️ Leave Management

**Sales Employees**:
- 📊 Analytics
- ⭐ Performance

---

## 🚀 How to Use

### For Users - Submit IT Support Ticket
1. Navigate to Help Desk page
2. Fill in ticket details (title, description, category, priority)
3. Click "Submit Ticket"
4. Track ticket status in "My Support Tickets"

### For IT Managers - Manage Tickets
1. Navigate to Help Desk page
2. View all tickets in the overview
3. Assign tickets to team members
4. Add resolution notes
5. Change status (Open → In Progress → Closed)

### For Finance Users - Use Calculator
1. Navigate to Calculator page
2. Use basic calculator or specialized financial tools
3. Calculate GST, discounts, profit/loss, percentage changes

---

## 🔄 Workflow Examples

### Help Desk Workflow
1. **Employee** submits ticket → Ticket #TKT-1705449600000 created
2. **IT Manager** reviews ticket
3. **IT Manager** assigns to IT staff member
4. **IT Staff** works on issue
5. **IT Staff** marks as "In Progress"
6. **IT Staff** adds resolution notes
7. **IT Staff** closes ticket
8. **Employee** sees ticket closed with resolution

### Finance Workflow
1. Finance employee opens Calculator
2. Uses GST calculator: Amount ₹1000, Rate 18%
3. System calculates: GST ₹180, Total ₹1180
4. Uses Discount calculator: Price ₹5000, Discount 10%
5. System calculates: Save ₹500, Pay ₹4500

---

## 🎯 Future Enhancements

- SMS/Email notifications for ticket updates
- Ticket priority queue optimization
- SLA tracking for tickets
- Customer satisfaction ratings
- Multi-language support
- Mobile app for help desk
- AI-powered ticket categorization
- Knowledge base for self-service support
- Advanced financial reports and dashboards

---

## 🔑 Test Credentials

Use these to test department-specific features:

**IT Manager** (Help Desk Manager):
- Email: john@office.com
- Password: 1234
- Department: IT, Role: Manager

**Finance Manager** (Calculator Access):
- Email: sarah@office.com
- Password: 1234
- Department: Finance, Role: Manager

**Regular Staff** (Help Desk User):
- Email: michael@office.com
- Password: 1234
- Department: IT, Role: Staff

---

## 📝 Notes

- Admin users can see everything across all departments
- Each department has specialized tools suited to their needs
- Help Desk is department-specific (only for IT)
- Calculator is department-specific (only for Finance)
- Dashboard adapts based on user's department
- All changes are logged in the system
- Support tickets maintain audit trail

---

Generated: January 16, 2026
System: Office Automation with Department-Specific Personalization

# ADMIN QUICK REFERENCE - Enterprise Features

## 🚀 First-Time Setup (5 Steps)

### 1. Email Configuration (2 minutes)
```
Sidebar → 📧 Email Configuration
├─ SMTP Host: smtp.gmail.com
├─ SMTP Port: 587
├─ Email Address: your-email@gmail.com
├─ Password: your-app-password
└─ Click "Save Configuration" → Test Email
```

### 2. Create Workflow Rules (5 minutes)
```
Sidebar → ⚙️ Automation
├─ Click "➕ New Rule"
├─ Name: "Escalate Overdue Tasks"
├─ When: Task becomes overdue
├─ Then: Escalate to manager
└─ Click "💾 Save Rule"
```

### 3. Process First Payroll (5 minutes)
```
Sidebar → 💳 Payroll
├─ Employee selects own salary config
├─ Admin goes to "Process Payroll" section
├─ Select employee
├─ Select month
├─ Click "📊 Calculate Payroll"
└─ Payroll record created
```

### 4. Enable Document Versioning (0 minutes)
```
Already enabled in Documents
├─ Click document
├─ Upload New Version
├─ Add comments explaining changes
└─ Version history auto-tracked
```

### 5. Train Users
- Send them this guide
- Show demo of each feature
- Answer questions

---

## 📧 Email Configuration Checklist

### Gmail Setup (Most Common)
- [ ] Enable 2-Factor Authentication
- [ ] Generate App Password (not your regular password)
- [ ] SMTP Host: `smtp.gmail.com`
- [ ] SMTP Port: `587`
- [ ] Email: `your-email@gmail.com`
- [ ] Password: `your-app-password` (16 characters)
- [ ] Click "Test Email"

### Office 365 Setup
- [ ] SMTP Host: `smtp.office365.com`
- [ ] SMTP Port: `587`
- [ ] Email: `your-email@company.com`
- [ ] Password: Your Office 365 password
- [ ] Click "Test Email"

### SendGrid Setup
- [ ] SMTP Host: `smtp.sendgrid.net`
- [ ] SMTP Port: `587`
- [ ] Email: `apikey`
- [ ] Password: Your SendGrid API key
- [ ] Click "Test Email"

### After Setup
- [ ] Check "Send task notifications"
- [ ] Check "Send ticket updates"
- [ ] Check "Send leave notifications"
- [ ] Check "Send approval notifications"
- [ ] Click "Save Configuration"

---

## ⚙️ Automation Rules Reference

### Pre-Built Rule Templates

#### 1. Escalate Overdue Tasks
```
When: Task becomes overdue
Then: Escalate to manager
Why: Managers stay updated on delayed work
```

#### 2. Auto-Acknowledge Support Tickets
```
When: Help desk ticket created
Then: Send email to requester
Why: Users know their ticket was received
```

#### 3. Manager Approval Notifications
```
When: Approval request pending
Then: Send email to manager
Why: Managers don't miss important approvals
```

#### 4. Leave Request Assignment
```
When: Leave request submitted
Then: Create task for manager
Why: Manager has visible task to handle
```

#### 5. Task Assignment Reminder
```
When: Task assigned to user
Then: Send email to assignee
Why: Assignee gets immediate notification
```

### Custom Rule Creation Steps
1. Go to **⚙️ Automation**
2. Click **➕ New Rule**
3. Enter **Rule Name** (descriptive)
4. Enter **Description** (why this rule exists)
5. Select **Trigger** (when rule starts):
   - task_assigned
   - task_overdue
   - task_completed
   - ticket_created
   - approval_pending
   - leave_request
6. Select **Action** (what happens):
   - send_email
   - assign_task
   - escalate
   - update_status
   - create_reminder
7. Check **Active** checkbox
8. Click **💾 Save Rule**
9. View logs to verify execution

### Monitoring Automations
- Check "Recent Automation Executions" table
- Look for **Status**: "Completed" ✅ or "Failed" ❌
- See **Details** for error messages
- Adjust rules if frequently failing

---

## 💳 Payroll Management Workflow

### Step 1: Employee Configures Salary (One Time)
Employee goes to **💳 Payroll**:
```
Salary Configuration Section:
├─ Base Salary: ₹50,000
├─ Monthly Allowances: ₹5,000
├─ Monthly Deductions: ₹1,000
├─ Tax Percentage: 10
├─ Bank Account: 123456789
└─ Click "Save Configuration"
```

### Step 2: Employee Tracks Attendance (Daily)
```
Daily when arriving: Click ✓ Check In
Daily when leaving: Click ✗ Check Out
System auto-calculates hours worked
```

### Step 3: Admin Processes Payroll (Monthly)
Go to **💳 Payroll** → **Process Payroll** section:
```
1. Select Employee: [Dropdown]
2. Select Month: [Date picker]
3. Click "📊 Calculate Payroll"
4. System shows:
   ├─ Base Salary: ₹50,000
   ├─ Allowances: ₹5,000
   ├─ Gross: ₹55,000
   ├─ Tax (10%): ₹5,500
   ├─ Deductions: ₹1,000
   └─ NET SALARY: ₹48,500
5. Status changes to "Processed"
6. Record saved in history
```

### Step 4: View Payroll History
```
Payroll History Table shows:
├─ Month
├─ Base Salary
├─ Gross Salary
├─ Tax
├─ Deductions
├─ Net Salary
└─ Status (Draft/Processed)
```

### Payroll Calculation Formula
```
Gross Salary = Base Salary + Allowances
Tax = (Gross Salary × Tax %) / 100
Deductions = Monthly Deductions
NET = Gross Salary - Tax - Deductions
```

### Tips
- Always verify salary config before processing
- Keep attendance records updated
- Process payroll before payment day
- Archive processed records for audit trail
- Don't delete old payroll records

---

## 📄 Document Version Control Features

### How Version Tracking Works
```
User uploads document → v1 created
User uploads updated file → v2 created
User uploads again → v3 created
... unlimited versions kept
```

### How to Use

#### Upload New Version
```
Documents page → Select document → Upload New Version
├─ Select file
├─ Add comments: "Added charts, fixed typos"
└─ Upload
```

#### View Version History
```
Documents page → Select document → Version History
Shows:
├─ v3 (Latest) - uploaded by John, 2 hours ago
├─ v2 - uploaded by Sarah, yesterday
└─ v1 - uploaded by Mike, last week
```

#### Revert to Old Version
```
Version History → Find desired version → Click "Revert"
├─ Old content restored
├─ Creates NEW version (v4)
├─ Preserves complete history
└─ Comment shows "Reverted to v2"
```

#### Add Comments/Discuss
```
Document → Add Comment
├─ Type feedback: "Can you clarify section 3?"
└─ All editors see your comment
```

### Compliance & Audit Trail
- Every change tracked with user & timestamp
- Never loses old versions
- Shows who changed what and when
- Perfect for regulatory compliance
- Easy to prove document history

---

## 👤 User Management (Admin Only)

### Creating New Users
```
Dashboard → 👤 User Management
├─ Click "➕ Add New User"
├─ Name: [Full Name]
├─ Email: [user@company.com]
├─ Department: [Admin/HR/Sales/etc]
├─ Role: [Admin/Manager/Staff]
├─ Password: [Auto-generated or custom]
└─ Click "Create User"
```

### User Roles & Permissions
```
Admin:
├─ Manage all users
├─ Email configuration
├─ Workflow automation
├─ Payroll for all employees
└─ System settings

Manager:
├─ View team employees
├─ Approve team leave/expenses
├─ Assign team tasks
└─ View team performance

HR:
├─ View all employees
├─ Process payroll
├─ Manage leaves
└─ Track attendance

Staff:
├─ View own profile
├─ Submit requests
├─ View own payroll
└─ Track own attendance
```

### Department Access
```
Employee Directory visible to:
├─ Admin (always)
└─ HR department (always)

NOT visible to:
├─ Managers (of other depts)
├─ Sales, Finance, IT staff
└─ All other roles
```

### Changing User Role
```
User Management → Select user → Edit → Change Role → Save
Immediately takes effect
```

### Resetting Password
```
User Management → Select user → Reset Password
├─ New temp password generated
├─ User must change on login
└─ Send reset link via email
```

---

## 🔒 Security Checklist

- [ ] Email password stored securely (never in code)
- [ ] Only admins can access configuration pages
- [ ] Employee directory restricted to Admin/HR
- [ ] Payroll data access limited by role
- [ ] Regular backups of database
- [ ] Monitor access logs for suspicious activity
- [ ] Use strong passwords (12+ characters)
- [ ] Enable 2FA for admin accounts
- [ ] Audit trail kept for compliance
- [ ] Data encrypted in transit (HTTPS)

---

## 📊 Monitoring & Troubleshooting

### Check Email Service Status
```
Email Configuration page → "Test Email" button
├─ If works: ✅ Email system functioning
├─ If fails: ❌ Check SMTP settings
└─ Read error message for details
```

### Check Automation Execution
```
⚙️ Automation page → "Recent Automation Executions" table
├─ Status: Completed ✅ or Failed ❌
├─ See which rules ran
├─ Check execution time
└─ Review error details if failed
```

### Monitor Payroll Processing
```
💳 Payroll page → Payroll History
├─ All calculations visible
├─ Status shows Draft/Processed
├─ Verify calculations are correct
└─ Check for missing employees
```

### Check System Logs (Server)
```
Terminal → npm logs
├─ See real-time server activity
├─ Catch any errors
├─ Monitor database queries
└─ Check API response times
```

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Emails not sending | Check SMTP config, test email, verify password |
| Automations not running | Enable rule, check trigger matches event, check logs |
| Payroll calculation wrong | Verify salary config saved, check tax %, verify deductions |
| Document upload fails | Check file permissions, verify storage space, try smaller file |
| User can't access page | Verify role permissions, check department, clear browser cache |
| Server won't start | Check port 3000 not in use, verify Node.js installed, check database |

---

## 📞 Support Resources

### For Email Issues
- Test SMTP connection with "Test Email" button
- Verify app password (not regular password)
- Check email address format is correct
- Ensure "Enable emails" checkbox is checked

### For Workflow Issues
- Verify rule trigger matches event you want
- Check rule is marked "Active"
- Review automation execution logs
- Test with simple rule first

### For Payroll Issues
- Verify salary configuration is saved
- Check tax percentage is realistic
- Ensure all required fields filled
- Review payroll history for patterns

### For Document Issues
- Ensure sufficient storage space
- Verify file upload completed
- Check file format is allowed
- Review version history for recoverable versions

### System Logs Location
```
Backend logs: Check terminal where server is running
Frontend logs: Open DevTools (F12) → Console
Database: Uses SQLite (local file)
Email logs: Check Email Configuration page
```

---

## 🎯 Monthly Admin Checklist

- [ ] Process all employee payroll
- [ ] Review automation rule execution logs
- [ ] Backup database
- [ ] Check for failed automations
- [ ] Verify email service still working
- [ ] Review user access logs
- [ ] Update payroll configurations if needed
- [ ] Archive old email logs
- [ ] Test disaster recovery
- [ ] Review system performance

---

## 🆘 Emergency Contacts

For production issues:
1. Check this guide first
2. Review system logs
3. Test in non-production
4. Document the issue
5. Contact system administrator

**Keep this guide handy!** Print or bookmark for quick reference.

# Deployment & Testing Guide

## Pre-Deployment Checklist

### 1. Dependencies Installation
```bash
cd backend
npm install
```

This installs all required packages including:
- ✅ `nodemailer` (6.9.7) - Email service
- ✅ `node-schedule` (2.1.1) - Task scheduling
- ✅ All existing dependencies (express, sqlite3, cors, etc.)

### 2. Environment Variables Setup

Create `.env` file in `backend` folder:
```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Office Automation
SMTP_TLS=true

# Server Configuration
PORT=3000
NODE_ENV=development
DB_PATH=./office-automation.db

# Optional: Third-Party Services
# SLACK_WEBHOOK=https://hooks.slack.com/...
# SENDGRID_API_KEY=SG.xxxx...
```

### 3. Database Verification
```bash
npm start
```

Server will auto-create tables on startup:
- ✅ `workflow_rules` - Automation triggers/actions
- ✅ `automation_logs` - Execution history
- ✅ `document_versions` - File versioning
- ✅ `document_comments` - Collaborative notes
- ✅ `payroll_config` - Salary structure
- ✅ `payroll_records` - Monthly payroll
- ✅ `attendance_records` - Check-in/out tracking

### 4. Port Availability
Ensure port 3000 is available:
```bash
# Windows - Check what's using port 3000
netstat -ano | findstr :3000

# If in use, kill the process or change PORT in .env
```

---

## Testing Guide

### Phase 1: Basic Functionality Tests

#### 1.1 Server Startup
```bash
cd backend
npm start
```
✅ Expected: Server starts, "Server is running on port 3000"
✅ Database: `office-automation.db` created
✅ Tables: All 20+ tables created automatically

#### 1.2 Login Test
1. Open `http://localhost:3000`
2. Login with default admin
   - Email: `admin@office.com`
   - Password: `admin123`
✅ Expected: Dashboard loads with sidebar

#### 1.3 Navigation Test
1. Click each sidebar link
2. Verify all pages load
3. Check "User Management" link visible (Admin only)
✅ Expected: All pages accessible by role

---

### Phase 2: Email Integration Testing

#### 2.1 Email Configuration
1. Admin → 📧 Email Configuration
2. Enter SMTP settings:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   Email: your-email@gmail.com
   Password: app-password
   Display Name: Test Company
   ```
3. Click **Save Configuration**
✅ Expected: Settings saved to localStorage

#### 2.2 Test Email
1. Click **Test Email** button
2. Enter recipient email
3. Click **Send Test Email**
✅ Expected: Email arrives in inbox within 2 minutes
❌ If fails: Check SMTP settings, password, firewall

#### 2.3 Task Assignment Email
1. Create task assigned to user
2. User should receive notification email
✅ Expected: Email with task details arrives

#### 2.4 Approval Request Email
1. Submit approval request
2. Approver should receive email
✅ Expected: Email notification sent to approver

#### 2.5 Leave Request Email
1. Submit leave request
2. Manager should receive email
✅ Expected: Manager notified via email

---

### Phase 3: Workflow Automation Testing

#### 3.1 Create Simple Rule
1. Admin → ⚙️ Automation
2. Click **➕ New Rule**
   ```
   Name: Test Overdue Escalation
   Description: Test rule for overdue tasks
   When: Task becomes overdue
   Then: Escalate
   Active: ✓ Checked
   ```
3. Click **Save Rule**
✅ Expected: Rule appears in list

#### 3.2 Test Rule Execution
1. Create task with date that's now passed
2. Task should be overdue
3. Rule should execute automatically
4. Check "Recent Automation Executions" table
✅ Expected: Rule shows as "Completed" in logs

#### 3.3 Create Complex Rule
1. Create rule:
   ```
   When: Ticket created
   Then: Send email
   ```
2. Submit help desk ticket
3. Email should be sent to assigned person
✅ Expected: Log shows completed execution

#### 3.4 Disable & Re-enable Rule
1. Click rule in list
2. Uncheck "Active"
3. Save rule
4. Trigger event - rule should NOT execute
5. Re-check "Active"
6. Trigger event - rule should execute
✅ Expected: Rule can be toggled on/off

#### 3.5 View Execution Logs
1. Go to ⚙️ Automation
2. Scroll to "Recent Automation Executions"
3. See list of executed rules
✅ Expected: Logs show timestamp, status, details

---

### Phase 4: Document Versioning Testing

#### 4.1 Upload Document
1. Documents → Create new document
2. Upload file (any format)
✅ Expected: Document appears, version 1 created

#### 4.2 Upload New Version
1. Click document
2. Click **Upload New Version**
3. Upload different file (or edited version)
4. Add comment: "Version 2 with corrections"
✅ Expected: Version 2 created, comment saved

#### 4.3 View Version History
1. Click document
2. Click **Version History**
✅ Expected: Shows v1 and v2 with metadata
- Upload date
- Who uploaded
- File size
- Comments

#### 4.4 Upload Another Version
1. Upload file again
2. Document now has v1, v2, v3
✅ Expected: Versions auto-numbered

#### 4.5 Add Document Comments
1. Click document
2. Click **Add Comment**
3. Type: "Can you add more details to section 2?"
4. Post comment
✅ Expected: Comment visible in document

#### 4.6 Revert to Previous Version
1. View **Version History**
2. Click **Revert** on v1
3. Confirm revert
✅ Expected: 
- New v4 created with v1 content
- Comment shows "Reverted to v1"
- Full history preserved

#### 4.7 Test Comment Notification
1. Add comment on document
2. Other users see comment
✅ Expected: Collaborative editing works

---

### Phase 5: Payroll System Testing

#### 5.1 Employee Salary Configuration
As Employee:
1. Sidebar → 💳 Payroll
2. Enter salary configuration:
   ```
   Base Salary: 50000
   Allowances: 5000
   Deductions: 1000
   Tax Percentage: 10
   Bank Account: 123456789
   Bank Name: ABC Bank
   ```
3. Click **Save Configuration**
✅ Expected: Configuration saved

#### 5.2 Check-In / Check-Out
1. Payroll page → Attendance section
2. Click **✓ Check In**
✅ Expected: Current time recorded as check-in

3. Later, click **✗ Check Out**
✅ Expected: 
- Check-out time recorded
- Hours worked calculated automatically
- Example: 9 AM to 5 PM = 8 hours

#### 5.3 View Attendance
1. Go to Payroll → Attendance section
✅ Expected: Today's attendance shows
- Check-in time
- Check-out time
- Hours worked

#### 5.4 Admin Process Payroll
As Admin:
1. Sidebar → 💳 Payroll
2. Go to **Process Payroll** section
3. Select employee from dropdown
4. Select month
5. Click **📊 Calculate Payroll**
✅ Expected: Payroll calculated:
```
Base Salary:        ₹50,000
Allowances:         ₹5,000
─────────────────
Gross Salary:       ₹55,000
Tax (10%):          ₹5,500
Deductions:         ₹1,000
─────────────────
NET SALARY:         ₹48,500
Status:             Processed
```

#### 5.5 Verify Payroll Record
1. Check **Payroll History** table
✅ Expected: Record appears with all values

#### 5.6 Multiple Employees
1. Process payroll for multiple employees
✅ Expected: Each has own record with different salaries

#### 5.7 Multiple Months
1. Process March payroll
2. Process April payroll
✅ Expected: Both records visible in history

#### 5.8 View Payroll Summary
1. Payroll page → Summary section
✅ Expected: Shows
- Average Gross Salary
- Average Net Salary
- Total Processed Records

---

### Phase 6: Access Control Testing

#### 6.1 Admin Can View Employees
As Admin:
1. Sidebar → 👤 Employees
✅ Expected: Employee directory visible

#### 6.2 HR Can View Employees
Switch to HR user:
1. Sidebar → 👤 Employees
✅ Expected: Employee directory visible

#### 6.3 Manager Cannot View Employees
Switch to Manager:
1. Look for 👤 Employees link
✅ Expected: Link NOT visible in sidebar

#### 6.4 Staff Cannot View Employees
Switch to Staff:
1. Look for 👤 Employees link
✅ Expected: Link NOT visible

#### 6.5 Unauthorized Page Access
As Manager:
1. Try accessing: `http://localhost:3000/employees.html`
✅ Expected: "Access Denied" message shown

---

### Phase 7: Messages System Testing

#### 7.1 Start Conversation
1. Messages page
2. Search for user name: "John"
3. Click user
✅ Expected: Chat window opens for that user

#### 7.2 Send Message
1. Type message: "Hello, how are you?"
2. Click Send
✅ Expected: Message appears in chat (blue bubble)

#### 7.3 Receive Response
As other user:
1. Go to Messages
2. See John in conversation list
3. Click conversation
✅ Expected: Your message appears (gray bubble)
4. Type response
5. Send message
✅ Expected: First user sees response

#### 7.4 Conversation List
1. Messages page
2. See all conversations listed
✅ Expected: Shows conversation with preview of last message

#### 7.5 Search Conversations
1. Type in search bar: "john"
✅ Expected: Filters conversations by name

#### 7.6 Auto-Refresh
1. Keep Messages page open
2. User sends you a message from another tab
✅ Expected: New message appears automatically

#### 7.7 Message Timestamps
1. Send multiple messages
✅ Expected: Each message shows time sent

---

### Phase 8: Help Desk System Testing

#### 8.1 Create Ticket
1. Help Desk page
2. Click **Create Ticket**
3. Title: "Printer not working"
4. Description: "Office printer offline"
5. Submit
✅ Expected: Ticket created with ID

#### 8.2 Assign to Agent
As Admin:
1. Help Desk → See ticket
2. Click **Assign to Me**
✅ Expected: Ticket assigned to admin

#### 8.3 Accept Ticket
1. Click ticket
2. Click **Accept Ticket**
✅ Expected: Status changes to "Accepted"

#### 8.4 Work on Ticket
1. Add work note: "Checking printer connectivity"
2. Save note
✅ Expected: Note added to ticket

#### 8.5 Complete Ticket
1. Click **Complete Ticket**
2. Add solution: "Restarted printer, now working"
3. Submit
✅ Expected: Status changes to "Completed"

#### 8.6 Escalate Ticket
1. New ticket
2. Click **Escalate**
✅ Expected: Ticket marked for escalation

---

### Phase 9: Integration Testing

#### 9.1 Email + Workflow
1. Create automation rule: "Send email when ticket created"
2. Create help desk ticket
✅ Expected: Email sent when ticket created + automation log shows completed

#### 9.2 Payroll + Attendance
1. Check in/out multiple days
2. Process payroll
✅ Expected: Payroll calculation includes attendance

#### 9.3 Task + Email + Automation
1. Automation rule: "Send email when task overdue"
2. Create task with past due date
3. Task becomes overdue
✅ Expected: Email sent + automation log shows

#### 9.4 Document + Comments + Versions
1. Upload document
2. Add comment
3. Upload new version
4. Check version history
✅ Expected: All tracked together

---

### Phase 10: Performance Testing

#### 10.1 Load Time Test
1. Clear browser cache
2. Open dashboard
3. Check load time (should be < 3 seconds)
✅ Expected: Dashboard loads quickly

#### 10.2 Large Message List
1. Create 100+ messages between users
2. Go to Messages page
3. Check if loads smoothly
✅ Expected: Interface responsive

#### 10.3 Large Document List
1. Upload 50+ documents
2. Go to Documents page
3. Check if loads smoothly
✅ Expected: Interface responsive

#### 10.4 Automation with Many Rules
1. Create 20+ automation rules
2. Trigger all rules
3. Check execution logs
✅ Expected: All execute without delay

#### 10.5 Payroll Large Employee Base
1. Create 100 employee records
2. Process payroll for all
✅ Expected: Calculations complete in < 10 seconds

---

## Deployment to Production

### Step 1: Environment Setup
```bash
# Create .env file with production values
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=company@company.com
SMTP_PASS=secure-app-password
SMTP_FROM=Company Name
PORT=3000
NODE_ENV=production
```

### Step 2: Install Dependencies
```bash
npm install --production
```

### Step 3: Database Backup
```bash
# Backup current database
cp office-automation.db office-automation.db.backup
```

### Step 4: Start Server
```bash
npm start
```
Or with PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name "office-automation"
pm2 startup
pm2 save
```

### Step 5: Setup HTTPS (Optional but Recommended)
Use reverse proxy like Nginx:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 6: Monitoring
```bash
# Check server status
pm2 status

# View logs
pm2 logs office-automation

# Restart if needed
pm2 restart office-automation
```

---

## Troubleshooting

### Issue: "Cannot find module 'nodemailer'"
```bash
Solution: npm install nodemailer node-schedule
```

### Issue: "Port 3000 already in use"
```bash
# Kill existing process
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Or change PORT in .env
```

### Issue: "SMTP authentication failed"
```
Solution:
1. Verify SMTP settings
2. Use app-specific password (not regular password)
3. Check email address format
4. Enable "Less secure apps" if using Gmail
```

### Issue: "Automation rule not executing"
```
Solution:
1. Verify rule is marked "Active"
2. Check trigger matches the event
3. Review automation execution logs
4. Restart server
```

### Issue: "Email configuration not saving"
```
Solution:
1. Check browser console for errors (F12)
2. Verify localStorage enabled
3. Clear browser cache
4. Try different browser
```

### Issue: "Database locked"
```
Solution:
1. Restart server
2. Check for multiple server instances
3. Backup and delete database, server will recreate
```

---

## Rollback Procedure

If something breaks in production:

### Step 1: Stop Server
```bash
pm2 stop office-automation
```

### Step 2: Restore Database
```bash
cp office-automation.db.backup office-automation.db
```

### Step 3: Revert Code
```bash
git checkout <previous-commit>
# Or
git reset --hard <tag>
```

### Step 4: Restart
```bash
npm install
npm start
pm2 start server.js --name "office-automation"
```

---

## Success Checklist ✅

Before declaring deployment complete:

- [ ] Server starts without errors
- [ ] Database tables created
- [ ] Login works
- [ ] All pages accessible by role
- [ ] Email test successful
- [ ] Automation rule created and executed
- [ ] Document version uploaded
- [ ] Payroll calculated
- [ ] Employee access restricted correctly
- [ ] Messages send/receive
- [ ] Help desk tickets working
- [ ] No console errors
- [ ] No database errors
- [ ] Backups created
- [ ] Team trained on features

---

## Monitoring Checklist (Weekly)

- [ ] Check server uptime
- [ ] Review error logs
- [ ] Verify email service operational
- [ ] Check automation rule executions
- [ ] Monitor database size
- [ ] Backup database
- [ ] Test disaster recovery
- [ ] Review user feedback
- [ ] Check for performance issues
- [ ] Update dependencies if needed

---

This guide covers everything needed to deploy, test, and maintain the system in production.

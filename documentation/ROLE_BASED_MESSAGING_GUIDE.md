# Role-Based Access & Department Segregation Guide

## Overview

The messaging system now implements **role-based and department-based access control** to ensure proper communication boundaries within the organization.

---

## Access Rules by Role & Department

### **1. Admin Users**
- **Can message:** Everyone in the system
- **Visibility:** All departments, all roles
- **Use case:** Company-wide communication, organization-wide announcements

**Example:**
- Admin can contact any staff member from Finance, HR, IT, Sales, etc.

---

### **2. Manager Users**
- **Can message:**
  - ✅ Their own department members
  - ✅ HR team members
  - ✅ Company Admins
  - ❌ Managers/Staff from other departments (unless they're HR/Admin)

- **Cannot message:**
  - Staff from other departments (unless those staff are HR or Admin)
  - Managers from other departments

**Example:**
- Sales Manager can message:
  - All Sales Department staff
  - Anyone in HR
  - Company Admins
  - Cannot directly message Finance team members

---

### **3. Staff Users**
- **Can message:**
  - ✅ Their own department members
  - ✅ Their department managers
  - ✅ HR team members
  - ✅ Company Admins
  - ❌ Staff/Managers from other departments

- **Cannot message:**
  - Other departments (except HR and Admins)
  - Cross-department communication

**Example:**
- IT Staff member can message:
  - Other IT Department staff
  - IT Manager
  - Anyone in HR
  - Company Admins
  - Cannot message Sales or Finance teams

---

## Visual Indicators

### Role Badges in Search Results

When searching for contacts, you'll see color-coded role badges:

- **Red Badge** = Admin (full system access)
- **Blue Badge** = Manager (department lead)
- **Green Badge** = Staff (team member)

**Example Search Result:**
```
John Smith [ADMIN]
john.smith@company.com • HR

Sarah Johnson [MANAGER]
sarah.johnson@company.com • Sales

Mike Davis [STAFF]
mike.davis@company.com • IT
```

---

## Search & Conversation Features

### **Single Unified Search Bar**

The messaging page now has ONE search bar that:

1. **Searches existing conversations** first
   - Shows messages with people you've already chatted with
   - Fast access to previous conversations

2. **Searches available contacts** if no conversations match
   - Only shows people you're allowed to message based on your role
   - Filters by department rules automatically

3. **Real-time filtering**
   - Search by name or email
   - Results appear as you type
   - Respects your access permissions

### **How to Search:**

1. Click in the search bar at the top of the conversations list
2. Type a name or email
3. Results appear instantly
4. Click a result to open or start a conversation
5. Clear search to see all your conversations again

### **Fixed: Search Results Clearing**

✅ **Problem resolved:** Search results no longer clear when you click them
- You can now:
  - Click on a search result
  - Start typing your message immediately
  - Continue the conversation without frustration

---

## Permission Matrix

| User Role | Own Department | Other Depts | Managers | Admins | HR Team |
|-----------|----------------|-------------|----------|--------|---------|
| **Admin** | ✅ All | ✅ All | ✅ Yes | ✅ Yes | ✅ Yes |
| **Manager** | ✅ All | ❌ No* | ❌ No | ✅ Yes | ✅ Yes |
| **Staff** | ✅ All | ❌ No* | ✅ Own Mgr | ✅ Yes | ✅ Yes |

*Except HR and Admin users

---

## Department Examples

### **Organization Structure**
```
Company
├── Admin
│   └── Can see: Everyone
├── HR Department
│   ├── Visible to: Everyone (Admins, Managers, Staff from all depts)
│   └── Can message: Everyone
├── Sales Department
│   ├── Manager: Can see Sales team, HR, Admins
│   └── Staff: Can see Sales team, Sales Manager, HR, Admins
├── IT Department
│   ├── Manager: Can see IT team, HR, Admins
│   └── Staff: Can see IT team, IT Manager, HR, Admins
└── Finance Department
    ├── Manager: Can see Finance team, HR, Admins
    └── Staff: Can see Finance team, Finance Manager, HR, Admins
```

### **Real-World Scenario:**

**Sarah (Sales Manager, Sales Dept)**
- Searches for "Mike"
- Can find:
  - ✅ Mike (Sales Staff) - Same department
  - ✅ Mike (HR) - HR Department
  - ✅ Mike (Admin) - Admin
  - ❌ Mike (IT Manager) - Different department, not HR/Admin
  - ❌ Mike (Finance Staff) - Different department, not HR/admin

---

## Technical Implementation

### **Backend Filtering**
The API automatically filters based on:
1. User's role (Admin/Manager/Staff)
2. User's department
3. Target user's role and department
4. Whether target user is in HR (special case)

### **Frontend Behavior**
1. Department and role data loaded from user's profile
2. Search respects backend filters
3. Only available contacts displayed in results
4. No cross-department access shown

### **Database Rules**
- Users table includes: `role`, `department`, `status`
- Messages route checks headers: `userrole`, `userdept`, `userid`
- Query filters applied before returning results

---

## Troubleshooting

### **Q: I can't find a colleague to message**
**A:** Check:
1. Are they in your department or HR?
2. Are they an Admin or Manager?
3. If Staff: are they in your department?
4. Is their account status "Active"?

### **Q: Why do I see fewer contacts than before?**
**A:** The system now respects department boundaries:
- Managers see only: own dept, HR, Admins
- Staff see only: own dept, own manager, HR, Admins

### **Q: Can I message cross-departments?**
**A:** Only if:
- You're an Admin (message anyone)
- The person is in HR (HR is visible to all)
- You're in HR (HR can message anyone)

---

## Best Practices

### **For Admins:**
- Use messaging for organization-wide communication
- Can directly reach any team member
- Consider HR for employee-related matters

### **For Managers:**
- Use for team management and coordination
- Can message HR for policy questions
- Use Admin for cross-departmental issues

### **For Staff:**
- Use for team collaboration
- Contact your manager for escalations
- Use HR for HR-related matters
- Contact Admin only for system issues

---

## Privacy & Security

✅ **Your access is automatically enforced:**
- You only see contacts you're allowed to message
- The backend validates all access attempts
- No workaround to contact unauthorized users
- All access is logged in the database

---

## Testing Your Access

### **To test role-based access:**

1. **Test as Staff member:**
   - Search for own department → Should find ✅
   - Search for another department → Should not find ❌
   - Search for HR → Should find ✅

2. **Test as Manager:**
   - Search for own department → Should find ✅
   - Search for other department → Should not find ❌
   - Search for HR → Should find ✅
   - Search for Admin → Should find ✅

3. **Test as Admin:**
   - Search for anyone → Should find ✅
   - No restrictions applied

---

## What Changed

| Feature | Before | After |
|---------|--------|-------|
| Search bars | 2 separate bars | 1 unified search |
| Role visibility | No segregation | Full role-based filtering |
| Department access | No restrictions | Enforced separation |
| Search clearing | Cleared on click | Stays until manual clear |
| Contact badges | Role in parentheses | Color-coded badges |

---

## Questions?

For technical issues:
1. Check browser console (F12) for errors
2. Verify your user role is set correctly
3. Confirm target user's account is Active
4. Contact your admin if access is incorrect

---

Created: January 16, 2026
Last Updated: January 16, 2026

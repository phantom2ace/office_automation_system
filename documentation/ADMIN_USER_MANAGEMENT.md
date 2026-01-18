# 👤 User Management System - Quick Guide

## Overview
You can now create, edit, and delete staff members directly through the **User Management Panel** without editing code. This is available only to Admin users.

## Accessing User Management

### Method 1: From Dashboard
1. Login as an Admin (email: `admin@office.com`, password: `admin`)
2. Go to Dashboard
3. Click **👤 User Management** in the sidebar (admin-only link)

### Method 2: Direct URL
- Navigate to: `http://localhost:3000/user-management.html`
- Only admins can access this page

## Creating a New User

### Via User Management Panel (Recommended)
1. Open the User Management page
2. Fill in the form on the left:
   - **Full Name**: Employee's full name
   - **Email Address**: Unique email (e.g., `john.smith@office.com`)
   - **Password**: Initial password for the user
   - **Department**: Select from HR, IT, Finance, Sales, Operations, Marketing
   - **Role**: Select Admin, Manager, or Staff
3. Click **Create User**
4. The new user appears in the Users list on the right

### Example:
```
Name: Jane Doe
Email: jane.doe@office.com
Password: jane123
Department: Finance
Role: Manager
```

After creation, Jane can login with `jane.doe@office.com` / `jane123`

## Editing an Existing User

1. Open User Management
2. Find the user in the "System Users" list on the right
3. Click the **Edit** button (yellow)
4. In the modal dialog, update the fields you want to change:
   - Name, Email, Password, Department, Role, Status
5. Leave the password field empty if you don't want to change it
6. Click **Update User**

## Deleting a User

1. Open User Management
2. Find the user in the list
3. Click the **Delete** button (red)
4. Confirm the deletion

**⚠️ Safety Note**: You cannot delete the only admin user in the system. At least one admin must always exist.

## Filtering Users

Use the dropdown filters at the top of the Users section:
- **Filter by Department**: Show only users from a specific department
- **Filter by Role**: Show only users with a specific role (Admin, Manager, Staff)

## Statistics Dashboard

The top of the User Management page shows:
- **Total Users**: Total number of users in the system
- **Admins**: Number of admin users
- **Active Users**: Number of users with "Active" status

## User Status

Users can have two statuses:
- **Active**: User can login and use the system
- **Inactive**: User's account is disabled

Change a user's status by editing them.

## Default Test Users

The system comes with these default users:

| Name | Email | Password | Department | Role |
|------|-------|----------|-----------|------|
| Admin User | admin@office.com | admin | IT | Admin |
| John Smith | john@office.com | jsmith | IT | Manager |
| Mary Johnson | mary@office.com | mjohnson | HR | Manager |
| Robert Davis | robert@office.com | rdavis | Sales | Staff |
| Sarah Wilson | sarah@office.com | swilson | Finance | Manager |
| Michael Brown | michael@office.com | mbrown | IT | Staff |

## API Endpoints (For Developers)

If you need to integrate with other systems, these endpoints are available:

### Create User
```
POST /api/users/create
Headers: userid, userrole (must be Admin)
Body: { name, email, password, department, role }
```

### Get All Users
```
GET /api/users/all
Headers: userid, userrole (must be Admin)
```

### Update User
```
PUT /api/users/{userId}
Headers: userid, userrole (must be Admin)
Body: { name, email, password, department, role, status, availability }
```

### Delete User
```
DELETE /api/users/{userId}
Headers: userid, userrole (must be Admin)
```

## Security Notes

- Only Admin users can access the User Management panel
- Passwords are currently stored in plain text (consider implementing bcrypt encryption)
- All user creation/deletion is logged by timestamps
- You cannot delete the only admin user

## Troubleshooting

### "Access Restricted" Message
- You must be logged in as an Admin
- Login to admin account first: `admin@office.com` / `admin`

### "Email already exists" Error
- Another user with that email is already in the system
- Use a different email address

### "Cannot delete the only admin user" Error
- Create another Admin user first before deleting this one
- At least one Admin must exist in the system

## Regular Tasks

### Monthly: Review Active Users
1. Open User Management
2. Check the "Active Users" statistic
3. Identify and update inactive users

### Onboarding: Create New Employee
1. Open User Management
2. Fill in the form with employee details
3. Send them their email and temporary password
4. They can change their password after first login

### Offboarding: Deactivate Employee
1. Edit the employee
2. Change Status to "Inactive"
3. Click "Update User"
4. User can no longer login

## Next Steps

- Create your company's staff users
- Set appropriate departments and roles
- Test login with different user types
- Implement password hashing for production use (recommended)

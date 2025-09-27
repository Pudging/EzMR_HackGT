# Admin Setup Guide

This guide explains how to set up and use the admin functionality in the EzMR application.

## Features

- **Role-based access control** with USER and ADMIN roles
- **Admin-only user management page** at `/admin/users`
- **Automatic redirect protection** for non-admin users
- **Admin panel link** in user navigation dropdown

## Setting Up the First Admin User

### Method 1: Bootstrap API (Development Only)

1. Sign in to the application with your email
2. Make a POST request to `/api/admin/bootstrap`
3. This will promote your current user to admin role (only works if no admins exist)

Example using curl:

```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

### Method 2: Direct Database Update

1. Connect to your database
2. Find your user ID
3. Update the role field:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Using the Admin Panel

### Accessing the Admin Panel

1. Sign in as an admin user
2. Click on your user avatar in the top navigation
3. Select "Admin Panel" from the dropdown menu
4. You'll be redirected to `/admin/users`

### Admin Users Page Features

- **User Statistics**: Total users, admin count, regular user count
- **User List**: Complete list of all users with:
  - User avatar (or default icon)
  - Name and email
  - Role badge (Admin/User)
  - Email verification status
  - Account creation date
  - Active sessions count
- **Role Management**: View user roles and permissions

### API Endpoints

#### Bootstrap Admin (Development Only)

- **POST** `/api/admin/bootstrap`
- Creates the first admin user if none exist
- Only available in development environment

#### Promote User (Admin Only)

- **POST** `/api/admin/promote-user`
- Allows admins to change user roles
- Requires admin authentication

Example request:

```json
{
  "userId": "user-id-here",
  "role": "ADMIN" // or "USER"
}
```

## Security Features

### Access Control

- Admin pages automatically redirect non-admin users to home page
- Admin API endpoints require admin authentication
- Role checks are performed server-side

### Navigation

- Admin panel link only appears for admin users
- Regular users cannot see or access admin functionality

## Database Schema

The user model includes a `role` field with the following values:

- `USER` (default): Regular user with standard permissions
- `ADMIN`: Administrator with access to admin panel and user management

```prisma
enum UserRole {
    USER
    ADMIN
}

model User {
    // ... other fields
    role UserRole @default(USER)
}
```

## Development Notes

- The bootstrap endpoint is only available in development mode
- In production, the first admin should be created manually via database
- All admin functionality is protected by server-side authentication checks
- The admin role is included in the NextAuth session for easy access

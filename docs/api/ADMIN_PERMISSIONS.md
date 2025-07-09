# Admin Permissions Implementation

## Overview

This document explains how permissions are managed when a user's role is changed, especially when upgrading a user to an Admin role or demoting an Admin to a regular user.

## How Permissions Work

### Permission Flow

1. **User Authentication**:
   - Upon login, the user's basic profile information is stored in the Redux auth slice
   - The App component fetches the user's permissions from the backend

2. **Permission Context**:
   - Permissions are loaded from the backend and stored in the UserPermissionsContext
   - The sidebar menu and route protection are based on these permissions

3. **Role Changes**:
   - When a user's role is changed in the User Management module, the backend is updated via the API
   - The permissions are not automatically refreshed in the current user's session
   - A global app refreshPermissions function is available to manually refresh permissions

### Role Change Behavior

When an admin changes a user's role:

1. The role change is sent to the backend using the `updateUser` API endpoint
2. The permissions for that user are updated on the backend but not in the current session
3. The system now automatically calls the refreshPermissions function to update the app state
4. For the affected user, a full logout and login is required to see their updated permissions

## Best Practices

1. **After Role Changes**:
   - Inform users that they need to log out and log back in to see their updated permissions
   - For critical role changes, consider forcing a logout of affected users

2. **Admin Permissions**:
   - Admin users always have full access to admin modules
   - The Permissions module enforces that admin users have admin access to the Permissions module

## Technical Implementation

The permissions system consists of these key components:

1. **User API Service**: Handles user updates including role changes
2. **Permissions API Service**: Manages the permission settings for each user
3. **App Component**: Fetches and refreshes permissions
4. **UserPermissionsContext**: Provides permissions to all components
5. **ProtectedRoute**: Restricts access based on permissions
6. **Layout Component**: Builds the sidebar menu based on permissions

When a role change occurs in UserManagement.tsx, the following steps happen:

1. User data is updated via `updateUserAsync` 
2. If the role changed, `refreshPermissions` is called
3. A notification informs that the user must re-login for changes to fully take effect

## Troubleshooting

If a user doesn't see their updated permissions after a role change:
1. Verify the role was updated in the database
2. Have the user log out and log back in
3. Check the permissions in the UserPermissionsContext after login
4. Verify the backend is correctly assigning permissions based on roles

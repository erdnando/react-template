import { UserDto, UserPermissionDto } from '../services/userApiService';

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US');
};

export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const debounce = <T extends (...args: never[]) => unknown>(func: T, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0;
};

/**
 * Permission and Role Utilities
 */

// Permission types based on backend enum
export enum PermissionType {
  None = 0,
  Read = 10,
  Write = 20,
  Delete = 30,
  Admin = 40
}

// Check if user has admin permissions
export const hasAdminPermission = (user: UserDto | null): boolean => {
  if (!user || !user.permissions) return false;
  
  // Check if user has any Admin permission (PermissionType = 40)
  return user.permissions.some((permission: UserPermissionDto) => 
    permission.permissionType === PermissionType.Admin
  );
};

// Check if user has admin role
export const hasAdminRole = (user: UserDto | null): boolean => {
  if (!user || !user.role) return false;
  
  // Check if user role is "admin" or similar
  const roleName = user.role.name?.toLowerCase();
  return roleName === 'admin' || roleName === 'administrator' || roleName === 'administrador';
};

// Check if user can perform admin operations (utils endpoints)
export const canPerformAdminOperations = (user: UserDto | null): boolean => {
  return hasAdminPermission(user) || hasAdminRole(user);
};

// Format permission type to readable string
export const formatPermissionType = (permissionType: number): string => {
  switch (permissionType) {
    case PermissionType.None: return 'None';
    case PermissionType.Read: return 'Read';
    case PermissionType.Write: return 'Write';
    case PermissionType.Delete: return 'Delete';
    case PermissionType.Admin: return 'Admin';
    default: return 'Unknown';
  }
};

/**
 * Email and User Utilities
 */

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format user display name
export const formatUserDisplayName = (user: UserDto | null): string => {
  if (!user) return 'Unknown User';
  if (user.fullName) return user.fullName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.email) return user.email;
  return 'Unknown User';
};
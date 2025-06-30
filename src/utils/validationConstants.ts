// Validation constants for form inputs
// These constants define the maximum lengths for various input fields across the application
// Following industry standards and best practices

export const VALIDATION_LIMITS = {
  // User Management
  FIRST_NAME_MIN: 3,
  FIRST_NAME_MAX: 50,
  LAST_NAME_MIN: 3,
  LAST_NAME_MAX: 50,
  EMAIL_MAX: 254, // RFC 5321 standard
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 128,

  // Role Management
  ROLE_NAME_MIN: 3,
  ROLE_NAME_MAX: 100,

  // Task Management
  TASK_TITLE_MAX: 100,
  TASK_DESCRIPTION_MAX: 500,

  // Login
  LOGIN_EMAIL_MAX: 254,
  LOGIN_PASSWORD_MAX: 128,

  // General
  GENERAL_TEXT_SHORT: 100,
  GENERAL_TEXT_MEDIUM: 255,
  GENERAL_TEXT_LONG: 500,
  GENERAL_TEXT_EXTRA_LONG: 1000,
} as const;

// Email validation regex (RFC 5322 compliant)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Helper function to validate text length
export const validateTextLength = (
  text: string,
  minLength = 0,
  maxLength: number,
  fieldName = 'Field'
): string => {
  if (!text.trim() && minLength > 0) {
    return `${fieldName} is required`;
  }
  if (text.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  if (text.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return '';
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters long`,
  MAX_LENGTH: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  INVALID_EMAIL: 'Please enter a valid email address',
  DUPLICATE_EXISTS: (field: string) => `A ${field.toLowerCase()} with this name already exists`,
  CANNOT_DELETE_ADMIN: 'Cannot delete or deactivate admin users',
  CANNOT_DELETE_SYSTEM_ROLE: 'Cannot delete system roles',
} as const;

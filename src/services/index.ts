// src/services/index.ts - Updated service exports

// Legacy services (keep for backward compatibility)
export * from './api';
export * from './auth';

// API client
export * from './apiClient';
export * from './authApiService';

// Export specific services
export { userService } from './userApiService';
export { roleService } from './roleApiService';
export { permissionsService } from './permissionsApiService';
export { taskService } from './taskService';
export { catalogService } from './catalogService';
export { authService } from './authApiService';
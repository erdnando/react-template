// Permissions API service - Updated to match new API structure
import { apiRequest, ApiResponse } from './apiClient';
import { isMockMode } from './apiConfig';
import { MockDataService } from './mockDataService';

// Permission Type enum based on API definition
export enum PermissionType {
  None = 0,
  Read = 10,
  Write = 20,
  Delete = 30,
  Admin = 40
}

// Module DTOs based on the API definition
export interface ModuleDto {
  id: number;
  name: string | null;
  description: string | null;
  code: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateModuleDto {
  name: string | null;
  description: string | null;
  code: string | null;
}

export interface UpdateModuleDto {
  name: string | null;
  description: string | null;
  code: string | null;
  isActive: boolean | null;
}

// User Permission DTOs
export interface UserPermissionDto {
  id: number;
  userId: number;
  moduleId: number;
  moduleName: string | null;
  moduleCode: string | null;
  permissionType: PermissionType;
  createdAt: string;
}

export interface CreateUserPermissionDto {
  userId: number;
  moduleId: number;
  permissionType: PermissionType;
}

export interface UpdateUserPermissionDto {
  id: number;
  permissionType: PermissionType;
}

// Paged result interface
export interface PagedResult<T> {
  data: T[] | null;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Permissions service functions
export const permissionsService = {
  // ====================
  // MODULE OPERATIONS
  // ====================

  // Get all modules with pagination and filtering
  getModules: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<PagedResult<ModuleDto>>> => {
    if (isMockMode()) {
      return MockDataService.getModules(params) as Promise<ApiResponse<PagedResult<ModuleDto>>>;
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/Permissions/modules?${queryString}` : '/Permissions/modules';
    return apiRequest.get<PagedResult<ModuleDto>>(url);
  },

  // Get module by ID
  getModuleById: (id: number): Promise<ApiResponse<ModuleDto>> => {
    if (isMockMode()) {
      // Temporary simplified implementation
      return Promise.resolve({ success: true, message: 'Module found (mock)', data: { id, name: 'Mock Module', description: 'Mock description', code: 'mock', isActive: true, createdAt: new Date().toISOString(), updatedAt: null } });
    }
    return apiRequest.get<ModuleDto>(`/Permissions/modules/${id}`);
  },

  // Create new module
  createModule: (moduleData: CreateModuleDto): Promise<ApiResponse<ModuleDto>> => {
    return apiRequest.post<ModuleDto>('/Permissions/modules', moduleData);
  },

  // Update module
  updateModule: (id: number, moduleData: UpdateModuleDto): Promise<ApiResponse<ModuleDto>> => {
    return apiRequest.put<ModuleDto>(`/Permissions/modules/${id}`, moduleData);
  },

  // Delete module (soft delete)
  deleteModule: (id: number): Promise<ApiResponse<boolean>> => {
    return apiRequest.delete<boolean>(`/Permissions/modules/${id}`);
  },

  // ====================
  // USER PERMISSION OPERATIONS
  // ====================

  // Get user permissions
  getUserPermissions: (userId: number): Promise<ApiResponse<UserPermissionDto[]>> => {
    return apiRequest.get<UserPermissionDto[]>(`/Permissions/users/${userId}`);
  },

  // Update user permissions (replace all permissions for a user)
  updateUserPermissions: (userId: number, permissionsData: UpdateUserPermissionDto[]): Promise<ApiResponse<boolean>> => {
    return apiRequest.put<boolean>(`/Permissions/users/${userId}`, permissionsData);
  },

  // Assign specific permission to user
  assignPermissionToUser: (userId: number, moduleId: number, permissionData: CreateUserPermissionDto): Promise<ApiResponse<UserPermissionDto>> => {
    return apiRequest.post<UserPermissionDto>(`/Permissions/users/${userId}/modules/${moduleId}`, permissionData);
  },

  // Remove specific permission from user
  removePermissionFromUser: (userId: number, moduleId: number): Promise<ApiResponse<boolean>> => {
    return apiRequest.delete<boolean>(`/Permissions/users/${userId}/modules/${moduleId}`);
  },

  // Check if user has specific permission for a module
  checkUserPermission: (userId: number, moduleCode: string, requiredPermission?: PermissionType): Promise<ApiResponse<boolean>> => {
    const queryParams = new URLSearchParams();
    if (requiredPermission !== undefined) {
      queryParams.append('requiredPermission', requiredPermission.toString());
    }
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/Permissions/users/${userId}/modules/${moduleCode}/check?${queryString}`
      : `/Permissions/users/${userId}/modules/${moduleCode}/check`;
    
    return apiRequest.get<boolean>(url);
  },

  // Get user module permissions map (all modules and their permissions for a user)
  getUserModulePermissionsMap: (userId: number): Promise<ApiResponse<Record<string, PermissionType>>> => {
    return apiRequest.get<Record<string, PermissionType>>(`/Permissions/users/${userId}/modules`);
  },
};

export default permissionsService;

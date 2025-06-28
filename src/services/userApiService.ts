// User API service - Updated to match new API structure
import { apiRequest, ApiResponse } from './apiClient';
import { isMockMode } from './apiConfig';
import { MockDataService } from './mockDataService';

// Role DTO (referenced in UserDto)
export interface RoleDto {
  id: number;
  name: string | null;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// User permission DTO (referenced in UserDto)
export interface UserPermissionDto {
  id: number;
  userId: number;
  moduleId: number;
  moduleName: string | null;
  moduleCode: string | null;
  permissionType: number; // PermissionType enum (0=None, 10=Read, 20=Write, 30=Delete, 40=Admin)
  createdAt: string;
}

// User Status enum (0=Inactive, 1=Active)
export enum UserStatus {
  Inactive = 0,
  Active = 1
}

// Main UserDto based on the API definition
export interface UserDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  roleId: number;
  role: RoleDto;
  status: UserStatus;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  permissions: UserPermissionDto[] | null;
}

// Create user DTO
export interface CreateUserDto {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
  roleId: number;
  status: UserStatus;
  avatar: string | null;
}

// Update user DTO
export interface UpdateUserDto {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  roleId: number | null;
  status: UserStatus;
  avatar: string | null;
}

// Change password DTO
export interface ChangePasswordDto {
  currentPassword: string | null;
  newPassword: string | null;
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

// User service functions
export const userService = {
  // Get all users with pagination and filtering
  getUsers: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<PagedResult<UserDto>>> => {
    if (isMockMode()) {
      return MockDataService.getUsers(params) as Promise<ApiResponse<PagedResult<UserDto>>>;
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/Users?${queryString}` : '/Users';
    return apiRequest.get<PagedResult<UserDto>>(url);
  },

  // Get user by ID
  getUserById: (id: number): Promise<ApiResponse<UserDto>> => {
    if (isMockMode()) {
      return MockDataService.getUserById(id);
    }
    return apiRequest.get<UserDto>(`/Users/${id}`);
  },

  // Get user by email
  getUserByEmail: (email: string): Promise<ApiResponse<UserDto>> => {
    if (isMockMode()) {
      return MockDataService.getUserByEmail(email);
    }
    return apiRequest.get<UserDto>(`/Users/by-email/${encodeURIComponent(email)}`);
  },

  // Create new user
  createUser: (userData: CreateUserDto): Promise<ApiResponse<UserDto>> => {
    if (isMockMode()) {
      return MockDataService.createUser(userData);
    }
    return apiRequest.post<UserDto>('/Users', userData);
  },

  // Update user
  updateUser: (id: number, userData: UpdateUserDto): Promise<ApiResponse<UserDto>> => {
    if (isMockMode()) {
      return MockDataService.updateUser(id, userData);
    }
    return apiRequest.put<UserDto>(`/Users/${id}`, userData);
  },

  // Delete user (soft delete)
  deleteUser: (id: number): Promise<ApiResponse<boolean>> => {
    if (isMockMode()) {
      return MockDataService.deleteUser(id);
    }
    return apiRequest.delete<boolean>(`/Users/${id}`);
  },

  // Change user password
  changePassword: (id: number, passwordData: ChangePasswordDto): Promise<ApiResponse<boolean>> => {
    if (isMockMode()) {
      // Mock doesn't need password changes for now
      return Promise.resolve({ success: true, message: 'Password changed successfully (mock)', data: true });
    }
    return apiRequest.post<boolean>(`/Users/${id}/change-password`, passwordData);
  },
};

export default userService;

// Role API service - Updated to match new API structure
import { apiRequest, ApiResponse } from './apiClient';
import { isMockMode } from './apiConfig';
import { MockDataService } from './mockDataService';

// Role DTOs based on the API definition
export interface RoleDto {
  id: number;
  name: string | null;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoleDto {
  name: string | null;
  description: string | null;
}

export interface UpdateRoleDto {
  name: string | null;
  description: string | null;
}

// Paged result interface for roles
export interface PagedResult<T> {
  data: T[] | null;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Role service functions
export const roleService = {
  // Get all roles with pagination and filtering
  getRoles: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<PagedResult<RoleDto>>> => {
    if (isMockMode()) {
      return MockDataService.getRoles(params) as Promise<ApiResponse<PagedResult<RoleDto>>>;
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/Roles?${queryString}` : '/Roles';
    return apiRequest.get<PagedResult<RoleDto>>(url);
  },

  // Get role by ID
  getRoleById: (id: number): Promise<ApiResponse<RoleDto>> => {
    if (isMockMode()) {
      return MockDataService.getRoleById(id);
    }
    return apiRequest.get<RoleDto>(`/Roles/${id}`);
  },

  // Create new role
  createRole: (roleData: CreateRoleDto): Promise<ApiResponse<RoleDto>> => {
    if (isMockMode()) {
      return MockDataService.createRole(roleData);
    }
    return apiRequest.post<RoleDto>('/Roles', roleData);
  },

  // Update role
  updateRole: (id: number, roleData: UpdateRoleDto): Promise<ApiResponse<RoleDto>> => {
    if (isMockMode()) {
      return MockDataService.updateRole(id, roleData);
    }
    return apiRequest.put<RoleDto>(`/Roles/${id}`, roleData);
  },

  // Delete role (soft delete)
  deleteRole: (id: number): Promise<ApiResponse<boolean>> => {
    if (isMockMode()) {
      return MockDataService.deleteRole(id);
    }
    return apiRequest.delete<boolean>(`/Roles/${id}`);
  },
};

export default roleService;

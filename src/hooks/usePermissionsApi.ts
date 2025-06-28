// Custom hook for managing permissions API state - Updated for new API structure
import { useState, useEffect, useCallback } from 'react';
import { 
  userService, 
  roleService, 
  permissionsService,
} from '../services';

// Import types from the new API services
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto
} from '../services/userApiService';
import type {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto
} from '../services/roleApiService';
import type {
  ModuleDto,
  UpdateUserPermissionDto
} from '../services/permissionsApiService';

// Import enums as values (not types) since they're used at runtime
import { UserStatus } from '../services/userApiService';
import { PermissionType } from '../services/permissionsApiService';

// Frontend-compatible user interface (for backward compatibility)
export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  roleId: number;
  isActive: boolean;
  role: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  joinDate: string;
  lastLoginAt: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
}

// Frontend-compatible role interface
export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
}

// Frontend-compatible module interface
export interface Module {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// Permission structure for the frontend
export interface UserModulePermissions {
  [userName: string]: {
    [moduleCode: string]: {
      enabled: boolean;
      type: 'Admin' | 'Delete' | 'Write' | 'Read' | 'None';
      permissionId?: number;
    };
  };
}

// Pagination state
interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const usePermissionsApi = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userModulePermissions, setUserModulePermissions] = useState<UserModulePermissions>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [usersPagination, setUsersPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [rolesPagination, setRolesPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [modulesPagination, setModulesPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Helper function to convert PermissionType enum to string
  const permissionTypeToString = useCallback((type: PermissionType): 'Admin' | 'Delete' | 'Write' | 'Read' | 'None' => {
    switch (type) {
      case PermissionType.Admin: return 'Admin';
      case PermissionType.Delete: return 'Delete';
      case PermissionType.Write: return 'Write';
      case PermissionType.Read: return 'Read';
      case PermissionType.None:
      default: return 'None';
    }
  }, []);

  // Helper function to convert string to PermissionType enum
  const stringToPermissionType = useCallback((type: string): PermissionType => {
    switch (type) {
      case 'Admin': return PermissionType.Admin;
      case 'Delete': return PermissionType.Delete;
      case 'Write': return PermissionType.Write;
      case 'Read': return PermissionType.Read;
      case 'None':
      default: return PermissionType.None;
    }
  }, []);

  // Convert API user data to frontend format
  const convertApiUserToUser = useCallback((apiUser: UserDto, rolesData: Role[]): User => {
    const userRole = rolesData.find(r => r.id === apiUser.roleId);
    return {
      id: apiUser.id,
      name: apiUser.fullName || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email || '',
      email: apiUser.email || '',
      status: apiUser.isActive ? 'active' : 'inactive', // Use isActive instead of status enum
      roleId: apiUser.roleId,
      isActive: apiUser.isActive,
      role: userRole?.name || 'Sin rol',
      avatar: apiUser.avatar,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt || apiUser.createdAt,
      joinDate: apiUser.createdAt, // Use createdAt as joinDate
      lastLoginAt: apiUser.lastLoginAt,
      firstName: apiUser.firstName || '',
      lastName: apiUser.lastName || '',
      fullName: apiUser.fullName || '',
    };
  }, []);

  // Convert API role data to frontend format
  const convertApiRoleToRole = useCallback((apiRole: RoleDto): Role => ({
    id: apiRole.id,
    name: apiRole.name || '',
    description: apiRole.description || undefined,
    isSystemRole: apiRole.isSystemRole,
  }), []);

  // Convert API module data to frontend format
  const convertApiModuleToModule = useCallback((apiModule: ModuleDto): Module => ({
    id: apiModule.id,
    name: apiModule.name || '',
    code: apiModule.code || '',
    description: apiModule.description || undefined,
    isActive: apiModule.isActive,
  }), []);

  // Load users with pagination
  const loadUsers = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }) => {
    console.log('usePermissionsApi: Loading users...', params);
    
    try {
      const response = await userService.getUsers(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load users');
      }

      const pagedResult = response.data;
      setUsersPagination({
        page: pagedResult.pageNumber,
        pageSize: pagedResult.pageSize,
        totalPages: pagedResult.totalPages,
        totalRecords: pagedResult.totalRecords,
        hasNext: pagedResult.hasNext,
        hasPrevious: pagedResult.hasPrevious
      });

      return pagedResult.data || [];
    } catch (err) {
      console.error('Error loading users:', err);
      throw err;
    }
  }, []);

  // Load roles with pagination
  const loadRoles = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }) => {
    console.log('usePermissionsApi: Loading roles...', params);
    
    try {
      const response = await roleService.getRoles(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load roles');
      }

      const pagedResult = response.data;
      setRolesPagination({
        page: pagedResult.pageNumber,
        pageSize: pagedResult.pageSize,
        totalPages: pagedResult.totalPages,
        totalRecords: pagedResult.totalRecords,
        hasNext: pagedResult.hasNext,
        hasPrevious: pagedResult.hasPrevious
      });

      return pagedResult.data || [];
    } catch (err) {
      console.error('Error loading roles:', err);
      throw err;
    }
  }, []);

  // Load modules with pagination
  const loadModules = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }) => {
    console.log('usePermissionsApi: Loading modules...', params);
    
    try {
      const response = await permissionsService.getModules(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load modules');
      }

      const pagedResult = response.data;
      setModulesPagination({
        page: pagedResult.pageNumber,
        pageSize: pagedResult.pageSize,
        totalPages: pagedResult.totalPages,
        totalRecords: pagedResult.totalRecords,
        hasNext: pagedResult.hasNext,
        hasPrevious: pagedResult.hasPrevious
      });

      return pagedResult.data || [];
    } catch (err) {
      console.error('Error loading modules:', err);
      throw err;
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    console.log('usePermissionsApi: Starting loadData...');
    setLoading(true);
    setError(null);
    
    try {
      // Load all roles first (get all without pagination for compatibility)
      const allRolesResponse = await roleService.getRoles({ page: 1, pageSize: 100 });
      if (!allRolesResponse.success || !allRolesResponse.data) {
        throw new Error('Failed to load roles');
      }
      
      const rolesData = (allRolesResponse.data.data || []).map(convertApiRoleToRole);
      setRoles(rolesData);

      // Load all users with role data (get all without pagination for compatibility)
      const allUsersResponse = await userService.getUsers({ page: 1, pageSize: 100 });
      if (!allUsersResponse.success || !allUsersResponse.data) {
        throw new Error('Failed to load users');
      }
      
      const usersData = (allUsersResponse.data.data || []).map(user => convertApiUserToUser(user, rolesData));
      setUsers(usersData);

      // Load all modules (get all without pagination for compatibility)
      const allModulesResponse = await permissionsService.getModules({ page: 1, pageSize: 100 });
      if (allModulesResponse.success && allModulesResponse.data) {
        const modulesData = (allModulesResponse.data.data || []).map(convertApiModuleToModule);
        setModules(modulesData);
      }

      // Load permissions for all users
      if (usersData.length > 0) {
        const permissionsPromises = usersData.map(user => 
          permissionsService.getUserPermissions(user.id)
        );
        const permissionsResponses = await Promise.all(permissionsPromises);
        
        const allPermissions: UserModulePermissions = {};
        usersData.forEach((user, index) => {
          const userPermissions = permissionsResponses[index];
          if (userPermissions.success && userPermissions.data) {
            allPermissions[user.name] = {};
            userPermissions.data.forEach(perm => {
              const moduleCode = perm.moduleCode || perm.moduleId.toString();
              allPermissions[user.name][moduleCode] = {
                enabled: perm.permissionType !== PermissionType.None,
                type: permissionTypeToString(perm.permissionType),
                permissionId: perm.id,
              };
            });
          }
        });
        setUserModulePermissions(allPermissions);
      }
    } catch (err) {
      console.error('Error loading permissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [convertApiUserToUser, convertApiRoleToRole, convertApiModuleToModule, permissionTypeToString]);

  // Create user
  const createUser = useCallback(async (userData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string;
    status: 'active' | 'inactive'; 
    roleId: number;
    avatar?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const createData: CreateUserDto = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        roleId: userData.roleId,
        status: userData.status === 'active' ? UserStatus.Active : UserStatus.Inactive,
        avatar: userData.avatar || null,
      };
      
      const response = await userService.createUser(createData);
      if (response.success && response.data) {
        // Reload data to get updated list
        await loadData();
        return response.data;
      }
      throw new Error(response.message || 'Failed to create user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Update user
  const updateUser = useCallback(async (id: number, userData: { 
    firstName?: string; 
    lastName?: string; 
    email?: string; 
    status?: 'active' | 'inactive'; 
    roleId?: number;
    avatar?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: UpdateUserDto = {
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        email: userData.email || null,
        roleId: userData.roleId || null,
        status: userData.status ? (userData.status === 'active' ? UserStatus.Active : UserStatus.Inactive) : UserStatus.Active,
        avatar: userData.avatar || null,
      };
      
      const response = await userService.updateUser(id, updateData);
      if (response.success && response.data) {
        // Reload data to get updated list
        await loadData();
        return response.data;
      }
      throw new Error(response.message || 'Failed to update user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Delete user
  const deleteUser = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        // Reload data to get updated list
        await loadData();
        return true;
      }
      throw new Error(response.message || 'Failed to delete user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Create role
  const createRole = useCallback(async (roleData: { name: string; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const createData: CreateRoleDto = {
        name: roleData.name,
        description: roleData.description || null,
      };
      
      const response = await roleService.createRole(createData);
      if (response.success && response.data) {
        // Reload data to get updated list
        await loadData();
        return response.data;
      }
      throw new Error(response.message || 'Failed to create role');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Update role
  const updateRole = useCallback(async (id: number, roleData: { name?: string; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: UpdateRoleDto = {
        name: roleData.name || null,
        description: roleData.description || null,
      };
      
      const response = await roleService.updateRole(id, updateData);
      if (response.success && response.data) {
        // Reload data to get updated list
        await loadData();
        return response.data;
      }
      throw new Error(response.message || 'Failed to update role');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Delete role
  const deleteRole = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await roleService.deleteRole(id);
      if (response.success) {
        // Reload data to get updated list
        await loadData();
        return true;
      }
      throw new Error(response.message || 'Failed to delete role');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Save user permissions
  const saveUserPermissions = useCallback(async (userName: string, permissions: UserModulePermissions[string]) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = users.find(u => u.name === userName);
      if (!user) {
        throw new Error('User not found');
      }

      // Convert frontend permissions to API format
      const permissionsData: UpdateUserPermissionDto[] = Object.entries(permissions).map(([moduleCode, perm]) => {
        const module = modules.find(m => m.code === moduleCode);
        if (!module) {
          throw new Error(`Module not found: ${moduleCode}`);
        }

        return {
          id: perm.permissionId || 0, // Will be created if 0
          permissionType: stringToPermissionType(perm.enabled ? perm.type : 'None'),
        };
      });

      const response = await permissionsService.updateUserPermissions(user.id, permissionsData);
      if (response.success) {
        // Update local state
        setUserModulePermissions(prev => ({
          ...prev,
          [userName]: permissions,
        }));
        return true;
      }
      throw new Error(response.message || 'Failed to save permissions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, modules, stringToPermissionType]);

  // Load data on mount
  useEffect(() => {
    console.log('usePermissionsApi: Loading initial data...');
    loadData().catch(err => {
      console.error('usePermissionsApi: Failed to load initial data:', err);
    });
  }, [loadData]);

  return {
    // Data
    users,
    roles,
    modules,
    userModulePermissions,
    
    // Pagination
    usersPagination,
    rolesPagination,
    modulesPagination,
    
    // State
    loading,
    error,
    
    // Actions
    loadData,
    loadUsers,
    loadRoles,
    loadModules,
    createUser,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    deleteRole,
    saveUserPermissions,
    setUserModulePermissions,
    
    // Helper functions
    permissionTypeToString,
    stringToPermissionType,
  };
};

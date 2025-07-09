// Mock data service for development without backend
import { API_CONFIG } from './apiConfig';
import type { ApiResponse } from './apiClient';
import type { UserDto, CreateUserDto, UpdateUserDto, RoleDto, UserPermissionDto } from './userApiService';
import type { CreateRoleDto, UpdateRoleDto } from './roleApiService';
import type { ModuleDto } from './permissionsApiService';

// Define enums locally to avoid circular dependencies
enum UserStatus {
  Inactive = 0,
  Active = 1
}

enum PermissionType {
  None = 0,
  Read = 10,
  Write = 20,
  Delete = 30,
  Admin = 40
}

// Mock data

// Define roles first
const mockRoles: RoleDto[] = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Administrator role with full access',
    isSystemRole: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Analista',
    description: 'Analyst role with limited access',
    isSystemRole: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Sin asignar',
    description: 'Unassigned role',
    isSystemRole: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

// Define modules
const mockModules: ModuleDto[] = [
  {
    id: 1,
    code: 'users',
    name: 'Users',
    description: 'User management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    code: 'roles',
    name: 'Roles',
    description: 'Role management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
    code: 'permisos',
    name: 'Permisos',
    description: 'Permissions management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 4,
    code: 'admin_utilities',
    name: 'Admin Utilities',
    description: 'Administrative utilities module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 5,
    code: 'tasks',
    name: 'Gestión de Tareas',
    description: 'Task management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 6,
    code: 'reports',
    name: 'Reportes',
    description: 'Reports module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

// Define permissions
const mockUserPermissions: UserPermissionDto[] = [
  // Admin user (userId: 1) permissions for all admin modules
  {
    id: 1,
    userId: 1,
    moduleId: 1,
    moduleName: 'Users',
    moduleCode: 'users',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    moduleId: 2,
    moduleName: 'Roles',
    moduleCode: 'roles',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
    userId: 1,
    moduleId: 3,
    moduleName: 'Permisos',
    moduleCode: 'permisos',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 4,
    userId: 1,
    moduleId: 4,
    moduleName: 'Admin Utilities',
    moduleCode: 'admin_utilities',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 5,
    userId: 1,
    moduleId: 5,
    moduleName: 'Gestión de Tareas',
    moduleCode: 'tasks',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 6,
    userId: 2,
    moduleId: 6,
    moduleName: 'Reportes',
    moduleCode: 'reports',
    permissionType: PermissionType.Read,
    createdAt: '2023-01-01T00:00:00Z'
  },
  // Bob (userId: 2) is also an admin, so add admin permissions for all admin modules
  {
    id: 7,
    userId: 2,
    moduleId: 1,
    moduleName: 'Users',
    moduleCode: 'users',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 8,
    userId: 2,
    moduleId: 2,
    moduleName: 'Roles',
    moduleCode: 'roles',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 9,
    userId: 2,
    moduleId: 3,
    moduleName: 'Permisos',
    moduleCode: 'permisos',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 10,
    userId: 2,
    moduleId: 4,
    moduleName: 'Admin Utilities',
    moduleCode: 'admin_utilities',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 11,
    userId: 2,
    moduleId: 5,
    moduleName: 'Gestión de Tareas',
    moduleCode: 'tasks',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  },
  // Erdnando user (userId: 5) - also an admin with all admin permissions
  {
    id: 12,
    userId: 5,
    moduleId: 1,
    moduleName: 'Users',
    moduleCode: 'users',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 13,
    userId: 5,
    moduleId: 2,
    moduleName: 'Roles',
    moduleCode: 'roles',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 14,
    userId: 5,
    moduleId: 3,
    moduleName: 'Permisos',
    moduleCode: 'permisos',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 15,
    userId: 5,
    moduleId: 4,
    moduleName: 'Admin Utilities',
    moduleCode: 'admin_utilities',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 16,
    userId: 5,
    moduleId: 5,
    moduleName: 'Gestión de Tareas',
    moduleCode: 'tasks',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 17,
    userId: 5,
    moduleId: 6,
    moduleName: 'Reportes',
    moduleCode: 'reports',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  },
  // Admin@sistema.com user (userId: 6) - full admin permissions
  {
    id: 18,
    userId: 6,
    moduleId: 1,
    moduleName: 'Users',
    moduleCode: 'users',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 19,
    userId: 6,
    moduleId: 2,
    moduleName: 'Roles',
    moduleCode: 'roles',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 20,
    userId: 6,
    moduleId: 3,
    moduleName: 'Permisos',
    moduleCode: 'permisos',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 21,
    userId: 6,
    moduleId: 4,
    moduleName: 'Admin Utilities',
    moduleCode: 'admin_utilities',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 22,
    userId: 6,
    moduleId: 5,
    moduleName: 'Gestión de Tareas',
    moduleCode: 'tasks',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 23,
    userId: 6,
    moduleId: 6,
    moduleName: 'Reportes',
    moduleCode: 'reports',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  }
];

// Define users last (after roles and permissions)
const mockUsers: UserDto[] = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    fullName: 'Alice Smith',
    email: 'alice@example.com',
    status: UserStatus.Active,
    isActive: true,
    roleId: 1,
    role: mockRoles[0],
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z',
    permissions: mockUserPermissions.filter(p => p.userId === 1)
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Johnson',
    fullName: 'Bob Johnson',
    email: 'bob@example.com',
    status: UserStatus.Active,
    isActive: true,
    roleId: 1,
    role: mockRoles[0],
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z',
    permissions: mockUserPermissions.filter(p => p.userId === 2)
  },
  {
    id: 3,
    firstName: 'Charlie',
    lastName: 'Brown',
    fullName: 'Charlie Brown',
    email: 'charlie@example.com',
    status: UserStatus.Active,
    isActive: true,
    roleId: 2,
    role: mockRoles[1],
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z',
    permissions: []
  },
  {
    id: 4,
    firstName: 'Diana',
    lastName: 'Wilson',
    fullName: 'Diana Wilson',
    email: 'diana@example.com',
    status: UserStatus.Inactive,
    isActive: false,
    roleId: 3,
    role: mockRoles[2],
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: null,
    permissions: []
  },
  {
    id: 5,
    firstName: 'Erdnando',
    lastName: 'User',
    fullName: 'Erdnando User',
    email: 'erdnando@gmail.com',
    status: UserStatus.Active,
    isActive: true,
    roleId: 1,
    role: mockRoles[0],
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z',
    permissions: mockUserPermissions.filter(p => p.userId === 5)
  },
  {
    id: 6,
    firstName: 'Admin',
    lastName: 'System',
    fullName: 'Admin System',
    email: 'admin@sistema.com',
    status: UserStatus.Active,
    isActive: true,
    roleId: 1,
    role: mockRoles[0],
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z',
    permissions: mockUserPermissions.filter(p => p.userId === 6)
  }
];

// Helper to create paginated response
const createPagedResponse = <T>(data: T[], page = 1, pageSize = 10) => ({
  data,
  pageNumber: page,
  pageSize,
  totalPages: Math.ceil(data.length / pageSize),
  totalRecords: data.length,
  hasNext: page * pageSize < data.length,
  hasPrevious: page > 1
});

// Helper to create API response
const createResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  message: 'Success',
  data
});

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock service class
export class MockDataService {
  
  // Users
  static async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Promise<ApiResponse<{ data: UserDto[]; pageNumber: number; pageSize: number; totalPages: number; totalRecords: number; hasNext: boolean; hasPrevious: boolean; }>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading users from mock data
    
    let filteredUsers = [...mockUsers];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.firstName?.toLowerCase().includes(search) ||
        user.lastName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    }
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(start, start + pageSize);
    
    return createResponse(createPagedResponse(paginatedUsers, page, pageSize));
  }

  static async createUser(userData: CreateUserDto): Promise<ApiResponse<UserDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Creating user in mock data
    
    const role = mockRoles.find(r => r.id === userData.roleId) || mockRoles[2]; // Default to "Sin asignar"
    
    const newUser: UserDto = {
      id: Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      status: userData.status,
      isActive: userData.status === UserStatus.Active,
      roleId: userData.roleId,
      role: role,
      avatar: userData.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      permissions: []
    };
    
    mockUsers.push(newUser);
    return createResponse(newUser);
  }

  static async updateUser(id: number, userData: UpdateUserDto): Promise<ApiResponse<UserDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Updating user in mock data
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const currentUser = mockUsers[userIndex];
    const newRoleId = userData.roleId || currentUser.roleId;
    const role = mockRoles.find(r => r.id === newRoleId) || currentUser.role;
    
    const updatedUser: UserDto = {
      ...currentUser,
      firstName: userData.firstName ?? currentUser.firstName,
      lastName: userData.lastName ?? currentUser.lastName,
      email: userData.email ?? currentUser.email,
      roleId: newRoleId,
      role: role,
      status: userData.status,
      isActive: userData.status === UserStatus.Active,
      avatar: userData.avatar ?? currentUser.avatar,
      fullName: userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : currentUser.fullName,
      updatedAt: new Date().toISOString()
    };
    
    mockUsers[userIndex] = updatedUser;
    return createResponse(updatedUser);
  }

  static async deleteUser(id: number): Promise<ApiResponse<boolean>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Deleting user from mock data
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers.splice(userIndex, 1);
    return createResponse(true);
  }

  static async getUserById(id: number): Promise<ApiResponse<UserDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading user by ID from mock data
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return createResponse(user);
  }

  static async getUserByEmail(email: string): Promise<ApiResponse<UserDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading user by email from mock data
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    
    return createResponse(user);
  }

  // Roles
  static async getRoles(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<{ data: RoleDto[]; pageNumber: number; pageSize: number; totalPages: number; totalRecords: number; hasNext: boolean; hasPrevious: boolean; }>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading roles from mock data
    
    let filteredRoles = [...mockRoles];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredRoles = filteredRoles.filter(role => 
        role.name?.toLowerCase().includes(search)
      );
    }
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    
    return createResponse(createPagedResponse(filteredRoles, page, pageSize));
  }

  static async createRole(roleData: CreateRoleDto): Promise<ApiResponse<RoleDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Creating role in mock data
    
    const newRole: RoleDto = {
      id: Date.now(),
      name: roleData.name,
      description: roleData.description || null,
      isSystemRole: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockRoles.push(newRole);
    return createResponse(newRole);
  }

  static async updateRole(id: number, roleData: UpdateRoleDto): Promise<ApiResponse<RoleDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Updating role in mock data
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    const updatedRole = {
      ...mockRoles[roleIndex],
      ...roleData,
      updatedAt: new Date().toISOString()
    };
    
    mockRoles[roleIndex] = updatedRole;
    return createResponse(updatedRole);
  }

  static async deleteRole(id: number): Promise<ApiResponse<boolean>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Deleting role from mock data
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    mockRoles.splice(roleIndex, 1);
    return createResponse(true);
  }

  static async getRoleById(id: number): Promise<ApiResponse<RoleDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading role by ID from mock data
    
    const role = mockRoles.find(r => r.id === id);
    if (!role) {
      throw new Error('Role not found');
    }
    
    return createResponse(role);
  }

  // Modules
  static async getModules(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<{ data: ModuleDto[]; pageNumber: number; pageSize: number; totalPages: number; totalRecords: number; hasNext: boolean; hasPrevious: boolean; }>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading modules from mock data
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    
    return createResponse(createPagedResponse(mockModules, page, pageSize));
  }

  // Permissions
  static async getUserPermissions(userId: number): Promise<ApiResponse<UserPermissionDto[]>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Loading user permissions from mock data
    
    const userPerms = mockUserPermissions.filter(p => p.userId === userId);
    return createResponse(userPerms);
  }

  static async assignUserPermission(data: {
    userId: number;
    moduleId: number;
    moduleCode: string;
    permissionType: PermissionType;
  }): Promise<ApiResponse<UserPermissionDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Assigning permission in mock data
    
    const module = mockModules.find(m => m.id === data.moduleId);
    
    const newPermission: UserPermissionDto = {
      id: Date.now(),
      userId: data.userId,
      moduleId: data.moduleId,
      moduleName: module?.name || null,
      moduleCode: data.moduleCode,
      permissionType: data.permissionType,
      createdAt: new Date().toISOString()
    };
    
    mockUserPermissions.push(newPermission);
    return createResponse(newPermission);
  }

  static async updateUserPermission(id: number, data: {
    permissionType: PermissionType;
  }): Promise<ApiResponse<UserPermissionDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Updating permission in mock data
    
    const permIndex = mockUserPermissions.findIndex(p => p.id === id);
    if (permIndex === -1) {
      throw new Error('Permission not found');
    }
    
    const updatedPermission = {
      ...mockUserPermissions[permIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockUserPermissions[permIndex] = updatedPermission;
    return createResponse(updatedPermission);
  }

  static async deleteUserPermission(id: number): Promise<ApiResponse<boolean>> {
    await delay(API_CONFIG.MOCK_DELAY);
    // Deleting permission from mock data
    
    const permIndex = mockUserPermissions.findIndex(p => p.id === id);
    if (permIndex === -1) {
      throw new Error('Permission not found');
    }
    
    mockUserPermissions.splice(permIndex, 1);
    return createResponse(true);
  }
}

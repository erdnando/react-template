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
    name: 'Gestión de Usuarios',
    description: 'User management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    code: 'tasks',
    name: 'Gestión de Tareas',
    description: 'Task management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
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
  {
    id: 1,
    userId: 1,
    moduleId: 1,
    moduleName: 'Gestión de Usuarios',
    moduleCode: 'users',
    permissionType: PermissionType.Admin,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    moduleId: 2,
    moduleName: 'Gestión de Tareas',
    moduleCode: 'tasks',
    permissionType: PermissionType.Write,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
    userId: 2,
    moduleId: 3,
    moduleName: 'Reportes',
    moduleCode: 'reports',
    permissionType: PermissionType.Read,
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
    console.log('🎭 Mock: Loading users...', params);
    
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
    console.log('🎭 Mock: Creating user...', userData);
    
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
    console.log('🎭 Mock: Updating user...', id, userData);
    
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
    console.log('🎭 Mock: Deleting user...', id);
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers.splice(userIndex, 1);
    return createResponse(true);
  }

  static async getUserById(id: number): Promise<ApiResponse<UserDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    console.log('🎭 Mock: Loading user by ID...', id);
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return createResponse(user);
  }

  static async getUserByEmail(email: string): Promise<ApiResponse<UserDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    console.log('🎭 Mock: Loading user by email...', email);
    
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
    console.log('🎭 Mock: Loading roles...', params);
    
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
    console.log('🎭 Mock: Creating role...', roleData);
    
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
    console.log('🎭 Mock: Updating role...', id, roleData);
    
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
    console.log('🎭 Mock: Deleting role...', id);
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    mockRoles.splice(roleIndex, 1);
    return createResponse(true);
  }

  static async getRoleById(id: number): Promise<ApiResponse<RoleDto>> {
    await delay(API_CONFIG.MOCK_DELAY);
    console.log('🎭 Mock: Loading role by ID...', id);
    
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
    console.log('🎭 Mock: Loading modules...', params);
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    
    return createResponse(createPagedResponse(mockModules, page, pageSize));
  }

  // Permissions
  static async getUserPermissions(userId: number): Promise<ApiResponse<UserPermissionDto[]>> {
    await delay(API_CONFIG.MOCK_DELAY);
    console.log('🎭 Mock: Loading user permissions...', userId);
    
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
    console.log('🎭 Mock: Assigning permission...', data);
    
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
    console.log('🎭 Mock: Updating permission...', id, data);
    
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
    console.log('🎭 Mock: Deleting permission...', id);
    
    const permIndex = mockUserPermissions.findIndex(p => p.id === id);
    if (permIndex === -1) {
      throw new Error('Permission not found');
    }
    
    mockUserPermissions.splice(permIndex, 1);
    return createResponse(true);
  }
}

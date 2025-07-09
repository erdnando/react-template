// Custom hook for managing permissions API state - Updated for new API structure
import { useState, useCallback } from 'react';
import { 
  userService, 
  roleService, 
  permissionsService,
  apiRequest,
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
  UpdateUserPermissionDto // <-- Import the correct type
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
  order?: number; // <-- Agregado para orden global
}

// Permission structure for the frontend
export interface UserModulePermissions {
  [userId: string]: {
    [moduleCode: string]: {
      enabled: boolean;
      type: 'Edit' | 'ReadOnly' | 'None';
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

// Local type for modules from /Modules endpoint
interface BackendModule {
  id: number;
  name: string;
  description?: string;
  path: string;
  icon: string;
  order?: number;
  code?: string; // <-- Agregado para reflejar la respuesta del backend
}

export const usePermissionsApi = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesVersion, setModulesVersion] = useState(0);
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

  // Helper function to convert PermissionType enum to string
  const permissionTypeToString = useCallback((type: PermissionType): 'Edit' | 'ReadOnly' | 'None' => {
    switch (type) {
      case PermissionType.Write: return 'Edit';
      case PermissionType.Read: return 'ReadOnly';
      case PermissionType.None:
      default: return 'None';
    }
  }, []);

  // Convert API user data to frontend format
  const convertApiUserToUser = useCallback((apiUser: UserDto, rolesData: Role[]): User => {
    const userRole = rolesData.find(r => r.id === apiUser.roleId);
    return {
      id: apiUser.id,
      name: apiUser.fullName || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email || '',
      email: apiUser.email || '',
      status: apiUser.isActive ? 'active' : 'inactive',
      roleId: apiUser.roleId,
      isActive: apiUser.isActive,
      role: userRole?.name || 'Sin rol',
      avatar: apiUser.avatar,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt || apiUser.createdAt,
      joinDate: apiUser.createdAt,
      lastLoginAt: apiUser.lastLoginAt,
      firstName: apiUser.firstName || '',
      lastName: apiUser.lastName || ''
    };
  }, []);

  // Convert API role data to frontend format
  const convertApiRoleToRole = useCallback((apiRole: RoleDto): Role => ({
    id: apiRole.id,
    name: apiRole.name || '',
    description: apiRole.description || undefined,
    isSystemRole: apiRole.isSystemRole,
  }), []);

  // Convert API module data to frontend format - se usa internamente si es necesario
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Helper type guard for modules response
  // function isModulesArrayResponse(data: unknown): data is BackendModule[] {
  //   return Array.isArray(data);
  // }
  // function isModulesObjectWithData(data: unknown): data is { data: BackendModule[] } {
  //   return typeof data === 'object' && data !== null && Array.isArray((data as any).data);
  // }

  // Helper para extraer módulos de cualquier formato de respuesta
  function extractModulesFromResponse(data: unknown): BackendModule[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      // Si tiene propiedad 'data' que es array
      if (Array.isArray((data as { [key: string]: unknown }).data)) {
        return (data as { [key: string]: unknown }).data as BackendModule[];
      }
      // Si es un objeto con props tipo array (índices numéricos)
      const keys = Object.keys(data).filter((key) => /^\d+$/.test(key));
      keys.sort((a, b) => Number(a) - Number(b));
      const modules: BackendModule[] = keys.map((key) => {
        const value = (data as Record<string, unknown>)[key];
        if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
          return value as BackendModule;
        }
        return undefined;
      }).filter(Boolean) as BackendModule[];
      return modules;
    }
    return [];
  }

  // Load modules directamente del array del backend
  const loadModules = useCallback(async () => {
    try {
      const modulesResp = await apiRequest.get('/Modules');
      let modulesArr: BackendModule[] = extractModulesFromResponse(modulesResp);
      modulesArr = modulesArr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const mappedModules = modulesArr.map((m) => ({
        id: m.id,
        name: m.name ?? '',
        code: (m.code && m.code !== '' ? m.code : (m.name && m.name !== '' ? m.name : m.id.toString())),
        description: m.description,
        isActive: true,
        order: m.order, // <-- Mantener el orden
      }));
      setModules(mappedModules);
      setModulesVersion((v) => v + 1);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
      setError('Error al cargar módulos. Por favor, recargue la página.');
      setModules([]);
      setModulesVersion((v) => v + 1);
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all roles first (get all without pagination for compatibility)
      const allRolesResponse = await roleService.getRoles({ page: 1, pageSize: 100 });
      if (!allRolesResponse.success || !allRolesResponse.data || !Array.isArray(allRolesResponse.data.data)) {
        throw new Error('Failed to load roles');
      }
      const rolesData = allRolesResponse.data.data.map(convertApiRoleToRole);
      setRoles(rolesData);

      // Load all users with role data (get all without pagination for compatibility)
      const allUsersResponse = await userService.getUsers({ page: 1, pageSize: 100 });
      if (!allUsersResponse.success || !allUsersResponse.data || !Array.isArray(allUsersResponse.data.data)) {
        throw new Error('Failed to load users');
      }
      const usersData = allUsersResponse.data.data.map(user => convertApiUserToUser(user, rolesData));
      setUsers(usersData);

      // Load all modules (get all from /Modules) y úsalo directamente
      const modulesResp = await apiRequest.get('/Modules');
      let modulesArr: BackendModule[] = extractModulesFromResponse(modulesResp);
      modulesArr = modulesArr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const mappedModules = modulesArr.map((m) => ({
        id: m.id,
        name: m.name ?? '',
        code: (m.code && m.code !== '' ? m.code : (m.name && m.name !== '' ? m.name : m.id.toString())),
        description: m.description,
        isActive: true,
        order: m.order, // <-- Mantener el orden
      }));
      setModules(mappedModules);
      setModulesVersion((v) => v + 1);

      // Inicializa permisos dummy para todos los usuarios y módulos
      const allPermissions: UserModulePermissions = {};
      usersData.forEach(user => {
        allPermissions[String(user.id)] = {};
        mappedModules.forEach(module => {
          allPermissions[String(user.id)][module.code.toUpperCase()] = {
            enabled: false,
            type: 'ReadOnly',
          };
        });
      });

      // Obtiene los permisos reales y sobrescribe los dummy
      if (usersData.length > 0 && mappedModules.length > 0) {
        const permissionsPromises = usersData.map((user: User) => 
          permissionsService.getUserPermissions(user.id)
        );
        const permissionsResponses = await Promise.all(permissionsPromises);
        usersData.forEach((user: User, index: number) => {
          const userPermissions = permissionsResponses[index];
          if (userPermissions.success && userPermissions.data) {
            // Build a lookup for moduleCode/moduleId -> permission
            const permMap: Record<string, { id: number; permissionType: PermissionType }> = {};
            userPermissions.data.forEach((perm: {
              id: number;
              moduleCode?: string | null;
              moduleId: number;
              permissionType: PermissionType;
            }) => {
              const moduleCode = ((perm.moduleCode ?? undefined) || perm.moduleId.toString()).toUpperCase();
              permMap[moduleCode] = { id: perm.id, permissionType: perm.permissionType };
            });
            // For every module, always set permissionId (even if None)
            mappedModules.forEach((module) => {
              const code = module.code.toUpperCase();
              const found = permMap[code];
              allPermissions[String(user.id)][code] = found
                ? {
                    enabled: found.permissionType !== PermissionType.None,
                    type: permissionTypeToString(found.permissionType),
                    permissionId: found.id, // always set
                  }
                : {
                    enabled: false,
                    type: 'None',
                    permissionId: 0, // explicitly set 0 for new
                  };
            });
          } else {
            // No permissions from backend, set all to None with id 0
            mappedModules.forEach((module) => {
              allPermissions[String(user.id)][module.code.toUpperCase()] = {
                enabled: false,
                type: 'None',
                permissionId: 0,
              };
            });
          }
        });
      }
      setUserModulePermissions(allPermissions);
    } catch (err) {
      console.error('Error loading permissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [convertApiUserToUser, convertApiRoleToRole, permissionTypeToString]);

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
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create user');
      }
      
      // Actualiza el estado local con el nuevo usuario
      const newUser = convertApiUserToUser(response.data, roles);
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // También actualiza los permisos del usuario (inicialmente sin permisos)
      setUserModulePermissions(prevPermissions => ({
        ...prevPermissions,
        [String(newUser.id)]: modules.reduce(
          (acc: { [code: string]: { enabled: boolean; type: 'Edit' | 'ReadOnly' | 'None' } }, module: Module) => {
            acc[module.code] = { enabled: false, type: 'ReadOnly' };
            return acc;
          },
          {}
        ),
      }));
      
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [convertApiUserToUser, roles, modules]);

  // Update user
  const updateUser = useCallback(async (userId: number, userData: Partial<UpdateUserDto>) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure all fields are present and not undefined for UpdateUserDto
      const safeUserData: UpdateUserDto = {
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        email: userData.email ?? '',
        roleId: userData.roleId ?? 0,
        status: userData.status ?? UserStatus.Active,
        avatar: userData.avatar ?? null,
      };
      const response = await userService.updateUser(userId, safeUserData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update user');
      }
      setUsers(prevUsers => {
        const userIndex = prevUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) return prevUsers;
        // Map backend UserDto to frontend User type
        const userDto = { ...prevUsers[userIndex], ...response.data };
        const rolesData = roles.find(r => r.id === userDto.roleId);
        const mappedUser: User = {
          id: userDto.id,
          name: userDto.fullName ?? userDto.firstName ?? userDto.email ?? '',
          email: userDto.email ?? '',
          status: userDto.status === UserStatus.Active ? 'active' : 'inactive',
          roleId: userDto.roleId,
          isActive: userDto.status === UserStatus.Active,
          role: rolesData?.name ?? 'Sin rol',
          avatar: userDto.avatar ?? null,
          createdAt: userDto.createdAt ?? '',
          updatedAt: userDto.updatedAt ?? '',
          joinDate: userDto.createdAt ?? '',
          lastLoginAt: userDto.lastLoginAt ?? null,
          firstName: userDto.firstName ?? '',
          lastName: userDto.lastName ?? ''
        };
        const newUsers = [...prevUsers];
        newUsers[userIndex] = mappedUser;
        return newUsers;
      });
      return response.data;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roles]);

  // Delete user
  const deleteUser = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
      
      // Elimina el usuario del estado local
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      // También elimina los permisos del usuario
      setUserModulePermissions(prevPermissions => {
        const newPermissions = { ...prevPermissions };
        delete newPermissions[userId];
        return newPermissions;
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create role
  const createRole = useCallback(async (roleData: { 
    name: string; 
    description?: string; 
    isSystemRole: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const createData: CreateRoleDto = {
        name: roleData.name ?? '',
        description: roleData.description ?? null,
        // isSystemRole removed, not in DTO
      };
      
      const response = await roleService.createRole(createData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create role');
      }
      
      // Actualiza el estado local
      setRoles(prevRoles => [...prevRoles, convertApiRoleToRole(response.data)]);
      
      return response.data;
    } catch (err) {
      console.error('Error creating role:', err);
      setError(err instanceof Error ? err.message : 'Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [convertApiRoleToRole]);

  // Update role
  const updateRole = useCallback(async (roleId: number, roleData: Partial<UpdateRoleDto>) => {
    setLoading(true);
    setError(null);
    
    try {
      const safeRoleData: UpdateRoleDto = {
        name: roleData.name ?? '',
        description: roleData.description ?? null,
        // isSystemRole removed, not in DTO
      };
      const response = await roleService.updateRole(roleId, safeRoleData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update role');
      }
      
      // Actualiza el estado local
      setRoles(prevRoles => {
        const roleIndex = prevRoles.findIndex(r => r.id === roleId);
        if (roleIndex !== -1) {
          const updatedRoles = [...prevRoles];
          updatedRoles[roleIndex] = {
            ...updatedRoles[roleIndex],
            ...safeRoleData,
            name: safeRoleData.name ?? '',
            description: safeRoleData.description ?? undefined,
          };
          return updatedRoles;
        }
        return prevRoles;
      });
      return response.data;
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete role
  const deleteRole = useCallback(async (roleId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await roleService.deleteRole(roleId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete role');
      }
      
      // Elimina el rol del estado local
      setRoles(prevRoles => prevRoles.filter(r => r.id !== roleId));
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save user permissions (production implementation, cleaned for warnings and logs)
  const saveUserPermissions = useCallback(
    async (userId: string | number, permissions: UserModulePermissions[string]) => {
      setLoading(true);
      setError(null);
      try {
        // Map frontend type to backend PermissionType enum
        const typeToEnum = (type: 'Edit' | 'ReadOnly' | 'None') => {
          switch (type) {
            case 'Edit': return PermissionType.Write;
            case 'ReadOnly': return PermissionType.Read;
            case 'None':
            default: return PermissionType.None;
          }
        };
        // Map moduleCode to moduleId
        const moduleCodeToId: Record<string, number> = {};
        modules.forEach((mod) => {
          moduleCodeToId[mod.code.toUpperCase()] = mod.id;
        });
        // Build array of UpdateUserPermissionDto (with moduleId)
        const permissionsData: UpdateUserPermissionDto[] = Object.keys(moduleCodeToId).map((upperCode) => {
          const perm = permissions[upperCode];
          const moduleId = moduleCodeToId[upperCode] ?? 0;
          // Always include moduleId as a top-level property
          return {
            id: perm && perm.permissionId && perm.permissionId > 0 ? perm.permissionId : 0,
            permissionType: perm ? typeToEnum(perm.type) : PermissionType.None,
            moduleId,
          };
        });
        // Log URL and payload before API call for debugging
        // Saving user permissions
        // Call API with correct type
        const response = await permissionsService.updateUserPermissions(Number(userId), permissionsData);
        if (!response.success) {
          throw new Error(response.message || 'No se pudieron guardar los permisos');
        }
        // Refresca los permisos SOLO del usuario guardado para evitar sobrescribir cambios locales de otros usuarios
        const userPermResp = await permissionsService.getUserPermissions(Number(userId));
        if (userPermResp.success && userPermResp.data) {
          setUserModulePermissions(prev => {
            const updated = { ...prev };
            // Mantener el resto de usuarios igual, solo actualiza el usuario guardado
            const perms: typeof prev[string] = {};
            modules.forEach((mod) => {
              // Busca el permiso para este módulo
              const found = userPermResp.data.find((p: {
                id: number;
                moduleCode?: string | null;
                moduleId: number;
                permissionType: PermissionType;
              }) => {
                // Normaliza code y compara
                const code = ((p.moduleCode ?? undefined) || p.moduleId.toString()).toUpperCase();
                return code === mod.code.toUpperCase();
              });
              perms[mod.code.toUpperCase()] = found
                ? {
                    enabled: found.permissionType !== PermissionType.None,
                    type: permissionTypeToString(found.permissionType),
                    permissionId: found.id, // <-- Asegura que se asigna el id real
                  }
                : {
                    enabled: false,
                    type: 'None',
                    permissionId: 0,
                  };
            });
            updated[String(userId)] = perms;
            return updated;
          });
        }
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar permisos');
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      } finally {
        setLoading(false);
      }
    },
    [modules, permissionTypeToString]
  );

  return {
    // State
    users,
    roles,
    modules,
    modulesVersion,
    userModulePermissions,
    loading,
    error,
    // Pagination states
    usersPagination,
    rolesPagination,
    // Actions
    loadUsers,
    loadRoles,
    loadModules,
    loadData,
    createUser,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    deleteRole,
    saveUserPermissions,
    setUserModulePermissions,
  };
};

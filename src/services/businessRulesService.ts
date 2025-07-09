// Business Rules Service
// This service centralizes business logic rules that determine system behavior

import { permissionsService } from './permissionsApiService';
import { PermissionType } from './permissionsApiService';

// Define admin modules - these are the modules that only administrators should have access to
// IMPORTANTE: Los nombres deben coincidir EXACTAMENTE con los códigos de módulo en el backend
export const ADMIN_MODULES = [
  'USERS',
  'users', // versión en minúsculas como en mock data
  'Users', // versión con primera letra mayúscula
  'ROLES',
  'roles', // versión en minúsculas como en mock data  
  'Roles', // versión con primera letra mayúscula
  // Añadimos todas las variantes posibles de los nombres para "Permisos" y "Admin Utilities"
  'PERMISOS',
  'permisos', // versión en minúsculas como en mock data
  'Permisos', // versión con primera letra mayúscula
  'PERMISSIONS',
  'permissions', // versión en inglés minúsculas
  'Permissions', // versión en inglés con primera letra mayúscula
  'PERMISOS_MODULE',
  'PERMISOS-MODULE',
  'ADMIN_UTILITIES',
  'admin_utilities', // versión en minúsculas como en mock data
  'Admin_Utilities', // versión mixta
  'AdminUtilities', // versión CamelCase
  'ADMINUTILITIES',
  'adminutilities', // versión en minúsculas
  'ADMIN-UTILITIES',
  'admin-utilities', // versión en minúsculas con guión
  'ADMINUTILS',
  'adminutils', // versión en minúsculas
  'ADMIN_UTILS',
  'admin_utils' // versión en minúsculas
];

// Define system modules - these are general modules that everyone might have access to
export const SYSTEM_MODULES = [
  'HOME',
  'TASKS',
  'CATALOGS'
];

/**
 * Applies role-based permission rules
 * When a user's role changes, this function updates their permissions accordingly
 * @param userId - The user ID whose permissions need to be updated
 * @param newRoleId - The new role ID assigned to the user
 * @param isAdministratorRole - Whether the new role is an administrator role
 */
export const applyRolePermissionRules = async (userId: number, newRoleId: number, isAdministratorRole: boolean): Promise<boolean> => {
  try {
    // 1. Get the user's current permissions
    const userPermsResponse = await permissionsService.getUserPermissions(userId);
    
    if (!userPermsResponse.success || !userPermsResponse.data) {
      console.error('Failed to fetch user permissions:', userPermsResponse.message);
      return false;
    }
    
    const currentPermissions = userPermsResponse.data;
    
    // 2. Get all available modules
    const modulesResponse = await permissionsService.getModules();
    
    if (!modulesResponse.success || !modulesResponse.data?.data) {
      console.error('Failed to fetch modules:', modulesResponse.message);
      return false;
    }
    
    const modules = modulesResponse.data.data;
    
    // 3. Create permissions mapping
    const permissionsToUpdate: {
      id: number;
      permissionType: PermissionType;
      moduleId: number;
    }[] = [];
    
    // 4. Process each module
    modules.forEach(module => {
      if (!module.code) return;
      
      const moduleCode = module.code.toUpperCase();
      
      // Find existing permission for this module
      const existingPerm = currentPermissions.find(
        p => (p.moduleCode?.toUpperCase() === moduleCode) || 
             (p.moduleId === module.id)
      );
      
      // Check if this is an admin module
      const isAdminModule = ADMIN_MODULES.includes(moduleCode);
      
      let permType: PermissionType;
      
      if (isAdministratorRole) {
        // For administrators, we always give Write access to ensure they can
        // modify all modules in the system, including Home, Tasks, Catalogs, etc.
        // This is critical for the permission management functionality to work properly
        permType = PermissionType.Write;
        
        // If in the future, there are modules that admins should not edit, 
        // we can use shouldAdminHaveEditAccess function to check:
        // if (!shouldAdminHaveEditAccess(moduleCode)) {
        //   permType = PermissionType.Read;
        // }
      } else if (isAdminModule) {
        // Non-admins lose access to admin modules
        permType = PermissionType.None;
      } else {
        // Keep existing permission for non-admin modules for non-admins
        permType = existingPerm?.permissionType || PermissionType.None;
      }
      
      // Track what permission is being assigned to each module
      const permData = {
        id: existingPerm?.id || 0,
        permissionType: permType,
        moduleId: module.id
      };
      
      permissionsToUpdate.push(permData);
    });
    
    // 5. Update the permissions in the backend
    const updateResponse = await permissionsService.updateUserPermissions(userId, permissionsToUpdate);
    
    if (!updateResponse.success) {
      console.error('Failed to update permissions:', updateResponse.message);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error applying role permission rules:', error);
    return false;
  }
};

/**
 * Determines if a module should be editable by administrators
 * @param moduleCode - The code of the module to check
 * @returns true if administrators should have edit access, false otherwise
 */
export const shouldAdminHaveEditAccess = (moduleCode: string): boolean => {
  // Convert to uppercase for consistent comparison
  const code = moduleCode.toUpperCase();
  
  // Define any modules that administrators should NOT have edit access to
  // Currently empty - administrators have access to all modules
  const restrictedModules: string[] = [];
  
  // Check if the module is in the restricted list
  return !restrictedModules.includes(code);
};

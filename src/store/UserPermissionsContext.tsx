import React, { createContext } from 'react';

// Estructura de permisos por módulo
export type ModulePermission = {
  enabled: boolean;
  type: 'None' | 'ReadOnly' | 'Edit';
};

export type UserPermissions = {
  [moduleCode: string]: ModulePermission;
};

// Contexto global
export const UserPermissionsContext = createContext<UserPermissions>({});

// Provider de ejemplo
export const UserPermissionsProvider: React.FC<{ permissions: UserPermissions; children: React.ReactNode }> = ({ permissions, children }) => {
  return (
    <UserPermissionsContext.Provider value={permissions}>
      {children}
    </UserPermissionsContext.Provider>
  );
};

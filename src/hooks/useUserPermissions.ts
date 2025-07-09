// Hook de ejemplo para obtener los permisos del usuario desde el contexto global
// Debes adaptar esto a tu store/contexto real
import { useContext } from 'react';
import { UserPermissions, UserPermissionsContext } from '../store/UserPermissionsContext';

export function useUserPermissions(): UserPermissions {
  // Retorna un objeto: { [moduleCode]: { enabled, type } }
  return useContext(UserPermissionsContext);
}

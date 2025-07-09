import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserPermissions } from '../hooks/useUserPermissions'; // Debes implementar este hook o adaptarlo a tu contexto

interface ProtectedRouteProps {
  moduleCode: string;
  children: React.ReactNode;
  requiredType?: Array<'ReadOnly' | 'Edit'>; // Por defecto permite ambos
}

/**
 * Protege una ruta según los permisos del usuario para el módulo indicado.
 * - Si el permiso es 'None', redirige a /no-access.
 * - Si el permiso es 'ReadOnly' y requiredType incluye 'ReadOnly', permite acceso solo lectura.
 * - Si el permiso es 'Edit' y requiredType incluye 'Edit', permite acceso total.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ moduleCode, children, requiredType = ['ReadOnly', 'Edit'] }) => {
  const permissions = useUserPermissions(); // { [moduleCode]: { enabled, type } }
  const modulePerm = permissions[moduleCode];

  if (!modulePerm || modulePerm.type === 'None' || !requiredType.includes(modulePerm.type)) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};

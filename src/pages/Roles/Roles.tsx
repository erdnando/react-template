import React from 'react';
import { RoleManagement } from '../../components/common';
import { useUserPermissions } from '../../hooks/useUserPermissions';

const Roles: React.FC = () => {
  const userPermissions = useUserPermissions();
  const canEdit =
    userPermissions['roles'] &&
    typeof userPermissions['roles'].type === 'string' &&
    userPermissions['roles'].type.toLowerCase() === 'edit';
  return (
    <RoleManagement 
      showStats={true}
      title="Gestión de Roles"
      canEdit={canEdit}
    />
  );
};

export default Roles;

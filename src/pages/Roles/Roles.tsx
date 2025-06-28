import React from 'react';
import { RoleManagement } from '../../components/common';

const Roles: React.FC = () => {
  return (
    <RoleManagement 
      showStats={true}
      title="Gestión de Roles"
    />
  );
};

export default Roles;

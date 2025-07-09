import React from 'react';
import { UserManagement } from '../../components/common';
import { useUserPermissions } from '../../hooks/useUserPermissions';

interface UsersProps {
  refreshPermissions?: () => Promise<void>;
}

const Users: React.FC<UsersProps> = ({ refreshPermissions }) => {
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['users']?.type === 'Edit';
  return (
    <UserManagement 
      showStats={true}
      title="User Management"
      canEdit={canEdit}
      refreshPermissions={refreshPermissions}
    />
  );
};

export default Users;
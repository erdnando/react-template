import React from 'react';
import { UserManagement } from '../../components/common';

const Users: React.FC = () => {
  return (
    <UserManagement 
      showStats={true}
      title="User Management"
    />
  );
};

export default Users;
import React from 'react';
import { Container } from '@mui/material';
import { UserManagement } from '../../components/common';

const Users: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <UserManagement 
        showStats={true}
        title="User Management"
      />
    </Container>
  );
};

export default Users;
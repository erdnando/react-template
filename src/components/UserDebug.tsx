import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Divider 
} from '@mui/material';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserDebugProps {
  user?: UserInfo;
}

const UserDebug: React.FC<UserDebugProps> = ({ user }) => {
  const mockUser: UserInfo = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active'
  };

  const currentUser = user || mockUser;

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        User Debug Component
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          User ID:
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {currentUser.id}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Name:
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {currentUser.name}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Email:
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {currentUser.email}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Role:
        </Typography>
        <Chip label={currentUser.role} color="primary" size="small" sx={{ mb: 1 }} />
      </Box>
      
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Status:
        </Typography>
        <Chip 
          label={currentUser.status} 
          color={currentUser.status === 'active' ? 'success' : 'error'} 
          size="small" 
        />
      </Box>
    </Paper>
  );
};

export default UserDebug;

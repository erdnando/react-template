import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';

const UserInfo: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated || !user) {
    return (
      <Card sx={{ maxWidth: 400, m: 2 }}>
        <CardContent>
          <Typography variant="h6" color="error">
            Usuario no autenticado
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, m: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: 'primary.main', 
              mr: 2,
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información del Usuario
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usuario autenticado
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>ID:</strong> {user.id}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Nombre de usuario:</strong> {user.username}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Correo electrónico:</strong> {user.email}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserInfo;

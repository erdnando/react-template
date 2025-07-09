import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NoAccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 4 }}>
      <Typography variant="h3" color="error" sx={{ mb: 2, fontWeight: 700 }}>
        Acceso Denegado
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#555' }}>
        No tienes permisos para ver este módulo o realizar esta acción.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Ir al inicio</Button>
    </Box>
  );
};

export default NoAccess;

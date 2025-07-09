import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { usePermissionsApi } from '../hooks/usePermissionsApi';

// Definición de tipos para los módulos y usuarios
interface Module {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

interface User {
  id: number;
  name: string;
  email?: string;
  status?: string;
  roleId?: number;
}

export const ModuleList: React.FC = () => {
  const { modules, users, loading, error } = usePermissionsApi();
  const [debugInfo, setDebugInfo] = useState<{
    modulesCount: number;
    usersCount: number;
    modulesSample: string[];
    usersSample: string[];
  }>({
    modulesCount: 0,
    usersCount: 0,
    modulesSample: [],
    usersSample: [],
  });

  useEffect(() => {
    setDebugInfo({
      modulesCount: modules.length,
      usersCount: users.length,
      modulesSample: modules.slice(0, 5).map((m: Module) => `${m.name} (${m.code})`),
      usersSample: users.slice(0, 5).map((u: User) => u.name),
    });
    
    // console.log('Módulos cargados:', modules);
    // console.log('Usuarios cargados:', users);
  }, [modules, users]);

  const reloadPermissions = () => {
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Diagnóstico de Permisos
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 1, my: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Información de carga:</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Módulos: {debugInfo.modulesCount}
              </Typography>
              <List dense>
                {debugInfo.modulesSample.length > 0 ? (
                  debugInfo.modulesSample.map((module, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={module} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No se han cargado módulos" />
                  </ListItem>
                )}
                {debugInfo.modulesCount > 5 && (
                  <ListItem>
                    <ListItemText primary={`...y ${debugInfo.modulesCount - 5} más`} />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Usuarios: {debugInfo.usersCount}
              </Typography>
              <List dense>
                {debugInfo.usersSample.length > 0 ? (
                  debugInfo.usersSample.map((user, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={user} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No se han cargado usuarios" />
                  </ListItem>
                )}
                {debugInfo.usersCount > 5 && (
                  <ListItem>
                    <ListItemText primary={`...y ${debugInfo.usersCount - 5} más`} />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Si los módulos no aparecen en el panel de permisos, puedes usar este componente para verificar que se están cargando correctamente desde la API.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={reloadPermissions}
            disabled={loading}
          >
            Recargar datos
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

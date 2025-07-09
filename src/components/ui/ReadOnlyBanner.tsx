import React from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';

/**
 * Banner que indica cuando un módulo está en modo solo lectura.
 * Utiliza un estilo común para mantener consistencia en toda la aplicación.
 */
interface ReadOnlyBannerProps {
  /**
   * Mensaje adicional opcional para mostrar en el banner
   */
  message?: string;
}

const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({ 
  message = 'Para realizar cambios en este módulo, solicite permisos de edición al administrador.'
}) => {
  return (
    <Alert
      severity="info"
      icon={<LockOutlinedIcon fontSize="inherit" />}
      sx={{
        mb: 3,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 1,
        bgcolor: 'rgba(229, 246, 253, 0.9)',
        border: '1px solid rgba(3, 169, 244, 0.2)',
        '& .MuiAlert-icon': {
          color: 'info.main',
          mr: 1,
          alignSelf: 'center'
        }
      }}
    >
      <Box>
        <Typography 
          variant="subtitle2" 
          component="div" 
          sx={{ 
            fontWeight: 600,
            color: 'info.dark',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Modo Solo Lectura
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {message}
        </Typography>
      </Box>
    </Alert>
  );
};

export default ReadOnlyBanner;

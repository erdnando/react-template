import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  SxProps, 
  Theme 
} from '@mui/material';

interface ModuleCardProps {
  title: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  elevation?: number;
}

/**
 * Card component estándar para módulos del sistema
 * Basado en el look and feel del módulo de permisos
 */
export const ModuleCard: React.FC<ModuleCardProps> = ({ 
  title, 
  children, 
  sx = {}, 
  elevation = 1 
}) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        ...sx
      }}
    >
      {/* Header con título */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '1.1rem',
          }}
        >
          {title}
        </Typography>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Paper>
  );
};

interface ModuleLayoutProps {
  title?: string;
  children: React.ReactNode;
  maxWidth?: string | number;
}

/**
 * Layout principal para páginas de módulos
 */
export const ModuleLayout: React.FC<ModuleLayoutProps> = ({ 
  title, 
  children, 
  maxWidth = '100%' 
}) => {
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth, 
      mx: 'auto',
      px: { xs: 0, sm: 1 } // Menos padding en móvil para maximizar espacio
    }}>
      {title && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3,
            fontSize: { xs: '1.5rem', md: '2rem' },
            px: { xs: 1, sm: 0 }, // Agregar padding horizontal sólo en móvil
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
};

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  action?: React.ReactNode;
}

/**
 * Card para secciones dentro de un módulo
 */
export const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  children, 
  sx = {},
  action
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
        width: '100%', // Asegurar que ocupe el ancho completo
        maxWidth: '100%', // Prevenir desbordamiento
        ...sx
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: 1.5,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' }, // Apilado en móvil, fila en tablets/desktop
          gap: 1,
          width: '100%', // Asegurar ancho completo del header
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'text.primary',
            width: { xs: '100%', sm: 'auto' }, // Ancho completo en móvil
          }}
        >
          {title}
        </Typography>
        {action && (
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}> {/* Contenedor para acción, ancho completo en móvil */}
            {action}
          </Box>
        )}
      </Box>
      
      {/* Content */}
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, width: '100%' }}> {/* Padding reducido en móvil, ancho completo */}
        {children}
      </Box>
    </Paper>
  );
};

import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Componente estándar para encabezados de módulos
 * Proporciona un estilo consistente para títulos y subtítulos en todas las páginas
 */
const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  sx = {}
}) => {
  return (
    <Box 
      sx={{ 
        mb: 4, 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        width: '100%',
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
        {icon && (
          <Box sx={{ mr: 1.5, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        <Box>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                mt: 0.5,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                maxWidth: '700px'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {action && (
        <Box sx={{ flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default ModuleHeader;

import React from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  SxProps,
  Theme,
  Stack,
  Chip,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  PendingOutlined as PendingOutlinedIcon,
  PriorityHigh as PriorityHighOutlinedIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
}

/**
 * Campo de búsqueda estándar para módulos
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  sx = {}
}) => {
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{ color: 'text.secondary' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'background.paper',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        },
        ...sx
      }}
    />
  );
};

interface ActionButtonsProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  addLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Botones de acción estándar para tablas y listas
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onView,
  addLabel = "Agregar",
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  viewLabel = "Ver",
  canAdd = true,
  canEdit = true,
  canDelete = true,
  canView = false,
  size = 'small'
}) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {canAdd && onAdd && (
        <Button
          variant="contained"
          size={size}
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {addLabel}
        </Button>
      )}
      
      {canView && onView && (
        <Tooltip title={viewLabel}>
          <IconButton
            size={size}
            onClick={onView}
            sx={{
              color: 'info.main',
              '&:hover': {
                bgcolor: 'info.light',
                color: 'info.contrastText',
              },
            }}
          >
            <ViewIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      
      {canEdit && onEdit && (
        <Tooltip title={editLabel}>
          <IconButton
            size={size}
            onClick={onEdit}
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              },
            }}
          >
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      
      {canDelete && onDelete && (
        <Tooltip title={deleteLabel}>
          <IconButton
            size={size}
            onClick={onDelete}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

interface StatsDisplayProps {
  stats: Array<{
    label: string;
    value: number | string;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    icon?: React.ReactNode;
  }>;
  variant?: 'default' | 'enhanced';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Componente para mostrar estadísticas en formato moderno y profesional
 */
export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  stats, 
  variant = 'enhanced', 
  size = 'medium' 
}) => {
  // Determinar tamaños según la prop size
  const getFontSizes = () => {
    switch(size) {
      case 'small': return { value: '1.5rem', label: '0.9rem' };
      case 'large': return { value: '2.8rem', label: '0.9rem' };
      default: return { value: '2rem', label: '0.85rem' };
    }
  };
  
  const { value: valueSize, label: labelSize } = getFontSizes();
  
  if (variant === 'enhanced') {
    // Iconos utilizados para los diferentes tipos de estadísticas
    const getIcon = (label: string) => {
      switch(label.toLowerCase()) {
        case 'total':
        case 'total tareas': 
          return <AssignmentIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />;
        case 'completadas': 
          return <CheckCircleOutlineIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />;
        case 'pendientes': 
          return <PendingOutlinedIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />;
        case 'alta prioridad': 
          return <PriorityHighOutlinedIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />;
        default: 
          return <BarChartIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />;
      }
    };

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: 2, width: '100%' }}>
        {stats.map((stat, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              flexGrow: 1,
              flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' },
              height: { xs: '100px', sm: '110px' }, // Altura más compacta y formal
              border: '1px solid',
              borderColor: (theme: Theme) => `${theme.palette.divider}`,
              borderLeft: (theme: Theme) => `4px solid ${theme.palette[stat.color || 'primary'].main}`,
              borderRadius: '4px',
              display: 'flex',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 1,
                borderColor: (theme: Theme) => `${theme.palette[stat.color || 'primary'].main}`,
              },
            }}
          >
            {/* Contenido de la tarjeta de estadística */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'stretch',
                width: '100%'
              }}
            >
              {/* Icono a la izquierda */}
              <Box 
                sx={{ 
                  width: { xs: 45, sm: 55 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: (theme: Theme) => theme.palette[stat.color || 'primary'].main,
                  borderRight: '1px solid',
                  borderRightColor: 'divider',
                }}
              >
                {stat.icon || getIcon(stat.label)}
              </Box>
              
              {/* Contenido principal */}
              <Box 
                sx={{ 
                  flex: 1,
                  p: { xs: 1, sm: 2 },
                  pl: { xs: 1.5, sm: 2.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {/* Etiqueta encima del valor */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: labelSize,
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5,
                    display: 'block'
                  }}
                >
                  {stat.label}
                </Typography>
                
                {/* Valor grande */}
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: valueSize,
                    fontWeight: 600,
                    color: (theme: Theme) => theme.palette[stat.color || 'primary'].main,
                    lineHeight: 1
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }
  
  // Versión original (chips) como fallback
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {stats.map((stat, index) => (
        <Chip
          key={index}
          label={`${stat.label}: ${stat.value}`}
          color={stat.color || 'primary'}
          variant="outlined"
          size="small"
          sx={{
            fontWeight: 600,
            '& .MuiChip-label': {
              fontSize: '0.8rem',
            },
          }}
        />
      ))}
    </Stack>
  );
};

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Sección para organizar campos de formulario
 */
export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  sx = {} 
}) => {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
          fontSize: '1rem',
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
};

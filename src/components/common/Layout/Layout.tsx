import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Category as CatalogIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useAuth } from '../../../hooks/useAuth';
import { apiRequest } from '../../../services/apiClient';
import { useUserPermissions } from '../../../hooks/useUserPermissions';

const drawerWidth = 220;
const collapsedDrawerWidth = 56;

interface LayoutProps {
  children: React.ReactNode;
}

// Nuevo tipo para el módulo según el backend
interface BackendModule {
  id: number;
  name: string;
  code: string; // <-- Add code property
  description?: string;
  path: string;
  icon: string;
  order?: number;
}

// Tipo auxiliar para la posible respuesta del backend
interface BackendModulesResponse {
  data: BackendModule[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [moduleAnchorEl, setModuleAnchorEl] = useState<null | HTMLElement>(null);
  
  // Estado para los módulos dinámicos
  const [modules, setModules] = useState<BackendModule[] | null>(null);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);

  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const userPermissions = useUserPermissions();

  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  // Construir menuItems dinámicamente a partir de modules y permisos
  const menuItems = React.useMemo(() => {
    if (!modules) {
      return [];
    }
    const filtered = modules.filter((mod) => {
      if (!mod.code) {
        return false;
      }
      const perm = userPermissions[mod.code.toLowerCase()];
      return perm && perm.type !== 'None';
    });
    const sorted = filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const mapped = sorted.map((mod) => {
      // Icono dinámico robusto (case-insensitive, fallback)
      let menuIcon: React.ReactNode = <AssignmentIcon />;
      switch ((mod.icon || '').toLowerCase()) {
        case 'homeicon': menuIcon = <HomeIcon />; break;
        case 'assignmenticon': menuIcon = <AssignmentIcon />; break;
        case 'peopleicon': menuIcon = <SecurityIcon />; break;
        case 'securityicon': menuIcon = <SecurityIcon />; break;
        case 'catalogicon': menuIcon = <CatalogIcon />; break;
        case 'chevronlefticon': menuIcon = <ChevronLeftIcon />; break;
        case 'chevronrighticon': menuIcon = <ChevronRightIcon />; break;
        default: break;
      }
      // Force Admin Utilities path to '/admin/utils'
      let path = mod.path;
      if (mod.code && mod.code.toLowerCase() === 'admin_utils') {
        path = '/admin/utils';
      }
      return {
        text: mod.name,
        icon: menuIcon,
        path,
      };
    });
    return mapped;
  }, [modules, userPermissions]);

  // Agrupación de menú en 3 secciones (igual que antes, pero usando menuItems)
  const menuGroups = React.useMemo(() => {
    if (!menuItems.length) return [[], [], []];
    return [
      menuItems.filter(item => item.text === 'Home'),
      menuItems.filter(item => ['Tasks', 'Catalogs'].includes(item.text)),
      menuItems.filter(item => ['Users', 'Roles', 'Permisos', 'Admin Utilities'].includes(item.text)),
    ];
  }, [menuItems]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleModuleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setModuleAnchorEl(event.currentTarget);
  };

  const handleModuleMenuClose = () => {
    setModuleAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileClose();
  };

  const handleModuleChange = (path: string) => {
    navigate(path);
    handleModuleMenuClose();
  };

  const getCurrentModule = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem || menuItems[0];
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation items agrupados */}
      <List sx={{ flexGrow: 1, pt: 4.5, px: 0.5 }}>
        {menuGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            {group
              .filter(item => item) // adminOnly ya no existe
              .map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      minHeight: 36,
                      justifyContent: isCollapsed ? 'center' : 'initial',
                      px: isCollapsed ? 0.75 : 1.25,
                      mx: 0.5,
                      borderRadius: 1,
                      mb: 0.2,
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                      ...(location.pathname === item.path && {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isCollapsed ? 'auto' : 2,
                        justifyContent: 'center',
                        color: location.pathname === item.path ? 'primary.contrastText' : 'primary.main',
                        '& .MuiSvgIcon-root': {
                          fontSize: '1.3rem',
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: isCollapsed ? 0 : 1,
                        '& .MuiListItemText-primary': {
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            {/* Divider entre grupos, excepto el último */}
            {idx < menuGroups.length - 1 && <Divider sx={{ my: 1.5 }} />}
          </React.Fragment>
        ))}
      </List>

      {/* Collapse button - Siempre visible y más destacado */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: '50%',
          right: -12,
          zIndex: 9999,
          transform: 'translateY(-50%)',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <IconButton
          onClick={handleDrawerCollapse}
          size="small"
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            color: 'white',
            border: '0px solid',
            borderColor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            borderRadius: '50%',
            filter: 'drop-shadow(0px 0px 3px rgba(0, 120, 255, 0.4))', /* Efecto de resplandor azul */
            transition: theme.transitions.create(['background-color', 'transform', 'box-shadow', 'filter'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              bgcolor: 'primary.dark',
              color: 'white',
              transform: 'scale(1.15)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
              filter: 'drop-shadow(0px 0px 8px rgba(0, 120, 255, 0.6))',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.1rem',
              fontWeight: 'bold',
            },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Box>
  );

  React.useEffect(() => {
    setModulesLoading(true);
    apiRequest.get<BackendModule[] | BackendModulesResponse>('/Modules')
      .then((resp) => {
        let modulesArr: BackendModule[] | undefined;
        if (Array.isArray(resp)) {
          modulesArr = resp.filter((m: BackendModule) => m && m.path);
        } else if (resp && Array.isArray((resp as BackendModulesResponse).data)) {
          modulesArr = (resp as BackendModulesResponse).data.filter((m: BackendModule) => m && m.path);
        }
        if (modulesArr && modulesArr.length > 0) {
          setModules(modulesArr);
          setModulesError(null);
        } else {
          setModulesError('Respuesta inesperada del backend para los módulos.');
        }
      })
      .catch((err) => {
        setModulesError(err?.message || 'Error al cargar los módulos del menú.');
      })
      .finally(() => setModulesLoading(false));
  }, []);

  // Si los módulos están cargando o hay error, mostrar feedback en el drawer
  if (modulesLoading) {
    return (
      <Box sx={{ width: currentDrawerWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }
  if (modulesError) {
    return (
      <Box sx={{ width: currentDrawerWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'error.main', p: 2 }}>
        <Typography variant="body2">{modulesError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          left: 0,
          top: 0,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{
          minHeight: 52,
          display: 'flex',
          alignItems: 'center',
          px: 1.25,
          gap: { xs: 0, md: 1.25 },
        }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            size="small"
            sx={{ 
              display: { md: 'none' },
              mr: 1,
              '& .MuiSvgIcon-root': {
                fontSize: '1.3rem',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              boxShadow: 1,
              bgcolor: 'background.default',
              overflow: 'hidden',
              flexShrink: 0,
              mr: { xs: 0, md: 1.25 },
            }}
          >
            <img
              src={process.env.PUBLIC_URL + '/imgs/logo.png'}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              loading="eager"
            />
          </Box>
          
          {/* Project Name */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.1rem',
              letterSpacing: '0.15px',
              display: { xs: 'none', md: 'block' },
              flexShrink: 0,
            }}
          >
            System
          </Typography>

          {/* Breadcrumbs */}
          <Box  sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center',
            flex: 1,
            ml: { 
              sm: 4,
              md: isCollapsed ? 5.5 : 8
            },
            transition: theme.transitions.create(['margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
              <MuiLink
                component={Link}
                to="/"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary', 
                  textDecoration: 'none', 
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Home
              </MuiLink>
              {location.pathname.split('/').filter((x) => x).map((value, index) => {
                const pathSegments = location.pathname.split('/').filter((x) => x);
                const to = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const isLast = index === pathSegments.length - 1;
                
                // Show module selector for main module routes
                if (isLast && menuItems.some(item => item.path === location.pathname)) {
                  return (
                    <Box key={to} sx={{ position: 'relative' }}>
                      <Box
                        onClick={handleModuleMenuOpen}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          px: 0.75,
                          py: 0.375,
                          borderRadius: 0.75,
                          minHeight: 28,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <Box sx={{ mr: 0.75, color: 'primary.main', fontSize: '1.2rem' }}>
                          {getCurrentModule().icon}
                        </Box>
                        <Typography 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            color: 'text.primary',
                            mr: 0.5,
                            fontSize: '0.95rem',
                          }}
                        >
                          {getCurrentModule().text}
                        </Typography>
                        <Box sx={{ color: 'text.secondary', fontSize: '0.6rem', lineHeight: 1 }}>
                          ▼
                        </Box>
                      </Box>
                      
                      {/* Module dropdown menu */}
                      <Menu
                        anchorEl={moduleAnchorEl}
                        open={Boolean(moduleAnchorEl)}
                        onClose={handleModuleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        sx={{
                          mt: 0.5,
                          '& .MuiPaper-root': {
                            minWidth: 180,
                            boxShadow: 3,
                          }
                        }}
                      >
                        {menuItems.map((item) => (
                          <MenuItem
                            key={item.path}
                            onClick={() => handleModuleChange(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              py: 1,
                              px: 1.5,
                              minHeight: 40,
                              '&.Mui-selected': {
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                }
                              }
                            }}
                          >
                            <Box sx={{ mr: 1.5, color: location.pathname === item.path ? 'inherit' : 'primary.main', fontSize: '1.2rem' }}>
                              {item.icon}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                              {item.text}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  );
                }
                
                // Regular breadcrumb
                return (
                  <MuiLink
                    component={Link}
                    to={to}
                    key={to}
                    sx={{ 
                      color: 'text.secondary', 
                      textDecoration: 'none', 
                      textTransform: 'capitalize',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {value.replace(/-/g, ' ')}
                  </MuiLink>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Profile menu */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            ml: { xs: 'auto', md: 0 }
          }}>
            <Tooltip title="Profile menu">
              <IconButton
                size="medium"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                sx={{ 
                  color: 'primary.main',
                  p: 0.5,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            {/* Profile dropdown */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleProfileClose}
              sx={{
                mt: 1,
                '& .MuiPaper-root': {
                  minWidth: 200,
                  boxShadow: 3,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, pb: 1 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700, mr: 1.5, fontSize: '0.875rem' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
                    {user?.username || 'Usuario'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.2 }}>
                    {user?.email || 'correo@ejemplo.com'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleProfileClose} sx={{ py: 0.75, px: 1.5 }}>
                <Typography sx={{ fontSize: 14 }}>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleProfileClose} sx={{ py: 0.75, px: 1.5 }}>
                <Typography sx={{ fontSize: 14 }}>Settings</Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 0.75, px: 1.5 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Sign out
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: 52,
              height: 'calc(100% - 52px)',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              top: 52,
              height: 'calc(100% - 52px)',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 4,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { xs: 0, md: 0 },
          mt: '62px',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

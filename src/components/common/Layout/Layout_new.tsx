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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Category as CatalogIcon,
  People as PeopleIcon,
  AccountCircle,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useAuth } from '../../../hooks/useAuth';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [moduleAnchorEl, setModuleAnchorEl] = useState<null | HTMLElement>(null);
  
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);

  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  const menuItems = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/',
    },
    {
      text: 'Tasks',
      icon: <AssignmentIcon />,
      path: '/tasks',
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
    },
    {
      text: 'Catalogs',
      icon: <CatalogIcon />,
      path: '/catalogs',
    },
  ];

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
      {/* Logo and project name in sidebar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: isCollapsed ? 1 : 2,
          py: 2,
          minHeight: 64,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: 'white',
            mr: isCollapsed ? 0 : 2,
          }}
        >
          <img
            src={process.env.PUBLIC_URL + '/imgs/logo.png'}
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
        {!isCollapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'primary.contrastText',
            }}
          >
            React Admin
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Navigation items */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                minHeight: 48,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: 2.5,
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
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
                  mr: isCollapsed ? 'auto' : 3,
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.contrastText' : 'primary.main',
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
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Collapse button */}
      <Box sx={{ p: 1, display: { xs: 'none', md: 'block' } }}>
        <IconButton
          onClick={handleDrawerCollapse}
          sx={{
            width: '100%',
            borderRadius: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Box>
  );

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
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          gap: 2,
        }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
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
              borderRadius: 2,
              boxShadow: 1,
              bgcolor: 'background.default',
              overflow: 'hidden',
              flexShrink: 0,
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
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.1rem',
              letterSpacing: '0.5px',
              display: { xs: 'none', md: 'block' },
              flexShrink: 0,
            }}
          >
            React Admin
          </Typography>

          {/* Breadcrumbs */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center',
            flex: 1,
            ml: { 
              md: isCollapsed ? 2 : 4
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
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          minHeight: 32,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <Box sx={{ mr: 1, color: 'primary.main', fontSize: '1.1rem' }}>
                          {getCurrentModule().icon}
                        </Box>
                        <Typography 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            color: 'text.primary',
                            mr: 0.5
                          }}
                        >
                          {getCurrentModule().text}
                        </Typography>
                        <Box sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1 }}>
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
                              py: 1.5,
                              px: 2,
                              '&.Mui-selected': {
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                }
                              }
                            }}
                          >
                            <Box sx={{ mr: 2, color: location.pathname === item.path ? 'inherit' : 'primary.main' }}>
                              {item.icon}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Profile menu">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem' }}>
                  {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
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
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 700, mr: 2 }}>
                  {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>
                    {user?.username || 'Usuario'}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.2 }}>
                    {user?.email || 'correo@ejemplo.com'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleProfileClose}>
                <Typography sx={{ fontSize: 14 }}>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleProfileClose}>
                <Typography sx={{ fontSize: 14 }}>Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
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
              top: 64,
              height: 'calc(100% - 64px)',
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
              top: 64,
              height: 'calc(100% - 64px)',
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
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { xs: 0, md: 0 },
          mt: '64px',
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

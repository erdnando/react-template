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
import { Link, useLocation } from 'react-router-dom';
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
  const theme = useTheme();
  const location = useLocation();
  const { logout } = useAuth();
  
  const { user } = useSelector((state: RootState) => state.auth);

  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

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

  const handleLogout = async () => {
    await logout();
    setAnchorEl(null);
    // No need to navigate - AuthGuard will handle redirect
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Catalogs', icon: <CatalogIcon />, path: '/catalogs' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' }, 
  ];

  // Drawer for mobile (always expanded)
  const mobileDrawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Drawer for desktop (collapsible)
  const desktopDrawer = (
    <Box>
      <Toolbar>
        {isCollapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <IconButton onClick={handleDrawerCollapse} color="primary">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6" noWrap component="div">
              
            </Typography>
            <IconButton onClick={handleDrawerCollapse} color="primary">
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={isCollapsed ? item.text : ''} placement="right">
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 'auto' : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
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
          px: { xs: 2, sm: 3 },
        }}>
          {/* Left section: Mobile menu button + Logo + Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Mobile menu button - only visible on mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo */}
            <Box
              sx={{
                width: 40,
                height: 40,
                mr: 3,
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
            
            {/* Breadcrumbs - always visible on desktop, hidden on mobile */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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
                  
                  return isLast ? (
                    <Typography 
                      color="text.primary" 
                      key={to} 
                      sx={{ 
                        textTransform: 'capitalize',
                        fontWeight: 600
                      }}
                    >
                      {value.replace(/-/g, ' ')}
                    </Typography>
                  ) : (
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
          </Box>

          {/* Right section: Profile menu */}
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
            
            {/* Profile dropdown menu */}
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
      {/* Sidebar (Drawer) fixed below topbar */}
      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: 64, // Height of AppBar
            },
          }}
        >
          {mobileDrawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              top: 64, // Height of AppBar
              height: 'calc(100% - 64px)',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              position: 'fixed',
            },
          }}
          open
        >
          {desktopDrawer}
        </Drawer>
      </Box>
      {/* Main content area with correct padding */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 11, // 64px AppBar + 24px default padding
          width: '100%',
          ml: { md: `${currentDrawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
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
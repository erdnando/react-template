import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import store from './store/store';
import AuthGuard from './components/common/AuthGuard/AuthGuard';
import AuthLayout from './components/common/AuthLayout/AuthLayout';
import AppLayout from './components/common/AppLayout/AppLayout';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

import './styles/globals.css';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { UserPermissionsProvider, UserPermissions } from './store/UserPermissionsContext';
import { permissionsService, PermissionType } from './services/permissionsApiService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppWithPermissions: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loadingPerms, setLoadingPerms] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user && user.id) {
        setLoadingPerms(true);
        try {
          const resp = await permissionsService.getUserModulePermissionsMap(Number(user.id));
          if (resp.success && resp.data) {
            // Map response from backend (object: moduleCode -> permissionType)
            const perms: UserPermissions = {};
            Object.entries(resp.data).forEach(([moduleCode, permType]) => {
              let type: 'None' | 'ReadOnly' | 'Edit' = 'None';
              if (permType === PermissionType.Write || permType === PermissionType.Admin) type = 'Edit';
              else if (permType === PermissionType.Read) type = 'ReadOnly';
              perms[moduleCode.toLowerCase()] = { enabled: permType !== PermissionType.None, type };
            });
            setPermissions(perms);
          } else {
            console.warn('Permissions API returned no data or not success:', resp);
            setPermissions({});
          }
        } catch (e) {
          console.error('Error fetching permissions:', e);
          setPermissions({});
        } finally {
          setLoadingPerms(false);
        }
      } else {
        setPermissions({});
      }
    };
    fetchPermissions();
  }, [user]);

  // Expose a refreshPermissions function to children
  const refreshPermissions = async () => {
    if (user && user.id) {
      setLoadingPerms(true);
      try {
        const resp = await permissionsService.getUserModulePermissionsMap(Number(user.id));
        if (resp.success && resp.data) {
          const perms: UserPermissions = {};
          Object.entries(resp.data).forEach(([moduleCode, permType]) => {
            let type: 'None' | 'ReadOnly' | 'Edit' = 'None';
            if (permType === PermissionType.Write || permType === PermissionType.Admin) type = 'Edit';
            else if (permType === PermissionType.Read) type = 'ReadOnly';
            perms[moduleCode.toLowerCase()] = { enabled: permType !== PermissionType.None, type };
          });
          setPermissions(perms);
        } else {
          setPermissions({});
        }
      } catch (e) {
        setPermissions({});
      } finally {
        setLoadingPerms(false);
      }
    } else {
      setPermissions({});
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router 
        future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* API Test route - temporary for testing backend connection */}

          {/* Public routes - No authentication required */}
          <Route path="/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />
          <Route path="/forgot-password" element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          } />
          <Route path="/reset-password" element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          } />
          {/* Protected routes - Authentication required */}
          <Route path="/*" element={
            <AuthGuard
              fallback={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              }
            >
              {loadingPerms ? (
                <div style={{ padding: 40, textAlign: 'center' }}>Loading permissions...</div>
              ) : (
                <UserPermissionsProvider permissions={permissions}>
                  <AppLayout refreshPermissions={refreshPermissions} />
                </UserPermissionsProvider>
              )}
            </AuthGuard>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppWithPermissions />
    </Provider>
  );
};

export default App;
import React from 'react';
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
import { ApiTest } from './components/ApiTest';
import './styles/globals.css';

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

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* API Test route - temporary for testing backend connection */}
            <Route path="/api-test" element={<ApiTest />} />
            
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
                <AppLayout />
              </AuthGuard>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import store from './store/store';
import AuthGuard from './components/common/AuthGuard/AuthGuard';
import AuthLayout from './components/common/AuthLayout/AuthLayout';
import AppLayout from './components/common/AppLayout/AppLayout';
import Login from './pages/Login/Login';
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
        <AuthGuard
          fallback={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        >
          <AppLayout />
        </AuthGuard>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  CircularProgress,
  Link,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    console.log('Login: Form submitted with data:', { email, password: '***' });
    
    try {
      console.log('Login: About to call login function...');
      const result = await login(email, password);
      console.log('Login: Login function completed successfully:', result);
      
      // Redireccionar al home después de login exitoso
      navigate('/');
    } catch (error: unknown) {
      console.error('Login: Error occurred during login:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.log('Login: Setting error message:', errorMessage);
      setLocalError(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    // Solo permitir navegar a forgot-password si hay un email ingresado
    if (!email.trim()) {
      setLocalError('Please enter your email address first to reset your password.');
      return;
    }
    
    // Navegar a forgot-password pasando el email en el estado
    navigate('/forgot-password', { 
      state: { email: email.trim() } 
    });
  };

  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 48, height: 48 }}>
        <LockOutlinedIcon sx={{ fontSize: '1.5rem' }} />
      </Avatar>
      
      <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Welcome Back
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" paragraph>
        Please sign in to your account
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || error}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          variant="outlined"
          size="small"
          inputProps={{ maxLength: 254 }}
          helperText="Enter your email address (max 254 characters)"
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          variant="outlined"
          size="small"
          inputProps={{ maxLength: 128 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ 
            mt: 2.5, 
            mb: 2, 
            height: 42,
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sign In'
          )}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Link 
            component="button" 
            type="button"
            onClick={handleForgotPassword}
            variant="body2" 
            sx={{ 
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Forgot your password? <strong>Reset Password</strong>
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default Login;
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
  Divider,
  Chip,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    try {
      await login(email, password);
      // No need to navigate - the AuthGuard will handle the redirect
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setLocalError(errorMessage);
    }
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

        <Divider sx={{ my: 3 }}>
          <Chip 
            label="Demo Credentials" 
            size="small" 
            variant="outlined"
            color="primary"
          />
        </Divider>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Demo Login:</strong><br />
            Email: demo@example.com<br />
            Password: demo123
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Link href="/register" variant="body2" sx={{ textDecoration: 'none' }}>
            Don&apos;t have an account? <strong>Sign Up</strong>
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default Login;
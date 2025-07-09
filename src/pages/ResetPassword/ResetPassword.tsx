import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { 
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { authService } from '../../services/authApiService';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setTokenFromUrl(urlToken);
      setIsValidating(false);
    } else {
      setError('Invalid reset link. Please check your email for the correct reset link.');
      setIsValidating(false);
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Please use the reset link from your email to reset your password.' }
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  // Validate strong password: min 8 chars, uppercase, lowercase, number, special char
  const validatePassword = (password: string): boolean => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tokenFromUrl) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.resetPassword({ token: tokenFromUrl, newPassword, confirmPassword });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { state: { message: 'Password reset successful! You can now sign in with your new password.' } });
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 48, height: 48 }}>
          <CircularProgress size={24} color="inherit" />
        </Avatar>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Validating Reset Link
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" paragraph>
          Please wait while we validate your password reset link...
        </Typography>
      </>
    );
  }

  if (!tokenFromUrl && error) {
    return (
      <>
        <Avatar sx={{ m: 1, bgcolor: 'error.main', width: 48, height: 48 }}>
          <LockResetIcon sx={{ fontSize: '1.5rem' }} />
        </Avatar>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Invalid Reset Link
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" paragraph>
          This password reset link is invalid or has expired.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <Button fullWidth variant="contained" href="/forgot-password" size="large" sx={{ mt: 2, mb: 2 }}>
          Request New Reset Link
        </Button>
        <Link href="/login" variant="body2" sx={{ mt: 2 }}>Back to Sign In</Link>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Avatar sx={{ m: 1, bgcolor: 'success.main', width: 48, height: 48 }}>
          <LockResetIcon sx={{ fontSize: '1.5rem' }} />
        </Avatar>
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Password Reset Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" paragraph>
          Your password has been successfully updated.
        </Typography>
        <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
          Redirecting to login...
        </Alert>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">Redirecting in a few seconds...</Typography>
        </Box>
        <Link href="/login" variant="body2">Go to Sign In now</Link>
      </>
    );
  }

  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 48, height: 48 }}>
        <LockResetIcon sx={{ fontSize: '1.5rem' }} />
      </Avatar>
      <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Reset Your Password
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" paragraph>
        Enter your new password below
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="New Password"
          type="password"
          id="newPassword"
          autoComplete="new-password"
          autoFocus
          value={newPassword}
          onChange={(e) => {
            const val = e.target.value;
            setNewPassword(val);
            if (!validatePassword(val)) {
              setPasswordError('Too weak: include uppercase, lowercase, number, special char.');
            } else {
              setPasswordError(null);
            }
            // Also validate confirmation
            if (confirmPassword && val !== confirmPassword) {
              setConfirmError('Passwords do not match.');
            } else {
              setConfirmError(null);
            }
          }}
          disabled={loading}
          variant="outlined"
          size="small"
          inputProps={{ minLength: 8, maxLength: 100 }}
          error={!!passwordError}
          helperText={passwordError || 'At least 8 chars, uppercase, lowercase, number & special char'}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            const val = e.target.value;
            setConfirmPassword(val);
            if (newPassword && val !== newPassword) {
              setConfirmError('Passwords do not match.');
            } else {
              setConfirmError(null);
            }
          }}
          disabled={loading}
          variant="outlined"
          size="small"
          inputProps={{ minLength: 8, maxLength: 100 }}
          error={!!confirmError}
          helperText={confirmError || 'Re-enter password'}
        />
        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
          {loading ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Resetting Password...</> : 'Reset Password'}
        </Button>
        <Box sx={{ textAlign: 'center' }}><Link href="/login" variant="body2">Back to Sign In</Link></Box>
      </Box>
    </>
  );
};

export default ResetPassword;
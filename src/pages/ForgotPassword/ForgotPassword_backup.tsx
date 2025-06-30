import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  CircularProgress,
  Link,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import { authService } from '../../services/authApiService';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(0); // 0: request reset, 1: enter token and new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Precargar email del usuario logueado o usar un email de ejemplo
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.email) {
      setEmail(currentUser.email);
    } else {
      // Email de ejemplo basado en el dominio o usar admin@sistema.com por defecto
      setEmail('admin@sistema.com');
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      if (response.success) {
        setSuccess('Password reset instructions have been sent to your email. Check your inbox and click the link to reset your password.');
        setStep(1);
      } else {
        setError(response.message || 'Failed to send reset instructions');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // ✅ Arquitectura superior: Solo token, newPassword y confirmPassword
      const response = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword, // Agregado para validación doble en el backend
      });
      
      if (response.success) {
        setSuccess('Password has been reset successfully! You can now login with your new password.');
        // Reset form
        setStep(0);
        setEmail('');
        setToken('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Request Reset', 'Reset Password'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#ffffff', // Fondo completamente blanco
        p: 3,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 460,
          borderRadius: 3,
          border: '1px solid #e0e0e0',
          bgcolor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              m: 1, 
              bgcolor: step === 0 ? '#6366f1' : '#10b981', 
              width: 56, 
              height: 56,
              mb: 2
            }}
          >
            {step === 0 ? <EmailIcon sx={{ fontSize: '1.8rem' }} /> : <LockIcon sx={{ fontSize: '1.8rem' }} />}
          </Avatar>
          
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: '#1f2937',
              textAlign: 'center',
              mb: 1
            }}
          >
            {step === 0 ? 'Forgot Password?' : 'Reset Password'}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ 
              fontSize: '0.95rem',
              lineHeight: 1.5,
              maxWidth: 320
            }}
          >
            {step === 0 
              ? 'No worries! Enter your email and we\'ll send you reset instructions.'
              : 'Check your email for a reset link, or enter the token manually below along with your new password.'
            }
          </Typography>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.9rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.9rem'
              }
            }}
          >
            {success}
          </Alert>
        )}

        {step === 0 ? (
          <Box component="form" onSubmit={handleRequestReset} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                readOnly: true, // Campo de solo lectura
              }}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  '&.Mui-focused': {
                    color: '#6366f1',
                  },
                },
              }}
              helperText="This email address is associated with your account"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                mb: 3, 
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: '#6366f1',
                '&:hover': {
                  bgcolor: '#5855eb',
                },
                '&:disabled': {
                  bgcolor: '#9ca3af',
                },
                textTransform: 'none',
                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
              }}
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Send Reset Instructions'
              )}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="token"
              label="Reset Token"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  '&.Mui-focused': {
                    color: '#6366f1',
                  },
                },
              }}
              helperText="Enter the reset token from your email"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  '&.Mui-focused': {
                    color: '#6366f1',
                  },
                },
              }}
              helperText="At least 8 characters"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  '&.Mui-focused': {
                    color: '#6366f1',
                  },
                },
              }}
              helperText="Re-enter your new password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mb: 2, 
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: '#10b981',
                '&:hover': {
                  bgcolor: '#059669',
                },
                '&:disabled': {
                  bgcolor: '#9ca3af',
                },
                textTransform: 'none',
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
              }}
              disabled={loading || !token.trim() || !newPassword.trim() || !confirmPassword.trim()}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setStep(0)}
              disabled={loading}
              sx={{ 
                mb: 1,
                color: '#6b7280',
                '&:hover': {
                  bgcolor: '#f3f4f6',
                },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Back to Email Step
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Link 
            href="/login" 
            variant="body2" 
            sx={{ 
              textDecoration: 'none',
              color: '#6366f1',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Remember your password? <strong>Sign In</strong>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;

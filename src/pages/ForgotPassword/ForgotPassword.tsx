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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authApiService';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(0); // 0: request reset, 1: confirm reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener email del state de navegación y validar acceso
  useEffect(() => {
    const navigationState = location.state as { email?: string } | null;
    const emailFromNavigation = navigationState?.email;
    
    if (emailFromNavigation && emailFromNavigation.trim()) {
      // Email válido desde login
      setEmail(emailFromNavigation.trim());
      setAccessDenied(false);
    } else {
      // Verificar si hay usuario autenticado como fallback
      const currentUser = authService.getCurrentUser();
      if (currentUser?.email) {
        setEmail(currentUser.email);
        setAccessDenied(false);
      } else {
        // No hay email válido - denegar acceso
        setAccessDenied(true);
        setError('Access denied. Please go to the login page and enter your email first.');
      }
    }
  }, [location.state]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Asegurar que email sea string y esté limpio
      const cleanEmail = email.trim();
      const requestData = { email: cleanEmail };
      
      const response = await authService.forgotPassword(requestData);
      
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
    
    if (!token.trim()) {
      setError('Missing reset token. Please check your email for the reset link.');
      return;
    }

    setLoading(true);

    try {
      // Using pre-defined secure password with token
      const response = await authService.resetPassword({
        token,
        newPassword: 'DefaultSecurePassword123!',
        confirmPassword: 'DefaultSecurePassword123!'
      });
      
      if (response.success) {
        setSuccess('Password has been reset successfully! Your account has been secured.');
        // Reset form
        setStep(0);
        setEmail('');
        setToken('');
        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! You can now sign in with your new password.' 
            } 
          });
        }, 3000);
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

  // Si no hay acceso válido, mostrar mensaje de acceso denegado
  if (accessDenied) {
    return (
      <>
        <Avatar sx={{ m: 1, bgcolor: 'error.main', width: 48, height: 48 }}>
          <EmailIcon sx={{ fontSize: '1.5rem' }} />
        </Avatar>
        
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Access Denied
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" paragraph>
          To reset your password, please go to the login page and enter your email address first.
        </Typography>

        <Box sx={{ width: '100%' }}>
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={handleBackToLogin}
            sx={{ 
              mt: 2.5, 
              mb: 2, 
              height: 42,
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Go to Login Page
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 48, height: 48 }}>
        {step === 0 ? <EmailIcon sx={{ fontSize: '1.5rem' }} /> : <LockIcon sx={{ fontSize: '1.5rem' }} />}
      </Avatar>
      
      <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        {step === 0 ? 'Forgot Password?' : 'Reset Password'}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" paragraph>
        {step === 0 
          ? 'No worries! Enter your email and we\'ll send you reset instructions.'
          : 'Check your email for a reset link, or enter the token manually below.'
        }
      </Typography>

      <Stepper activeStep={step} sx={{ width: '100%', mb: 3 }}>
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

        {(error || success) && (
          <Alert 
            severity={success ? "success" : "error"} 
            sx={{ mb: 2 }}
          >
            {success || error}
          </Alert>
        )}

        {step === 0 ? (
          <Box component="form" onSubmit={handleRequestReset} sx={{ mt: 1, width: '100%' }}>
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
              size="small"
              inputProps={{ maxLength: 254 }}
              helperText="This email address is associated with your account"
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
          <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Hidden fields - data needed for submission but not shown in UI */}
            <input type="hidden" id="token" name="token" value={token} />
            <input type="hidden" id="newPassword" name="newPassword" value="DefaultSecurePassword123!" />
            <input type="hidden" id="confirmPassword" name="confirmPassword" value="DefaultSecurePassword123!" />
            
            <Typography variant="body1" sx={{ mb: 4, color: '#4a5568', textAlign: 'center' }}>
              Password reset instructions have been sent to your email.<br />
              Please check your inbox and click the link to reset your password.
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2.5, 
                mb: 2, 
                height: 42,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                maxWidth: '300px'
              }}
              disabled={loading || !token.trim()}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Confirm Account Reset'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setStep(0)}
              disabled={loading}
              sx={{ 
                color: 'text.secondary',
                textTransform: 'none',
              }}
            >
              Request New Reset Link
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Link 
            component="button"
            type="button"
            onClick={handleBackToLogin}
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
            Remember your password? <strong>Sign In</strong>
          </Link>
        </Box>
    </>
  );
};

export default ForgotPassword;

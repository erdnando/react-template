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
  Container,
  Card,
  CardContent,
  Fade,
  LinearProgress,
  IconButton,
  InputAdornment,
  Chip,
  alpha,
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ErrorOutline as ErrorIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { authService } from '../../services/authApiService';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) score++;
    });

    return { score, checks };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const getStrengthColor = (score: number) => {
    if (score <= 2) return '#f44336';
    if (score <= 3) return '#ff9800';
    if (score <= 4) return '#4caf50';
    return '#2e7d32';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Strong';
    return 'Very Strong';
  };

  useEffect(() => {
    // Extraer token de la URL
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      // Token encontrado en la URL - usuario llegó desde el enlace del email
      setToken(urlToken);
      setTokenFromUrl(urlToken);
      setIsValidating(false);
    } else {
      // No hay token en la URL - acceso inválido
      setError('Invalid reset link. Please check your email for the correct reset link.');
      setIsValidating(false);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Please use the reset link from your email to reset your password.' 
          } 
        });
      }, 3000);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    // Asegurar que tenemos el token (debe estar presente si llegamos aquí)
    const resetToken = tokenFromUrl || token;
    if (!resetToken) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);

    try {
      // Usar el token extraído de la URL
      const response = await authService.resetPassword({
        token: resetToken,
        newPassword,
        confirmPassword,
      });
      
      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! You can now sign in with your new password.' 
            } 
          });
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Shared styles for text fields
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.3)',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,1)',
        border: '1px solid rgba(102, 126, 234, 0.5)',
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255,255,255,1)',
        border: '1px solid #667eea',
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
      }
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#667eea',
      fontWeight: 600,
    },
    '& .MuiFormHelperText-root': {
      marginTop: 8,
      fontWeight: 500,
    }
  };

  // Mostrar estado de carga mientras se valida el token
  if (isValidating) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, bgcolor: '#fff' }}>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#667eea' }} />
          <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
            Validating reset link...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state - token inválido o no presente
  if (!tokenFromUrl && error) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, bgcolor: '#fff' }}>
        <Fade in timeout={1000}>
          <Card 
            elevation={24}
            sx={{
              width: '100%',
              borderRadius: 6,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ff5252 0%, #f44336 50%, #d32f2f 100%)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(255,255,255,0.05) 0%, transparent 50%)
                `,
                zIndex: 1,
              }
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Avatar sx={{ 
                m: '0 auto 32px',
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(20px)',
                width: 100, 
                height: 100,
                border: '3px solid rgba(255,255,255,0.3)',
                transition: 'all 0.6s ease',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(255,255,255,0.4)',
                  },
                  '70%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 0 10px rgba(255,255,255,0)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                  },
                }
              }}>
                <ErrorIcon sx={{ fontSize: '3rem', color: '#fff' }} />
              </Avatar>
              
              <Typography component="h1" variant="h3" gutterBottom sx={{ 
                fontWeight: 800,
                color: '#fff',
                mb: 4,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                letterSpacing: '-0.5px'
              }}>
                Invalid Reset Link
              </Typography>
              
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  '& .MuiAlert-icon': {
                    color: '#fff',
                    fontSize: '1.5rem'
                  },
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                {error || 'This password reset link is invalid or has expired.'}
              </Alert>

              <Button
                fullWidth
                variant="contained"
                href="/forgot-password"
                size="large"
                sx={{ 
                  mb: 3,
                  height: 64,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.3)',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                  }
                }}
              >
                Request New Reset Link
              </Button>

              <Link href="/login" variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#fff',
                  textDecoration: 'underline',
                  textDecorationThickness: '2px',
                }
              }}>
                Back to Sign In
              </Link>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, bgcolor: '#fff' }}>
        <Fade in timeout={1000}>
          <Card 
            elevation={24}
            sx={{
              width: '100%',
              borderRadius: 6,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 50%, #388e3c 100%)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 50% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
                `,
                zIndex: 1,
              }
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Avatar sx={{ 
                m: '0 auto 32px',
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(20px)',
                width: 100, 
                height: 100,
                border: '3px solid rgba(255,255,255,0.3)',
                transition: 'all 0.6s ease',
                animation: 'successPulse 2s ease-in-out infinite',
                '@keyframes successPulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)',
                  },
                  '70%': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 0 15px rgba(76, 175, 80, 0)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                  },
                }
              }}>
                <CheckCircleIcon sx={{ fontSize: '3rem', color: '#fff' }} />
              </Avatar>
              
              <Typography component="h1" variant="h3" gutterBottom sx={{ 
                fontWeight: 800,
                color: '#fff',
                mb: 4,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                letterSpacing: '-0.5px'
              }}>
                Password Reset Successful!
              </Typography>
              
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 4,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  '& .MuiAlert-icon': {
                    color: '#fff',
                    fontSize: '1.5rem'
                  },
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                Your password has been successfully updated. Redirecting to login...
              </Alert>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 3,
                mb: 4 
              }}>
                <CircularProgress 
                  size={48} 
                  thickness={4}
                  sx={{ 
                    color: '#fff',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }} 
                />
                
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.95)', 
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.5
                }}>
                  You will be redirected to the login page in a few seconds.
                </Typography>
              </Box>

              <Link href="/login" variant="body1" sx={{ 
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: 3,
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                }
              }}>
                Go to Sign In now
              </Link>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    );
  }

  // Main form
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, bgcolor: '#fff' }}>
      <Fade in timeout={1000}>
        <Card 
          elevation={3}
          sx={{
            width: '100%',
            borderRadius: 6,
            overflow: 'hidden',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.12)',
            position: 'relative',
          }}
        >
          {loading && (
            <LinearProgress 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                zIndex: 3,
                height: 4,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4fc3f7, #29b6f6, #03a9f4)'
                }
              }} 
            />
          )}
          
          <CardContent sx={{ p: 6, position: 'relative', zIndex: 2 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Avatar 
                sx={{ 
                  m: '0 auto 32px',
                  bgcolor: '#667eea',
                  width: 100, 
                  height: 100,
                  border: '3px solid rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.6s ease',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': {
                      transform: 'translateY(0px) rotate(0deg)',
                    },
                    '50%': {
                      transform: 'translateY(-10px) rotate(5deg)',
                    },
                    '100%': {
                      transform: 'translateY(0px) rotate(0deg)',
                    },
                  },
                  '&:hover': {
                    transform: 'scale(1.1) rotate(10deg)',
                    bgcolor: '#5a67d8',
                    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
                  }
                }}
              >
                <SecurityIcon sx={{ fontSize: '3rem', color: '#fff' }} />
              </Avatar>
              
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  color: '#2d3748',
                  mb: 2,
                  letterSpacing: '-0.5px'
                }}
              >
                Reset Your Password
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#4a5568',
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  maxWidth: 450,
                  mx: 'auto',
                  fontWeight: 400
                }}
              >
                Enter your new password below. Make sure it&apos;s secure and at least 8 characters long.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: '#d32f2f',
                    fontSize: '1.1rem',
                    '& .MuiAlert-icon': {
                      color: '#d32f2f',
                      fontSize: '1.5rem'
                    },
                    '& .MuiAlert-message': {
                      fontWeight: 500
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 5,
                backgroundColor: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(30px)',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                variant="outlined"
                autoFocus
                sx={{ mb: 2, ...textFieldStyles }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: alpha('#667eea', 0.1),
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Strength Indicator */}
              {newPassword && (
                <Fade in>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                        Password Strength
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700, 
                          color: getStrengthColor(passwordStrength.score)
                        }}
                      >
                        {getStrengthText(passwordStrength.score)}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 5) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(getStrengthColor(passwordStrength.score), 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: getStrengthColor(passwordStrength.score),
                          transition: 'all 0.3s ease',
                        },
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                        <Chip
                          key={key}
                          label={
                            key === 'length' ? '8+ chars' :
                            key === 'uppercase' ? 'A-Z' :
                            key === 'lowercase' ? 'a-z' :
                            key === 'numbers' ? '0-9' :
                            'Special'
                          }
                          size="small"
                          icon={passed ? <CheckIcon /> : <CloseIcon />}
                          sx={{
                            backgroundColor: passed ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                            color: passed ? '#4caf50' : '#f44336',
                            border: `1px solid ${passed ? alpha('#4caf50', 0.3) : alpha('#f44336', 0.3)}`,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: passed ? '#4caf50' : '#f44336',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                variant="outlined"
                error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                sx={{ mb: 5, ...textFieldStyles }}
                helperText={
                  confirmPassword.length > 0 && newPassword !== confirmPassword 
                    ? "Passwords don't match" 
                    : "Re-enter your new password"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: alpha('#667eea', 0.1),
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword || passwordStrength.score < 3}
                sx={{ 
                  height: 64,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 45px rgba(76, 175, 80, 0.6)',
                    background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 50%, #66bb6a 100%)',
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)',
                    color: 'rgba(255,255,255,0.6)',
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={28} color="inherit" />
                    <span>Resetting Password...</span>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShieldIcon sx={{ fontSize: '1.5rem' }} />
                    <span>Reset Password</span>
                  </Box>
                )}
              </Button>
            </Box>

            {/* Footer Link */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Link 
                href="/login" 
                variant="body1"
                sx={{ 
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  padding: '12px 24px',
                  borderRadius: 3,
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                  '&:hover': {
                    color: '#5a67d8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    border: '2px solid rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                  }
                }}
              >
                Back to Sign In
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default ResetPassword;

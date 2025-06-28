import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert 
} from '@mui/material';

const MockLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleMockLogin = () => {
    if (email && password) {
      setMessage(`Mock login successful for: ${email}`);
    } else {
      setMessage('Please enter both email and password');
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Mock Login Component
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button
          fullWidth
          variant="contained"
          onClick={handleMockLogin}
          sx={{ mb: 2 }}
        >
          Mock Login
        </Button>
        
        {message && (
          <Alert severity={message.includes('successful') ? 'success' : 'error'}>
            {message}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default MockLogin;

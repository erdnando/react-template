import React from 'react';
import { Typography, Paper } from '@mui/material';

const DebugAuth: React.FC = () => {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Debug Auth Component
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This component is for debugging authentication. Implementation pending.
      </Typography>
    </Paper>
  );
};

export default DebugAuth;

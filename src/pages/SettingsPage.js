import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Settings
      </Typography>
      <Alert severity="info">Settings page placeholder.</Alert>
    </Box>
  );
};

export default SettingsPage;

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const UsersPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Users
      </Typography>
      <Alert severity="info">
        Users UI is next. Backend endpoint: GET /api/users (admin-only).
      </Alert>
    </Box>
  );
};

export default UsersPage;

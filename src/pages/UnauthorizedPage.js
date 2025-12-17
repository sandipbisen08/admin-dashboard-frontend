import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Unauthorized
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        You don’t have permission to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Go to Dashboard</Button>
    </Box>
  );
};

export default UnauthorizedPage;

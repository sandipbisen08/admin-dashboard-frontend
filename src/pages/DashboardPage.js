import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const StatCard = ({ title, value }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
};

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Users" value="-" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Sessions" value="-" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Errors" value="-" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Uptime" value="-" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

/**
 * Dashboard Page Component
 * Main dashboard for authenticated users
 * Created: July 6, 2025
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          User not found. Please log in again.
        </Typography>
      </Box>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Welcome back, {user.firstName}!
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* User Info Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{ width: 60, height: 60, mr: 2 }}
                  src={user.avatar}
                >
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={user.roles?.[0] || 'User'}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                  color={user.isEmailVerified ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Tasks
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No recent activity. Start by creating your first task!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 2 }}
            >
              Create Task
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{ py: 2 }}
            >
              View Projects
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{ py: 2 }}
            >
              Team Members
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{ py: 2 }}
            >
              Settings
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage; 
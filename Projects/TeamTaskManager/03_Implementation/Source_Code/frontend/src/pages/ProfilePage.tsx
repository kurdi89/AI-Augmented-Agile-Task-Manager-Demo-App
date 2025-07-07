// Team Task Manager - Profile Page
// Sprint 1: User profile management component
// Created: July 6, 2025

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  Divider,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .required('Last name is required'),
  displayName: Yup.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .required('Display name is required'),
  bio: Yup.string()
    .max(500, 'Bio must be less than 500 characters'),
  location: Yup.string()
    .max(100, 'Location must be less than 100 characters'),
  website: Yup.string()
    .url('Please enter a valid URL')
    .max(200, 'Website URL must be less than 200 characters'),
});

const ProfilePage: React.FC = () => {
  const { user, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<string>('');

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setUpdateLoading(true);
        setUpdateError('');
        setUpdateSuccess('');
        
        await updateProfile(values);
        setUpdateSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess('');
        }, 3000);
        
      } catch (error: any) {
        setUpdateError(error.response?.data?.message || 'Failed to update profile. Please try again.');
      } finally {
        setUpdateLoading(false);
      }
    },
  });

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Profile
        </Typography>
        <Button
          variant={isEditing ? "outlined" : "contained"}
          onClick={() => setIsEditing(!isEditing)}
          disabled={updateLoading}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      {/* Alerts */}
      {updateError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateError}
        </Alert>
      )}

      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {updateSuccess}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                src={user.profilePicture}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.displayName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={user.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                  color={user.isEmailVerified ? 'success' : 'warning'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={user.roles?.[0] || 'User'}
                  color="primary"
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              
              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      disabled={!isEditing || updateLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      disabled={!isEditing || updateLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="displayName"
                      name="displayName"
                      label="Display Name"
                      value={formik.values.displayName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.displayName && Boolean(formik.errors.displayName)}
                      helperText={formik.touched.displayName && formik.errors.displayName}
                      disabled={!isEditing || updateLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="bio"
                      name="bio"
                      label="Bio"
                      multiline
                      rows={3}
                      value={formik.values.bio}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.bio && Boolean(formik.errors.bio)}
                      helperText={formik.touched.bio && formik.errors.bio}
                      disabled={!isEditing || updateLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="location"
                      name="location"
                      label="Location"
                      value={formik.values.location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.location && Boolean(formik.errors.location)}
                      helperText={formik.touched.location && formik.errors.location}
                      disabled={!isEditing || updateLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="website"
                      name="website"
                      label="Website"
                      value={formik.values.website}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.website && Boolean(formik.errors.website)}
                      helperText={formik.touched.website && formik.errors.website}
                      disabled={!isEditing || updateLoading}
                    />
                  </Grid>
                </Grid>
                
                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateLoading || !formik.isValid}
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        formik.resetForm();
                      }}
                      disabled={updateLoading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage; 
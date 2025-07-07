// Team Task Manager - Reset Password Page
// Sprint 1: Password reset confirmation component
// Created: July 6, 2025

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema
const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmResetPassword } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('No reset token provided');
      return;
    }
    setToken(resetToken);
  }, [searchParams]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        setError('No reset token available');
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        await confirmResetPassword(token, values.password);
        setSuccess('Password reset successfully! You can now log in with your new password.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Password reset failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  if (!token && !error) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ width: '100%', maxWidth: 500 }}>
            <Card>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Loading...
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 500 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Reset Password
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enter your new password below
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="New Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  disabled={loading}
                  required
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !formik.isValid}
                  sx={{ mb: 3 }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage; 
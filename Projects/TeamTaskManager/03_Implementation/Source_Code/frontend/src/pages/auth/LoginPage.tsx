/**
 * Login Page Component
 * User authentication login form with validation
 * Created: July 6, 2025
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  rememberMe: Yup.boolean()
});

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await login(values.email, values.password);
      
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to intended page or dashboard
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Signing you in..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          borderRadius: 2
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your Team Task Manager account
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Login Form */}
        <Formik
          initialValues={{
            email: '',
            password: '',
            rememberMe: false
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Box mb={2}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  autoComplete="email"
                  autoFocus
                />
              </Box>

              <Box mb={2}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  autoComplete="current-password"
                />
              </Box>

              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={values.rememberMe}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting || loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Forgot Password Link */}
              <Box textAlign="center" mb={2}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  color="primary"
                >
                  Forgot your password?
                </Link>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Register Link */}
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    color="primary"
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default LoginPage; 
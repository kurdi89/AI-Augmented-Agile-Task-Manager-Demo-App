// Team Task Manager - Registration Page
// Sprint 1: User Registration (US-001)
// Created: July 6, 2025

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
  Container,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .required('First name is required'),
  lastName: Yup.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
  subscribeNewsletter: Yup.boolean()
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      subscribeNewsletter: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        setSubmitSuccess(data.message || 'Registration successful! Please check your email to verify your account.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

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
                  Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Join Team Task Manager and start collaborating
                </Typography>
              </Box>

              {submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {submitError}
                </Alert>
              )}

              {submitSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {submitSuccess}
                </Alert>
              )}

              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                    disabled={isLoading}
                    required
                  />
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
                    disabled={isLoading}
                    required
                  />
                </Box>

                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={isLoading}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={isLoading}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  disabled={isLoading}
                  required
                  sx={{ mb: 3 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formik.values.acceptTerms}
                      onChange={formik.handleChange}
                      disabled={isLoading}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the{' '}
                      <Link href="/terms" target="_blank" rel="noopener">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" rel="noopener">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                  <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {formik.errors.acceptTerms}
                  </Typography>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      id="subscribeNewsletter"
                      name="subscribeNewsletter"
                      checked={formik.values.subscribeNewsletter}
                      onChange={formik.handleChange}
                      disabled={isLoading}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Subscribe to our newsletter for updates and tips
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || !formik.isValid}
                  sx={{ mb: 3 }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => navigate('/login')}
                      sx={{ textDecoration: 'none' }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 
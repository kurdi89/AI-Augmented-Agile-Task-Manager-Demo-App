// Team Task Manager - 404 Not Found Page
// Sprint 1: Error page component
// Created: July 6, 2025

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

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
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 500, p: 4, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'text.secondary' }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 
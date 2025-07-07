// Team Task Manager - Loading Spinner Component
// Sprint 1: Common UI component for loading states
// Created: July 6, 2025

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 40,
  color = 'primary'
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner; 
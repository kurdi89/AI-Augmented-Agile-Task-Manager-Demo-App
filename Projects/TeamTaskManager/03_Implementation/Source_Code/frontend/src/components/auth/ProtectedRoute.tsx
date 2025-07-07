/**
 * Protected Route Component
 * Handles authentication-based routing and access control
 * Created: July 6, 2025
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireEmailVerification = false
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email verification is required
  if (requireEmailVerification && user && !user.emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute; 
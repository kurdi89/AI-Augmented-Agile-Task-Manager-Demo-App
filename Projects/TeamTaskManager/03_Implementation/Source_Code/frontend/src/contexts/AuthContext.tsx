/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth methods
 * Created: July 6, 2025
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token && !authService.isTokenExpired(token)) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } else {
          // Clear invalid token
          authService.logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        acceptTerms: userData.acceptTerms,
        subscribeNewsletter: userData.subscribeNewsletter
      });
      // Don't set user until email is verified
      console.log('Registration successful:', response.message);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
      // Get updated user data
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.verifyEmail(token);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmResetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      await authService.confirmResetPassword(token, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    verifyEmail,
    resetPassword,
    confirmResetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
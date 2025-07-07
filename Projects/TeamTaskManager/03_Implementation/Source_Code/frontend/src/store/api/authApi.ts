// Team Task Manager - Authentication RTK Query API
// Sprint 1: API endpoints for authentication
// Created: July 6, 2025

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
    sessionId: string;
  };
  error?: string;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

// Auth API slice
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      // Add auth token to headers if available
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Session'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Session'],
    }),

    // Register
    register: builder.mutation<ApiResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Verify Email
    verifyEmail: builder.mutation<ApiResponse, { token: string }>({
      query: ({ token }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['User'],
    }),

    // Resend Verification
    resendVerification: builder.mutation<ApiResponse, { email: string }>({
      query: ({ email }) => ({
        url: '/resend-verification',
        method: 'POST',
        body: { email },
      }),
    }),

    // Logout
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Session'],
    }),

    // Refresh Token
    refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      invalidatesTags: ['Session'],
    }),

    // Get Profile
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/profile',
      providesTags: ['User'],
    }),

    // Update Profile
    updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Health Check
    healthCheck: builder.query<ApiResponse, void>({
      query: () => '/health',
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useHealthCheckQuery,
} = authApi; 
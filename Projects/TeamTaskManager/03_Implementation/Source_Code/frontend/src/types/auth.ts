// Team Task Manager Frontend - Authentication Types
// Sprint 1: Authentication System Type Definitions
// Created: July 6, 2025

import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  website?: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  preferences: UserPreferences;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  scope?: string;
  assignedAt: string;
  assignedBy: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  taskAssignments: boolean;
  taskUpdates: boolean;
  teamInvitations: boolean;
  systemUpdates: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLastSeen: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
  lastActivity: number | null;
  deviceId: string | null;
  sessionId: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export interface AuthResponse {
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

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
  website?: string;
  profilePicture?: File;
}

export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  notifications?: Partial<NotificationPreferences>;
  privacy?: Partial<PrivacyPreferences>;
}

export interface SessionInfo {
  id: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
  isActive: boolean;
}

export interface LogoutRequest {
  sessionId?: string;
  allDevices?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: AuthError;
  errors?: ValidationError[];
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  subscribeNewsletter: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bio: string;
  location: string;
  website: string;
}

// Redux action types
export enum AuthActionTypes {
  LOGIN_START = 'auth/loginStart',
  LOGIN_SUCCESS = 'auth/loginSuccess',
  LOGIN_FAILURE = 'auth/loginFailure',
  REGISTER_START = 'auth/registerStart',
  REGISTER_SUCCESS = 'auth/registerSuccess',
  REGISTER_FAILURE = 'auth/registerFailure',
  LOGOUT = 'auth/logout',
  REFRESH_TOKEN_START = 'auth/refreshTokenStart',
  REFRESH_TOKEN_SUCCESS = 'auth/refreshTokenSuccess',
  REFRESH_TOKEN_FAILURE = 'auth/refreshTokenFailure',
  UPDATE_PROFILE_START = 'auth/updateProfileStart',
  UPDATE_PROFILE_SUCCESS = 'auth/updateProfileSuccess',
  UPDATE_PROFILE_FAILURE = 'auth/updateProfileFailure',
  VERIFY_EMAIL_START = 'auth/verifyEmailStart',
  VERIFY_EMAIL_SUCCESS = 'auth/verifyEmailSuccess',
  VERIFY_EMAIL_FAILURE = 'auth/verifyEmailFailure',
  RESET_PASSWORD_START = 'auth/resetPasswordStart',
  RESET_PASSWORD_SUCCESS = 'auth/resetPasswordSuccess',
  RESET_PASSWORD_FAILURE = 'auth/resetPasswordFailure',
  CLEAR_ERROR = 'auth/clearError',
  SET_LOADING = 'auth/setLoading',
  UPDATE_LAST_ACTIVITY = 'auth/updateLastActivity',
  SESSION_EXPIRED = 'auth/sessionExpired',
}

// Hook return types
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: (options?: LogoutRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Component prop types
export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export interface AuthFormProps {
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Constants
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
  DEVICE_ID: 'device_id',
  SESSION_ID: 'session_id',
  LAST_ACTIVITY: 'last_activity',
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
} as const;

export const SESSION_CONFIG = {
  TIMEOUT: 3600000, // 1 hour
  REFRESH_THRESHOLD: 300000, // 5 minutes
  ACTIVITY_INTERVAL: 30000, // 30 seconds
  MAX_CONCURRENT_SESSIONS: 5,
} as const; 
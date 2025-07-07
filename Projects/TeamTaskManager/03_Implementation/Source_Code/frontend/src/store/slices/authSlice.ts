// Team Task Manager - Authentication Redux Slice
// Sprint 1: Authentication State Management
// Created: July 6, 2025

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types (simplified to avoid React dependency issues)
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

interface AuthState {
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

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
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

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionExpiry: null,
  lastActivity: null,
  deviceId: null,
  sessionId: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // This will be implemented with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Logout failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentRefreshToken = state.auth.refreshToken;

      if (!currentRefreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Token refresh failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Email verification failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    sessionExpired: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.sessionId = null;
      state.error = 'Session expired. Please log in again.';
    },
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.success && action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.refreshToken = action.payload.data.refreshToken;
          state.sessionId = action.payload.data.sessionId;
          state.isAuthenticated = true;
          state.sessionExpiry = Date.now() + (action.payload.data.expiresIn * 1000);
          state.lastActivity = Date.now();
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Registration doesn't log user in automatically
        // They need to verify email first
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.sessionExpiry = null;
        state.sessionId = null;
        state.lastActivity = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails on server, clear local state
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.sessionExpiry = null;
        state.sessionId = null;
        state.lastActivity = null;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.success && action.payload.data) {
          state.token = action.payload.data.token;
          state.refreshToken = action.payload.data.refreshToken;
          state.sessionExpiry = Date.now() + (action.payload.data.expiresIn * 1000);
          state.lastActivity = Date.now();
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If refresh fails, user needs to log in again
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
        state.sessionId = null;
      });

    // Email Verification
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Update user verification status if user is logged in
        if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setLoading,
  updateLastActivity,
  sessionExpired,
  setDeviceId,
  resetAuthState,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error; 
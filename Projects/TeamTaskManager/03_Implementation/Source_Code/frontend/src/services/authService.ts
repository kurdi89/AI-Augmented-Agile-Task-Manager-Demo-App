// Team Task Manager Frontend - Authentication Service
// Sprint 1: Authentication API Service
// Created: July 6, 2025

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { 
  User, 
  ApiResponse 
} from '../types/task';

// Type imports (will be properly typed once React types are resolved)
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: any;
}

interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
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

interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
}

class AuthService {
  private api: AxiosInstance;
  private readonly baseURL: string;
  private readonly storageKeys = {
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'auth_user',
    DEVICE_ID: 'device_id',
    SESSION_ID: 'session_id',
    LAST_ACTIVITY: 'last_activity',
  };

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add device ID
        const deviceId = this.getDeviceId();
        if (deviceId) {
          config.headers['X-Device-ID'] = deviceId;
        }

        // Add session ID
        const sessionId = this.getSessionId();
        if (sessionId) {
          config.headers['X-Session-ID'] = sessionId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken();
              if (response.success) {
                this.setToken(response.token);
                this.setRefreshToken(response.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.token}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const deviceInfo = this.getDeviceInfo();
      const response = await this.api.post<AuthResponse>('/auth/login', {
        ...credentials,
        deviceInfo,
      });

      if (response.data.success && response.data.data) {
        const { user, token, refreshToken, sessionId } = response.data.data;
        
        this.setToken(token);
        this.setRefreshToken(refreshToken);
        this.setUser(user);
        this.setSessionId(sessionId);
        this.updateLastActivity();
        
        if (!this.getDeviceId()) {
          this.generateDeviceId();
        }
      }

      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const deviceInfo = this.getDeviceInfo();
      const response = await this.api.post<AuthResponse>('/auth/register', {
        ...credentials,
        deviceInfo,
      });

      if (response.data.success && response.data.data) {
        const { user, token, refreshToken, sessionId } = response.data.data;
        
        this.setToken(token);
        this.setRefreshToken(refreshToken);
        this.setUser(user);
        this.setSessionId(sessionId);
        this.updateLastActivity();
        
        if (!this.getDeviceId()) {
          this.generateDeviceId();
        }
      }

      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async logout(options?: { sessionId?: string; allDevices?: boolean }): Promise<void> {
    try {
      await this.api.post('/auth/logout', options);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.api.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
        deviceId: this.getDeviceId(),
      });

      if (response.data.success) {
        this.setToken(response.data.token);
        this.setRefreshToken(response.data.refreshToken);
        this.setSessionId(response.data.sessionId);
        this.updateLastActivity();
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.post<ApiResponse<void>>('/auth/verify-email', { token });
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.post<ApiResponse<void>>('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.post<ApiResponse<void>>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async confirmPasswordReset(data: { token: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.post<ApiResponse<void>>('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.post<ApiResponse<void>>('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async updateProfile(data: any): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put<ApiResponse<User>>('/auth/profile', data);
      
      if (response.data.success && response.data.data) {
        this.setUser(response.data.data);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get<ApiResponse<User>>('/auth/profile');
      
      if (response.data.success && response.data.data) {
        this.setUser(response.data.data);
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async getSessions(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>('/auth/sessions');
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  async terminateSession(sessionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.delete<ApiResponse<void>>(`/auth/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      return this.handleApiError(error);
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.storageKeys.TOKEN) || Cookies.get(this.storageKeys.TOKEN) || null;
  }

  setToken(token: string): void {
    localStorage.setItem(this.storageKeys.TOKEN, token);
    Cookies.set(this.storageKeys.TOKEN, token, { 
      expires: 7, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.storageKeys.REFRESH_TOKEN) || Cookies.get(this.storageKeys.REFRESH_TOKEN) || null;
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.storageKeys.REFRESH_TOKEN, refreshToken);
    Cookies.set(this.storageKeys.REFRESH_TOKEN, refreshToken, { 
      expires: 30, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.storageKeys.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.storageKeys.USER, JSON.stringify(user));
  }

  getSessionId(): string | null {
    return localStorage.getItem(this.storageKeys.SESSION_ID);
  }

  setSessionId(sessionId: string): void {
    localStorage.setItem(this.storageKeys.SESSION_ID, sessionId);
  }

  getDeviceId(): string | null {
    return localStorage.getItem(this.storageKeys.DEVICE_ID);
  }

  generateDeviceId(): string {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(this.storageKeys.DEVICE_ID, deviceId);
    return deviceId;
  }

  updateLastActivity(): void {
    const timestamp = Date.now().toString();
    localStorage.setItem(this.storageKeys.LAST_ACTIVITY, timestamp);
  }

  getLastActivity(): number | null {
    const timestamp = localStorage.getItem(this.storageKeys.LAST_ACTIVITY);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  clearAuthData(): void {
    // Clear localStorage
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear cookies
    Object.values(this.storageKeys).forEach(key => {
      Cookies.remove(key);
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getTokenExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000;
    } catch {
      return null;
    }
  }

  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;

    const threshold = thresholdMinutes * 60 * 1000;
    return expiry - Date.now() < threshold;
  }

  getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      deviceType: this.getDeviceType(),
    };
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private handleApiError(error: any): any {
    console.error('API Error:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    };
  }

  // Session management
  startActivityTracking(): void {
    // Update activity every 30 seconds
    setInterval(() => {
      if (this.isAuthenticated()) {
        this.updateLastActivity();
      }
    }, 30000);

    // Track user interactions
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => {
        if (this.isAuthenticated()) {
          this.updateLastActivity();
        }
      }, { passive: true });
    });
  }

  startTokenRefreshTimer(): void {
    setInterval(async () => {
      if (this.isAuthenticated() && this.isTokenExpiringSoon()) {
        try {
          await this.refreshToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          this.logout();
        }
      }
    }, 60000); // Check every minute
  }

  // Register new user
  async registerUser(registerData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/register`, registerData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Store token and user data
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Login user
  async loginUser(loginData: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Store token and user data
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/forgot-password`, { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  // Reset password
  async resetPasswordUser(resetData: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/reset-password`, resetData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmailUser(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/verify-email`, { token }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/resend-verification`, { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticatedUser(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check token validity
  async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await axios.get(`${this.baseURL}/auth/validate-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.success;
    } catch (error) {
      console.error('Error validating token:', error);
      this.clearAuth();
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 
// Team Task Manager - User Service
// Sprint 2: User Management API Integration
// Created: July 6, 2025

import axios from 'axios';
import { 
  User, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/task';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// User Service Class
class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Update current user profile
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, passwordData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Get all users (for admin purposes)
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) {
        params.append('search', search);
      }

      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Search users by name or email
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/search`, {
        headers: this.getAuthHeaders(),
        params: { q: query }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ avatar: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_BASE_URL}/auth/upload-avatar`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/stats`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: this.getAuthHeaders()
      });

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService; 
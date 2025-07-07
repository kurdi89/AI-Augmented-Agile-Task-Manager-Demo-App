// Team Task Manager - Project Service
// Sprint 2: Project Management API Integration
// Created: July 6, 2025

import axios from 'axios';
import { 
  Project, 
  CreateProjectForm, 
  UpdateProjectForm, 
  ProjectFilters, 
  ApiResponse, 
  PaginatedResponse,
  BulkProjectUpdate,
  ProjectMember,
  ProjectInvite
} from '../types/task';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Project Service Class
class ProjectService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all projects with filters and pagination
  async getProjects(filters?: ProjectFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.status) params.append('status', filters.status.join(','));
        if (filters.search) params.append('search', filters.search);
        if (filters.memberId) params.append('memberId', filters.memberId);
      }
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get a single project by ID
  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create a new project
  async createProject(projectData: CreateProjectForm): Promise<ApiResponse<Project>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, projectData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update an existing project
  async updateProject(projectId: string, projectData: UpdateProjectForm): Promise<ApiResponse<Project>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, projectData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Bulk update projects
  async bulkUpdateProjects(updates: BulkProjectUpdate): Promise<ApiResponse<Project[]>> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/projects/bulk-update`, updates, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error bulk updating projects:', error);
      throw error;
    }
  }

  // Get project members
  async getProjectMembers(projectId: string): Promise<ApiResponse<ProjectMember[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/members`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }
  }

  // Add member to project
  async addProjectMember(projectId: string, memberData: { userId: string; role: string }): Promise<ApiResponse<ProjectMember>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/members`, memberData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  }

  // Remove member from project
  async removeProjectMember(projectId: string, memberId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  }

  // Update member role
  async updateMemberRole(projectId: string, memberId: string, role: string): Promise<ApiResponse<ProjectMember>> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, { role }, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  // Get project invites
  async getProjectInvites(projectId: string): Promise<ApiResponse<ProjectInvite[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/invites`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching project invites:', error);
      throw error;
    }
  }

  // Send project invite
  async sendProjectInvite(projectId: string, inviteData: { email: string; role: string }): Promise<ApiResponse<ProjectInvite>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/invites`, inviteData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error sending project invite:', error);
      throw error;
    }
  }

  // Accept project invite
  async acceptProjectInvite(inviteId: string): Promise<ApiResponse<ProjectMember>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/invites/${inviteId}/accept`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error accepting project invite:', error);
      throw error;
    }
  }

  // Decline project invite
  async declineProjectInvite(inviteId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/invites/${inviteId}/decline`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error declining project invite:', error);
      throw error;
    }
  }

  // Get my projects (projects where user is a member)
  async getMyProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    try {
      const params = new URLSearchParams();
      params.append('myProjects', 'true');
      
      if (filters) {
        if (filters.status) params.append('status', filters.status.join(','));
        if (filters.search) params.append('search', filters.search);
      }

      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching my projects:', error);
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/stats`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();
export default projectService; 
// Team Task Manager - Task Service
// Sprint 2: Task Management API Integration
// Created: July 6, 2025

import axios from 'axios';
import { 
  Task, 
  CreateTaskForm, 
  UpdateTaskForm, 
  TaskFilters, 
  ApiResponse, 
  PaginatedResponse,
  BulkTaskUpdate 
} from '../types/task';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Task Service Class
class TaskService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all tasks with filters and pagination
  async getTasks(filters?: TaskFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Task>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.status) params.append('status', filters.status.join(','));
        if (filters.priority) params.append('priority', filters.priority.join(','));
        if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.search) params.append('search', filters.search);
        if (filters.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom);
        if (filters.dueDateTo) params.append('dueDateTo', filters.dueDateTo);
      }
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get a single task by ID
  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskData: CreateTaskForm): Promise<ApiResponse<Task>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update an existing task
  async updateTask(taskId: string, taskData: UpdateTaskForm): Promise<ApiResponse<Task>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, taskData, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Bulk update tasks
  async bulkUpdateTasks(updates: BulkTaskUpdate): Promise<ApiResponse<Task[]>> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tasks/bulk-update`, updates, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  }

  // Get tasks by project
  async getTasksByProject(projectId: string, filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    try {
      const params = new URLSearchParams();
      params.append('projectId', projectId);
      
      if (filters) {
        if (filters.status) params.append('status', filters.status.join(','));
        if (filters.priority) params.append('priority', filters.priority.join(','));
        if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
        if (filters.search) params.append('search', filters.search);
      }

      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  // Get tasks assigned to current user
  async getMyTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    try {
      const params = new URLSearchParams();
      params.append('assignedToMe', 'true');
      
      if (filters) {
        if (filters.status) params.append('status', filters.status.join(','));
        if (filters.priority) params.append('priority', filters.priority.join(','));
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.search) params.append('search', filters.search);
      }

      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getTaskStats(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/stats`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();
export default taskService; 
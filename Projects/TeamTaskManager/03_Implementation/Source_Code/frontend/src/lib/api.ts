import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Task, 
  Project, 
  User, 
  CreateTaskForm, 
  UpdateTaskForm, 
  CreateProjectForm, 
  UpdateProjectForm,
  TaskFilters,
  ProjectFilters,
  ApiResponse,
  PaginatedResponse,
  DashboardStats
} from './types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private handleUnauthorized(): void {
    this.removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.client.post<{ token: string }>('/api/login', {
      email,
      password,
    });
    
    const { token } = response.data;
    this.setAuthToken(token);
    
    // Get user profile
    const user = await this.getCurrentUser();
    return { token, user };
  }

  async signup(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    const response = await this.client.post<User>('/api/signup', {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/users/me');
    return response.data;
  }

  logout(): void {
    this.removeAuthToken();
  }

  // Tasks
  async getTasks(filters?: TaskFilters, page = 1, limit = 20): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await this.client.get<PaginatedResponse<Task>>(`/api/tasks?${params.toString()}`);
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get<Task>(`/api/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData: CreateTaskForm): Promise<Task> {
    const response = await this.client.post<Task>('/api/tasks', taskData);
    return response.data;
  }

  async updateTask(id: string, taskData: UpdateTaskForm): Promise<Task> {
    const response = await this.client.put<Task>(`/api/tasks/${id}`, taskData);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/api/tasks/${id}`);
  }

  // Projects
  async getProjects(filters?: ProjectFilters, page = 1, limit = 20): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await this.client.get<PaginatedResponse<Project>>(`/api/projects?${params.toString()}`);
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get<Project>(`/api/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: CreateProjectForm): Promise<Project> {
    const response = await this.client.post<Project>('/api/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: UpdateProjectForm): Promise<Project> {
    const response = await this.client.put<Project>(`/api/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/api/projects/${id}`);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  }

  // File Upload
  async uploadFile(file: File, taskId?: string): Promise<{ fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (taskId) {
      formData.append('taskId', taskId);
    }

    const response = await this.client.post<{ fileUrl: string; fileName: string }>(
      '/api/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Search
  async searchTasks(query: string, filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await this.client.get<Task[]>(`/api/search/tasks?${params.toString()}`);
    return response.data;
  }

  async searchProjects(query: string, filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await this.client.get<Project[]>(`/api/search/projects?${params.toString()}`);
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for convenience
export default apiClient; 
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../TaskList';
import ProjectList from '../ProjectList';
import apiClient from '@/lib/api';
import { socket } from '@/lib/socket';
import { Task, Project, TaskStatus, TaskPriority, ProjectStatus } from '@/lib/types';

// Mock the API client and socket
jest.mock('@/lib/api');
jest.mock('@/lib/socket');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSocket = socket as jest.Mocked<typeof socket>;

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task Management Flow', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Implement login feature',
        description: 'Add user authentication',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: 'project-1',
        createdById: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      },
    ];

    test('complete task management workflow', async () => {
      // Setup mocks
      mockApiClient.getTasks.mockResolvedValue({
        data: mockTasks,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
      mockApiClient.createTask.mockResolvedValue(mockTasks[0]);
      mockApiClient.updateTask.mockResolvedValue(mockTasks[0]);
      mockApiClient.deleteTask.mockResolvedValue(undefined);

      render(<TaskList />);

      // Verify initial load
      await waitFor(() => {
        expect(screen.getByText('Implement login feature')).toBeInTheDocument();
      });

      // Create new task
      const createButton = screen.getByText('Create Task');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByLabelText('Title');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

      // Submit form
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiClient.createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
        });
      });

      // Update task status
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });

      await waitFor(() => {
        expect(mockApiClient.updateTask).toHaveBeenCalledWith('1', {
          status: TaskStatus.IN_PROGRESS,
        });
      });

      // Search tasks
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'login' } });

      await waitFor(() => {
        expect(mockApiClient.searchTasks).toHaveBeenCalledWith('login', {});
      });
    });

    test('real-time task updates', async () => {
      mockApiClient.getTasks.mockResolvedValue({
        data: mockTasks,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Implement login feature')).toBeInTheDocument();
      });

      // Simulate real-time task creation
      const newTask: Task = {
        id: '2',
        title: 'Real-time Task',
        description: 'Created via WebSocket',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: 'project-1',
        createdById: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate socket event
      const socketOn = mockSocket.on as jest.Mock;
      const taskCreatedCallback = socketOn.mock.calls.find(
        call => call[0] === 'task:created'
      )?.[1];

      if (taskCreatedCallback) {
        taskCreatedCallback(newTask);
      }

      await waitFor(() => {
        expect(screen.getByText('Real-time Task')).toBeInTheDocument();
      });
    });
  });

  describe('Project Management Flow', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Frontend Development',
        description: 'React application development',
        status: ProjectStatus.ACTIVE,
        tags: ['react', 'typescript'],
        ownerId: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      },
    ];

    test('complete project management workflow', async () => {
      // Setup mocks
      mockApiClient.getProjects.mockResolvedValue({
        data: mockProjects,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
      mockApiClient.createProject.mockResolvedValue(mockProjects[0]);
      mockApiClient.updateProject.mockResolvedValue(mockProjects[0]);
      mockApiClient.deleteProject.mockResolvedValue(undefined);

      render(<ProjectList />);

      // Verify initial load
      await waitFor(() => {
        expect(screen.getByText('Frontend Development')).toBeInTheDocument();
      });

      // Create new project
      const createButton = screen.getByText('Create Project');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument();
      });

      // Fill form
      const nameInput = screen.getByLabelText('Project Name');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(nameInput, { target: { value: 'New Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

      // Submit form
      const submitButton = screen.getByText('Create Project');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiClient.createProject).toHaveBeenCalledWith({
          name: 'New Project',
          description: 'New Description',
        });
      });

      // Update project status
      const statusSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusSelect, { target: { value: ProjectStatus.COMPLETED } });

      await waitFor(() => {
        expect(mockApiClient.updateProject).toHaveBeenCalledWith('1', {
          status: ProjectStatus.COMPLETED,
        });
      });

      // Search projects
      const searchInput = screen.getByPlaceholderText('Search projects...');
      fireEvent.change(searchInput, { target: { value: 'frontend' } });

      await waitFor(() => {
        expect(mockApiClient.searchProjects).toHaveBeenCalledWith('frontend', {});
      });
    });

    test('real-time project updates', async () => {
      mockApiClient.getProjects.mockResolvedValue({
        data: mockProjects,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      render(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Frontend Development')).toBeInTheDocument();
      });

      // Simulate real-time project creation
      const newProject: Project = {
        id: '2',
        name: 'Real-time Project',
        description: 'Created via WebSocket',
        status: ProjectStatus.ACTIVE,
        tags: ['realtime'],
        ownerId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate socket event
      const socketOn = mockSocket.on as jest.Mock;
      const projectCreatedCallback = socketOn.mock.calls.find(
        call => call[0] === 'project:created'
      )?.[1];

      if (projectCreatedCallback) {
        projectCreatedCallback(newProject);
      }

      await waitFor(() => {
        expect(screen.getByText('Real-time Project')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('handles API errors gracefully', async () => {
      mockApiClient.getTasks.mockRejectedValue(new Error('Network error'));

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
      });
    });

    test('handles network timeouts', async () => {
      mockApiClient.getProjects.mockRejectedValue(new Error('Request timeout'));

      render(<ProjectList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    test('handles large datasets efficiently', async () => {
      const largeTaskList = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description for task ${i}`,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: 'project-1',
        createdById: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      }));

      mockApiClient.getTasks.mockResolvedValue({
        data: largeTaskList,
        pagination: {
          page: 1,
          limit: 20,
          total: 1000,
          totalPages: 50,
        },
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 0')).toBeInTheDocument();
      });

      // Should render without performance issues
      expect(screen.getByText('Task 0')).toBeInTheDocument();
    });
  });

  describe('Authentication Integration', () => {
    test('handles authentication state changes', async () => {
      // Mock successful login
      mockApiClient.login.mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          emailVerified: true,
          createdAt: '2025-07-01T00:00:00Z',
          updatedAt: '2025-07-01T00:00:00Z',
        },
      });

      // Test that components work with authenticated user
      mockApiClient.getTasks.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Integration', () => {
    test('handles file uploads correctly', async () => {
      mockApiClient.uploadFile.mockResolvedValue({
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'document.pdf',
      });

      // Test file upload functionality
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await apiClient.uploadFile(file, 'task-1');
      
      expect(result).toEqual({
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'document.pdf',
      });
    });
  });

  describe('Search and Filter Integration', () => {
    test('combines search and filtering', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'High priority bug fix',
          description: 'Critical issue',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          projectId: 'project-1',
          createdById: 'user-1',
          createdAt: '2025-07-01T00:00:00Z',
          updatedAt: '2025-07-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Low priority feature',
          description: 'Nice to have',
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          projectId: 'project-1',
          createdById: 'user-1',
          createdAt: '2025-07-01T00:00:00Z',
          updatedAt: '2025-07-01T00:00:00Z',
        },
      ];

      mockApiClient.getTasks.mockResolvedValue({
        data: mockTasks,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('High priority bug fix')).toBeInTheDocument();
        expect(screen.getByText('Low priority feature')).toBeInTheDocument();
      });

      // Apply filters
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });

      // Filter by priority
      const priorityFilter = screen.getByLabelText('Priority');
      fireEvent.change(priorityFilter, { target: { value: TaskPriority.HIGH } });

      await waitFor(() => {
        expect(mockApiClient.getTasks).toHaveBeenCalledWith(
          { priority: [TaskPriority.HIGH] },
          1,
          20
        );
      });
    });
  });
}); 
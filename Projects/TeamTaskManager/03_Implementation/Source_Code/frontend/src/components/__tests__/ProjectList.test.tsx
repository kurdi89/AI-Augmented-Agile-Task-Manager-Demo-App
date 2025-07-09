import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectList from '../ProjectList';
import apiClient from '@/lib/api';
import { socket } from '@/lib/socket';
import { Project, ProjectStatus, ProjectRole } from '@/lib/types';

// Mock the API client
jest.mock('@/lib/api');
jest.mock('@/lib/socket');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSocket = socket as jest.Mocked<typeof socket>;

// Mock project data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'Test description 1',
    status: ProjectStatus.ACTIVE,
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    tags: ['frontend', 'react'],
    ownerId: 'user-1',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Project 2',
    description: 'Test description 2',
    status: ProjectStatus.ON_HOLD,
    startDate: undefined,
    endDate: undefined,
    tags: ['backend', 'nodejs'],
    ownerId: 'user-1',
    createdAt: '2025-07-02T00:00:00Z',
    updatedAt: '2025-07-02T00:00:00Z',
  },
];

describe('ProjectList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.getProjects.mockResolvedValue({ 
      data: mockProjects,
      pagination: {
        page: 1,
        limit: 20,
        total: mockProjects.length,
        totalPages: 1
      }
    });
    mockApiClient.createProject.mockResolvedValue(mockProjects[0]);
    mockApiClient.updateProject.mockResolvedValue(mockProjects[0]);
    mockApiClient.deleteProject.mockResolvedValue(undefined);
    mockApiClient.searchProjects.mockResolvedValue(mockProjects);
  });

  test('renders project list with create button', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });
  });

  test('loads and displays projects', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });
    
    expect(mockApiClient.getProjects).toHaveBeenCalledWith({}, 1, 20);
  });

  test('handles search functionality', async () => {
    render(<ProjectList />);
    
    const searchInput = screen.getByPlaceholderText('Search projects...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(mockApiClient.searchProjects).toHaveBeenCalledWith('test', {});
    });
  });

  test('opens create project form when create button is clicked', async () => {
    render(<ProjectList />);
    
    const createButton = screen.getByText('Create Project');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });
  });

  test('creates a new project successfully', async () => {
    render(<ProjectList />);
    
    // Open create form
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
  });

  test('updates project status', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: ProjectStatus.COMPLETED } });
    
    await waitFor(() => {
      expect(mockApiClient.updateProject).toHaveBeenCalledWith('1', {
        status: ProjectStatus.COMPLETED,
      });
    });
  });

  test('deletes project with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this project? This will also delete all associated tasks.'
    );
    
    await waitFor(() => {
      expect(mockApiClient.deleteProject).toHaveBeenCalledWith('1');
    });
  });

  test('handles real-time project creation', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    // Simulate real-time project creation
    const newProject: Project = {
      id: '3',
      name: 'Real-time Project',
      description: 'Created via WebSocket',
      status: ProjectStatus.ACTIVE,
      startDate: undefined,
      endDate: undefined,
      tags: ['realtime'],
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Trigger socket event
    const socketEmit = mockSocket.emit as jest.Mock;
    socketEmit.mockImplementation((event, callback) => {
      if (event === 'project:created') {
        callback(newProject);
      }
    });
    
    // Simulate the socket event
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

  test('handles error states', async () => {
    mockApiClient.getProjects.mockRejectedValue(new Error('Failed to load'));
    
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    });
  });

  test('applies filters correctly', async () => {
    render(<ProjectList />);
    
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByLabelText('Status');
    fireEvent.change(statusFilter, { target: { value: ProjectStatus.ACTIVE } });
    
    await waitFor(() => {
      expect(mockApiClient.getProjects).toHaveBeenCalledWith(
        { status: ProjectStatus.ACTIVE },
        1,
        20
      );
    });
  });

  test('displays project statistics', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    // Check for member count and task count displays
    expect(screen.getByText(/0 members/)).toBeInTheDocument();
    expect(screen.getByText(/0 tasks/)).toBeInTheDocument();
  });

  test('handles project selection', async () => {
    const onProjectSelect = jest.fn();
    render(<ProjectList onProjectSelect={onProjectSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    const projectCard = screen.getByText('Test Project 1').closest('div');
    if (projectCard) {
      fireEvent.click(projectCard);
    }
    
    expect(onProjectSelect).toHaveBeenCalledWith(mockProjects[0]);
  });

  test('displays project tags', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    // Check for tag displays
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
    expect(screen.getByText('nodejs')).toBeInTheDocument();
  });

  test('handles pagination', async () => {
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    // Scroll to trigger pagination
    const container = screen.getByRole('main') || document.body;
    fireEvent.scroll(container, { target: { scrollY: 1000 } });
    
    await waitFor(() => {
      expect(mockApiClient.getProjects).toHaveBeenCalledWith({}, 2, 20);
    });
  });
}); 
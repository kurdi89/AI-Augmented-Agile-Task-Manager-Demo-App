import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../TaskList';
import apiClient from '@/lib/api';
import { socket } from '@/lib/socket';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

// Mock the API client
jest.mock('@/lib/api');
jest.mock('@/lib/socket');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSocket = socket as jest.Mocked<typeof socket>;

// Mock task data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description 1',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: 'project-1',
    createdById: 'user-1',
    assigneeId: 'user-2',
    dueDate: '2025-07-15',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test description 2',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    projectId: 'project-1',
    createdById: 'user-1',
    assigneeId: undefined,
    dueDate: undefined,
    createdAt: '2025-07-02T00:00:00Z',
    updatedAt: '2025-07-02T00:00:00Z',
  },
];

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.getTasks.mockResolvedValue({ 
      data: mockTasks,
      pagination: {
        page: 1,
        limit: 20,
        total: mockTasks.length,
        totalPages: 1
      }
    });
    mockApiClient.createTask.mockResolvedValue(mockTasks[0]);
    mockApiClient.updateTask.mockResolvedValue(mockTasks[0]);
    mockApiClient.deleteTask.mockResolvedValue(undefined);
    mockApiClient.searchTasks.mockResolvedValue(mockTasks);
  });

  test('renders task list with create button', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });
  });

  test('loads and displays tasks', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
    
    expect(mockApiClient.getTasks).toHaveBeenCalledWith({}, 1, 20);
  });

  test('filters tasks by project when projectId is provided', async () => {
    render(<TaskList projectId="project-1" />);
    
    await waitFor(() => {
      expect(mockApiClient.getTasks).toHaveBeenCalledWith(
        { projectId: 'project-1' },
        1,
        20
      );
    });
  });

  test('handles search functionality', async () => {
    render(<TaskList />);
    
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(mockApiClient.searchTasks).toHaveBeenCalledWith('test', {});
    });
  });

  test('opens create task form when create button is clicked', async () => {
    render(<TaskList />);
    
    const createButton = screen.getByText('Create Task');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  test('creates a new task successfully', async () => {
    render(<TaskList />);
    
    // Open create form
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
  });

  test('updates task status', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });
    
    await waitFor(() => {
      expect(mockApiClient.updateTask).toHaveBeenCalledWith('1', {
        status: TaskStatus.IN_PROGRESS,
      });
    });
  });

  test('deletes task with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    
    await waitFor(() => {
      expect(mockApiClient.deleteTask).toHaveBeenCalledWith('1');
    });
  });

  test('handles real-time task creation', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    // Simulate real-time task creation
    const newTask: Task = {
      id: '3',
      title: 'Real-time Task',
      description: 'Created via WebSocket',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      projectId: 'project-1',
      createdById: 'user-1',
      assigneeId: undefined,
      dueDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Trigger socket event
    const socketEmit = mockSocket.emit as jest.Mock;
    socketEmit.mockImplementation((event, callback) => {
      if (event === 'task:created') {
        callback(newTask);
      }
    });
    
    // Simulate the socket event
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

  test('handles error states', async () => {
    mockApiClient.getTasks.mockRejectedValue(new Error('Failed to load'));
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });

  test('applies filters correctly', async () => {
    render(<TaskList />);
    
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByLabelText('Status');
    fireEvent.change(statusFilter, { target: { value: TaskStatus.TODO } });
    
    await waitFor(() => {
      expect(mockApiClient.getTasks).toHaveBeenCalledWith(
        { status: TaskStatus.TODO },
        1,
        20
      );
    });
  });

  test('handles pagination', async () => {
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    // Scroll to trigger pagination
    const container = screen.getByRole('main') || document.body;
    fireEvent.scroll(container, { target: { scrollY: 1000 } });
    
    await waitFor(() => {
      expect(mockApiClient.getTasks).toHaveBeenCalledWith({}, 2, 20);
    });
  });
}); 
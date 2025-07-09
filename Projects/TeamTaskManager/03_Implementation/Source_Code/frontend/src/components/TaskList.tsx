"use client";

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskFilters, CreateTaskForm } from '@/lib/types';
import apiClient from '@/lib/api';
import { socket } from '@/lib/socket';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';

interface TaskListProps {
  projectId?: string;
  showCreateButton?: boolean;
  onTaskSelect?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  projectId, 
  showCreateButton = true, 
  onTaskSelect 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load tasks
  const loadTasks = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await apiClient.getTasks(
        { ...filters, projectId },
        currentPage,
        20
      );
      
      if (reset) {
        setTasks(response.data);
        setPage(1);
      } else {
        setTasks(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 20);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search tasks
  const searchTasks = async () => {
    if (!searchQuery.trim()) {
      loadTasks(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await apiClient.searchTasks(searchQuery, { ...filters, projectId });
      setTasks(results);
      setHasMore(false);
    } catch (err) {
      setError('Failed to search tasks');
      console.error('Error searching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: CreateTaskForm) => {
    try {
      const newTask = await apiClient.createTask({
        ...taskData,
        projectId: projectId || taskData.projectId,
      });
      setTasks(prev => [newTask, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  // Update task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updatedTask = await apiClient.updateTask(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await apiClient.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Handle real-time updates
  useEffect(() => {
    socket.on('task:created', (newTask: Task) => {
      if (!projectId || newTask.projectId === projectId) {
        setTasks(prev => [newTask, ...prev]);
      }
    });

    socket.on('task:updated', (updatedTask: Task) => {
      if (!projectId || updatedTask.projectId === projectId) {
        setTasks(prev => prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ));
      }
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      setTasks(prev => prev.filter(task => task.id !== id));
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [projectId]);

  // Load initial data
  useEffect(() => {
    loadTasks(true);
  }, [projectId, filters]);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchTasks();
      } else {
        loadTasks(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case TaskStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'text-gray-500';
      case TaskPriority.MEDIUM: return 'text-yellow-600';
      case TaskPriority.HIGH: return 'text-orange-600';
      case TaskPriority.URGENT: return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {showCreateButton && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Task
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? [e.target.value as TaskStatus] : undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priority: e.target.value ? [e.target.value as TaskPriority] : undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={filters.dueDateFrom || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dueDateFrom: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {task.dueDate && (
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  {task.assignee && (
                    <span>Assigned to: {task.assignee.firstName} {task.assignee.lastName}</span>
                  )}
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {onTaskSelect && (
                  <button
                    onClick={() => onTaskSelect(task)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye size={16} />
                  </button>
                )}
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && tasks.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => {
              setPage(prev => prev + 1);
              loadTasks();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Load More
          </button>
        </div>
      )}

      {/* Create Task Form */}
      {showCreateForm && (
        <TaskForm
          onSubmit={createTask}
          onCancel={() => setShowCreateForm(false)}
          projectId={projectId}
        />
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => updateTask(editingTask.id, data)}
          onCancel={() => setEditingTask(null)}
          projectId={projectId}
        />
      )}
    </div>
  );
};

// Task Form Component
interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskForm) => void;
  onCancel: () => void;
  projectId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, projectId }) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || TaskPriority.MEDIUM,
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {task ? 'Edit Task' : 'Create Task'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(TaskPriority).map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {task ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskList; 
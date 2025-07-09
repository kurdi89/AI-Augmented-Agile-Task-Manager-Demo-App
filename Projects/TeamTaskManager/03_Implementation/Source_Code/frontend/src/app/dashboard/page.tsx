"use client";

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Task, Project, DashboardStats, CreateTaskForm, CreateProjectForm } from '@/lib/types';
import ProjectList from '@/components/ProjectList';
import TaskList from '@/components/TaskList';
import KanbanBoard from '@/components/KanbanBoard';
import TaskCreationForm from '@/components/TaskCreationForm';
import ProjectCreationForm from '@/components/ProjectCreationForm';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import { dashboardStyles } from '@/lib/design-system';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Users, 
  FolderOpen,
  TrendingUp,
  Activity,
  LogOut,
  Plus,
  Search,
  Filter,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attachments, setAttachments] = useState<{ [key: string]: { fileUrl: string; fileType: string } }>({});
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load tasks
      const tasksResponse = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.data || []);
      }

      // Load projects
      const projectsResponse = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data || []);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle task creation
  const handleCreateTask = async (taskData: CreateTaskForm) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      loadDashboardData(); // Refresh stats
    } catch (err: any) {
      throw err;
    }
  };

  // Handle project creation
  const handleCreateProject = async (projectData: CreateProjectForm) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const newProject = await response.json();
      setProjects(prev => [newProject, ...prev]);
      loadDashboardData(); // Refresh stats
    } catch (err: any) {
      throw err;
    }
  };

  // Socket connection and event handlers
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      socket.connect(token);
    }

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('task:created', (newTask: Task) => {
      console.log('Task created:', newTask);
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      loadDashboardData(); // Refresh stats
    });

    socket.on('task:updated', (updatedTask: Task) => {
      console.log('Task updated:', updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      loadDashboardData(); // Refresh stats
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      console.log('Task deleted:', id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      loadDashboardData(); // Refresh stats
    });

    socket.on('project:created', (newProject: Project) => {
      console.log('Project created:', newProject);
      setProjects((prevProjects) => [newProject, ...prevProjects]);
      loadDashboardData(); // Refresh stats
    });

    socket.on('task:attachment:created', (attachment: { taskId: string; fileUrl: string; fileType: string }) => {
      setAttachments((prevAttachments) => ({
        ...prevAttachments,
        [attachment.taskId]: { fileUrl: attachment.fileUrl, fileType: attachment.fileType },
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('project:created');
      socket.off('task:attachment:created');
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    socket.disconnect();
    window.location.href = '/auth/login';
  };

  const getCompletionRate = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const getActiveProjectsRate = () => {
    if (stats.totalProjects === 0) return 0;
    return Math.round((stats.activeProjects / stats.totalProjects) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Activity size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={dashboardStyles.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Team Task Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'projects'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.totalTasks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.pendingTasks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FolderOpen className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Projects</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.activeProjects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Team Members</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.recentActivity?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Task Completion</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Completion Rate</span>
                        <span>{getCompletionRate()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getCompletionRate()}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {stats.completedTasks} of {stats.totalTasks} tasks completed
                    </div>
                  </div>
                </div>
              </div>

              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Active Projects</span>
                        <span>{getActiveProjectsRate()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getActiveProjectsRate()}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {stats.activeProjects} of {stats.totalProjects} projects active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <div className={dashboardStyles.card}>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={dashboardStyles.card}>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setShowTaskForm(true)}
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Create Task</span>
                  </button>
                  <button 
                    onClick={() => setShowProjectForm(true)}
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Create Project</span>
                  </button>
                  <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">View Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              <button 
                onClick={() => setShowTaskForm(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
            
            <KanbanBoard 
              showCreateButton={false}
              onTaskSelect={(task) => {
                console.log('Task selected:', task);
              }}
            />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <button 
                onClick={() => setShowProjectForm(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
            
            <ProjectList 
              showCreateButton={false}
              onProjectSelect={(project) => {
                console.log('Project selected:', project);
              }}
            />
          </div>
        )}
      </main>

      {/* Task Creation Form */}
      <TaskCreationForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        users={[]} // TODO: Add users list
      />

      {/* Project Creation Form */}
      <ProjectCreationForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleCreateProject}
        users={[]} // TODO: Add users list
      />
    </div>
  );
};

export default DashboardPage;

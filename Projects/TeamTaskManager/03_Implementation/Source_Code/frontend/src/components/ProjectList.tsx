"use client";

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectRole, ProjectFilters, CreateProjectForm } from '@/lib/types';
import apiClient from '@/lib/api';
import { socket } from '@/lib/socket';
import { Plus, Search, Filter, Edit, Trash2, Eye, Users, Calendar } from 'lucide-react';

interface ProjectListProps {
  showCreateButton?: boolean;
  onProjectSelect?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  showCreateButton = true, 
  onProjectSelect 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load projects
  const loadProjects = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await apiClient.getProjects(filters, currentPage, 20);
      
      if (reset) {
        setProjects(response.data);
        setPage(1);
      } else {
        setProjects(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 20);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search projects
  const searchProjects = async () => {
    if (!searchQuery.trim()) {
      loadProjects(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await apiClient.searchProjects(searchQuery, filters);
      setProjects(results);
      setHasMore(false);
    } catch (err) {
      setError('Failed to search projects');
      console.error('Error searching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const createProject = async (projectData: CreateProjectForm) => {
    try {
      const newProject = await apiClient.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    }
  };

  // Update project
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const updatedProject = await apiClient.updateProject(id, projectData);
      setProjects(prev => prev.map(project => 
        project.id === id ? updatedProject : project
      ));
      setEditingProject(null);
    } catch (err) {
      setError('Failed to update project');
      console.error('Error updating project:', err);
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) return;
    
    try {
      await apiClient.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    }
  };

  // Handle real-time updates
  useEffect(() => {
    socket.on('project:created', (newProject: Project) => {
      setProjects(prev => [newProject, ...prev]);
    });

    socket.on('project:updated', (updatedProject: Project) => {
      setProjects(prev => prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      ));
    });

    socket.on('project:deleted', ({ id }: { id: string }) => {
      setProjects(prev => prev.filter(project => project.id !== id));
    });

    return () => {
      socket.off('project:created');
      socket.off('project:updated');
      socket.off('project:deleted');
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadProjects(true);
  }, [filters]);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchProjects();
      } else {
        loadProjects(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case ProjectStatus.ON_HOLD: return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
      case ProjectStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberCount = (project: Project) => {
    return project.members?.length || 0;
  };

  const getTaskCount = (project: Project) => {
    return project.tasks?.length || 0;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Projects</h2>
        {showCreateButton && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Project
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search projects..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? [e.target.value as ProjectStatus] : undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {Object.values(ProjectStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                placeholder="Enter tags (comma separated)"
                value={filters.tags?.join(', ') || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : undefined
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

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex gap-1">
                {onProjectSelect && (
                  <button
                    onClick={() => onProjectSelect(project)}
                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye size={14} />
                  </button>
                )}
                <button
                  onClick={() => setEditingProject(project)}
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {project.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{getMemberCount(project)} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{getTaskCount(project)} tasks</span>
              </div>
            </div>
            
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{project.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && projects.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => {
              setPage(prev => prev + 1);
              loadProjects();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Load More
          </button>
        </div>
      )}

      {/* Create Project Form */}
      {showCreateForm && (
        <ProjectForm
          onSubmit={createProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Project Form */}
      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={(data) => updateProject(editingProject.id, data)}
          onCancel={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};

// Project Form Component
interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: CreateProjectForm) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateProjectForm>({
    name: project?.name || '',
    description: project?.description || '',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    tags: project?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {project ? 'Edit Project' : 'Create Project'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {project ? 'Update' : 'Create'}
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

export default ProjectList;

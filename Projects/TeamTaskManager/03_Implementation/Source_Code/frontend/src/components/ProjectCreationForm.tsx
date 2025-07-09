"use client";

import React, { useState } from 'react';
import { Project, ProjectStatus, CreateProjectForm } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Users, Folder, AlertCircle, CheckCircle } from 'lucide-react';

interface ProjectCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: CreateProjectForm) => Promise<void>;
  users?: any[];
  initialData?: Partial<CreateProjectForm>;
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  initialData = {}
}) => {
  const [formData, setFormData] = useState<CreateProjectForm>({
    name: '',
    description: '',
    status: ProjectStatus.ACTIVE,
    startDate: '',
    endDate: '',
    tags: [],
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        status: ProjectStatus.ACTIVE,
        startDate: '',
        endDate: '',
        tags: []
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProjectForm, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
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
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'text-green-600 bg-green-50';
      case ProjectStatus.ON_HOLD:
        return 'text-yellow-600 bg-yellow-50';
      case ProjectStatus.COMPLETED:
        return 'text-blue-600 bg-blue-50';
      case ProjectStatus.CANCELLED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return <CheckCircle className="w-4 h-4" />;
      case ProjectStatus.ON_HOLD:
        return <AlertCircle className="w-4 h-4" />;
      case ProjectStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case ProjectStatus.CANCELLED:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-indigo-600" />
            <span>Create New Project</span>
          </DialogTitle>
          <DialogDescription>
            Create a new project for your team. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Project Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter project description"
              value={formData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Project Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <Select
              value={formData.status || ProjectStatus.ACTIVE}
              onValueChange={(value: string) => handleInputChange('status', value as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProjectStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              Start Date
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('startDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
              End Date
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('endDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              {(formData.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreationForm; 
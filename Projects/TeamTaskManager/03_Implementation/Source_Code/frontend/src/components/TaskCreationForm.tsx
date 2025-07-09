"use client";

import React, { useState, useEffect } from 'react';
import { Task, Project, TaskPriority, TaskStatus, CreateTaskForm } from '@/lib/types';
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
import { Calendar, Clock, User, Folder, AlertCircle, CheckCircle } from 'lucide-react';

interface TaskCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskForm) => Promise<void>;
  projects?: Project[];
  users?: any[];
  initialData?: Partial<CreateTaskForm>;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  users = [],
  initialData = {}
}) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        projectId: '',
        assigneeId: '',
        priority: TaskPriority.MEDIUM,
        dueDate: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTaskForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'text-green-600 bg-green-50';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case TaskPriority.HIGH:
        return 'text-orange-600 bg-orange-50';
      case TaskPriority.URGENT:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return <CheckCircle className="w-4 h-4" />;
      case TaskPriority.MEDIUM:
        return <Clock className="w-4 h-4" />;
      case TaskPriority.HIGH:
        return <AlertCircle className="w-4 h-4" />;
      case TaskPriority.URGENT:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-indigo-600" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            Add a new task to your project. Fill in the details below.
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

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Task Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium text-gray-700">
              Project
            </Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => handleInputChange('projectId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-gray-400" />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Selection */}
          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-sm font-medium text-gray-700">
              Assignee
            </Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => handleInputChange('assigneeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an assignee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange('priority', value as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getPriorityColor(priority)}`}>
                      {getPriorityIcon(priority)}
                      <span className="capitalize">{priority.toLowerCase()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
              Due Date
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="pl-10"
              />
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
              disabled={loading || !formData.title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreationForm; 
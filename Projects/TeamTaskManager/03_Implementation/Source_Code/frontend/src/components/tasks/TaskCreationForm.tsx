// Team Task Manager - Task Creation Form Component
// Sprint 2: Task Creation Interface
// Created: July 6, 2025

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  FormHelperText,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { TaskService } from '../../services/taskService';
import { ProjectService } from '../../services/taskService';
import { 
  CreateTaskForm, 
  TaskStatus, 
  TaskPriority, 
  Project, 
  User 
} from '../../types/task';

interface TaskCreationFormProps {
  onSuccess?: (task: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateTaskForm>;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    projectId: '',
    assigneeId: '',
    tags: [],
    ...initialData
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTag, setNewTag] = useState('');

  // Load projects and users on component mount
  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await ProjectService.getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // This would typically come from a user service
      // For now, we'll use mock data
      const mockUsers: User[] = [
        {
          id: '1',
          displayName: 'John Doe',
          email: 'john@example.com',
          profilePicture: null
        },
        {
          id: '2',
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          profilePicture: null
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTaskForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      const response = await TaskService.createTask(formData);
      
      if (response.success) {
        onSuccess?.(response.data);
        // Reset form
        setFormData({
          title: '',
          description: '',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: null,
          projectId: '',
          assigneeId: '',
          tags: []
        });
      } else {
        setError(response.message || 'Failed to create task');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.IN_PROGRESS: return 'warning';
      case TaskStatus.COMPLETED: return 'success';
      case TaskStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'success';
      case TaskPriority.MEDIUM: return 'warning';
      case TaskPriority.HIGH: return 'error';
      case TaskPriority.URGENT: return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Task
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              error={!formData.title.trim()}
              helperText={!formData.title.trim() ? 'Title is required' : ''}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={4}
              placeholder="Describe the task in detail..."
            />
          </Grid>

          {/* Status and Priority */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
              >
                {Object.values(TaskStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    <Chip 
                      label={status.replace('_', ' ')} 
                      size="small" 
                      color={getStatusColor(status) as any}
                      sx={{ mr: 1 }}
                    />
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Priority"
              >
                {Object.values(TaskPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    <Chip 
                      label={priority.replace('_', ' ')} 
                      size="small" 
                      color={getPriorityColor(priority) as any}
                      sx={{ mr: 1 }}
                    />
                    {priority.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Project Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                label="Project"
              >
                <MenuItem value="">
                  <em>No project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Assignee Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={formData.assigneeId}
                onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                label="Assignee"
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Due Date */}
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) => handleInputChange('dueDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                slotProps={{
                  textField: {
                    InputProps: {
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  deleteIcon={<DeleteIcon />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.title.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskCreationForm; 
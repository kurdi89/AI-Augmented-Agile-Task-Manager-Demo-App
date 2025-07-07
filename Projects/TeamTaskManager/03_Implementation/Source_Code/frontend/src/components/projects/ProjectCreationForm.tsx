// Team Task Manager - Project Creation Form Component
// Sprint 2: Project Management Interface
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
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';

import { projectService } from '../../services/projectService';
import { 
  CreateProjectForm, 
  ProjectStatus, 
  User 
} from '../../types/task';

interface ProjectCreationFormProps {
  onSave?: (project: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateProjectForm>;
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateProjectForm>({
    name: '',
    description: '',
    status: ProjectStatus.ACTIVE,
    members: [],
    ...initialData
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchEmail, setSearchEmail] = useState('');

  // Load available users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // This would typically come from a user service
      // For now, we'll simulate it
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john@example.com',
          displayName: 'John Doe',
          avatar: null,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'jane@example.com',
          displayName: 'Jane Smith',
          avatar: null,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      setError('Failed to load users');
    }
  };

  const handleInputChange = (field: keyof CreateProjectForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMember = (user: User) => {
    if (!formData.members.find(member => member.userId === user.id)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { userId: user.id, role: 'MEMBER' }]
      }));
    }
    setSearchEmail('');
  };

  const handleRemoveMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.userId !== userId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.createProject(formData);

      if (response.success) {
        onSave?.(response.data);
      } else {
        setError(response.message || 'Failed to create project');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMemberUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Create New Project
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Project Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              error={!formData.name}
              helperText={!formData.name ? 'Project name is required' : ''}
            />
          </Grid>

          {/* Project Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
              placeholder="Describe your project..."
            />
          </Grid>

          {/* Project Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
              >
                {Object.values(ProjectStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Team Members Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Team Members
            </Typography>

            {/* Add Member */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search users by email or name..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              {searchEmail && filteredUsers.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {filteredUsers.map((user) => (
                      <ListItem
                        key={user.id}
                        button
                        onClick={() => handleAddMember(user)}
                        disabled={formData.members.some(member => member.userId === user.id)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.displayName} />
                            ) : (
                              <PersonIcon />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.displayName}
                          secondary={user.email}
                        />
                        {formData.members.some(member => member.userId === user.id) && (
                          <Chip label="Added" size="small" color="success" />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            {/* Current Members */}
            {formData.members.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Current Members ({formData.members.length})
                </Typography>
                <List dense>
                  {formData.members.map((member) => {
                    const user = getMemberUser(member.userId);
                    return user ? (
                      <ListItem key={member.userId}>
                        <ListItemAvatar>
                          <Avatar>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.displayName} />
                            ) : (
                              <PersonIcon />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.displayName}
                          secondary={`${user.email} • ${member.role}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveMember(member.userId)}
                            color="error"
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ) : null;
                  })}
                </List>
              </Box>
            )}
          </Grid>

          {/* Error Alert */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">
                {error}
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading || !formData.name}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ProjectCreationForm; 
// Team Task Manager - Project List Component
// Sprint 2: Project Management Interface
// Created: July 6, 2025

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Folder as ProjectIcon,
  Group as GroupIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';

import { projectService } from '../../services/projectService';
import { 
  Project, 
  ProjectStatus, 
  ProjectFilters 
} from '../../types/task';

interface ProjectListProps {
  onProjectSelect?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectCreate?: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  onProjectSelect,
  onProjectEdit,
  onProjectDelete,
  onProjectCreate
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    status: [],
    search: '',
    memberId: ''
  });

  // Load projects on component mount and when filters change
  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getProjects({
        ...filters
      });

      if (response.success) {
        setProjects(response.data);
      } else {
        setError(response.message || 'Failed to load projects');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'success';
      case ProjectStatus.ON_HOLD: return 'warning';
      case ProjectStatus.COMPLETED: return 'info';
      case ProjectStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressPercentage = (project: Project) => {
    if (!project._count?.tasks) return 0;
    const totalTasks = project._count.tasks;
    const completedTasks = project.tasks?.filter(task => task.status === 'COMPLETED').length || 0;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Projects ({projects.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProjects}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onProjectCreate}
          >
            Create Project
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filters.status || []}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                {Object.values(ProjectStatus).map((status) => (
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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Member</InputLabel>
              <Select
                value={filters.memberId || ''}
                onChange={(e) => handleFilterChange('memberId', e.target.value)}
                label="Member"
              >
                <MenuItem value="">All Members</MenuItem>
                {/* Add member options here */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Projects Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first project to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => onProjectSelect?.(project)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Project Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 1,
                        width: 40,
                        height: 40
                      }}
                    >
                      <ProjectIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" noWrap>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {project.owner?.displayName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Project Description */}
                  {project.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>
                  )}

                  {/* Project Status */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={project.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(project.status) as any}
                    />
                  </Box>

                  {/* Project Stats */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TaskIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {project._count?.tasks || 0} tasks
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {project._count?.members || 0} members
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getProgressPercentage(project)}%
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 4 }}>
                      <Box
                        sx={{
                          width: `${getProgressPercentage(project)}%`,
                          bgcolor: 'primary.main',
                          height: 4,
                          borderRadius: 1,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Project Dates */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
                    <span>Created: {formatDate(project.createdAt)}</span>
                    {project.updatedAt && (
                      <span>Updated: {formatDate(project.updatedAt)}</span>
                    )}
                  </Box>
                </CardContent>

                {/* Project Actions */}
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Project">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectSelect?.(project);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Project">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectEdit?.(project);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Project">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectDelete?.(project.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* Quick Stats */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Badge badgeContent={project._count?.tasks || 0} color="primary">
                      <TaskIcon sx={{ fontSize: 16 }} />
                    </Badge>
                    <Badge badgeContent={project._count?.members || 0} color="secondary">
                      <GroupIcon sx={{ fontSize: 16 }} />
                    </Badge>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default ProjectList; 
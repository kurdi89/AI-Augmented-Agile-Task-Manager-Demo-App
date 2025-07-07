// Team Task Manager - Task List Component
// Sprint 2: Task Management Interface
// Created: July 6, 2025

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  Folder as ProjectIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskFilters,
  Project,
  User,
  UpdateTaskForm
} from '../../types/task';

interface TaskListProps {
  onViewTask?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  projectId?: string;
  showFilters?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  onViewTask,
  onEditTask,
  onDeleteTask,
  projectId,
  showFilters = true
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.getTasks(filters, page + 1, rowsPerPage);
      
      if (response.success && response.data) {
        setTasks(response.data);
        setTotalTasks(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Error loading tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load projects and users for filters
  const loadFilterData = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        projectService.getProjects(),
        userService.getUsers()
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        setProjects(projectsResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (err) {
      console.error('Error loading filter data:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  // Handle task selection
  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'delete' | 'update', updates?: Partial<UpdateTaskForm>) => {
    if (selectedTasks.length === 0) return;

    try {
      if (action === 'delete') {
        // Delete selected tasks
        await Promise.all(selectedTasks.map(taskId => taskService.deleteTask(taskId)));
        setSelectedTasks([]);
        loadTasks();
      } else if (action === 'update' && updates) {
        // Update selected tasks
        await taskService.bulkUpdateTasks({
          taskIds: selectedTasks,
          updates
        });
        setSelectedTasks([]);
        loadTasks();
      }
    } catch (err) {
      setError('Error performing bulk action');
      console.error('Error performing bulk action:', err);
    }
  };

  // Get task status color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'default';
      case TaskStatus.IN_PROGRESS: return 'primary';
      case TaskStatus.COMPLETED: return 'success';
      case TaskStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'default';
      case TaskPriority.MEDIUM: return 'primary';
      case TaskPriority.HIGH: return 'warning';
      case TaskPriority.URGENT: return 'error';
      default: return 'default';
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadTasks();
    loadFilterData();
  }, [page, rowsPerPage, filters, projectId]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Tasks</Typography>
        <Box>
          {selectedTasks.length > 0 && (
            <>
              <Button
                size="small"
                color="primary"
                onClick={() => handleBulkAction('update', { status: TaskStatus.COMPLETED })}
                sx={{ mr: 1 }}
              >
                Mark Complete ({selectedTasks.length})
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => handleBulkAction('delete')}
              >
                Delete ({selectedTasks.length})
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || []}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  multiple
                >
                  {Object.values(TaskStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority || []}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  multiple
                >
                  {Object.values(TaskPriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={filters.assigneeId || ''}
                  onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={filters.projectId || ''}
                  onChange={(e) => handleFilterChange('projectId', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                size="small"
                onClick={() => setFilters({})}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Task Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  indeterminate={selectedTasks.length > 0 && selectedTasks.length < tasks.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTasks(tasks.map(task => task.id));
                    } else {
                      setSelectedTasks([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" noWrap>
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {task.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {task.assignee ? task.assignee.displayName : 'Unassigned'}
                </TableCell>
                <TableCell>
                  {task.project ? task.project.name : 'No Project'}
                </TableCell>
                <TableCell>
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {onViewTask && (
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => onViewTask(task)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onEditTask && (
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEditTask(task)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDeleteTask && (
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalTasks}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default TaskList; 
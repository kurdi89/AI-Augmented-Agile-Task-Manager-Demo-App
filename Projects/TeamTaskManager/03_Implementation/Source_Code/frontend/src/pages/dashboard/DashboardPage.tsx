// Team Task Manager - Dashboard Page
// Sprint 2: Main Dashboard Interface
// Created: July 6, 2025

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  TrendingUp as StatsIcon,
  Notifications as NotificationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { dashboardService } from '../../services/taskService';
import { DashboardStats, Task, Project, ActivityItem } from '../../types/task';
import { RootState } from '../../store/store';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Dashboard Statistics Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Recent Activity Component
interface ActivityListProps {
  activities: ActivityItem[];
  loading: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, loading }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h6" component="h3">
        Recent Activity
      </Typography>
      <IconButton size="small">
        <RefreshIcon />
      </IconButton>
    </Box>
    
    {loading ? (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    ) : activities.length === 0 ? (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
        No recent activity
      </Typography>
    ) : (
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={activity.user.profilePicture} alt={activity.user.displayName}>
                  {activity.user.displayName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.title}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < activities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    )}
  </Paper>
);

// Quick Actions Component
const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create Task',
      description: 'Add a new task to your project',
      icon: <TaskIcon />,
      color: '#3B82F6',
      action: () => navigate('/tasks/create')
    },
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: <ProjectIcon />,
      color: '#10B981',
      action: () => navigate('/projects/create')
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: <StatsIcon />,
      color: '#F59E0B',
      action: () => navigate('/analytics')
    }
  ];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ color: action.color, mb: 1 }}>
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" component="div" fontWeight="bold">
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// Main Dashboard Component
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard statistics
      const statsResponse = await dashboardService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Load recent tasks
      const tasksResponse = await dashboardService.getMyTasks();
      if (tasksResponse.success && tasksResponse.data) {
        setRecentTasks(tasksResponse.data.tasks.slice(0, 5));
      }

      // Load recent projects
      const projectsResponse = await dashboardService.getMyProjects();
      if (projectsResponse.success && projectsResponse.data) {
        setRecentProjects(projectsResponse.data.projects.slice(0, 5));
      }

      // Load recent activity
      const activityResponse = await dashboardService.getRecentActivity();
      if (activityResponse.success && activityResponse.data) {
        setActivities(activityResponse.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.firstName || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your tasks and projects
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton>
              <NotificationIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Tasks"
              value={stats.tasks.total}
              icon={<TaskIcon />}
              color="#3B82F6"
              subtitle={`${stats.tasks.done} completed`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Projects"
              value={stats.projects.active}
              icon={<ProjectIcon />}
              color="#10B981"
              subtitle={`${stats.projects.total} total`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="In Progress"
              value={stats.tasks.inProgress}
              icon={<TaskIcon />}
              color="#F59E0B"
              subtitle="Tasks being worked on"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Overdue"
              value={stats.tasks.overdue}
              icon={<TaskIcon />}
              color="#EF4444"
              subtitle="Tasks past due date"
            />
          </Grid>
        </Grid>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <QuickActions />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <ActivityList activities={activities} loading={loading} />
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" component="h3">
                Recent Tasks
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tasks/create')}
              >
                New Task
              </Button>
            </Box>
            
            {recentTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No recent tasks
              </Typography>
            ) : (
              <List>
                {recentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {task.project.name} • Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              <Chip 
                                label={task.status} 
                                size="small" 
                                color={task.status === 'DONE' ? 'success' : 'default'}
                              />
                              <Chip 
                                label={task.priority} 
                                size="small" 
                                color={task.priority === 'URGENT' ? 'error' : 'default'}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" component="h3">
                Recent Projects
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/projects/create')}
              >
                New Project
              </Button>
            </Box>
            
            {recentProjects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No recent projects
              </Typography>
            ) : (
              <List>
                {recentProjects.map((project, index) => (
                  <React.Fragment key={project.id}>
                    <ListItem>
                      <ListItemText
                        primary={project.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {project.description || 'No description'}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              <Chip 
                                label={project.status} 
                                size="small" 
                                color={project.status === 'ACTIVE' ? 'success' : 'default'}
                              />
                              <Chip 
                                label={`${project.tasks.length} tasks`} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentProjects.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage; 
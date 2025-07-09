// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: ProjectMember[];
  tasks?: Task[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user?: User;
  project?: Project;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  userId?: string;
  role: ProjectRole;
  status: InviteStatus;
  invitedById: string;
  invitedAt: string;
  expiresAt?: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  creator?: User;
  project?: Project;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  timeEntries?: TimeEntry[];
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: string;
  uploader?: User;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  projectId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  ownerId?: string;
  search?: string;
  tags?: string[];
}

// Form Types
export interface CreateTaskForm {
  title: string;
  description?: string;
  projectId?: string;
  assigneeId?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskForm {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface CreateProjectForm {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface UpdateProjectForm {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

// Dashboard Types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalProjects: number;
  activeProjects: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'project_updated';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  user?: User;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'project_invite' | 'mention' | 'due_date';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  relatedId?: string;
}

// WebSocket Event Types
export interface WebSocketEvents {
  'task:created': Task;
  'task:updated': Task;
  'task:deleted': { id: string };
  'project:created': Project;
  'project:updated': Project;
  'project:deleted': { id: string };
  'user:joined': { userId: string; projectId: string };
  'user:left': { userId: string; projectId: string };
  'notification:new': Notification;
}

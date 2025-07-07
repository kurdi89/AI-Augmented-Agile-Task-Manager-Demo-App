// Team Task Manager - Task Management Types
// Sprint 2: TypeScript Interfaces and Enums
// Created: July 6, 2025

// Task Status Enum
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Task Priority Enum
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Project Status Enum
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Project Role Enum
export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

// Invite Status Enum
export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

// User Interface
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Task Interface
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  projectId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  assignee?: User;
  project?: Project;
  createdBy?: User;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  timeEntries?: TimeEntry[];
}

// Project Interface
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  owner?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  invites?: ProjectInvite[];
  
  // Counts for UI
  _count?: {
    tasks?: number;
    members?: number;
  };
}

// Project Member Interface
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  
  // Relations
  project?: Project;
  user?: User;
}

// Project Invite Interface
export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: ProjectRole;
  status: InviteStatus;
  invitedById: string;
  invitedAt: string;
  expiresAt: string;
  
  // Relations
  project?: Project;
  invitedBy?: User;
}

// Task Attachment Interface
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: string;
  
  // Relations
  task?: Task;
  uploadedBy?: User;
}

// Task Comment Interface
export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  task?: Task;
  author?: User;
}

// Time Entry Interface
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  task?: Task;
  user?: User;
}

// Form Interfaces
export interface CreateTaskForm {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
  tags?: string[];
}

export interface UpdateTaskForm {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
  tags?: string[];
}

export interface CreateProjectForm {
  name: string;
  description?: string;
  status: ProjectStatus;
  members: Array<{
    userId: string;
    role: ProjectRole;
  }>;
}

export interface UpdateProjectForm {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

// Filter Interfaces
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  projectId?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  search?: string;
  memberId?: string;
}

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  totalMembers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'project_created' | 'member_added';
  description: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
  
  // Relations
  user?: User;
  task?: Task;
  project?: Project;
}

// Search and Filter Interfaces
export interface SearchFilters {
  query: string;
  filters: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    project?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Bulk Operations
export interface BulkTaskUpdate {
  taskIds: string[];
  updates: Partial<UpdateTaskForm>;
}

export interface BulkProjectUpdate {
  projectIds: string[];
  updates: Partial<UpdateProjectForm>;
}

// Notification Interfaces
export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_due' | 'project_invite' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Real-time Event Interfaces
export interface RealTimeEvent {
  type: 'task_updated' | 'task_created' | 'task_deleted' | 'project_updated' | 'member_added' | 'comment_added';
  data: any;
  timestamp: string;
  userId: string;
} 
// Team Task Manager - Socket.io Service
// Sprint 2: Real-time Collaboration
// Created: July 6, 2025

import { Server, Socket } from 'socket.io';
import { Task, Project, User } from '@prisma/client';

// Define the types for the events
interface TaskUpdatePayload {
  projectId: string;
  task: Task;
}

interface TaskDeletePayload {
  projectId: string;
  taskId: string;
}

interface NotificationPayload {
  userId: string;
  message: string;
  type: string; // e.g., 'task_assigned', 'task_updated', 'project_update'
  link?: string;
}

interface PresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'idle';
  lastActive?: Date;
}

class SocketService {
  private io: Server;

  constructor(server: Server) {
    this.io = server;
    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);
      this.handleEvents(socket);
    });
  }

  private handleEvents(socket: Socket) {
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    socket.on('joinProject', (projectId: string) => {
      socket.join(projectId);
      console.log(`Client ${socket.id} joined project room: ${projectId}`);
    });

    socket.on('leaveProject', (projectId: string) => {
      socket.leave(projectId);
      console.log(`Client ${socket.id} left project room: ${projectId}`);
    });

    // Example event
    socket.on('ping', () => {
      socket.emit('pong');
    });

    socket.on('userOnline', (userId: string) => {
      this.io.emit('userPresence', { userId, status: 'online', lastActive: new Date() });
    });

    socket.on('userOffline', (userId: string) => {
      this.io.emit('userPresence', { userId, status: 'offline', lastActive: new Date() });
    });

    socket.on('userIdle', (userId: string) => {
      this.io.emit('userPresence', { userId, status: 'idle', lastActive: new Date() });
    });
  }

  // --- Public methods for broadcasting events ---

  public emitTaskCreated(payload: TaskUpdatePayload) {
    this.io.to(payload.projectId).emit('task_created', payload.task);
    this.io.to(payload.task.assigneeId || '').emit('notification', {
      userId: payload.task.assigneeId,
      message: `You have been assigned a new task: ${payload.task.title}`,
      type: 'task_assigned',
      link: `/tasks/${payload.task.id}`
    });
  }

  public emitTaskUpdated(payload: TaskUpdatePayload) {
    this.io.to(payload.projectId).emit('task_updated', payload.task);
    // Notify assignee if changed
    if (payload.task.assigneeId) {
      this.io.to(payload.task.assigneeId).emit('notification', {
        userId: payload.task.assigneeId,
        message: `Task "${payload.task.title}" has been updated.`,
        type: 'task_updated',
        link: `/tasks/${payload.task.id}`
      });
    }
  }

  public emitTaskDeleted(payload: TaskDeletePayload) {
    this.io.to(payload.projectId).emit('task_deleted', payload.taskId);
  }

  public emitProjectUpdate(projectId: string, project: Project) {
    this.io.to(projectId).emit('project_updated', project);
  }

  public emitNotification(payload: NotificationPayload) {
    this.io.to(payload.userId).emit('notification', payload);
  }

  public emitPresenceUpdate(payload: PresencePayload) {
    this.io.emit('userPresence', payload);
  }

  public getIO(): Server {
    return this.io;
  }
}

export default SocketService;

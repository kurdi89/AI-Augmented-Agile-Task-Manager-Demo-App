// Team Task Manager - Task Routes
// Sprint 2: Task Management API Routes
// Created: July 6, 2025

import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTasks,
  getTaskStats
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Task routes
router.get('/', getTasks);                    // GET /api/tasks - Get all tasks with filtering
router.get('/stats', getTaskStats);          // GET /api/tasks/stats - Get task statistics
router.get('/:id', getTaskById);             // GET /api/tasks/:id - Get single task
router.post('/', createTask);                // POST /api/tasks - Create new task
router.put('/:id', updateTask);              // PUT /api/tasks/:id - Update task
router.delete('/:id', deleteTask);           // DELETE /api/tasks/:id - Delete task
router.patch('/bulk', bulkUpdateTasks);      // PATCH /api/tasks/bulk - Bulk update tasks

export default router; 
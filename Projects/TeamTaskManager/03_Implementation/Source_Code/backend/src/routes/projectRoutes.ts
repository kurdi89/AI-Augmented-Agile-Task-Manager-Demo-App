// Team Task Manager - Project Routes
// Sprint 2: Project Management API Routes
// Created: July 6, 2025

import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
  inviteUserToProject,
  getProjectStats
} from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Project routes
router.get('/', getProjects);                                    // GET /api/projects - Get all projects
router.get('/:id', getProjectById);                             // GET /api/projects/:id - Get single project
router.post('/', createProject);                                // POST /api/projects - Create new project
router.put('/:id', updateProject);                              // PUT /api/projects/:id - Update project
router.delete('/:id', deleteProject);                           // DELETE /api/projects/:id - Delete project

// Project statistics
router.get('/:id/stats', getProjectStats);                      // GET /api/projects/:id/stats - Get project statistics

// Project member management
router.post('/:projectId/members', addProjectMember);           // POST /api/projects/:projectId/members - Add member
router.delete('/:projectId/members/:userId', removeProjectMember); // DELETE /api/projects/:projectId/members/:userId - Remove member
router.put('/:projectId/members/:userId/role', updateMemberRole); // PUT /api/projects/:projectId/members/:userId/role - Update member role

// Project invites
router.post('/:projectId/invites', inviteUserToProject);       // POST /api/projects/:projectId/invites - Invite user

export default router; 
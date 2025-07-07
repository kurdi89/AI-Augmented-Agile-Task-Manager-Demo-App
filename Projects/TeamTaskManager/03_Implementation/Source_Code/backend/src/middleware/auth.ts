// Team Task Manager - Authentication Middleware
// Sprint 2: JWT Token Validation
// Created: July 6, 2025

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as any;
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID required'
      });
    }

    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: req.user!.id
      }
    });

    if (!projectMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to project'
      });
    }

    next();
  } catch (error) {
    console.error('Project access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify project access'
    });
  }
};

export const requireTaskAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = req.params.taskId || req.body.taskId;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID required'
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId: req.user!.id }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Allow access if user is assignee, project owner, or project member
    const isAssignee = task.assigneeId === req.user!.id;
    const isProjectOwner = task.project?.ownerId === req.user!.id;
    const isProjectMember = task.project?.members.length > 0;

    if (!isAssignee && !isProjectOwner && !isProjectMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to task'
      });
    }

    next();
  } catch (error) {
    console.error('Task access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify task access'
    });
  }
}; 
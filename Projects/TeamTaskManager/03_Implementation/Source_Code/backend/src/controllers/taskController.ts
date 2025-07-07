// Team Task Manager - Task Controller
// Sprint 2: Task Management API
// Created: July 6, 2025

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

// Types
interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  projectId?: string;
  assigneeId?: string;
  tags?: string[];
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  projectId?: string;
  assigneeId?: string;
  tags?: string[];
}

interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  projectId?: string;
  search?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

// Get all tasks with filtering and pagination
export const getTasks = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assigneeId,
      projectId,
      search,
      dueDateFrom,
      dueDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = { in: Array.isArray(status) ? status : [status] };
    }

    if (priority) {
      where.priority = { in: Array.isArray(priority) ? priority : [priority] };
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom as string);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo as string);
    }

    // Get tasks with related data
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            fileSize: true,
            mimeType: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        timeEntries: {
          select: {
            id: true,
            duration: true,
            description: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip,
      take: limitNum
    });

    // Get total count for pagination
    const total = await prisma.task.count({ where });

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        attachments: {
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        timeEntries: {
          orderBy: { startTime: 'desc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
      tags
    }: CreateTaskRequest = req.body;

    // Validate required fields
    if (!title || !status || !priority) {
      return res.status(400).json({
        success: false,
        message: 'Title, status, and priority are required'
      });
    }

    // Validate project exists if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Validate assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      });
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assignee not found'
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId,
        createdById: req.user?.id,
        tags: tags || []
      },
      include: {
        assignee: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        createdBy: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate project exists if provided
    if (updateData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: updateData.projectId }
      });
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Validate assignee exists if provided
    if (updateData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: updateData.assigneeId }
      });
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assignee not found'
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        assignee: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        attachments: {
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete related records first (cascade delete)
    await prisma.taskComment.deleteMany({
      where: { taskId: id }
    });

    await prisma.taskAttachment.deleteMany({
      where: { taskId: id }
    });

    await prisma.timeEntry.deleteMany({
      where: { taskId: id }
    });

    // Delete the task
    await prisma.task.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk update tasks
export const bulkUpdateTasks = async (req: Request, res: Response) => {
  try {
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs are required'
      });
    }

    const updateData: UpdateTaskRequest = updates;

    // Validate project exists if provided
    if (updateData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: updateData.projectId }
      });
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Validate assignee exists if provided
    if (updateData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: updateData.assigneeId }
      });
      if (!assignee) {
        return res.status(400).json({
          success: false,
          message: 'Assignee not found'
        });
      }
    }

    const updatedTasks = await prisma.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `${updatedTasks.count} tasks updated successfully`,
      data: { updatedCount: updatedTasks.count }
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update tasks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get task statistics
export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const { projectId, assigneeId, dateFrom, dateTo } = req.query;

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        tasksByStatus,
        tasksByPriority
      }
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 
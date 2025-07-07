// Team Task Manager - Project Controller
// Sprint 2: Project Management API
// Created: July 6, 2025

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProjectStatus, ProjectRole } from '@prisma/client';

const prisma = new PrismaClient();

// Types
interface CreateProjectRequest {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

interface AddMemberRequest {
  userId: string;
  role: ProjectRole;
}

// Get all projects with filtering and pagination
export const getProjects = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      memberId,
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

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (memberId) {
      where.members = {
        some: {
          userId: memberId
        }
      };
    }

    // Get projects with related data
    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true,
                email: true
              }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip,
      take: limitNum
    });

    // Get total count for pagination
    const total = await prisma.project.count({ where });

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true,
                email: true
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        invites: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      tags
    }: CreateProjectRequest = req.body;

    // Validate required fields
    if (!name || !status) {
      return res.status(400).json({
        success: false,
        message: 'Name and status are required'
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: req.user?.id,
        tags: tags || []
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProjectRequest = req.body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                profilePicture: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete related records first (cascade delete)
    await prisma.task.deleteMany({
      where: { projectId: id }
    });

    await prisma.projectMember.deleteMany({
      where: { projectId: id }
    });

    await prisma.projectInvite.deleteMany({
      where: { projectId: id }
    });

    // Delete the project
    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add member to project
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId, role }: AddMemberRequest = req.body;

    // Validate required fields
    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
        joinedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: member
    });
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add project member',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Remove member from project
export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.params;

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Remove member
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing project member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove project member',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    // Check if member exists
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const member = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            profilePicture: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: member
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member role',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Invite user to project
export const inviteUserToProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required'
      });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Check if invite already exists
    const existingInvite = await prisma.projectInvite.findFirst({
      where: {
        projectId,
        userId: user.id,
        status: 'PENDING'
      }
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'User already has a pending invite'
      });
    }

    const invite = await prisma.projectInvite.create({
      data: {
        projectId,
        userId: user.id,
        role,
        invitedById: req.user?.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        },
        invitedBy: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Invite sent successfully',
      data: invite
    });
  } catch (error) {
    console.error('Error inviting user to project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite user to project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get project statistics
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalMembers,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.count({ where: { projectId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { projectId, status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          projectId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      prisma.projectMember.count({ where: { projectId } }),
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: { status: true }
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { projectId },
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
        totalMembers,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        tasksByStatus,
        tasksByPriority
      }
    });
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { protect } = require('./middleware/auth');
const { PrismaClient } = require('./generated/prisma');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const uploadRoutes = require('./routes/upload');

const prisma = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

// Make io available to routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.User.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  // a real app would compare a hashed password
  if (password !== user.password_hash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT_SECRET not defined' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.json({ token });
});

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.User.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await prisma.User.create({
      data: {
        id: uuidv4(),
        email,
        password_hash: password, // In a real app, you should hash the password
        first_name: firstName,
        last_name: lastName,
      },
    });
    res.json(user);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await prisma.User.findUnique({
      where: { email }
    });

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // In a real app, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send an email with the reset link
    // 4. Use a proper email service like SendGrid, AWS SES, etc.

    // For demo purposes, we'll just return success
    console.log(`Password reset requested for: ${email}`);
    
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Get tasks endpoint
app.get('/api/tasks', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { page = 1, limit = 20, projectId, status, priority, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      created_by: req.user.id,
      ...(projectId && { project_id: projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [tasks, total] = await Promise.all([
      prisma.Task.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          assignee: true,
          creator: true,
          project: true
        }
      }),
      prisma.Task.count({ where })
    ]);

    res.json({
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to load tasks' });
  }
});

// Get projects endpoint
app.get('/api/projects', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      owner_id: req.user.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [projects, total] = await Promise.all([
      prisma.Project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          owner: true,
          members: {
            include: {
              user: true
            }
          },
          tasks: true
        }
      }),
      prisma.Project.count({ where })
    ]);

    res.json({
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to load projects' });
  }
});

app.post('/api/projects', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const project = await prisma.Project.create({
      data: {
        name,
        description,
        owner_id: req.user.id,
      },
    });
    await prisma.ProjectMember.create({
      data: {
        project_id: project.id,
        user_id: req.user.id,
        role: 'OWNER',
      },
    });
    io.emit('project:created', project);
    res.json(project);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', protect, async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, tags } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user owns the project
    const existingProject = await prisma.Project.findUnique({
      where: { id: req.params.id }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (existingProject.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.start_date = new Date(startDate);
    if (endDate !== undefined) updateData.end_date = new Date(endDate);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    const project = await prisma.Project.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        },
        tasks: true
      }
    });

    io.emit('project:updated', project);
    res.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user owns the project
    const existingProject = await prisma.Project.findUnique({
      where: { id: req.params.id }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (existingProject.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await prisma.Project.delete({
      where: { id: req.params.id },
    });

    io.emit('project:deleted', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

app.post('/api/tasks', protect, async (req, res) => {
  try {
    const { title, description, projectId } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const task = await prisma.Task.create({
      data: {
        title,
        description,
        project_id: projectId,
        created_by: req.user.id,
      },
    });
    io.emit('task:created', task);
    res.json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', protect, async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId } = req.body;
    const task = await prisma.Task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        assignee_id: assigneeId,
      },
    });
    io.emit('task:updated', task);
    res.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await prisma.Task.delete({
      where: { id: req.params.id },
    });
    io.emit('task:deleted', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

app.use('/api/upload', uploadRoutes);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get task statistics
    const totalTasks = await prisma.Task.count({
      where: { created_by: req.user.id }
    });

    const completedTasks = await prisma.Task.count({
      where: { 
        created_by: req.user.id,
        status: 'COMPLETED'
      }
    });

    const pendingTasks = await prisma.Task.count({
      where: { 
        created_by: req.user.id,
        status: { in: ['TODO', 'IN_PROGRESS'] }
      }
    });

    // Get project statistics
    const totalProjects = await prisma.Project.count({
      where: { owner_id: req.user.id }
    });

    const activeProjects = await prisma.Project.count({
      where: { 
        owner_id: req.user.id,
        status: 'ACTIVE'
      }
    });

    // Get recent activity (last 10 activities)
    const recentActivity = await prisma.Task.findMany({
      where: { created_by: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        creator: true
      }
    });

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalProjects,
      activeProjects,
      recentActivity: recentActivity.map(task => ({
        id: task.id,
        type: 'task_created',
        title: `Task "${task.title}" created`,
        description: `New task created by ${task.creator?.first_name || 'Unknown'}`,
        timestamp: task.created_at,
        userId: task.created_by,
        user: task.creator
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

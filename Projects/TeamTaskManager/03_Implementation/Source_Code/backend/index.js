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

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.users.findUnique({ where: { email } });
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
  const { email, password, firstName, lastName } = req.body;
  const user = await prisma.users.create({
    data: {
      id: uuidv4(),
      email,
      password_hash: password, // In a real app, you should hash the password
      first_name: firstName,
      last_name: lastName,
    },
  });
  res.json(user);
});

app.post('/api/projects', protect, async (req, res) => {
  const { name, description } = req.body;
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: req.user.id,
    },
  });
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: req.user.id,
      role: 'OWNER',
    },
  });
  io.emit('project:created', project);
  res.json(project);
});

app.post('/api/tasks', protect, async (req, res) => {
  const { title, description, projectId } = req.body;
  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      createdById: req.user.id,
    },
  });
  io.emit('task:created', task);
  res.json(task);
});

app.put('/api/tasks/:id', protect, async (req, res) => {
  const { title, description, status, priority, assigneeId } = req.body;
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      title,
      description,
      status,
      priority,
      assigneeId,
    },
  });
  io.emit('task:updated', task);
  res.json(task);
});

app.delete('/api/tasks/:id', protect, async (req, res) => {
  const task = await prisma.task.delete({
    where: { id: req.params.id },
  });
  io.emit('task:deleted', { id: req.params.id });
  res.status(204).send();
});

app.use('/api/upload', uploadRoutes);

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

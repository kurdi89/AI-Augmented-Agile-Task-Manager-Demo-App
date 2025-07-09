# Team Task Manager - Technical Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Documentation](#backend-documentation)
3. [Frontend Documentation](#frontend-documentation)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Development Setup](#development-setup)
7. [Deployment Guide](#deployment-guide)
8. [Testing Strategy](#testing-strategy)

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│   - React 19    │    │   - REST API    │    │   - Prisma ORM  │
│   - TypeScript  │    │   - WebSocket   │    │   - Migrations  │
│   - Tailwind    │    │   - JWT Auth    │    │   - Indexes     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io 4.8.1
- **File Upload**: Multer 2.0.1
- **Validation**: Custom validation middleware

#### Frontend
- **Framework**: Next.js 15.3.5
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React hooks + Zustand
- **HTTP Client**: Axios 1.10.0
- **Real-time**: Socket.io Client 4.8.1
- **Icons**: Lucide React 0.525.0

#### Development Tools
- **Package Manager**: npm
- **TypeScript**: 5.x
- **Linting**: ESLint 9
- **Testing**: Jest 30.0.4
- **Database GUI**: Prisma Studio

---

## 🔧 Backend Documentation

### Project Structure
```
backend/
├── index.js                 # Main Express server
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
├── routes/
│   └── upload.js          # File upload endpoints
├── middleware/
│   └── auth.js            # JWT authentication
├── prisma/
│   └── schema.prisma      # Database schema
└── generated/
    └── prisma/            # Generated Prisma client
```

### Key Components

#### Express Server (`index.js`)
```javascript
// Main server setup with middleware
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

// Middleware configuration
app.use(cors());
app.use(express.json());

// WebSocket setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});
```

#### Authentication Middleware (`middleware/auth.js`)
```javascript
// JWT token validation
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

#### API Endpoints

##### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

##### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

##### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

##### File Upload
- `POST /api/upload` - Upload files

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"

# Authentication
JWT_SECRET="your-secret-key"

# Server
PORT=4000
NODE_ENV=development
```

---

## 🎨 Frontend Documentation

### Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard
│   │   ├── auth/                 # Authentication pages
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ProjectList.tsx       # Project display
│   │   ├── FileUpload.tsx        # File upload
│   │   ├── FilePreview.tsx       # File preview
│   │   └── ui/                   # UI components
│   └── lib/
│       ├── types.ts              # TypeScript types
│       ├── socket.ts             # WebSocket client
│       └── utils.ts              # Utility functions
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### Key Components

#### Dashboard (`src/app/dashboard/page.tsx`)
```typescript
"use client";

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Task } from '@/lib/types';

const DashboardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    socket.on('task:created', (newTask: Task) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on('task:updated', (updatedTask: Task) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
    };
  }, []);

  return (
    <div>
      <h1>Dashboard Page</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

#### Type Definitions (`src/lib/types.ts`)
```typescript
export interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface Project {
  id: number;
  name: string;
}
```

#### WebSocket Client (`src/lib/socket.ts`)
```typescript
import { io } from 'socket.io-client';

export const socket = io('http://localhost:4000', {
  autoConnect: true,
});
```

### Styling
The application uses Tailwind CSS for styling with a modern, responsive design approach.

---

## 🗄️ Database Schema

### Core Models

#### Users
```prisma
model users {
  id                    String    @id
  email                 String    @unique
  password_hash         String
  first_name            String
  last_name             String
  profile_picture_url   String?
  email_verified        Boolean   @default(false)
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  // Relations
  Project               Project[]
  ProjectMember         ProjectMember[]
  Task_Task_assigneeIdTousers    Task[]
  Task_Task_createdByIdTousers   Task[]
  TaskAttachment        TaskAttachment[]
  TaskComment           TaskComment[]
  TimeEntry             TimeEntry[]
}
```

#### Projects
```prisma
model Project {
  id            String          @id
  name          String
  description   String?
  status        ProjectStatus   @default(ACTIVE)
  startDate     DateTime?
  endDate       DateTime?
  tags          String[]        @default([])
  ownerId       String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime
  
  // Relations
  users         users           @relation(fields: [ownerId], references: [id])
  ProjectMember ProjectMember[]
  Task          Task[]
}
```

#### Tasks
```prisma
model Task {
  id                            String           @id
  title                         String
  description                   String?
  status                        TaskStatus       @default(TODO)
  priority                      TaskPriority     @default(MEDIUM)
  dueDate                       DateTime?
  assigneeId                    String?
  projectId                     String?
  createdById                   String
  createdAt                     DateTime         @default(now())
  updatedAt                     DateTime
  
  // Relations
  users_Task_assigneeIdTousers  users?           @relation("Task_assigneeIdTousers", fields: [assigneeId], references: [id])
  users_Task_createdByIdTousers users            @relation("Task_createdByIdTousers", fields: [createdById], references: [id])
  Project                       Project?         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  TaskAttachment                TaskAttachment[]
  TaskComment                   TaskComment[]
  TimeEntry                     TimeEntry[]
}
```

### Enums
```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ProjectStatus {
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/signup
**Description**: Register new user

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-07-08T10:00:00Z"
}
```

### Project Endpoints

#### POST /api/projects
**Description**: Create new project

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "Project Name",
  "description": "Project description"
}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Project description",
  "status": "ACTIVE",
  "ownerId": "user-uuid",
  "createdAt": "2025-07-08T10:00:00Z"
}
```

### Task Endpoints

#### POST /api/tasks
**Description**: Create new task

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Task Title",
  "description": "Task description",
  "projectId": "project-uuid"
}
```

**Response**:
```json
{
  "id": "uuid",
  "title": "Task Title",
  "description": "Task description",
  "status": "TODO",
  "priority": "MEDIUM",
  "projectId": "project-uuid",
  "createdById": "user-uuid",
  "createdAt": "2025-07-08T10:00:00Z"
}
```

### WebSocket Events

#### Client to Server
- `task:create` - Create new task
- `task:update` - Update existing task
- `task:delete` - Delete task
- `project:create` - Create new project

#### Server to Client
- `task:created` - Task created notification
- `task:updated` - Task updated notification
- `task:deleted` - Task deleted notification
- `project:created` - Project created notification

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd Projects/TeamTaskManager/03_Implementation/Source_Code/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and JWT settings

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd Projects/TeamTaskManager/03_Implementation/Source_Code/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
```bash
# Create database
createdb taskmanager

# Run migrations
npm run prisma:migrate

# Seed database (if seed script exists)
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

### Development Scripts
```bash
# Run both frontend and backend
npm run dev

# Run individually
npm run backend
npm run frontend

# Database operations
npm run db:generate
npm run db:migrate
npm run db:studio

# Testing
npm run test
npm run lint
```

---

## 🚀 Deployment Guide

### Production Environment

#### Backend Deployment
```bash
# Build for production
npm run build

# Set production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret"

# Start production server
npm start
```

#### Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret"
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL="https://api.yourapp.com"
NEXT_PUBLIC_WS_URL="wss://api.yourapp.com"
```

---

## 🧪 Testing Strategy

### Testing Pyramid
```
    E2E Tests (Few)
       ▲
   Integration Tests (Some)
       ▲
    Unit Tests (Many)
```

### Unit Testing
```javascript
// Example unit test for task service
describe('TaskService', () => {
  it('should create a new task', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      projectId: 'project-uuid'
    };
    
    const task = await TaskService.create(taskData);
    
    expect(task.title).toBe(taskData.title);
    expect(task.status).toBe('TODO');
  });
});
```

### Integration Testing
```javascript
// Example integration test for API
describe('Task API', () => {
  it('should create task via API', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'Test Description'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Test Task');
  });
});
```

### End-to-End Testing
```javascript
// Example E2E test with Cypress
describe('Task Management', () => {
  it('should create and update a task', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="create-task"]').click();
    cy.get('[data-testid="task-title"]').type('New Task');
    cy.get('[data-testid="save-task"]').click();
    cy.get('[data-testid="task-list"]').should('contain', 'New Task');
  });
});
```

### Test Coverage Goals
- **Unit Tests**: > 80% coverage
- **Integration Tests**: > 60% coverage
- **E2E Tests**: Critical user flows
- **Performance Tests**: API response times

---

## 📊 Performance Optimization

### Backend Optimization
- Database query optimization with Prisma
- Connection pooling
- Caching strategies
- Rate limiting
- Compression middleware

### Frontend Optimization
- Code splitting with Next.js
- Image optimization
- Bundle size optimization
- Lazy loading
- Service worker for caching

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Regular maintenance

---

## 🔒 Security Considerations

### Authentication
- JWT token validation
- Password hashing (bcrypt)
- Rate limiting for login attempts
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### API Security
- CORS configuration
- Request size limits
- File upload validation
- Error handling without information leakage

---

**Last Updated**: July 8, 2025  
**Version**: 1.0.0  
**Status**: �� **IN DEVELOPMENT** 
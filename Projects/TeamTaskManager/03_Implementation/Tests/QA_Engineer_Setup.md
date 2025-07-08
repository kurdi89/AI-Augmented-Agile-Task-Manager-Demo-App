# Sprint 2 QA Engineer Setup Guide - Team Task Manager

## 🎯 Sprint 2 QA Engineer Activation

**Sprint**: Sprint 2 (July 19, 2025 - July 31, 2025)
**Status**: ✅ **ACTIVATED**
**Assignment**: Comprehensive testing of Sprint 2 implemented features
**Start Date**: July 7, 2025
**Timeline**: 4-week Sprint 2 testing cycle

---

## 🚀 Sprint 2 Quick Start Setup

### 1. Environment Setup

#### Prerequisites
```bash
# Navigate to project directory
cd Projects/TeamTaskManager/03_Implementation/Source_Code

# Verify Sprint 2 implementations
ls -la frontend/
ls -la backend/
```

#### Frontend Testing Setup (Sprint 2 Focus)
```bash
cd frontend/

# Install testing dependencies for Sprint 2
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event @testing-library/dom
npm install --save-dev @types/jest

# Create test configuration for Sprint 2
echo '{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/serviceWorker.ts"
  ]
}' > jest.config.js

# Create setup file
echo 'import "@testing-library/jest-dom";' > src/setupTests.js
```

#### Backend Testing Setup (Sprint 2 Focus)
```bash
cd ../backend/

# Install testing dependencies for Sprint 2
npm install --save-dev jest supertest @types/jest @types/supertest
npm install --save-dev ts-jest

# Create test configuration for Sprint 2
echo '{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/src", "<rootDir>/tests"],
  "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ]
}' > jest.config.js
```

### 2. Sprint 2 Test Database Setup

#### Create Test Database
```bash
# Create test database for Sprint 2
createdb team_task_manager_sprint2_test

# Update .env.test file for Sprint 2
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager_sprint2_test"
JWT_SECRET="sprint2-test-secret-key"
NODE_ENV="test"' > .env.test
```

#### Database Migration for Sprint 2 Testing
```bash
# Run migrations for Sprint 2 test database
npx prisma migrate deploy --schema=./database/schema.prisma
npx prisma generate --schema=./database/schema.prisma
```

### 3. Sprint 2 Test Scripts Setup

#### Frontend Package.json Updates (Sprint 2)
```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:ci": "react-scripts test --coverage --watchAll=false --ci",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:sprint2": "npm run test:coverage"
  }
}
```

#### Backend Package.json Updates (Sprint 2)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:sprint2": "npm run test:coverage"
  }
}
```

---

## 📋 Sprint 2 Testing Priority Matrix

### Week 1: Sprint 2 Critical Features (Authentication & Database)

#### High Priority Tests (Sprint 2 Focus)
1. **Authentication System** ✅ **READY FOR TESTING**
   - User registration
   - User login/logout
   - JWT token management
   - Password reset functionality

2. **Database Operations** ✅ **READY FOR TESTING**
   - Prisma schema validation
   - CRUD operations
   - Data relationships
   - Constraint validation

3. **API Services** ✅ **READY FOR TESTING**
   - TaskService methods
   - ProjectService methods
   - UserService methods
   - AuthService methods

#### Sprint 2 Test Files to Create
```
Tests/Sprint2/
├── frontend/
│   ├── __tests__/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   ├── RegisterForm.test.tsx
│   │   │   │   └── PasswordReset.test.tsx
│   │   │   └── dashboard/
│   │   │       └── Dashboard.test.tsx
│   │   └── services/
│   │       ├── authService.test.ts
│   │       ├── taskService.test.ts
│   │       ├── projectService.test.ts
│   │       └── userService.test.ts
│   └── e2e/
│       └── auth.spec.ts
└── backend/
    ├── __tests__/
    │   ├── controllers/
    │   │   ├── authController.test.ts
    │   │   ├── taskController.test.ts
    │   │   └── projectController.test.ts
    │   ├── services/
    │   │   ├── authService.test.ts
    │   │   ├── taskService.test.ts
    │   │   └── projectService.test.ts
    │   ├── middleware/
    │   │   └── auth.test.ts
    │   └── database/
    │       └── prisma.test.ts
    └── integration/
        ├── auth.test.ts
        ├── tasks.test.ts
        └── projects.test.ts
```

### Week 2-3: Sprint 2 Feature Components

#### Medium Priority Tests (Sprint 2 Focus)
1. **Frontend Components** 🔄 **PARTIALLY READY**
   - Task creation forms
   - Task list components
   - Project management UI
   - Dashboard components

2. **Backend Controllers** 🔄 **PARTIALLY READY**
   - Task CRUD operations
   - Project CRUD operations
   - Member management
   - File handling

3. **Integration Testing** 🔄 **READY TO START**
   - Frontend-backend integration
   - API client testing
   - Error handling
   - State management

### Week 4: Sprint 2 Advanced Features

#### Low Priority Tests (Sprint 2 Focus)
1. **Performance Testing**
   - Load testing
   - Bundle size analysis
   - Response time optimization

2. **Security Testing**
   - Vulnerability assessment
   - Penetration testing
   - Security best practices

3. **Cross-Browser Testing**
   - Browser compatibility
   - Mobile responsiveness
   - Accessibility testing

---

## 🧪 Sprint 2 Test Implementation Guide

### 1. Sprint 2 Authentication Testing

#### Frontend Auth Tests (Sprint 2 Focus)
```typescript
// Tests/Sprint2/frontend/__tests__/components/auth/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../../src/components/auth/LoginForm';

describe('Sprint 2 - LoginForm', () => {
  test('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<LoginForm />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

#### Backend Auth Tests (Sprint 2 Focus)
```typescript
// Tests/Sprint2/backend/__tests__/controllers/authController.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Sprint 2 - Auth Controller', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    test('creates new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('rejects duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('logs in with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    test('rejects invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### 2. Sprint 2 Database Testing

#### Prisma Operations Test (Sprint 2 Focus)
```typescript
// Tests/Sprint2/backend/__tests__/database/prisma.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Sprint 2 - Database Operations', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Operations', () => {
    test('creates user with valid data', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          firstName: 'John',
          lastName: 'Doe'
        }
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
    });

    test('enforces unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe'
      };

      await prisma.user.create({ data: userData });

      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow();
    });
  });

  describe('Project Operations', () => {
    test('creates project with owner', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          password: 'hashedpassword',
          firstName: 'John',
          lastName: 'Doe'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          description: 'Test Description',
          ownerId: user.id,
          status: 'ACTIVE'
        }
      });

      expect(project).toHaveProperty('id');
      expect(project.name).toBe('Test Project');
      expect(project.ownerId).toBe(user.id);
    });
  });

  describe('Task Operations', () => {
    test('creates task with project', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'user@example.com',
          password: 'hashedpassword',
          firstName: 'John',
          lastName: 'Doe'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          description: 'Test Description',
          ownerId: user.id,
          status: 'ACTIVE'
        }
      });

      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          description: 'Test Task Description',
          status: 'TODO',
          priority: 'MEDIUM',
          projectId: project.id,
          assigneeId: user.id,
          createdById: user.id
        }
      });

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.projectId).toBe(project.id);
      expect(task.assigneeId).toBe(user.id);
    });
  });
});
```

### 3. Sprint 2 API Service Testing

#### TaskService Tests (Sprint 2 Focus)
```typescript
// Tests/Sprint2/frontend/__tests__/services/taskService.test.ts
import { TaskService } from '../../../src/services/taskService';
import { mockApiClient } from '../../mocks/apiClient';

jest.mock('../../../src/services/apiClient', () => ({
  apiClient: mockApiClient
}));

describe('Sprint 2 - TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    test('fetches tasks successfully', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'TODO',
          priority: 'MEDIUM'
        }
      ];

      mockApiClient.get.mockResolvedValue({ data: mockTasks });

      const tasks = await TaskService.getTasks();

      expect(mockApiClient.get).toHaveBeenCalledWith('/tasks');
      expect(tasks).toEqual(mockTasks);
    });

    test('handles API errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      await expect(TaskService.getTasks()).rejects.toThrow('API Error');
    });
  });

  describe('createTask', () => {
    test('creates task successfully', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        projectId: '1',
        assigneeId: '1'
      };

      const mockCreatedTask = {
        id: '2',
        ...taskData,
        status: 'TODO',
        priority: 'MEDIUM'
      };

      mockApiClient.post.mockResolvedValue({ data: mockCreatedTask });

      const createdTask = await TaskService.createTask(taskData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/tasks', taskData);
      expect(createdTask).toEqual(mockCreatedTask);
    });
  });
});
```

---

## 📊 Sprint 2 Testing Metrics Dashboard

### Daily Testing Checklist (Sprint 2 Focus)

#### Authentication Testing ✅
- [ ] User registration form validation
- [ ] User login form validation
- [ ] Password reset functionality
- [ ] JWT token management
- [ ] Session handling
- [ ] Protected route access

#### Database Testing ✅
- [ ] User CRUD operations
- [ ] Project CRUD operations
- [ ] Task CRUD operations
- [ ] Data relationship validation
- [ ] Constraint testing
- [ ] Transaction handling

#### API Testing ✅
- [ ] Authentication endpoints
- [ ] Task management endpoints
- [ ] Project management endpoints
- [ ] Error handling
- [ ] Response validation
- [ ] Performance testing

#### Frontend Testing ✅
- [ ] Component rendering
- [ ] User interactions
- [ ] Form validation
- [ ] State management
- [ ] Error handling
- [ ] Responsive design

### Sprint 2 Weekly Testing Report Template

```markdown
# Sprint 2 Weekly Testing Report - Week [X]

## Sprint 2 Testing Progress
- **Tests Executed**: [X] tests
- **Tests Passed**: [X] tests
- **Tests Failed**: [X] tests
- **Coverage**: [X]%

## Sprint 2 Critical Issues Found
1. [Issue description]
2. [Issue description]

## Sprint 2 Performance Metrics
- **API Response Time**: [X]ms average
- **Page Load Time**: [X]s average
- **Bundle Size**: [X]kB

## Sprint 2 Security Findings
- **Vulnerabilities**: [X] found
- **Critical Issues**: [X] found
- **Recommendations**: [List]

## Sprint 2 Next Week Priorities
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

---

## 🎯 Sprint 2 QA Engineer Success Metrics

### Week 1 Success Criteria (Sprint 2)
- ✅ Complete testing environment setup
- ✅ Authentication testing (100% coverage)
- ✅ Database testing (100% coverage)
- ✅ Basic CI/CD pipeline working

### Week 2-3 Success Criteria (Sprint 2)
- ✅ API service testing (90% coverage)
- ✅ Frontend component testing (80% coverage)
- ✅ Integration testing (85% coverage)
- ✅ Error handling validation

### Week 4 Success Criteria (Sprint 2)
- ✅ Performance testing complete
- ✅ Security testing complete
- ✅ Cross-browser testing complete
- ✅ Production readiness validated

---

## 🔄 Sprint-Based Testing Pattern

### Sprint 1 Testing (Completed)
- **Focus**: Basic authentication and user management
- **Testing**: Manual testing and basic validation
- **Coverage**: Core authentication features

### Sprint 2 Testing (Current)
- **Focus**: Comprehensive task and project management
- **Testing**: Automated testing with full coverage
- **Coverage**: Authentication, database, API services, frontend components

### Sprint 3 Testing (Planned)
- **Focus**: Real-time collaboration and advanced features
- **Testing**: E2E testing and performance optimization
- **Coverage**: WebSocket features, file management, advanced filtering

### Sprint 4 Testing (Planned)
- **Focus**: Production deployment and optimization
- **Testing**: Security testing and cross-browser validation
- **Coverage**: Security, performance, accessibility, production readiness

---

**Sprint 2 QA Engineer Status**: ✅ **ACTIVATED AND READY**
**Next Action**: Begin Sprint 2 testing environment setup and authentication testing
**Success Criteria**: Sprint 2 production-ready features with comprehensive test coverage 
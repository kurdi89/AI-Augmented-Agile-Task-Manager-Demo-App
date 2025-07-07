# API Specifications - Team Task Manager

## 1. API Overview

### 1.1 API Architecture

The Team Task Manager API follows **RESTful** design principles with **WebSocket** support for real-time features. The API is designed to be:

- **Stateless**: Each request contains all necessary information
- **Resource-oriented**: URLs represent resources, not actions
- **HTTP method semantic**: GET, POST, PUT, DELETE used appropriately
- **Consistent**: Uniform response formats and error handling
- **Versioned**: API versioning for backward compatibility

### 1.2 Base URL & Versioning

**Base URL**: `https://api.teamtaskmanager.com/v1`

**API Versioning Strategy**:
- **URL Path Versioning**: `/v1/`, `/v2/` for major versions
- **Header Versioning**: `API-Version: 1.0` for minor versions
- **Backward Compatibility**: Maintained for at least 12 months

### 1.3 Common Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-07-05 T10:30:00Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-07-05 T10:30:00Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
```

## 2. Authentication & Authorization

### 2.1 Authentication Flow

**JWT Token-based Authentication**:
1. User logs in with credentials
2. Server returns JWT access token + refresh token
3. Client includes token in `Authorization` header
4. Server validates token for each request
5. Token refresh when access token expires

**Token Structure**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

### 2.2 Authorization Levels

**Role-based Access Control (RBAC)**:
- **Admin**: Full system access, user management
- **Manager**: Project management, team oversight
- **Member**: Task management, collaboration
- **Viewer**: Read-only access to assigned projects

**Permission Matrix**:
```
┌─────────────────┬───────┬─────────┬────────┬────────┐
│ Resource        │ Admin │ Manager │ Member │ Viewer │
├─────────────────┼───────┼─────────┼────────┼────────┤
│ Users           │ CRUD  │ R       │ R      │ R      │
│ Projects        │ CRUD  │ CRUD    │ R      │ R      │
│ Tasks           │ CRUD  │ CRUD    │ CRUD   │ R      │
│ Comments        │ CRUD  │ CRUD    │ CRUD   │ R      │
│ Time Entries    │ CRUD  │ CRUD    │ CRUD   │ R      │
│ Reports         │ CRUD  │ R       │ R      │ R      │
└─────────────────┴───────┴─────────┴────────┴────────┘
```

## 3. Authentication Endpoints

### 3.1 User Registration

**POST** `/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "member"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "createdAt": "2025-07-05 T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}
```

### 3.2 User Login

**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "lastLoginAt": "2025-07-05 T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}
```

### 3.3 Token Refresh

**POST** `/auth/refresh`

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### 3.4 Logout

**POST** `/auth/logout`

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

## 4. User Management Endpoints

### 4.1 Get Current User

**GET** `/users/me`

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "avatar": "https://cdn.example.com/avatars/user_123.jpg",
      "preferences": {
        "theme": "light",
        "notifications": true,
        "timezone": "UTC"
      },
      "createdAt": "2025-07-05 T10:30:00Z",
      "lastLoginAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

### 4.2 Update User Profile

**PUT** `/users/me`

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "avatar": "https://cdn.example.com/avatars/user_123_new.jpg",
  "preferences": {
    "theme": "dark",
    "notifications": false,
    "timezone": "America/New_York"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "member",
      "avatar": "https://cdn.example.com/avatars/user_123_new.jpg",
      "preferences": {
        "theme": "dark",
        "notifications": false,
        "timezone": "America/New_York"
      },
      "updatedAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

### 4.3 Get Users

**GET** `/users`

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search by name or email
- `role`: Filter by role
- `status`: Filter by status (active, inactive)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "member",
        "avatar": "https://cdn.example.com/avatars/user_123.jpg",
        "status": "active",
        "lastLoginAt": "2025-07-05 T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## 5. Project Management Endpoints

### 5.1 Get Projects

**GET** `/projects`

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (active, completed, archived)
- `search`: Search by name or description

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project_123",
        "name": "Team Task Manager",
        "description": "Collaborative task management application",
        "status": "active",
        "owner": {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe"
        },
        "members": [
          {
            "id": "user_456",
            "firstName": "Jane",
            "lastName": "Smith",
            "role": "member"
          }
        ],
        "taskCounts": {
          "total": 25,
          "todo": 8,
          "inProgress": 5,
          "review": 3,
          "done": 9
        },
        "createdAt": "2025-07-05 T10:30:00Z",
        "updatedAt": "2025-07-05 T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 5.2 Create Project

**POST** `/projects`

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "members": [
    {
      "userId": "user_456",
      "role": "member"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project_456",
      "name": "New Project",
      "description": "Project description",
      "status": "active",
      "owner": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "members": [
        {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith",
          "role": "member"
        }
      ],
      "taskCounts": {
        "total": 0,
        "todo": 0,
        "inProgress": 0,
        "review": 0,
        "done": 0
      },
      "createdAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

### 5.3 Get Project Details

**GET** `/projects/{projectId}`

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project_123",
      "name": "Team Task Manager",
      "description": "Collaborative task management application",
      "status": "active",
      "owner": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "members": [
        {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith",
          "role": "member"
        }
      ],
      "taskCounts": {
        "total": 25,
        "todo": 8,
        "inProgress": 5,
        "review": 3,
        "done": 9
      },
      "createdAt": "2025-07-05 T10:30:00Z",
      "updatedAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

## 6. Task Management Endpoints

### 6.1 Get Tasks

**GET** `/projects/{projectId}/tasks`

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `status`: Filter by status (todo, inProgress, review, done)
- `assigneeId`: Filter by assignee
- `priority`: Filter by priority (low, medium, high)
- `search`: Search by title or description
- `dueDate`: Filter by due date (today, thisWeek, overdue)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_123",
        "title": "Implement user authentication",
        "description": "Create secure login system with JWT tokens",
        "status": "inProgress",
        "priority": "high",
        "assignee": {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "reporter": {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe"
        },
        "dueDate": " 2025-01-20T00:00:00Z",
        "estimatedHours": 8,
        "loggedHours": 3.5,
        "tags": ["authentication", "security"],
        "commentCount": 5,
        "attachmentCount": 2,
        "createdAt": "2025-07-05 T10:30:00Z",
        "updatedAt": "2025-07-05 T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "pages": 1
    }
  }
}
```

### 6.2 Create Task

**POST** `/projects/{projectId}/tasks`

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "assigneeId": "user_456",
  "dueDate": " 2025-01-25T00:00:00Z",
  "estimatedHours": 4,
  "tags": ["frontend", "ui"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_456",
      "title": "New Task",
      "description": "Task description",
      "status": "todo",
      "priority": "medium",
      "assignee": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "reporter": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "dueDate": " 2025-01-25T00:00:00Z",
      "estimatedHours": 4,
      "loggedHours": 0,
      "tags": ["frontend", "ui"],
      "commentCount": 0,
      "attachmentCount": 0,
      "createdAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

### 6.3 Update Task

**PUT** `/projects/{projectId}/tasks/{taskId}`

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "inProgress",
  "priority": "high",
  "assigneeId": "user_789",
  "dueDate": " 2025-01-22T00:00:00Z",
  "estimatedHours": 6,
  "tags": ["frontend", "ui", "responsive"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_456",
      "title": "Updated Task Title",
      "description": "Updated description",
      "status": "inProgress",
      "priority": "high",
      "assignee": {
        "id": "user_789",
        "firstName": "Mike",
        "lastName": "Johnson"
      },
      "reporter": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "dueDate": " 2025-01-22T00:00:00Z",
      "estimatedHours": 6,
      "loggedHours": 0,
      "tags": ["frontend", "ui", "responsive"],
      "commentCount": 0,
      "attachmentCount": 0,
      "updatedAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

### 6.4 Delete Task

**DELETE** `/projects/{projectId}/tasks/{taskId}`

**Headers**: `Authorization: Bearer <access_token>`

**Response** (204 No Content)

## 7. Comments Endpoints

### 7.1 Get Task Comments

**GET** `/projects/{projectId}/tasks/{taskId}/comments`

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_123",
        "content": "This task is progressing well. Need to add validation.",
        "author": {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "createdAt": "2025-07-05 T10:30:00Z",
        "updatedAt": "2025-07-05 T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 7.2 Create Comment

**POST** `/projects/{projectId}/tasks/{taskId}/comments`

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "content": "Great progress on this task!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "comment_456",
      "content": "Great progress on this task!",
      "author": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

## 8. Time Tracking Endpoints

### 8.1 Get Time Entries

**GET** `/projects/{projectId}/tasks/{taskId}/time-entries`

**Headers**: `Authorization: Bearer <access_token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `userId`: Filter by user
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "timeEntries": [
      {
        "id": "time_123",
        "description": "Implemented authentication logic",
        "hours": 2.5,
        "date": "2025-07-05 ",
        "user": {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "createdAt": "2025-07-05 T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    },
    "summary": {
      "totalHours": 15.5,
      "estimatedHours": 20,
      "remainingHours": 4.5
    }
  }
}
```

### 8.2 Create Time Entry

**POST** `/projects/{projectId}/tasks/{taskId}/time-entries`

**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "description": "Fixed authentication bugs",
  "hours": 1.5,
  "date": "2025-07-05 "
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "timeEntry": {
      "id": "time_456",
      "description": "Fixed authentication bugs",
      "hours": 1.5,
      "date": "2025-07-05 ",
      "user": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2025-07-05 T10:30:00Z"
    }
  }
}
```

## 9. WebSocket Events

### 9.1 WebSocket Connection

**Connection URL**: `wss://api.teamtaskmanager.com/v1/ws`

**Authentication**: JWT token via query parameter or header
- Query: `?token=<access_token>`
- Header: `Authorization: Bearer <access_token>`

### 9.2 Real-time Events

**Task Events**:
```json
{
  "type": "task.created",
  "data": {
    "task": {
      "id": "task_123",
      "title": "New Task",
      "projectId": "project_123",
      "status": "todo",
      "assignee": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  },
  "timestamp": "2025-07-05 T10:30:00Z"
}
```

```json
{
  "type": "task.updated",
  "data": {
    "task": {
      "id": "task_123",
      "title": "Updated Task",
      "projectId": "project_123",
      "status": "inProgress",
      "changes": ["status", "assignee"]
    }
  },
  "timestamp": "2025-07-05 T10:30:00Z"
}
```

**Comment Events**:
```json
{
  "type": "comment.created",
  "data": {
    "comment": {
      "id": "comment_123",
      "content": "New comment",
      "taskId": "task_123",
      "author": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  },
  "timestamp": "2025-07-05 T10:30:00Z"
}
```

**User Presence Events**:
```json
{
  "type": "user.presence",
  "data": {
    "user": {
      "id": "user_456",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "status": "online",
    "projectId": "project_123"
  },
  "timestamp": "2025-07-05 T10:30:00Z"
}
```

## 10. Error Codes

### 10.1 HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content to return
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### 10.2 Application Error Codes

```json
{
  "VALIDATION_ERROR": "Invalid input data",
  "AUTHENTICATION_FAILED": "Invalid credentials",
  "TOKEN_EXPIRED": "Access token has expired",
  "INSUFFICIENT_PERMISSIONS": "Insufficient permissions for this action",
  "RESOURCE_NOT_FOUND": "Requested resource not found",
  "DUPLICATE_RESOURCE": "Resource already exists",
  "RATE_LIMIT_EXCEEDED": "Too many requests",
  "PROJECT_ACCESS_DENIED": "Access to project denied",
  "TASK_ASSIGNMENT_FAILED": "Cannot assign task to user",
  "CONCURRENT_MODIFICATION": "Resource was modified by another user"
}
```

## 11. Rate Limiting

### 11.1 Rate Limit Rules

**Per User Limits**:
- **Authentication**: 10 requests per minute
- **General API**: 1000 requests per hour
- **WebSocket**: 100 connections per user
- **File Upload**: 50 MB per hour

**Headers**:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

**Rate Limit Response** (429 Too Many Requests):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## 12. API Testing & Documentation

### 12.1 OpenAPI Specification

The API is documented using **OpenAPI 3.0** specification available at:
- **Swagger UI**: `https://api.teamtaskmanager.com/docs`
- **OpenAPI JSON**: `https://api.teamtaskmanager.com/openapi.json`

### 12.2 Postman Collection

A comprehensive Postman collection is available for API testing:
- **Collection URL**: `https://api.teamtaskmanager.com/postman/collection.json`
- **Environment**: `https://api.teamtaskmanager.com/postman/environment.json`

### 12.3 API Health Check

**GET** `/health`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-07-05 T10:30:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "websocket": "healthy"
    }
  }
}
```

---

**Document Version**: 1.0  
**Created by**: Solutions Architect Agent  
**Date**: 2025-07-05   
**Status**: Ready for Review 
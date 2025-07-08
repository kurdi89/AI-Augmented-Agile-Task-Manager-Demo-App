# Technical Design Document (TDD) - Team Task Manager (v2)

## 1. Introduction

This document outlines the technical design for the migration of the Team Task Manager application to a new technology stack: Next.js, Shadcn UI, GraphQL, and Supabase.

## 2. GraphQL Schema

The following is a preliminary GraphQL schema. This will be refined as the migration progresses.

```graphql
type User {
  id: ID!
  email: String!
  name: String
  avatarUrl: String
  tasks: [Task!]
  projects: [Project!]
}

type Project {
  id: ID!
  name: String!
  description: String
  owner: User!
  members: [User!]
  tasks: [Task!]
  createdAt: String!
  updatedAt: String!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  assignee: User
  project: Project!
  createdAt: String!
  updatedAt: String!
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

type Query {
  users: [User!]
  user(id: ID!): User
  projects: [Project!]
  project(id: ID!): Project
  tasks(projectId: ID!): [Task!]
  task(id: ID!): Task
}

type Mutation {
  # User Mutations
  updateUser(name: String, avatarUrl: String): User

  # Project Mutations
  createProject(name: String!, description: String): Project!
  updateProject(id: ID!, name: String, description: String): Project
  deleteProject(id: ID!): Project
  addProjectMember(projectId: ID!, userId: ID!): Project
  removeProjectMember(projectId: ID!, userId: ID!): Project

  # Task Mutations
  createTask(title: String!, projectId: ID!, description: String, assigneeId: ID, priority: TaskPriority): Task!
  updateTask(id: ID!, title: String, description: String, status: TaskStatus, priority: TaskPriority, assigneeId: ID): Task
  deleteTask(id: ID!): Task
}
```

## 3. Frontend Component Architecture

The frontend will be built using a component-based architecture with Next.js. Shadcn UI will be used for the UI components.

- **`components/`**: Reusable UI components (e.g., Button, Input, Modal).
  - **`components/ui/`**: Shadcn UI components.
  - **`components/icons/`**: Lucid Icons.
- **`features/`**: Feature-specific components (e.g., TaskCard, ProjectList).
- **`pages/`**: Next.js pages, which will be mapped to routes.
- **`lib/`**: Utility functions and hooks.
- **`graphql/`**: GraphQL queries, mutations, and fragments.

## 4. Backend Architecture

The backend will be a GraphQL API powered by Apollo Server and Prisma, running as a serverless function.

- **`prisma/schema.prisma`**: The single source of truth for the database schema.
- **`src/graphql/`**: GraphQL schema, resolvers, and type definitions.
- **`src/services/`**: Business logic for the application.
- **`src/lib/`**: Utility functions and database client.

## 5. Authentication

Authentication will be handled by Supabase Auth. The frontend will use the Supabase client library to manage user sessions and JWTs. The backend will validate the JWTs on every request.

## 6. Real-time Features

Supabase Realtime will be used to provide real-time updates for tasks and projects. The frontend will subscribe to database changes and update the UI accordingly.

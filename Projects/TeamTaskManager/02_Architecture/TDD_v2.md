# Technical Design Document (TDD) - Team Task Manager (v2)

## 1. Introduction

This document outlines the technical design for the migration of the Team Task Manager application to a new technology stack: Next.js, Shadcn UI, GraphQL, and Supabase.

## 2. API Endpoints

The backend will expose a REST API with the following endpoints:

- `POST /api/login`: Authenticate a user and return a JWT.
- `POST /api/projects`: Create a new project.

Further endpoints will be added as the migration progresses.

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

The backend will be a REST API powered by Express and Prisma, running as a serverless function.

- **`prisma/schema.prisma`**: The single source of truth for the database schema.
- **`src/`**: Express server, routes, controllers, and services.
- **`src/lib/`**: Utility functions and database client.

## 5. Authentication

Authentication will be handled by Supabase Auth. The frontend will use the Supabase client library to manage user sessions and JWTs. The backend will validate the JWTs on every request.

## 6. Real-time Features

Supabase Realtime will be used to provide real-time updates for tasks and projects. The frontend will subscribe to database changes and update the UI accordingly.

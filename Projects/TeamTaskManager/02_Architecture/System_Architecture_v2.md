# System Architecture - Team Task Manager (v2 - Next.js & Supabase)

## 1. Infrastructure Overview

### 1.1 Cloud Architecture Strategy

The updated Team Task Manager will leverage a modern, serverless architecture to enhance scalability, reduce operational overhead, and improve developer experience. The new stack is centered around Next.js for the frontend and Supabase for the backend, providing a powerful and integrated solution.

### 1.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                INTERNET                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Vercel/Netlify (Frontend)                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Supabase (Backend)                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │  PostgreSQL DB  │  │  Supabase Auth  │  │ Supabase Storage│                │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤                │
│  │   GraphQL API   │  │Supabase Realtime│  │      ...        │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Cloud Services Architecture

### 2.1 Primary Cloud Services

**Frontend (Vercel/Netlify)**
- **Hosting**: Serverless Next.js hosting.
- **CDN**: Global CDN for static assets and pages.
- **CI/CD**: Integrated CI/CD pipeline for automated deployments.

**Backend (Supabase)**
- **Database**: Managed PostgreSQL database.
- **Authentication**: Supabase Auth for user management and authentication.
- **Storage**: Supabase Storage for file uploads.
- **Real-time**: Supabase Realtime for live updates.
- **API**: GraphQL API built with Apollo Server, running as a serverless function.

## 3. Frontend Architecture

- **Framework**: Next.js with TypeScript
- **UI Components**: Shadcn UI with Lucid Icons
- **State Management**: Zustand or React Query for managing application state.
- **Data Fetching**: Apollo Client for interacting with the GraphQL API.
- **Styling**: Tailwind CSS for utility-first styling.

## 4. Backend Architecture

- **API**: GraphQL API built with Apollo Server.
- **Database ORM**: Prisma for interacting with the PostgreSQL database.
- **Authentication**: Supabase Auth for JWT-based authentication.
- **Business Logic**: Encapsulated in GraphQL resolvers and services.

## 5. Data Schema

The existing PostgreSQL schema will be introspected and managed by Prisma. The `schema.prisma` file will be the source of truth for the database schema.

## 6. CI/CD Pipeline

- **Provider**: GitHub Actions
- **Workflow**:
  - On push to `main`, the pipeline will run tests, linting, and security scans.
  - If all checks pass, the frontend will be deployed to Vercel/Netlify and the backend (GraphQL API) will be deployed as a serverless function.

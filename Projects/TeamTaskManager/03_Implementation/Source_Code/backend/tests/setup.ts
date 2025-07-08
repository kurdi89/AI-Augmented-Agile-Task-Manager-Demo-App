// Sprint 2 Backend Test Setup
import { PrismaClient } from '@prisma/client';

// Mock environment variables for Sprint 2 testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'sprint2-test-secret-key';
process.env.DATABASE_URL = 'postgresql://username:password@localhost:5432/team_task_manager_sprint2_test';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  console.log('Sprint 2 Backend Test Setup - Initializing...');
});

// Global test teardown
afterAll(async () => {
  // Cleanup test database connection
  console.log('Sprint 2 Backend Test Setup - Cleaning up...');
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 
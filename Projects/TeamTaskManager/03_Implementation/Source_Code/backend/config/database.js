// Team Task Manager - Database Configuration
// Sprint 1: Authentication & User Management
// Created: July 6, 2025

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client with configuration
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
  errorFormat: 'pretty',
});

// Database connection event handlers
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

// Database health check
const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Database initialization
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database connection...');
    
    // Check connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Run any initialization queries if needed
    console.log('✅ Database initialized successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Database utility functions
const dbUtils = {
  // Transaction wrapper
  transaction: async (callback) => {
    return await prisma.$transaction(callback);
  },
  
  // Raw query execution
  raw: async (query, params = []) => {
    return await prisma.$queryRaw(query, ...params);
  },
  
  // Connection status
  isConnected: async () => {
    return await checkDatabaseConnection();
  },
  
  // Cleanup expired records
  cleanupExpiredRecords: async () => {
    try {
      const now = new Date();
      
      // Clean up expired verification tokens
      await prisma.user.updateMany({
        where: {
          verificationTokenExpires: {
            lt: now
          }
        },
        data: {
          verificationToken: null,
          verificationTokenExpires: null
        }
      });
      
      // Clean up expired password reset tokens
      await prisma.passwordResetRequest.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });
      
      // Clean up expired sessions
      await prisma.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });
      
      // Clean up expired blacklisted tokens
      await prisma.tokenBlacklist.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });
      
      console.log('✅ Expired records cleaned up successfully');
    } catch (error) {
      console.error('❌ Failed to clean up expired records:', error.message);
    }
  }
};

module.exports = {
  prisma,
  initializeDatabase,
  checkDatabaseConnection,
  dbUtils
}; 
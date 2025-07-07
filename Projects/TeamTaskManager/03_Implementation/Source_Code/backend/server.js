// Team Task Manager - Express Server
// Sprint 1: Backend API Server Setup
// Created: July 6, 2025

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const { AuditLogger } = require('./utils/auditLogger');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();

// Initialize audit logger
const auditLogger = new AuditLogger();

// Environment configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLogger.logSecurityEvent({
      action: 'RATE_LIMIT_EXCEEDED',
      details: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

app.use(globalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  if (NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Log security events
    if (res.statusCode >= 400) {
      auditLogger.logSecurityEvent({
        action: 'HTTP_ERROR',
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          body: req.body ? Object.keys(req.body) : []
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Team Task Manager API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API routes
app.use('/api/auth', authRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Team Task Manager API',
    version: '1.0.0',
    documentation: {
      authentication: '/api/auth',
      endpoints: {
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/verify-email': 'Email verification',
        'POST /api/auth/resend-verification': 'Resend verification email',
        'POST /api/auth/login': 'User login (Coming soon)',
        'POST /api/auth/forgot-password': 'Password reset request (Coming soon)',
        'POST /api/auth/reset-password': 'Password reset (Coming soon)',
        'POST /api/auth/logout': 'User logout (Coming soon)',
        'POST /api/auth/refresh': 'Token refresh (Coming soon)',
        'GET /api/auth/profile': 'Get user profile (Coming soon)',
        'PUT /api/auth/profile': 'Update user profile (Coming soon)',
        'GET /api/auth/health': 'Authentication service health check'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Serve static files in production
if (NODE_ENV === 'production') {
  app.use(express.static('public'));
  
  // Catch all handler for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Log error
  auditLogger.logSystemEvent({
    action: 'SERVER_ERROR',
    details: {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      body: req.body
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  auditLogger.logSystemEvent({
    action: 'UNHANDLED_REJECTION',
    details: {
      error: err.message,
      stack: err.stack
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  auditLogger.logSystemEvent({
    action: 'UNCAUGHT_EXCEPTION',
    details: {
      error: err.message,
      stack: err.stack
    }
  });
  
  // Graceful shutdown
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  auditLogger.logSystemEvent({
    action: 'SERVER_SHUTDOWN',
    details: { reason: 'SIGTERM' }
  });
  
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  auditLogger.logSystemEvent({
    action: 'SERVER_SHUTDOWN',
    details: { reason: 'SIGINT' }
  });
  
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Team Task Manager API Server running on port ${PORT}`);
      console.log(`📧 Environment: ${NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      
      // Log server start
      auditLogger.logSystemEvent({
        action: 'SERVER_STARTED',
        details: {
          port: PORT,
          environment: NODE_ENV,
          frontendUrl: FRONTEND_URL
        }
      });
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      auditLogger.logSystemEvent({
        action: 'SERVER_ERROR',
        details: {
          error: error.message,
          code: error.code
        }
      });
    });
    
    return server;
    
  } catch (error) {
    console.error('Failed to start server:', error);
    auditLogger.logSystemEvent({
      action: 'SERVER_START_FAILED',
      details: {
        error: error.message,
        stack: error.stack
      }
    });
    
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; 
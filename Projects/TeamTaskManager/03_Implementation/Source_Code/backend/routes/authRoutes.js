// Team Task Manager - Authentication Routes
// Sprint 1: User Registration and Authentication API Routes
// Created: July 6, 2025

const express = require('express');
const { AuthController, rateLimiters } = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const cors = require('cors');

const router = express.Router();

// Security middleware
router.use(helmet());
router.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes')
];

const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const tokenValidation = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Token is required')
    .matches(/^[a-f0-9]{64}$/)
    .withMessage('Invalid token format')
];

// Authentication Routes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (US-001)
 * @access  Public
 */
router.post('/register', 
  rateLimiters.register,
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    await AuthController.register(req, res);
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email address (US-001)
 * @access  Public
 */
router.post('/verify-email',
  rateLimiters.verifyEmail,
  tokenValidation,
  handleValidationErrors,
  async (req, res) => {
    await AuthController.verifyEmail(req, res);
  }
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification (US-001)
 * @access  Public
 */
router.post('/resend-verification',
  rateLimiters.resendVerification,
  emailValidation,
  handleValidationErrors,
  async (req, res) => {
    await AuthController.resendVerificationEmail(req, res);
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    User login (US-002) - Placeholder
 * @access  Public
 */
router.post('/login',
  rateLimiters.login,
  async (req, res) => {
    await AuthController.login(req, res);
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (US-003) - Placeholder
 * @access  Public
 */
router.post('/forgot-password',
  rateLimiters.passwordReset,
  async (req, res) => {
    await AuthController.forgotPassword(req, res);
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token (US-003) - Placeholder
 * @access  Public
 */
router.post('/reset-password',
  rateLimiters.passwordReset,
  async (req, res) => {
    await AuthController.resetPassword(req, res);
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout (US-008) - Placeholder
 * @access  Private
 */
router.post('/logout',
  async (req, res) => {
    await AuthController.logout(req, res);
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh authentication token (US-009) - Placeholder
 * @access  Private
 */
router.post('/refresh',
  async (req, res) => {
    await AuthController.refreshToken(req, res);
  }
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile (US-004) - Placeholder
 * @access  Private
 */
router.get('/profile',
  async (req, res) => {
    await AuthController.getProfile(req, res);
  }
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (US-004) - Placeholder
 * @access  Private
 */
router.put('/profile',
  async (req, res) => {
    await AuthController.updateProfile(req, res);
  }
);

/**
 * @route   GET /api/auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health',
  async (req, res) => {
    await AuthController.healthCheck(req, res);
  }
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Auth route error:', error);
  
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
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Handle 404 for auth routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Authentication endpoint not found'
  });
});

module.exports = router; 
// Team Task Manager - Authentication Controller
// Sprint 1: User Registration and Authentication Endpoints
// Created: July 6, 2025

const authService = require('../services/authService');
const { validateRegistrationData } = require('../utils/validation');
const { AuditLogger } = require('../utils/auditLogger');
const rateLimit = require('express-rate-limit');

class AuthController {
  constructor() {
    this.auditLogger = new AuditLogger();
  }

  /**
   * User Registration (US-001)
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, confirmPassword, firstName, lastName } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      // Validate input data
      const validation = validateRegistrationData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Register user
      const result = await authService.registerUser(
        validation.sanitizedData,
        ipAddress,
        userAgent
      );

      res.status(201).json(result);

    } catch (error) {
      console.error('Registration error:', error);
      
      // Return appropriate error response
      if (error.message.includes('email already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Email Verification (US-001)
   * POST /api/auth/verify-email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }

      const result = await authService.verifyEmail(token, ipAddress, userAgent);

      res.status(200).json(result);

    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.message.includes('Invalid or expired')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Email verification failed. Please try again.'
      });
    }
  }

  /**
   * Resend Verification Email (US-001)
   * POST /api/auth/resend-verification
   */
  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
      }

      const result = await authService.resendVerificationEmail(
        email,
        ipAddress,
        userAgent
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Resend verification error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email. Please try again.'
      });
    }
  }

  /**
   * User Login (US-002) - Placeholder for next implementation
   * POST /api/auth/login
   */
  async login(req, res) {
    res.status(501).json({
      success: false,
      message: 'Login endpoint not yet implemented - Coming in US-002'
    });
  }

  /**
   * Password Reset Request (US-003) - Placeholder for next implementation
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    res.status(501).json({
      success: false,
      message: 'Password reset endpoint not yet implemented - Coming in US-003'
    });
  }

  /**
   * Password Reset (US-003) - Placeholder for next implementation
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    res.status(501).json({
      success: false,
      message: 'Password reset endpoint not yet implemented - Coming in US-003'
    });
  }

  /**
   * User Logout (US-008) - Placeholder for next implementation
   * POST /api/auth/logout
   */
  async logout(req, res) {
    res.status(501).json({
      success: false,
      message: 'Logout endpoint not yet implemented - Coming in US-008'
    });
  }

  /**
   * Token Refresh (US-009) - Placeholder for next implementation
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    res.status(501).json({
      success: false,
      message: 'Token refresh endpoint not yet implemented - Coming in US-009'
    });
  }

  /**
   * Get Current User Profile (US-004) - Placeholder for next implementation
   * GET /api/auth/profile
   */
  async getProfile(req, res) {
    res.status(501).json({
      success: false,
      message: 'Profile endpoint not yet implemented - Coming in US-004'
    });
  }

  /**
   * Update User Profile (US-004) - Placeholder for next implementation
   * PUT /api/auth/profile
   */
  async updateProfile(req, res) {
    res.status(501).json({
      success: false,
      message: 'Profile update endpoint not yet implemented - Coming in US-004'
    });
  }

  /**
   * Health check endpoint
   * GET /api/auth/health
   */
  async healthCheck(req, res) {
    try {
      // Basic health check
      res.status(200).json({
        success: true,
        message: 'Authentication service is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed'
      });
    }
  }
}

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
  });
};

// Export rate limiters for use in routes
const rateLimiters = {
  // Registration: 5 attempts per 15 minutes
  register: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5,
    'Too many registration attempts. Please try again in 15 minutes.'
  ),
  
  // Email verification: 10 attempts per hour
  verifyEmail: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10,
    'Too many verification attempts. Please try again in an hour.'
  ),
  
  // Resend verification: 3 attempts per hour
  resendVerification: createRateLimit(
    60 * 60 * 1000, // 1 hour
    3,
    'Too many resend attempts. Please try again in an hour.'
  ),
  
  // Login: 10 attempts per 15 minutes (placeholder for US-002)
  login: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10,
    'Too many login attempts. Please try again in 15 minutes.'
  ),
  
  // Password reset: 5 attempts per hour (placeholder for US-003)
  passwordReset: createRateLimit(
    60 * 60 * 1000, // 1 hour
    5,
    'Too many password reset attempts. Please try again in an hour.'
  )
};

module.exports = {
  AuthController: new AuthController(),
  rateLimiters
}; 
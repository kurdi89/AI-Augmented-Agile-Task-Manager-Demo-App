// Team Task Manager - Authentication Service
// Sprint 1: User Registration (US-001)
// Created: July 6, 2025

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const emailService = require('./emailService');
const { validateEmail, validatePassword } = require('../utils/validation');
const { AuditLogger } = require('../utils/auditLogger');

class AuthService {
  constructor() {
    this.saltRounds = 12;
    this.verificationTokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.auditLogger = new AuditLogger();
  }

  /**
   * Register a new user (US-001)
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.confirmPassword - Password confirmation
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   * @returns {Promise<Object>} Registration result
   */
  async registerUser(userData, ipAddress, userAgent) {
    try {
      const { email, password, confirmPassword, firstName, lastName } = userData;

      // Input validation
      this.validateRegistrationData(userData);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        await this.auditLogger.log({
          action: 'REGISTRATION_FAILED',
          details: { reason: 'email_exists', email },
          ipAddress,
          userAgent
        });
        
        throw new Error('An account with this email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      const verificationTokenExpires = new Date(Date.now() + this.verificationTokenExpiry);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          verificationToken,
          verificationTokenExpires,
          emailVerified: false
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          emailVerified: true
        }
      });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken, {
        firstName: user.firstName,
        lastName: user.lastName
      });

      // Log successful registration
      await this.auditLogger.log({
        userId: user.id,
        action: 'USER_REGISTERED',
        details: { email: user.email },
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified
        }
      };

    } catch (error) {
      // Log registration failure
      await this.auditLogger.log({
        action: 'REGISTRATION_FAILED',
        details: { 
          reason: error.message,
          email: userData.email 
        },
        ipAddress,
        userAgent
      });

      throw error;
    }
  }

  /**
   * Verify user email (US-001)
   * @param {string} token - Verification token
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token, ipAddress, userAgent) {
    try {
      if (!token) {
        throw new Error('Verification token is required');
      }

      // Find user with valid verification token
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpires: {
            gt: new Date()
          },
          emailVerified: false
        }
      });

      if (!user) {
        await this.auditLogger.log({
          action: 'EMAIL_VERIFICATION_FAILED',
          details: { reason: 'invalid_token', token },
          ipAddress,
          userAgent
        });
        
        throw new Error('Invalid or expired verification token');
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null
        }
      });

      // Log successful verification
      await this.auditLogger.log({
        userId: user.id,
        action: 'EMAIL_VERIFIED',
        details: { email: user.email },
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Email verified successfully. You can now log in to your account.'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   * @returns {Promise<Object>} Resend result
   */
  async resendVerificationEmail(email, ipAddress, userAgent) {
    try {
      if (!email || !validateEmail(email)) {
        throw new Error('Valid email address is required');
      }

      // Find unverified user
      const user = await prisma.user.findUnique({
        where: { 
          email: email.toLowerCase(),
          emailVerified: false 
        }
      });

      if (!user) {
        // Don't reveal if user exists or is already verified
        return {
          success: true,
          message: 'If an unverified account exists, a verification email has been sent.'
        };
      }

      // Generate new verification token
      const verificationToken = this.generateVerificationToken();
      const verificationTokenExpires = new Date(Date.now() + this.verificationTokenExpiry);

      // Update user with new token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationTokenExpires
        }
      });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken, {
        firstName: user.firstName,
        lastName: user.lastName
      });

      // Log resend action
      await this.auditLogger.log({
        userId: user.id,
        action: 'VERIFICATION_EMAIL_RESENT',
        details: { email: user.email },
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Verification email sent successfully.'
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate registration data
   * @param {Object} userData - User registration data
   * @throws {Error} Validation error
   */
  validateRegistrationData(userData) {
    const { email, password, confirmPassword, firstName, lastName } = userData;

    // Required fields
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      throw new Error('All fields are required');
    }

    // Email validation
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Password confirmation
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Name validation
    if (firstName.trim().length < 1 || firstName.trim().length > 100) {
      throw new Error('First name must be between 1 and 100 characters');
    }

    if (lastName.trim().length < 1 || lastName.trim().length > 100) {
      throw new Error('Last name must be between 1 and 100 characters');
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Generate secure verification token
   * @returns {string} Verification token
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} Verification result
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }
}

module.exports = new AuthService(); 
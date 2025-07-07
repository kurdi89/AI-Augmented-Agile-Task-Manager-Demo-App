// Team Task Manager - Email Service
// Sprint 1: Email Verification for User Registration
// Created: July 6, 2025

const nodemailer = require('nodemailer');
const { AuditLogger } = require('../utils/auditLogger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.auditLogger = new AuditLogger();
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment
   */
  initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // For development, use ethereal email or console logging
    if (process.env.NODE_ENV === 'development') {
      this.transporter = nodemailer.createTransporter({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    } else {
      this.transporter = nodemailer.createTransporter(emailConfig);
    }
  }

  /**
   * Send email verification message
   * @param {string} email - Recipient email
   * @param {string} token - Verification token
   * @param {Object} userData - User data for personalization
   * @returns {Promise<Object>} Send result
   */
  async sendVerificationEmail(email, token, userData) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: `"Team Task Manager" <${process.env.FROM_EMAIL || 'noreply@teamtaskmanager.com'}>`,
        to: email,
        subject: 'Verify Your Email Address - Team Task Manager',
        html: this.getVerificationEmailTemplate(verificationUrl, userData),
        text: this.getVerificationEmailText(verificationUrl, userData)
      };

      const result = await this.sendEmail(mailOptions);

      // Log email sent
      await this.auditLogger.log({
        action: 'VERIFICATION_EMAIL_SENT',
        details: { 
          email,
          messageId: result.messageId 
        }
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      // Log email failure
      await this.auditLogger.log({
        action: 'EMAIL_SEND_FAILED',
        details: { 
          email,
          error: error.message,
          type: 'verification'
        }
      });

      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} token - Reset token
   * @param {Object} userData - User data for personalization
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(email, token, userData) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: `"Team Task Manager" <${process.env.FROM_EMAIL || 'noreply@teamtaskmanager.com'}>`,
        to: email,
        subject: 'Reset Your Password - Team Task Manager',
        html: this.getPasswordResetEmailTemplate(resetUrl, userData),
        text: this.getPasswordResetEmailText(resetUrl, userData)
      };

      const result = await this.sendEmail(mailOptions);

      // Log email sent
      await this.auditLogger.log({
        action: 'PASSWORD_RESET_EMAIL_SENT',
        details: { 
          email,
          messageId: result.messageId 
        }
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      // Log email failure
      await this.auditLogger.log({
        action: 'EMAIL_SEND_FAILED',
        details: { 
          email,
          error: error.message,
          type: 'password_reset'
        }
      });

      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email after successful verification
   * @param {string} email - Recipient email
   * @param {Object} userData - User data for personalization
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(email, userData) {
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      
      const mailOptions = {
        from: `"Team Task Manager" <${process.env.FROM_EMAIL || 'noreply@teamtaskmanager.com'}>`,
        to: email,
        subject: 'Welcome to Team Task Manager!',
        html: this.getWelcomeEmailTemplate(loginUrl, userData),
        text: this.getWelcomeEmailText(loginUrl, userData)
      };

      const result = await this.sendEmail(mailOptions);

      // Log email sent
      await this.auditLogger.log({
        action: 'WELCOME_EMAIL_SENT',
        details: { 
          email,
          messageId: result.messageId 
        }
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      // Log email failure
      await this.auditLogger.log({
        action: 'EMAIL_SEND_FAILED',
        details: { 
          email,
          error: error.message,
          type: 'welcome'
        }
      });

      // Don't throw error for welcome email - it's not critical
      console.error('Failed to send welcome email:', error);
      return { success: false };
    }
  }

  /**
   * Send generic email
   * @param {Object} mailOptions - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(mailOptions) {
    try {
      if (process.env.NODE_ENV === 'development') {
        // In development, log email to console
        console.log('📧 Email would be sent:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Text:', mailOptions.text);
        console.log('---');
        
        return {
          messageId: `dev-${Date.now()}`,
          accepted: [mailOptions.to],
          rejected: []
        };
      }

      const info = await this.transporter.sendMail(mailOptions);
      return info;

    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Get email verification HTML template
   * @param {string} verificationUrl - Verification URL
   * @param {Object} userData - User data
   * @returns {string} HTML template
   */
  getVerificationEmailTemplate(verificationUrl, userData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Task Manager</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${userData.firstName}!</h2>
            <p>Thank you for registering with Team Task Manager. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Team Task Manager. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get email verification text template
   * @param {string} verificationUrl - Verification URL
   * @param {Object} userData - User data
   * @returns {string} Text template
   */
  getVerificationEmailText(verificationUrl, userData) {
    return `
Welcome to Team Task Manager, ${userData.firstName}!

Thank you for registering with Team Task Manager. To complete your registration, please verify your email address by visiting the following link:

${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with us, please ignore this email.

© 2025 Team Task Manager. All rights reserved.
This is an automated message, please do not reply.
    `.trim();
  }

  /**
   * Get password reset HTML template
   * @param {string} resetUrl - Reset URL
   * @param {Object} userData - User data
   * @returns {string} HTML template
   */
  getPasswordResetEmailTemplate(resetUrl, userData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Task Manager</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${userData.firstName},</p>
            <p>We received a request to reset your password for your Team Task Manager account. Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This password reset link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2025 Team Task Manager. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get password reset text template
   * @param {string} resetUrl - Reset URL
   * @param {Object} userData - User data
   * @returns {string} Text template
   */
  getPasswordResetEmailText(resetUrl, userData) {
    return `
Team Task Manager - Password Reset Request

Hello ${userData.firstName},

We received a request to reset your password for your Team Task Manager account. Visit the following link to reset your password:

${resetUrl}

This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

© 2025 Team Task Manager. All rights reserved.
This is an automated message, please do not reply.
    `.trim();
  }

  /**
   * Get welcome email HTML template
   * @param {string} loginUrl - Login URL
   * @param {Object} userData - User data
   * @returns {string} HTML template
   */
  getWelcomeEmailTemplate(loginUrl, userData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Team Task Manager</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Team Task Manager!</h1>
          </div>
          <div class="content">
            <h2>You're all set, ${userData.firstName}!</h2>
            <p>Your email has been successfully verified and your account is now active. You can start using Team Task Manager to collaborate with your team and manage projects efficiently.</p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Login to Your Account</a>
            </div>
            <p>Here's what you can do with Team Task Manager:</p>
            <ul>
              <li>Create and manage projects</li>
              <li>Collaborate with team members</li>
              <li>Track task progress</li>
              <li>Set deadlines and priorities</li>
              <li>Generate reports and insights</li>
            </ul>
            <p>If you have any questions or need help getting started, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2025 Team Task Manager. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get welcome email text template
   * @param {string} loginUrl - Login URL
   * @param {Object} userData - User data
   * @returns {string} Text template
   */
  getWelcomeEmailText(loginUrl, userData) {
    return `
Welcome to Team Task Manager!

You're all set, ${userData.firstName}!

Your email has been successfully verified and your account is now active. You can start using Team Task Manager to collaborate with your team and manage projects efficiently.

Login to your account: ${loginUrl}

Here's what you can do with Team Task Manager:
- Create and manage projects
- Collaborate with team members
- Track task progress
- Set deadlines and priorities
- Generate reports and insights

If you have any questions or need help getting started, please don't hesitate to contact our support team.

© 2025 Team Task Manager. All rights reserved.
This is an automated message, please do not reply.
    `.trim();
  }
}

module.exports = new EmailService(); 
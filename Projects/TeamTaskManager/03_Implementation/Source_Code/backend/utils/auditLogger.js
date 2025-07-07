// Team Task Manager - Audit Logger Utility
// Sprint 1: Security Audit Logging for Authentication
// Created: July 6, 2025

const { prisma } = require('../config/database');

class AuditLogger {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Log security and user events
   * @param {Object} logData - Log data
   * @param {string} logData.action - Action performed
   * @param {string} logData.userId - User ID (optional)
   * @param {Object} logData.details - Additional details
   * @param {string} logData.ipAddress - Client IP address
   * @param {string} logData.userAgent - Client user agent
   * @param {string} logData.resource - Resource accessed (optional)
   * @param {string} logData.severity - Log severity level
   * @returns {Promise<void>}
   */
  async log(logData) {
    const {
      action,
      userId = null,
      details = {},
      ipAddress = null,
      userAgent = null,
      resource = null,
      severity = this.determineSeverity(action)
    } = logData;

    const auditEntry = {
      action,
      userId,
      resource,
      details: JSON.stringify(details),
      ipAddress,
      userAgent,
      severity,
      timestamp: new Date()
    };

    // Attempt to log with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.writeAuditLog(auditEntry);
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
          this.logToConsole(auditEntry);
        }
        
        return;
      } catch (error) {
        console.error(`Audit log attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          // If all retries fail, log to console as fallback
          console.error('AUDIT LOG FAILED - FALLBACK TO CONSOLE:', auditEntry);
          this.logToConsole(auditEntry);
        } else {
          // Wait before retry
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
  }

  /**
   * Write audit log to database
   * @param {Object} auditEntry - Audit entry data
   * @returns {Promise<void>}
   */
  async writeAuditLog(auditEntry) {
    await prisma.auditLog.create({
      data: auditEntry
    });
  }

  /**
   * Log to console for development/fallback
   * @param {Object} auditEntry - Audit entry data
   */
  logToConsole(auditEntry) {
    const timestamp = auditEntry.timestamp.toISOString();
    const severity = auditEntry.severity.toUpperCase();
    const action = auditEntry.action;
    const userId = auditEntry.userId || 'anonymous';
    const ip = auditEntry.ipAddress || 'unknown';
    
    console.log(`[${timestamp}] ${severity} - ${action} by user:${userId} from ip:${ip}`);
    
    if (auditEntry.details && auditEntry.details !== '{}') {
      console.log(`  Details: ${auditEntry.details}`);
    }
  }

  /**
   * Determine severity level based on action
   * @param {string} action - Action performed
   * @returns {string} Severity level
   */
  determineSeverity(action) {
    const severityMap = {
      // High severity - Security critical events
      'LOGIN_FAILED': 'HIGH',
      'ACCOUNT_LOCKED': 'HIGH',
      'SUSPICIOUS_ACTIVITY': 'HIGH',
      'UNAUTHORIZED_ACCESS': 'HIGH',
      'PASSWORD_RESET_FAILED': 'HIGH',
      'EMAIL_VERIFICATION_FAILED': 'HIGH',
      'TOKEN_BLACKLISTED': 'HIGH',
      'MULTIPLE_FAILED_ATTEMPTS': 'HIGH',
      'BRUTE_FORCE_DETECTED': 'HIGH',
      
      // Medium severity - Important business events
      'USER_REGISTERED': 'MEDIUM',
      'USER_LOGIN': 'MEDIUM',
      'USER_LOGOUT': 'MEDIUM',
      'PASSWORD_CHANGED': 'MEDIUM',
      'PASSWORD_RESET_REQUEST': 'MEDIUM',
      'PASSWORD_RESET_SUCCESS': 'MEDIUM',
      'EMAIL_VERIFIED': 'MEDIUM',
      'PROFILE_UPDATED': 'MEDIUM',
      'ROLE_ASSIGNED': 'MEDIUM',
      'ROLE_REMOVED': 'MEDIUM',
      'SESSION_EXPIRED': 'MEDIUM',
      'TOKEN_REFRESHED': 'MEDIUM',
      
      // Low severity - Normal operations
      'VERIFICATION_EMAIL_SENT': 'LOW',
      'VERIFICATION_EMAIL_RESENT': 'LOW',
      'PASSWORD_RESET_EMAIL_SENT': 'LOW',
      'WELCOME_EMAIL_SENT': 'LOW',
      'SESSION_CREATED': 'LOW',
      'SESSION_VALIDATED': 'LOW',
      'PROFILE_VIEWED': 'LOW',
      
      // Info severity - System events
      'EMAIL_SEND_FAILED': 'INFO',
      'REGISTRATION_FAILED': 'INFO',
      'DATABASE_ERROR': 'INFO',
      'EXTERNAL_SERVICE_ERROR': 'INFO'
    };

    return severityMap[action] || 'INFO';
  }

  /**
   * Log authentication events
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async logAuthEvent(eventData) {
    await this.log({
      ...eventData,
      resource: 'authentication'
    });
  }

  /**
   * Log user management events
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async logUserEvent(eventData) {
    await this.log({
      ...eventData,
      resource: 'user_management'
    });
  }

  /**
   * Log security events
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async logSecurityEvent(eventData) {
    await this.log({
      ...eventData,
      resource: 'security',
      severity: 'HIGH'
    });
  }

  /**
   * Log system events
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async logSystemEvent(eventData) {
    await this.log({
      ...eventData,
      resource: 'system'
    });
  }

  /**
   * Query audit logs with filters
   * @param {Object} filters - Query filters
   * @param {string} filters.userId - User ID
   * @param {string} filters.action - Action type
   * @param {string} filters.severity - Severity level
   * @param {Date} filters.startDate - Start date
   * @param {Date} filters.endDate - End date
   * @param {number} filters.limit - Result limit
   * @param {number} filters.offset - Result offset
   * @returns {Promise<Array>} Audit log entries
   */
  async queryLogs(filters = {}) {
    const {
      userId,
      action,
      severity,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (severity) {
      where.severity = severity;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    try {
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc'
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return logs.map(log => ({
        ...log,
        details: JSON.parse(log.details || '{}')
      }));
    } catch (error) {
      console.error('Error querying audit logs:', error);
      throw new Error('Failed to query audit logs');
    }
  }

  /**
   * Get security summary for a user
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Security summary
   */
  async getUserSecuritySummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const logs = await this.queryLogs({
        userId,
        startDate,
        limit: 1000
      });

      const summary = {
        totalEvents: logs.length,
        loginAttempts: 0,
        failedLogins: 0,
        successfulLogins: 0,
        passwordResets: 0,
        suspiciousActivity: 0,
        lastLogin: null,
        recentActions: []
      };

      logs.forEach(log => {
        switch (log.action) {
          case 'USER_LOGIN':
            summary.loginAttempts++;
            summary.successfulLogins++;
            if (!summary.lastLogin) {
              summary.lastLogin = log.timestamp;
            }
            break;
          case 'LOGIN_FAILED':
            summary.loginAttempts++;
            summary.failedLogins++;
            break;
          case 'PASSWORD_RESET_REQUEST':
          case 'PASSWORD_RESET_SUCCESS':
            summary.passwordResets++;
            break;
          case 'SUSPICIOUS_ACTIVITY':
          case 'BRUTE_FORCE_DETECTED':
            summary.suspiciousActivity++;
            break;
        }

        if (summary.recentActions.length < 10) {
          summary.recentActions.push({
            action: log.action,
            timestamp: log.timestamp,
            ipAddress: log.ipAddress,
            severity: log.severity
          });
        }
      });

      return summary;
    } catch (error) {
      console.error('Error getting user security summary:', error);
      throw new Error('Failed to get security summary');
    }
  }

  /**
   * Clean up old audit logs
   * @param {number} retentionDays - Number of days to retain logs
   * @returns {Promise<number>} Number of deleted logs
   */
  async cleanupOldLogs(retentionDays = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          },
          severity: {
            notIn: ['HIGH'] // Keep high severity logs longer
          }
        }
      });

      await this.log({
        action: 'AUDIT_LOG_CLEANUP',
        details: {
          deletedCount: result.count,
          cutoffDate: cutoffDate.toISOString()
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      throw new Error('Failed to cleanup audit logs');
    }
  }

  /**
   * Delay helper for retries
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { AuditLogger }; 
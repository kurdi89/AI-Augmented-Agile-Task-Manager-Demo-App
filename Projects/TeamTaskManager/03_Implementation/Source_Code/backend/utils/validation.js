// Team Task Manager - Validation Utilities
// Sprint 1: Input Validation for Authentication
// Created: July 6, 2025

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Check format and length
  if (!emailRegex.test(email) || email.length > 254) {
    return false;
  }

  // Check local part length (before @)
  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return false;
  }

  return true;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  // Password requirements
  const minLength = 8;
  const maxLength = 128;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Check length
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (password.length > maxLength) {
    return {
      isValid: false,
      message: `Password must be no more than ${maxLength} characters long`
    };
  }

  // Check character requirements
  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
    };
  }

  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{2,}/, // Three or more consecutive identical characters
    /123456|654321|abcdef|qwerty|password|admin|letmein/i, // Common weak passwords
    /^(.{1,2})\1+$/ // Repeated short patterns
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return {
        isValid: false,
        message: 'Password contains weak patterns. Please choose a stronger password.'
      };
    }
  }

  return {
    isValid: true,
    message: 'Password meets all requirements'
  };
}

/**
 * Validate name fields (first name, last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} Validation result
 */
function validateName(name, fieldName = 'Name') {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 1) {
    return {
      isValid: false,
      message: `${fieldName} cannot be empty`
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than 100 characters`
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    };
  }

  return {
    isValid: true,
    message: `${fieldName} is valid`
  };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize registration data
 * @param {Object} userData - User registration data
 * @returns {Object} Validation result with sanitized data
 */
function validateRegistrationData(userData) {
  const errors = [];
  const sanitizedData = {};

  // Validate email
  if (!userData.email) {
    errors.push('Email is required');
  } else if (!validateEmail(userData.email)) {
    errors.push('Please enter a valid email address');
  } else {
    sanitizedData.email = userData.email.toLowerCase().trim();
  }

  // Validate password
  if (!userData.password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.message);
    } else {
      sanitizedData.password = userData.password;
    }
  }

  // Validate password confirmation
  if (!userData.confirmPassword) {
    errors.push('Password confirmation is required');
  } else if (userData.password !== userData.confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Validate first name
  if (!userData.firstName) {
    errors.push('First name is required');
  } else {
    const firstNameValidation = validateName(userData.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      errors.push(firstNameValidation.message);
    } else {
      sanitizedData.firstName = sanitizeInput(userData.firstName).trim();
    }
  }

  // Validate last name
  if (!userData.lastName) {
    errors.push('Last name is required');
  } else {
    const lastNameValidation = validateName(userData.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      errors.push(lastNameValidation.message);
    } else {
      sanitizedData.lastName = sanitizeInput(userData.lastName).trim();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Rate limiting validation helper
 * @param {number} attempts - Number of attempts
 * @param {number} maxAttempts - Maximum allowed attempts
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} Rate limit check result
 */
function checkRateLimit(attempts, maxAttempts, windowMs) {
  const isExceeded = attempts >= maxAttempts;
  const resetTime = Date.now() + windowMs;

  return {
    isExceeded,
    attemptsRemaining: Math.max(0, maxAttempts - attempts),
    resetTime: isExceeded ? resetTime : null
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeInput,
  validateRegistrationData,
  checkRateLimit
}; 
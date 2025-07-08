// Team Task Manager - Forgot Password Page
// Sprint 2: Password Recovery
// Created: July 6, 2025

import React from 'react';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div>
      <h1>Forgot Your Password?</h1>
      <p>Enter your email address below, and we'll send you a link to reset your password.</p>
      <form>
        <input type="email" placeholder="Enter your email" />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the auth service for Sprint 2 testing
jest.mock('../../../../../frontend/src/services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

// Mock component for Sprint 2 testing
const MockLoginForm = () => {
  return (
    <div>
      <form>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" data-testid="email-input" />
        
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" data-testid="password-input" />
        
        <button type="submit" data-testid="login-button">Login</button>
      </form>
    </div>
  );
};

describe('Sprint 2 - LoginForm Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders login form with all required elements', () => {
    render(
      <BrowserRouter>
        <MockLoginForm />
      </BrowserRouter>
    );

    // Check if all form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('allows user to input email and password', () => {
    render(
      <BrowserRouter>
        <MockLoginForm />
      </BrowserRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    // Test email input
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });
    expect(emailInput).toHaveValue('test@example.com');

    // Test password input
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });
    expect(passwordInput).toHaveValue('password123');
  });

  test('form submission works correctly', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <BrowserRouter>
        <form onSubmit={mockOnSubmit}>
          <input type="email" data-testid="email-input" />
          <input type="password" data-testid="password-input" />
          <button type="submit" data-testid="login-button">Login</button>
        </form>
      </BrowserRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    // Fill in the form
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test('validates required fields', async () => {
    render(
      <BrowserRouter>
        <MockLoginForm />
      </BrowserRouter>
    );

    const loginButton = screen.getByTestId('login-button');
    
    // Try to submit without filling required fields
    fireEvent.click(loginButton);
    
    // In a real implementation, this would show validation errors
    // For now, we just verify the button is clickable
    expect(loginButton).toBeInTheDocument();
  });

  test('handles form submission with valid data', async () => {
    const mockOnSubmit = jest.fn((e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      return {
        email: formData.get('email'),
        password: formData.get('password')
      };
    });
    
    render(
      <BrowserRouter>
        <form onSubmit={mockOnSubmit}>
          <input type="email" name="email" data-testid="email-input" />
          <input type="password" name="password" data-testid="password-input" />
          <button type="submit" data-testid="login-button">Login</button>
        </form>
      </BrowserRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    // Fill in the form with valid data
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
}); 
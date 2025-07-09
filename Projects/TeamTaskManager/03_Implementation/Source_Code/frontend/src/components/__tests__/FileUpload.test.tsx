import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FileUpload from '../FileUpload';

describe('FileUpload', () => {
  test('renders file input and upload button', () => {
    render(<FileUpload />);
    const fileInput = screen.getByLabelText(/upload file/i);
    const uploadButton = screen.getByRole('button', { name: /upload/i });

    expect(fileInput).toBeInTheDocument();
    expect(uploadButton).toBeInTheDocument();
  });

  test('uploads a file', async () => {
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const { getByLabelText, getByRole } = render(<FileUpload />);

    const fileInput = getByLabelText(/upload file/i);
    const uploadButton = getByRole('button', { name: /upload/i });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    // Add assertions for file upload success
  });
});

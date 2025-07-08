/**
 * FileUpload Component Tests
 * Tests for file upload functionality
 * Created: July 7, 2025
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from './FileUpload';
import * as fileService from '../../services/fileService';

jest.mock('../../services/fileService');

describe('FileUpload', () => {
  it('renders the component', () => {
    render(<FileUpload onUpload={() => {}} />);
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<FileUpload onUpload={() => {}} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText('Choose File');
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText('hello.png')).toBeInTheDocument();
  });

  it('calls onUpload when the upload button is clicked', async () => {
    const onUpload = jest.fn();
    const mockUploadFile = jest.spyOn(fileService, 'uploadFile').mockResolvedValue({
      success: true,
      data: {
        filename: 'hello.png',
        path: '/uploads/hello.png',
        size: 5,
        mimetype: 'image/png',
      },
    });

    render(<FileUpload onUpload={onUpload} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText('Choose File');
    fireEvent.change(input, { target: { files: [file] } });
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1);
      expect(onUpload).toHaveBeenCalledWith({
        filename: 'hello.png',
        path: '/uploads/hello.png',
        size: 5,
        mimetype: 'image/png',
      });
    });

    mockUploadFile.mockRestore();
  });
});

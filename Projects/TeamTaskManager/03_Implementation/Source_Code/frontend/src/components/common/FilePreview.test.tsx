/**
 * FilePreview Component Tests
 * Tests for file preview functionality
 * Created: July 7, 2025
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilePreview from './FilePreview';

describe('FilePreview', () => {
  it('renders the component with a generic file icon', () => {
    const file = {
      filename: 'test.txt',
      path: '/uploads/test.txt',
      mimetype: 'text/plain',
    };
    render(<FilePreview file={file} />);
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByTestId('FileIcon')).toBeInTheDocument();
  });

  it('renders the component with an image icon', () => {
    const file = {
      filename: 'test.png',
      path: '/uploads/test.png',
      mimetype: 'image/png',
    };
    render(<FilePreview file={file} />);
    expect(screen.getByText('test.png')).toBeInTheDocument();
    expect(screen.getByTestId('ImageIcon')).toBeInTheDocument();
  });

  it('renders the component with a pdf icon', () => {
    const file = {
      filename: 'test.pdf',
      path: '/uploads/test.pdf',
      mimetype: 'application/pdf',
    };
    render(<FilePreview file={file} />);
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('PdfIcon')).toBeInTheDocument();
  });

  it('renders the component with a doc icon', () => {
    const file = {
      filename: 'test.docx',
      path: '/uploads/test.docx',
      mimetype:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    render(<FilePreview file={file} />);
    expect(screen.getByText('test.docx')).toBeInTheDocument();
    expect(screen.getByTestId('DocIcon')).toBeInTheDocument();
  });
});

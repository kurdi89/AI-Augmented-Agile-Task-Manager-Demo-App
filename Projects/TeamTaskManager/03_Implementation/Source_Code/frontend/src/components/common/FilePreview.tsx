// Team Task Manager - File Preview Component
// Sprint 2: File Management API
// Created: July 7, 2025

import React from 'react';
import { Box, Typography, Link, Paper } from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from '@mui/icons-material';

interface FilePreviewProps {
  file: {
    filename: string;
    path: string;
    mimetype: string;
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const getFileIcon = () => {
    if (file.mimetype.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 40 }} data-testid="ImageIcon" />;
    }
    if (file.mimetype === 'application/pdf') {
      return <PdfIcon sx={{ fontSize: 40 }} data-testid="PdfIcon" />;
    }
    if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      return <DocIcon sx={{ fontSize: 40 }} data-testid="DocIcon" />;
    }
    return <FileIcon sx={{ fontSize: 40 }} data-testid="FileIcon" />;
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 2 }}>{getFileIcon()}</Box>
      <Box>
        <Typography variant="body1">{file.filename}</Typography>
        <Link href={file.path} target="_blank" rel="noopener noreferrer">
          Download
        </Link>
      </Box>
    </Paper>
  );
};

export default FilePreview;

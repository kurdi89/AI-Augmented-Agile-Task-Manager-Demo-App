// Team Task Manager - File Dropzone Component
// Sprint 2: File Management API
// Created: July 7, 2025

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Typography, Paper } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onDrop }) => {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
  });

  return (
    <Paper
      {...getRootProps({ className: 'dropzone' })}
      sx={{
        p: 4,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.400',
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.default',
      }}
    >
      <input {...getInputProps()} />
      <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
      {isDragActive ? (
        <Typography>Drop the files here ...</Typography>
      ) : (
        <Typography>
          Drag 'n' drop some files here, or click to select files
        </Typography>
      )}
    </Paper>
  );
};

export default FileDropzone;

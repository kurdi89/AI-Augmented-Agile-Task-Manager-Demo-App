// Team Task Manager - File Upload Component
// Sprint 2: File Management API
// Created: July 7, 2025

import React, { useState } from 'react';
import { Button, Input, Box, Typography } from '@mui/material';
import { uploadFile } from '../../services/fileService';

interface FileUploadProps {
  onUpload: (file: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setUploading(true);
      try {
        const response = await uploadFile(selectedFile);
        onUpload(response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Box>
      <Input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="contained" component="span">
          Choose File
        </Button>
      </label>
      {selectedFile && (
        <Typography variant="body1" sx={{ ml: 2 }}>
          {selectedFile.name}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        sx={{ ml: 2 }}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </Box>
  );
};

export default FileUpload;

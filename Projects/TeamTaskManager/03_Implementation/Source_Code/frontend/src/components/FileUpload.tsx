"use client";

import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
const [file, setFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);
const [taskId, setTaskId] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

const handleUpload = async (taskId: string) => {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  setUploading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`http://localhost:4000/api/upload/${taskId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('File uploaded successfully', response.data);
  } catch (error) {
    console.error('Error uploading file', error);
  } finally {
    setUploading(false);
  }
};

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <input type="text" placeholder="Task ID" onChange={(e) => setTaskId(e.target.value)} />
      <button onClick={() => handleUpload(taskId)} disabled={!file || !taskId || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default FileUpload;

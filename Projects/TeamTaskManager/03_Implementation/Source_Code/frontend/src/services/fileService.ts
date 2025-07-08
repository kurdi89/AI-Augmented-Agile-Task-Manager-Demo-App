// Team Task Manager - File Service
// Sprint 2: File Management API
// Created: July 7, 2025

import { apiClient } from './apiClient';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

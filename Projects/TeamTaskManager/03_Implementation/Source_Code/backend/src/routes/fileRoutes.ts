// Team Task Manager - File Routes
// Sprint 2: File Management API
// Created: July 7, 2025

import { Router } from 'express';
import { uploadFile, uploadMiddleware } from '../controllers/fileController';

const router = Router();

router.post('/upload', uploadMiddleware, uploadFile);

export default router;

const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('../generated/prisma');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.post('/:taskId', protect, upload.single('file'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { filename, size, mimetype, path } = req.file;

    // Check if task exists
    const task = await prisma.Task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskAttachment = await prisma.TaskAttachment.create({
      data: {
        task_id: taskId,
        file_name: filename,
        file_size: size,
        file_type: mimetype,
        file_url: path,
        uploaded_by: req.user.id,
      },
    });

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('task:attachment:created', {
        taskId,
        fileUrl: path,
        fileType: mimetype,
      });
    }

    res.json({ taskAttachment });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;

// Import required modules
const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { PrismaClient } = require('../generated/prisma');

// Initialize express router and Prisma client
const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
// Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.
// The 'dest' option specifies the directory where the uploaded files should be stored.
const upload = multer({ dest: 'uploads/' });

// Define POST route for file uploads
// This route handles file uploads for a specific task identified by taskId.
// The 'protect' middleware ensures that only authenticated users can access this route.
// The 'upload.single('file')' middleware handles the file upload, making the uploaded file available in req.file.
router.post('/:taskId', protect, upload.single('file'), async (req, res) => {
  try {
    // Extract taskId from request parameters
    // The taskId is used to associate the uploaded file with a specific task in the database.
    const { taskId } = req.params;

    // Extract file details from request
    // The uploaded file's details (filename, size, mimetype, and path) are extracted from req.file.
    const { filename, size, mimetype, path } = req.file;

    // Check if the task exists in the database
    // The task is retrieved from the database using the taskId.
    // If the task does not exist, a 404 error is returned.
    const task = await prisma.Task.findUnique({
      where: { id: taskId }
    });

    // If task does not exist, return 404 error
    // This ensures that files are only uploaded for existing tasks.
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Create a new task attachment record in the database
    // The uploaded file's details are stored in the TaskAttachment table in the database.
    // The task_id field associates the attachment with the specific task.
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

    // Emit a socket event if io is available
    // If the io object is available (indicating that socket.io is set up), a 'task:attachment:created' event is emitted.
    // This event can be used to notify clients in real-time about the new file attachment.
    if (req.app.get('io')) {
      req.app.get('io').emit('task:attachment:created', {
        taskId,
        fileUrl: path,
        fileType: mimetype,
      });
    }

    // Return the created task attachment as JSON response
    // The details of the newly created task attachment are returned in the response.
    res.json({ taskAttachment });
  } catch (error) {
    // Log the error and return a 500 error response
    // If an error occurs during the file upload process, it is logged to the console, and a 500 error response is returned.
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Export the router for use in other parts of the application
// The router is exported so that it can be used in other parts of the application, such as in the main server file.
module.exports = router;

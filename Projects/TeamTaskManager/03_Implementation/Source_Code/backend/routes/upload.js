const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/:taskId', protect, upload.single('file'), async (req, res) => {
  const { taskId } = req.params;
  const { filename, size, mimetype, path } = req.file;

  const taskAttachment = await prisma.taskAttachment.create({
    data: {
      taskId,
      fileName: filename,
      fileSize: size,
      fileType: mimetype,
      fileUrl: path,
      uploadedById: req.user.id,
    },
  });

  io.emit('task:attachment:created', {
    taskId,
    fileUrl: path,
    fileType: mimetype,
  });

  res.json({ taskAttachment });
});

module.exports = router;

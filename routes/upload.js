const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const multer = require('multer');
const path = require('path');

// Store images in /uploads with original file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// POST /upload-profile-image
router.post('/upload-profile-image', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
      res.status(200).json({ imageUrl });
    } catch (err) {
      console.error('Upload failed:', err); // 👈 This will help!
      res.status(500).json({ error: 'Upload failed.' });
    }
  });  

module.exports = router;

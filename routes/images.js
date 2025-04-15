const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Multer setup for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save in /uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

/* GET all images for a camping spot */
router.get('/:spot_id', async (req, res, next) => {
  try {
    const spotId = parseInt(req.params.spot_id);
    const images = await prisma.images.findMany({
      where: { spot_id: spotId },
      orderBy: { uploaded_at: 'desc' }
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
});

/* POST upload a new image (file) */
router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    const spotId = parseInt(req.body.spot_id);
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const imageUrl = `http://localhost:3000/uploads/${file.filename}`;

    const newImage = await prisma.images.create({
      data: {
        spot_id: spotId,
        image_url: imageUrl,
        uploaded_at: new Date()
      }
    });

    res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
  } catch (err) {
    next(err);
  }
});

/* DELETE an image by ID */
router.delete('/:image_id', async (req, res, next) => {
  try {
    const imageId = parseInt(req.params.image_id);
    await prisma.images.delete({ where: { image_id: imageId } });
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

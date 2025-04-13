const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


//to uploud image.
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
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});


// gets profile either by email or id
router.get('/', async (req, res, next) => {
  try {
    const { email, userId } = req.query;

    if (!email && !userId) {
      return res.status(400).json({ error: 'Email or userId is required to fetch profile.' });
    }

    const user = await prisma.users.findUnique({
      where: email ? { email } : { user_id: parseInt(userId) },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        image_url: true,
        is_admin: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});


/* GET profile by email */
router.get('/', async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to fetch profile.' });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        image_url: true,
        is_admin: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// GET profile by user_id
router.get('/:id', async (req, res, next) => {
  const userId = parseInt(req.params.id);
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        image_url: true,
        is_admin: true,
        created_at: true
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});


/* PUT update profile by email */
router.put('/', async (req, res, next) => {
  try {
    const { email, first_name, last_name, phone_number, image_url } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to update profile.' });
    }

    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        first_name,
        last_name,
        phone_number,
        image_url
      },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        image_url: true,
        is_admin: true,
        created_at: true
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
});



module.exports = router;

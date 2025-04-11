const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

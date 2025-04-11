const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* POST new user registration */
router.post('/', async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      is_admin,
      image_url
    } = req.body;

    // Basic validation
    if (!email || !password || !first_name || !last_name || !phone_number) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Check if the user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    // Create the new user
    const newUser = await prisma.users.create({
      data: {
        email,
        password, // hash this
        first_name,
        last_name,
        phone_number,
        is_admin: is_admin ?? false,
        image_url,
        created_at: new Date()
      }
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

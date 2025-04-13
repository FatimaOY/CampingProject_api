const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// For admin

/* GET all users - Admin only */
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
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

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

/* GET a user by ID */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: parseInt(req.params.id) },
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

/* POST create a new user (admin-created) */
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

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const newUser = await prisma.users.create({
      data: {
        email,
        password,
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

/* PUT update a user by ID */
router.put('/:id', async (req, res, next) => {
  try {
    const { first_name, last_name, phone_number, image_url, is_admin } = req.body;

    const updatedUser = await prisma.users.update({
      where: { user_id: parseInt(req.params.id) },
      data: {
        first_name,
        last_name,
        phone_number,
        image_url,
        is_admin
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

    res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
  } catch (err) {
    next(err);
  }
});

/* DELETE a user by ID */
router.delete('/:id', async (req, res, next) => {
  const userId = parseInt(req.params.id);

  try {
    // 1. Get all spot IDs owned by this user
    const spots = await prisma.camping_spots.findMany({
      where: { owner_id: userId },
      select: { spot_id: true }
    });

    const spotIds = spots.map(s => s.spot_id);

    // 2. Delete from campingspot_amenities
    await prisma.campingspot_amenities.deleteMany({
      where: {
        spot_id: { in: spotIds }
      }
    });

    // 3. Delete camping spots
    await prisma.camping_spots.deleteMany({
      where: {
        owner_id: userId
      }
    });

    // 4. Finally, delete the user
    await prisma.users.delete({
      where: { user_id: userId }
    });

    res.status(200).json({ message: 'User and all related camping spots deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    next(err);
  }
});

module.exports = router;
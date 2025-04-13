const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔹 POST a new booking
router.post('/', async (req, res) => {
  const { user_id, spot_id, check_in_date, check_out_date, total_price, status_id } = req.body;

  try {
    const booking = await prisma.bookings.create({
      data: {
        user_id,
        spot_id,
        check_in_date: new Date(check_in_date),
        check_out_date: new Date(check_out_date),
        total_price,
        status_id
      }
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// 🔹 GET bookings made BY the user
router.get('/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const bookings = await prisma.bookings.findMany({
      where: { user_id: userId },
      include: {
        spot: {
          include: {
            city: true,
            country: true
          }
        },
        status: true
      }
    });

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ error: 'Failed to fetch user bookings.' });
  }
});

// 🔹 GET bookings for spots OWNED by a user
router.get('/owner/:ownerId', async (req, res) => {
  const ownerId = parseInt(req.params.ownerId);

  try {
    const bookings = await prisma.bookings.findMany({
      where: {
        spot: {
          owner_id: ownerId
        }
      },
      include: {
        user: true,
        spot: {
          include: {
            city: true,
            country: true
          }
        },
        status: true
      }
    });

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching owner bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings for owner.' });
  }
});

module.exports = router;

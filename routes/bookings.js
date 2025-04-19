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

    // 🛑 Step 1: Get all dates between check_in and check_out
    const start = new Date(check_in_date);
    const end = new Date(check_out_date);
    const dates = [];

    while (start <= end) {
      dates.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }

    // ✅ Step 2: Update isBooked for those dates
    await Promise.all(
      dates.map(async d => {
        await prisma.availability.updateMany({
          where: {
            spot_id,
            Date: {
              gte: new Date(d.toISOString().split('T')[0]),
              lt: new Date(new Date(d).setDate(d.getDate() + 1)) // Next day
            }
          },
          data: {
            isBooked: true
          }
        });
      })
    );

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

// 🔄 PATCH: update booking status (accept or deny)
router.patch('/:bookingId/status', async (req, res) => {
  const bookingId = parseInt(req.params.bookingId);
  const { status_id } = req.body;

  try {
    // First, find the booking
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // If denying the booking (status_id === 3), reset availability
    if (parseInt(status_id) === 3) {
      const start = new Date(booking.check_in_date);
      const end = new Date(booking.check_out_date);

      while (start <= end) {
        await prisma.availability.updateMany({
          where: {
            spot_id: booking.spot_id,
            Date: {
              gte: new Date(start.toISOString().split('T')[0]),
              lt: new Date(new Date(start).setDate(start.getDate() + 1))
            }
          },
          data: { isBooked: false }
        });

        start.setDate(start.getDate() + 1);
      }
    }

    // Update the booking status
    const updatedBooking = await prisma.bookings.update({
      where: { booking_id: bookingId },
      data: { status_id: parseInt(status_id) }
    });

    res.json({ message: 'Booking status updated.', booking: updatedBooking });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

// GET all bookings (for admin)
router.get('/all', async (req, res) => {
  try {
    const bookings = await prisma.bookings.findMany({
      include: {
        user: true,
        spot: true,
        status: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ error: 'Failed to fetch all bookings.' });
  }
});





module.exports = router;

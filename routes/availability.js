const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET availability for a camping spot */
router.get('/:spot_id', async (req, res, next) => {
  try {
    const spotId = parseInt(req.params.spot_id);

    const availability = await prisma.availability.findMany({
      where: {
        spot_id: spotId
      },
      orderBy: {
        Date: 'asc'
      }
    });

    res.json(availability);
  } catch (err) {
    next(err);
  }
});

/* POST toggle availability for a date */
router.post('/toggle', async (req, res, next) => {
  try {
    const { spot_id, date } = req.body;

    if (!spot_id || !date) {
      return res.status(400).json({ error: 'spot_id and date are required' });
    }

    // Check if this date is already available
    const existing = await prisma.availability.findFirst({
      where: {
        spot_id: spot_id,
        Date: new Date(date)
      }
    });

    if (existing) {
      // Date already exists — delete it (unmark)
      await prisma.availability.delete({
        where: {
          availability_id: existing.availability_id
        }
      });

      return res.json({ message: 'Date removed from availability', action: 'removed' });
    } else {
      // Date does not exist — create it (mark)
      const newAvailability = await prisma.availability.create({
        data: {
          spot_id,
          Date: new Date(date),
          isBooked: false
        }
      });

      return res.status(201).json({ message: 'Date added to availability', action: 'added', data: newAvailability });
    }
  } catch (err) {
    console.error('❌ Error toggling availability:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

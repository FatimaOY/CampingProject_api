const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET all camping spots */
router.get('/', async function (req, res, next) {
  try {
    const data = await prisma.camping_spots.findMany({
      include: {
        city: true,
        country: true,
        reviews: true,
        availability: true,
      }
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/* POST a new camping spot */
router.post('/', async function (req, res, next) {
  try {
    const { owner_id, name, location, city_id, coutry_id, description, amountGuests, price_per_night } = req.body;

    const newSpot = await prisma.camping_spots.create({
      data: {
        owner_id,
        name,
        location,
        city_id,
        coutry_id,
        description,
        amountGuests,
        price_per_night,
        is_Active: true,
        is_booked: false
      }
    });

    res.json(newSpot);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

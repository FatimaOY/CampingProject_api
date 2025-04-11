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
        campingspot_amenities: {
          include: {
            amenities: true // This gets the actual amenity details
          }
        }
      }
    });
    const cleanedData = data.map(spot => ({
      ...spot,
      amenities: spot.campingspot_amenities.map(ca => ca.amenities)
    }));

    res.json(cleanedData);
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

// GET one camping spot by ID
router.get('/:id', async (req, res, next) => {
  try {
    const spotId = parseInt(req.params.id);

    const spot = await prisma.camping_spots.findUnique({
      where: { spot_id: spotId },
      include: {
        city: true,
        country: true,
        reviews: true,
        availability: true,
        campingspot_amenities: {
          include: {
            amenities: true // This gets the actual amenity details
          }
        }
      }
    });

    if (!spot) {
      return res.status(404).json({ message: "Camping spot not found" });
    }

    const cleanedData = data.map(spot => ({
      ...spot,
      amenities: spot.campingspot_amenities.map(ca => ca.amenities)
    }));

    res.json(cleanedData);
  } catch (err) {
    next(err);
  }
});

// DELETE a camping spot by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const spotId = parseInt(req.params.id);

    // Check if the spot exists first
    const existingSpot = await prisma.camping_spots.findUnique({
      where: { spot_id: spotId }
    });

    if (!existingSpot) {
      return res.status(404).json({ message: 'Camping spot not found' });
    }

    // Delete the spot
    await prisma.camping_spots.delete({
      where: { spot_id: spotId }
    });

    res.json({ message: 'Camping spot deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT (update) a camping spot by ID
router.put('/:id', async (req, res, next) => {
  try {
    const spotId = parseInt(req.params.id);

    // Check if the spot exists
    const existingSpot = await prisma.camping_spots.findUnique({
      where: { spot_id: spotId }
    });

    if (!existingSpot) {
      return res.status(404).json({ message: 'Camping spot not found' });
    }

    // Update the spot with only the fields provided in req.body
    const updatedSpot = await prisma.camping_spots.update({
      where: { spot_id: spotId },
      data: {
        name: req.body.name,
        location: req.body.location,
        city_id: req.body.city_id,
        coutry_id: req.body.coutry_id,
        description: req.body.description,
        amountGuests: req.body.amountGuests,
        price_per_night: req.body.price_per_night,
        is_Active: req.body.is_Active,
        is_booked: req.body.is_booked
      }
    });

    res.json(updatedSpot);
  } catch (err) {
    next(err);
  }
});


module.exports = router;

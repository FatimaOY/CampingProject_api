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

// 🔍 GET all camping spots by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  const ownerId = parseInt(req.params.ownerId);

  try {
    const spots = await prisma.camping_spots.findMany({
      where: { owner_id: ownerId }
    });

    res.status(200).json(spots);
  } catch (err) {
    console.error('Error fetching spots for owner:', err);
    res.status(500).json({ error: 'Failed to fetch spots for owner.' });
  }
});


/* POST a new camping spot */
router.post('/', async function (req, res, next) {
  try {
    const {
      owner_id,
      name,
      location,
      city_name,
      country_name,
      description,
      amountGuests,
      price_per_night,
      amenities = []
    } = req.body;

    // 🔍 Find or create the country
    let country = await prisma.country.findFirst({ where: { name: country_name } });
    if (!country) {
      country = await prisma.country.create({ data: { name: country_name } });
    }

    // 🔍 Find or create the city
    let city = await prisma.city.findFirst({ where: { name: city_name } });
    if (!city) {
      city = await prisma.city.create({ data: { name: city_name, country_id: country.country_id } });
    }

    // 🏕️ Create the camping spot
    const newSpot = await prisma.camping_spots.create({
      data: {
        owner_id,
        name,
        location,
        city_id: city.city_id,
        coutry_id: country.country_id,
        description,
        amountGuests,
        price_per_night,
        is_Active: true,
        is_booked: false
      }
    });

    // ✅ Connect amenities
    if (amenities.length > 0) {
      const amenityData = amenities.map(aid => ({
        spot_id: newSpot.spot_id,
        amenity_id: aid
      }));

      await prisma.campingspot_amenities.createMany({
        data: amenityData
      });
    }

    res.status(201).json(newSpot);
  } catch (err) {
    console.error("Error creating camping spot:", err);
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

    // Check if the spot exists
    const existingSpot = await prisma.camping_spots.findUnique({
      where: { spot_id: spotId }
    });

    if (!existingSpot) {
      return res.status(404).json({ message: 'Camping spot not found' });
    }

    // Delete related entries first
    await prisma.campingspot_amenities.deleteMany({
      where: { spot_id: spotId }
    });

    await prisma.availability.deleteMany({
      where: { spot_id: spotId }
    });

    await prisma.reviews.deleteMany({
      where: { spot_id: spotId }
    });

    // Now delete the camping spot
    await prisma.camping_spots.delete({
      where: { spot_id: spotId }
    });

    res.json({ message: 'Camping spot deleted successfully' });
  } catch (err) {
    console.error("Error deleting spot:", err); // 👈 Log for debugging
    res.status(500).json({ error: 'Internal server error while deleting spot.' });
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

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET all amenities */
router.get('/', async (req, res, next) => {
  try {
    const amenities = await prisma.amenities.findMany();
    res.status(200).json(amenities);
  } catch (err) {
    next(err);
  }
});

/* POST create a new amenity */
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    // Basic exact match check (case-sensitive)
    const existing = await prisma.amenities.findFirst({
      where: {
        name: name
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Amenity already exists.' });
    }

    const newAmenity = await prisma.amenities.create({
      data: { name, description }
    });

    res.status(201).json(newAmenity);
  } catch (err) {
    console.error('Error in POST /amenities:', err); //log full error
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

/* DELETE an amenity by ID */
router.delete('/:id', async (req, res, next) => {
  try {
    const amenityId = parseInt(req.params.id);

    // Optional: Check if amenity exists first
    const existingAmenity = await prisma.amenities.findUnique({
      where: { amenity_id: amenityId }
    });

    if (!existingAmenity) {
      return res.status(404).json({ error: 'Amenity not found.' });
    }

    // Delete it
    await prisma.amenities.delete({
      where: { amenity_id: amenityId }
    });

    res.json({ message: 'Amenity deleted successfully.' });
  } catch (err) {
    console.error(' Error deleting amenity:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});



module.exports = router;

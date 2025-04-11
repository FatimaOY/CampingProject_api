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

module.exports = router;

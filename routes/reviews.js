const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* GET all reviews for a camping spot */
router.get('/spot/:spotId', async (req, res, next) => {
  const spotId = parseInt(req.params.spotId);
  try {
    const reviews = await prisma.reviews.findMany({
      where: { spot_id: spotId },
      include: {
        user: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            image_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

/* POST a new review */
router.post('/', async (req, res, next) => {
  try {
    const { user_id, spot_id, rating, comment } = req.body;

    if (!user_id || !spot_id || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newReview = await prisma.reviews.create({
      data: {
        user_id,
        spot_id,
        rating,
        comment
      }
    });

    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
});

/* DELETE a review by ID */
router.delete('/:id', async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);

    const review = await prisma.reviews.findUnique({
      where: { review_id: reviewId }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    await prisma.reviews.delete({
      where: { review_id: reviewId }
    });

    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* POST login */
router.post('/', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // ⚠️ For now, compare passwords directly (plaintext, not secure)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // Return user info (omit password!)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful!',
      user: userWithoutPassword
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;

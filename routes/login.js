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

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    // The frontend here can get the information about the user without password for extra safety so frontend is accesed by password but it doesnt use it after login.
    const { password: _, ...userWithoutPassword } = user;
    // _ : ignore variable
    // ...: It collects all the remaining properties.

    res.status(200).json({
      message: 'Login successful!',
      user: userWithoutPassword
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;

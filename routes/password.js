const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();


/* POST update password */
router.post('/update', async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const updatedUser = await prisma.users.update({
      where: { email },
      data: { password: newPassword }
    });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});


// For reseting the password
// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Creates a token & expiration
    const token = crypto.randomBytes(32).toString('hex'); //this is to generate a different unique token for each time.
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // it expires in 15 min

    // this send the token and expiry to database
    await prisma.users.update({
      where: { email },
      data: {
        reset_token: token,
        reset_token_expires_at: expiry
      }
    });

    // send to the actual email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // this is fallback port
      secure: false, 
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const resetUrl = `http://localhost:8080/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: '"Camping Support" <yourgmail@gmail.com>',
      to: email, // will go to the user’s Gmail
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>`
    });

    //console.log("Preview email:", nodemailer.getTestMessageUrl(info));

    res.json({ message: 'Reset email sent. Check your email box.' });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.users.findFirst({
      where: {
        reset_token: token,
        reset_token_expires_at: { gt: new Date() } // token not expired
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        password: newPassword,
        reset_token: null,
        reset_token_expires_at: null
      }
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: 'Server error while resetting password.' });
  }
});


module.exports = router;

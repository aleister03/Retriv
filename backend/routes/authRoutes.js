const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}` }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    const isNewUser = req.user.isNewUser || false;
    
    res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${req.user.email}&profilePicture=${encodeURIComponent(req.user.profilePicture || '')}&isNewUser=${isNewUser}`
    );
  }
);

// Email-only login 
router.post('/email-login', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find existing user
    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      // Create new user
      const userName = normalizedEmail.split('@')[0];
      
      user = await User.create({
        email: normalizedEmail,
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        authProvider: 'email',
        isVerified: false, 
      });

      isNewUser = true;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Return token, user info, and isNewUser flag
    res.json({
      success: true,
      token,
      isNewUser,
      user: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || '',
        isVerified: user.isVerified,
        reputationScore: user.reputationScore,
      },
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-googleId -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

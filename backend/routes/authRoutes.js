const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { verifyToken, checkUserStatus } = require('../middleware/auth'); // Import from new middleware

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}`,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    const isNewUser = req.user.isNewUser || false;
    res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${token}&isNewUser=${isNewUser}`
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
    } else {
      // Check if user is banned or suspended
      if (user.isBanned) {
        return res.status(403).json({ 
          success: false,
          isBanned: true,
          message: `Your account has been banned. Reason: ${user.banReason || 'No reason provided'}`,
          banReason: user.banReason,
        });
      }
      
      if (user.isCurrentlySuspended()) {
        const remainingTime = Math.ceil((user.suspendedUntil - new Date()) / (1000 * 60 * 60));
        return res.status(403).json({ 
          success: false,
          isSuspended: true,
          message: `Your account is suspended until ${user.suspendedUntil.toLocaleString()}`,
          suspensionReason: user.suspensionReason,
          suspendedUntil: user.suspendedUntil,
          remainingHours: remainingTime,
        });
      }
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
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile 
router.get('/profile', verifyToken, checkUserStatus, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-googleId -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update basic profile info 
router.put('/profile', verifyToken, checkUserStatus, async (req, res) => {
  try {
    const { name, address, gender, phoneNumber } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (gender !== undefined) updates.gender = gender;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select('-googleId -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res
      .status(500)
      .json({ message: 'Server error while updating profile' });
  }
});

// Update profile picture
router.put('/profile/picture', verifyToken, checkUserStatus, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    if (!profilePicture) {
      return res
        .status(400)
        .json({ message: 'profilePicture is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profilePicture } },
      { new: true }
    ).select('-googleId -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile picture update error:', error);
    res
      .status(500)
      .json({ message: 'Server error while updating picture' });
  }
});

// Toggle profile lock
router.put('/profile/lock', verifyToken, checkUserStatus, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isProfileLocked = !user.isProfileLocked;
    await user.save();

    res.json({
      success: true,
      isProfileLocked: user.isProfileLocked,
      user,
    });
  } catch (error) {
    console.error('Profile lock toggle error:', error);
    res
      .status(500)
      .json({ message: 'Server error while toggling profile lock' });
  }
});

module.exports = router;
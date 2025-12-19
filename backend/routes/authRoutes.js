const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};


router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


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


router.post('/email-login', async (req, res) => {
  try {
    const { email } = req.body;

    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    
    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
    
      const userName = normalizedEmail.split('@')[0];
      user = await User.create({
        email: normalizedEmail,
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        authProvider: 'email',
        isVerified: false,
      });
      isNewUser = true;
    }

    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    
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


router.get('/profile', verifyToken, async (req, res) => {
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
router.put('/profile', verifyToken, async (req, res) => {
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


router.put('/profile/picture', verifyToken, async (req, res) => {
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


router.put('/profile/lock', verifyToken, async (req, res) => {
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

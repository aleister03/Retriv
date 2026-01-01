const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.userId = decoded.id;
    next();
  });
};

const optionalVerifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    req.userId = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      req.userId = null;
    } else {
      req.userId = decoded.id;
    }
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin verification'
    });
  }
};

// Check if user is banned or suspended
const checkUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        isBanned: true,
        message: `Your account has been banned. Reason: ${user.banReason || 'No reason provided'}`,
        banReason: user.banReason,
      });
    }

    // Check if user is suspended
    if (user.isCurrentlySuspended()) {
      const remainingTime = Math.ceil((user.suspendedUntil - new Date()) / (1000 * 60 * 60)); // Hours
      return res.status(403).json({
        success: false,
        isSuspended: true,
        message: `Your account is suspended until ${user.suspendedUntil.toLocaleString()}`,
        suspensionReason: user.suspensionReason,
        suspendedUntil: user.suspendedUntil,
        remainingHours: remainingTime,
      });
    }

    next();
  } catch (error) {
    console.error('User status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status check'
    });
  }
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
  verifyAdmin,
  checkUserStatus
};
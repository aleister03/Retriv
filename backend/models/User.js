const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  authProvider: {
    type: String,
    enum: ['google', 'email'],
    required: true,
    default: 'email',
  },
  googleId: {
    type: String,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female',''],
    default: '',
  },
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
  },
  isProfileLocked: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  promotedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  promotedAt: {
    type: Date,
    default: null,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: '',
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspensionReason: {
    type: String,
    default: '',
  },
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  suspendedUntil: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  address: {
    type: String,
    default: "",
  },
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.isCurrentlySuspended = function() {
  if (!this.isSuspended) return false;
  if (!this.suspendedUntil) return false;
  
  // Check if suspension has expired
  if (new Date() > this.suspendedUntil) {
    // Auto-unsuspend
    this.isSuspended = false;
    this.suspendedUntil = null;
    this.suspensionReason = '';
    this.suspendedBy = null;
    this.save();
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('User', userSchema);
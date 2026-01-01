const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'message',
      'rental_reminder',
      'rental_overdue',
      'verification_approved',
      'verification_rejected',
      'verification_pending',
      'item_unavailable',  
      'post_update',
      'system',
    ],
    required: true,
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  post: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  verificationRequest: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VerificationRequest',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index 
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
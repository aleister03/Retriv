const mongoose = require('mongoose');

const rentalTrackingSchema = new mongoose.Schema({
  verificationRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VerificationRequest',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  durationInDays: {
    type: Number,
    required: true,
  },
  returnProofImages: {
    type: [String],
    default: [],
  },
  returnStatus: {
    type: String,
    enum: ['active', 'returned_pending', 'returned_verified', 'overdue'],
    default: 'active',
  },
  lastNotificationSent: {
    type: Date,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

rentalTrackingSchema.index({ renter: 1, isCompleted: 1 });
rentalTrackingSchema.index({ endDate: 1, isCompleted: 1 });

module.exports = mongoose.model('RentalTracking', rentalTrackingSchema);
const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['borrow', 'rent', 'swap', 'purchase', 'claim', 'return'],
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proofImages: {
    type: [String],
    default: [],
  },
  details: {
    type: String,
    default: '',
  },
  // For rent requests
  rentalDuration: {
    startDate: Date,
    endDate: Date,
    durationInDays: Number,
  },
  // For claim requests 
  ownershipProof: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

verificationRequestSchema.index({ status: 1, createdAt: -1 });
verificationRequestSchema.index({ post: 1 });
verificationRequestSchema.index({ requester: 1 });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
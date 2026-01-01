const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
    validate: [arrayLimit, 'Maximum 3 images allowed'],
  },
  type: {
    type: String,
    enum: ['lost-found', 'marketplace', 'exchange'],
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Marketplace specific fields
  price: {
    type: Number,
    default: 0,
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Used - Good', 'Used - Fair', ''],
    default: '',
  },
  // Exchange specific fields
  exchangeType: {
    type: String,
    enum: ['Rent', 'Borrow', 'Swap', ''],
    default: '',
  },
  duration: {
    type: String,
    default: '',
  },
  rentalPrice: {
    type: Number,
    default: 0,
  },
  availability: {
    type: String,
    enum: ['Available', 'Reserved', 'Unavailable', ''],
    default: 'Available',
  },
  // Reports array
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    }
  }],
  // Common fields
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val) {
  return val.length <= 3;
}

postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
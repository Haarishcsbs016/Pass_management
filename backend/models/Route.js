const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [50, 'Source cannot exceed 50 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [50, 'Destination cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    default: 'Tamil Nadu',
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  durationMultipliers: {
    '1-month': {
      type: Number,
      default: 1.0
    },
    '3-months': {
      type: Number,
      default: 2.5
    },
    '6-months': {
      type: Number,
      default: 4.5
    },
    '1-year': {
      type: Number,
      default: 8.0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  estimatedTime: {
    type: String,
    required: [true, 'Estimated time is required']
  },
  routeType: {
    type: String,
    enum: ['bus', 'metro', 'train', 'combined'],
    default: 'bus'
  },
  stops: [{
    name: String,
    order: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique route combinations
routeSchema.index({ state: 1, source: 1, destination: 1 }, { unique: true });
routeSchema.index({ isActive: 1 });

// Static method to calculate price
routeSchema.statics.calculatePrice = function(basePrice, duration) {
  const multipliers = {
    '1-month': 1.0,
    '3-months': 2.5,
    '6-months': 4.5,
    '1-year': 8.0
  };
  return basePrice * (multipliers[duration] || 1.0);
};

// Pre-save middleware to update timestamps
routeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Route', routeSchema);

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: [true, 'Route ID is required'],
    unique: true,
    trim: true,
    match: [/^RT\d{3}$/, 'Route ID must follow format RT001, RT002, etc.']
  },
  distanceKm: {
    type: Number,
    required: [true, 'Distance in kilometers is required'],
    min: [0.1, 'Distance must be at least 0.1 km'],
    max: [1000, 'Distance cannot exceed 1000 km']
  },
  trafficLevel: {
    type: String,
    required: [true, 'Traffic level is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Traffic level must be Low, Medium, or High'
    }
  },
  baseTimeMinutes: {
    type: Number,
    required: [true, 'Base time in minutes is required'],
    min: [5, 'Base time must be at least 5 minutes'],
    max: [480, 'Base time cannot exceed 8 hours (480 minutes)']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description must not exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate fuel cost for this route
routeSchema.methods.calculateFuelCost = function() {
  const baseFuelRate = 5; // ₹5/km
  const highTrafficSurcharge = this.trafficLevel === 'High' ? 2 : 0;
  return this.distanceKm * (baseFuelRate + highTrafficSurcharge);
};

module.exports = mongoose.model('Route', routeSchema);
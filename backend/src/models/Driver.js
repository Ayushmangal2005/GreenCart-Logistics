const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [2, 'Driver name must be at least 2 characters long'],
    maxlength: [50, 'Driver name must not exceed 50 characters']
  },
  currentShiftHours: {
    type: Number,
    default: 0,
    min: [0, 'Current shift hours cannot be negative'],
    max: [24, 'Current shift hours cannot exceed 24']
  },
  past7DaysWorkHours: {
    type: [Number],
    default: [0, 0, 0, 0, 0, 0, 0],
    validate: {
      validator: function(arr) {
        return arr.length === 7 && arr.every(hours => hours >= 0 && hours <= 24);
      },
      message: 'Past 7 days work hours must be an array of 7 non-negative numbers not exceeding 24'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate if driver has fatigue (worked > 8 hours yesterday)
driverSchema.methods.hasFatigue = function() {
  return this.past7DaysWorkHours[6] > 8; // Yesterday's hours (index 6 is yesterday)
};

// Update work hours for current day
driverSchema.methods.updateWorkHours = function(hoursWorked) {
  this.currentShiftHours += hoursWorked;
  
  // Shift array left and add today's hours
  this.past7DaysWorkHours.shift();
  this.past7DaysWorkHours.push(this.currentShiftHours);
  
  return this.save();
};

module.exports = mongoose.model('Driver', driverSchema);
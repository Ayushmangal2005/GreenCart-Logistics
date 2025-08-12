const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true,
    match: [/^ORD\d{3}$/, 'Order ID must follow format ORD001, ORD002, etc.']
  },
  value_rs: {
    type: Number,
    required: [true, 'Order value in rupees is required'],
    min: [1, 'Order value must be at least ₹1'],
    max: [100000, 'Order value cannot exceed ₹100,000']
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Assigned route is required']
  },
  deliveryTimestamp: {
    type: Date,
    required: [true, 'Delivery timestamp is required']
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'delivered', 'late'],
      message: 'Status must be pending, delivered, or late'
    },
    default: 'pending'
  },
  deliveryTimeMinutes: {
    type: Number,
    min: [0, 'Delivery time cannot be negative'],
    default: null
  },
  profit: {
    type: Number,
    default: 0
  },
  customerAddress: {
    type: String,
    trim: true,
    maxlength: [200, 'Customer address must not exceed 200 characters']
  },
  customerPhone: {
    type: String,
    match: [/^\d{10}$/, 'Customer phone must be 10 digits']
  }
}, {
  timestamps: true
});

// Calculate if order is high value (> ₹1000)
orderSchema.methods.isHighValue = function() {
  return this.value_rs > 1000;
};

// Check if delivery is late (delivery time > base route time + 10 minutes)
orderSchema.methods.isLateDelivery = function(baseRouteTime) {
  return this.deliveryTimeMinutes > (baseRouteTime + 10);
};

module.exports = mongoose.model('Order', orderSchema);
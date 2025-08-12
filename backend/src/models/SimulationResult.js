const mongoose = require('mongoose');

const simulationResultSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  inputParameters: {
    availableDrivers: Number,
    routeStartTime: String,
    maxHoursPerDriverPerDay: Number
  },
  results: {
    totalProfit: Number,
    totalOrders: Number,
    onTimeDeliveries: Number,
    lateDeliveries: Number,
    efficiencyScore: Number,
    fuelCostBreakdown: {
      totalFuelCost: Number,
      byTrafficLevel: {
        Low: Number,
        Medium: Number,
        High: Number
      }
    },
    perOrderResults: [{
      orderId: String,
      assignedDriverId: String,
      isLate: Boolean,
      deliveryTimeMinutes: Number,
      profit: Number,
      penalties: Number,
      bonus: Number,
      fuelCost: Number
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SimulationResult', simulationResultSchema);
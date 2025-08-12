const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');

class SimulationService {
  /**
   * Main simulation function implementing all company rules
   */
  static async runSimulation({ availableDrivers, routeStartTime, maxHoursPerDriverPerDay }) {
    try {
      // Fetch all active data
      const drivers = await Driver.find({ isActive: true }).limit(availableDrivers);
      const routes = await Route.find({ isActive: true });
      const orders = await Order.find({ status: 'pending' }).populate('assignedRoute');

      if (drivers.length === 0) {
        throw new Error('No available drivers found');
      }

      if (orders.length === 0) {
        throw new Error('No pending orders found');
      }

      // Sort orders by delivery timestamp (earliest first)
      orders.sort((a, b) => new Date(a.deliveryTimestamp) - new Date(b.deliveryTimestamp));

      const simulationResults = {
        totalProfit: 0,
        totalOrders: orders.length,
        onTimeDeliveries: 0,
        lateDeliveries: 0,
        efficiencyScore: 0,
        fuelCostBreakdown: {
          totalFuelCost: 0,
          byTrafficLevel: { Low: 0, Medium: 0, High: 0 }
        },
        perOrderResults: []
      };

      // Assign orders to drivers using round-robin
      let driverIndex = 0;
      const driverWorkHours = new Map();
      
      // Initialize driver work hours
      drivers.forEach(driver => {
        driverWorkHours.set(driver._id.toString(), 0);
      });

      for (const order of orders) {
        const route = order.assignedRoute;
        let currentDriver = drivers[driverIndex];

        // Check if current driver has exceeded max hours
        while (driverWorkHours.get(currentDriver._id.toString()) >= maxHoursPerDriverPerDay) {
          driverIndex = (driverIndex + 1) % drivers.length;
          currentDriver = drivers[driverIndex];
          
          // If all drivers are at max capacity, break
          if (Array.from(driverWorkHours.values()).every(hours => hours >= maxHoursPerDriverPerDay)) {
            break;
          }
        }

        // Calculate delivery time with fatigue adjustment
        let baseDeliveryTime = route.baseTimeMinutes;
        
        // Apply driver fatigue rule (30% slower if worked > 8 hours yesterday)
        if (currentDriver.hasFatigue()) {
          baseDeliveryTime *= 1.3;
        }

        // Traffic level adjustments (optional enhancement)
        switch (route.trafficLevel) {
          case 'Medium':
            baseDeliveryTime *= 1.1;
            break;
          case 'High':
            baseDeliveryTime *= 1.2;
            break;
        }

        const deliveryTimeMinutes = Math.round(baseDeliveryTime);
        
        // Determine if delivery is late
        const isLate = deliveryTimeMinutes > (route.baseTimeMinutes + 10);
        
        // Calculate fuel cost
        const fuelCost = route.calculateFuelCost();
        
        // Calculate penalties and bonuses
        let penalties = 0;
        let bonus = 0;
        
        // Late delivery penalty: ₹50
        if (isLate) {
          penalties += 50;
          simulationResults.lateDeliveries++;
        } else {
          simulationResults.onTimeDeliveries++;
          
          // High-value bonus: 10% if order value > ₹1000 AND delivered on time
          if (order.isHighValue()) {
            bonus = order.value_rs * 0.1;
          }
        }

        // Calculate profit: order value + bonus - penalties - fuel cost
        const profit = order.value_rs + bonus - penalties - fuelCost;

        // Update totals
        simulationResults.totalProfit += profit;
        simulationResults.fuelCostBreakdown.totalFuelCost += fuelCost;
        simulationResults.fuelCostBreakdown.byTrafficLevel[route.trafficLevel] += fuelCost;

        // Add to per-order results
        simulationResults.perOrderResults.push({
          orderId: order.orderId,
          assignedDriverId: currentDriver._id.toString(),
          isLate,
          deliveryTimeMinutes,
          profit,
          penalties,
          bonus,
          fuelCost
        });

        // Update driver work hours
        const currentHours = driverWorkHours.get(currentDriver._id.toString());
        driverWorkHours.set(currentDriver._id.toString(), currentHours + (deliveryTimeMinutes / 60));

        // Assign driver to order
        order.assignedDriver = currentDriver._id;
        order.deliveryTimeMinutes = deliveryTimeMinutes;
        order.profit = profit;
        order.status = isLate ? 'late' : 'delivered';

        // Move to next driver
        driverIndex = (driverIndex + 1) % drivers.length;
      }

      // Calculate efficiency score
      simulationResults.efficiencyScore = simulationResults.totalOrders > 0 
        ? Math.round((simulationResults.onTimeDeliveries / simulationResults.totalOrders) * 100)
        : 0;

      // Round total profit to 2 decimal places
      simulationResults.totalProfit = Math.round(simulationResults.totalProfit * 100) / 100;

      // Save simulation result
      const simulationRecord = new SimulationResult({
        inputParameters: {
          availableDrivers,
          routeStartTime,
          maxHoursPerDriverPerDay
        },
        results: simulationResults
      });

      await simulationRecord.save();

      return {
        timestamp: simulationRecord.timestamp,
        ...simulationResults
      };

    } catch (error) {
      console.error('Simulation Service Error:', error);
      throw error;
    }
  }

  /**
   * Get simulation history
   */
  static async getSimulationHistory(limit = 10) {
    try {
      return await SimulationResult.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('timestamp inputParameters results.totalProfit results.efficiencyScore results.totalOrders results.onTimeDeliveries results.lateDeliveries results.fuelCostBreakdown results.perOrderResults');
    } catch (error) {
      console.error('Get Simulation History Error:', error);
      throw error;
    }
  }

  /**
   * Get specific simulation result
   */
  static async getSimulationById(id) {
    try {
      return await SimulationResult.findById(id);
    } catch (error) {
      console.error('Get Simulation By ID Error:', error);
      throw error;
    }
  }
}

module.exports = SimulationService;
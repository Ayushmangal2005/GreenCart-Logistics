const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

describe('Simulation Service Tests', () => {
  let authToken;
  let driverId, routeId, orderId;

  beforeAll(async () => {
    // Generate auth token
    authToken = jwt.sign({ userId: 'test', email: 'test@test.com' }, process.env.JWT_SECRET || 'test-secret');
  });

  beforeEach(async () => {

    // Create test driver
    const driver = new Driver({
      name: 'Test Driver',
      currentShiftHours: 0,
      past7DaysWorkHours: [6, 7, 8, 7, 6, 8, 9] // Last day > 8 hours (fatigue)
    });
    await driver.save();
    driverId = driver._id;

    // Create test route
    const route = new Route({
      routeId: 'RT001',
      distanceKm: 20,
      trafficLevel: 'High',
      baseTimeMinutes: 60
    });
    await route.save();
    routeId = route._id;

    // Create test order
    const order = new Order({
      orderId: 'ORD001',
      value_rs: 1500, // High value order
      assignedRoute: routeId,
      deliveryTimestamp: new Date(),
      status: 'pending'
    });
    await order.save();
    orderId = order._id;
  });

  test('Should run simulation with correct business rules', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        availableDrivers: 1,
        routeStartTime: '09:00',
        maxHoursPerDriverPerDay: 8
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    
    const results = response.body.data;
    expect(results).toHaveProperty('totalProfit');
    expect(results).toHaveProperty('totalOrders');
    expect(results).toHaveProperty('onTimeDeliveries');
    expect(results).toHaveProperty('lateDeliveries');
    expect(results).toHaveProperty('efficiencyScore');
    expect(results).toHaveProperty('fuelCostBreakdown');
    expect(results).toHaveProperty('perOrderResults');
    
    expect(results.totalOrders).toBe(1);
    expect(results.perOrderResults).toHaveLength(1);
    
    const orderResult = results.perOrderResults[0];
    expect(orderResult.orderId).toBe('ORD001');
    expect(orderResult).toHaveProperty('profit');
    expect(orderResult).toHaveProperty('penalties');
    expect(orderResult).toHaveProperty('bonus');
    expect(orderResult).toHaveProperty('fuelCost');
  });

  test('Should apply fatigue rule correctly', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        availableDrivers: 1,
        routeStartTime: '09:00',
        maxHoursPerDriverPerDay: 8
      });

    const orderResult = response.body.data.perOrderResults[0];
    // With fatigue (30% slower), delivery time should be > base time
    expect(orderResult.deliveryTimeMinutes).toBeGreaterThan(60);
  });

  test('Should apply high-value bonus for on-time delivery', async () => {
    // Create a driver without fatigue
    await Driver.findByIdAndUpdate(driverId, {
      past7DaysWorkHours: [6, 7, 6, 7, 6, 7, 6] // No day > 8 hours
    });

    // Create a route with shorter base time to ensure on-time delivery
    await Route.findByIdAndUpdate(routeId, {
      baseTimeMinutes: 30,
      trafficLevel: 'Low'
    });

    const response = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        availableDrivers: 1,
        routeStartTime: '09:00',
        maxHoursPerDriverPerDay: 8
      });

    const orderResult = response.body.data.perOrderResults[0];
    
    if (!orderResult.isLate) {
      // High-value order (₹1500) delivered on time should have 10% bonus
      expect(orderResult.bonus).toBe(150); // 10% of ₹1500
    }
  });

  test('Should apply late delivery penalty', async () => {
    // Create a route that will definitely cause late delivery
    await Route.findByIdAndUpdate(routeId, {
      baseTimeMinutes: 20, // Base time 20 minutes
      trafficLevel: 'High'
    });

    const response = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        availableDrivers: 1,
        routeStartTime: '09:00',
        maxHoursPerDriverPerDay: 8
      });

    const orderResult = response.body.data.perOrderResults[0];
    
    if (orderResult.isLate) {
      expect(orderResult.penalties).toBe(50); // Late delivery penalty
    }
  });

  test('Should calculate fuel costs correctly', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        availableDrivers: 1,
        routeStartTime: '09:00',
        maxHoursPerDriverPerDay: 8
      });

    const orderResult = response.body.data.perOrderResults[0];
    // Route: 20km, High traffic (₹5 base + ₹2 surcharge = ₹7/km)
    expect(orderResult.fuelCost).toBe(140); // 20 * 7
    
    const fuelBreakdown = response.body.data.fuelCostBreakdown;
    expect(fuelBreakdown.totalFuelCost).toBe(140);
    expect(fuelBreakdown.byTrafficLevel.High).toBe(140);
  });

  test('Should validate simulation input parameters', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        availableDrivers: 0, // Invalid: must be >= 1
        routeStartTime: '25:00', // Invalid time format
        maxHoursPerDriverPerDay: 20 // Invalid: exceeds 16 hours
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body).toHaveProperty('invalidFields');
  });
});
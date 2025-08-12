const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('CRUD Operations Tests', () => {
  let authToken;

  beforeAll(async () => {
    authToken = jwt.sign({ userId: 'test', email: 'test@test.com' }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('Drivers CRUD', () => {
    test('Should create a new driver', async () => {
      const response = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Driver',
          currentShiftHours: 0,
          past7DaysWorkHours: [8, 7, 6, 8, 7, 6, 8]
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Test Driver');
    });

    test('Should validate driver creation', async () => {
      const response = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Invalid: empty name
          currentShiftHours: -1 // Invalid: negative hours
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('invalidFields');
    });
  });

  describe('Routes CRUD', () => {
    test('Should create a new route', async () => {
      const response = await request(app)
        .post('/api/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routeId: 'RT999',
          distanceKm: 15.5,
          trafficLevel: 'Medium',
          baseTimeMinutes: 45,
          description: 'Test Route'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.routeId).toBe('RT999');
    });

    test('Should validate route creation', async () => {
      const response = await request(app)
        .post('/api/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routeId: 'INVALID', // Invalid format
          distanceKm: -5, // Invalid: negative distance
          trafficLevel: 'Invalid', // Invalid traffic level
          baseTimeMinutes: 0 // Invalid: too low
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Orders CRUD', () => {
    let routeId;

    beforeEach(async () => {
      // Create a route for order testing
      const routeResponse = await request(app)
        .post('/api/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routeId: 'RT888',
          distanceKm: 20,
          trafficLevel: 'Low',
          baseTimeMinutes: 60
        });
      routeId = routeResponse.body.data._id;
    });

    test('Should create a new order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: 'ORD999',
          value_rs: 1200,
          assignedRoute: routeId,
          deliveryTimestamp: new Date().toISOString(),
          customerAddress: 'Test Address',
          customerPhone: '9876543210'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.orderId).toBe('ORD999');
    });

    test('Should validate order creation', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: 'INVALID', // Invalid format
          value_rs: -100, // Invalid: negative value
          assignedRoute: 'invalid-route-id' // Invalid route
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});
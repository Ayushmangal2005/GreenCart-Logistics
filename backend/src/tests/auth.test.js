const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('Authentication Tests', () => {

  test('Should register a new manager', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'manager@test.com',
        password: 'password123',
        name: 'Test Manager'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.manager.email).toBe('manager@test.com');
  });

  test('Should login with valid credentials', async () => {
    // First register a manager
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login Test'
      });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@test.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
  });

  test('Should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Invalid email or password');
  });

  test('Should protect routes without token', async () => {
    const response = await request(app)
      .get('/api/drivers');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
  });
});
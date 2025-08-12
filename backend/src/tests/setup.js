require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set up test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

// Debug: Log environment variables
console.log('Test setup - JWT_SECRET:', process.env.JWT_SECRET);
console.log('Test setup - NODE_ENV:', process.env.NODE_ENV);

let mongod;

// Connect to the in-memory database before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('Connected to test MongoDB');
});

// Clear all data between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Disconnect and stop the in-memory database after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
  console.log('Disconnected from test MongoDB');
});

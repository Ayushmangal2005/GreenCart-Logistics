require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');

// Sample data
const driversData = [
  { name: 'Rajesh Kumar', currentShiftHours: 0, past7DaysWorkHours: [6, 8, 7, 9, 8, 6, 7] },
  { name: 'Amit Singh', currentShiftHours: 0, past7DaysWorkHours: [8, 9, 8, 7, 8, 9, 8] },
  { name: 'Suresh Patel', currentShiftHours: 0, past7DaysWorkHours: [7, 6, 8, 7, 6, 8, 7] },
  { name: 'Vikram Sharma', currentShiftHours: 0, past7DaysWorkHours: [9, 8, 9, 8, 7, 8, 9] },
  { name: 'Manoj Gupta', currentShiftHours: 0, past7DaysWorkHours: [6, 7, 6, 8, 7, 6, 8] },
  { name: 'Ravi Yadav', currentShiftHours: 0, past7DaysWorkHours: [8, 7, 9, 8, 7, 9, 8] },
  { name: 'Deepak Joshi', currentShiftHours: 0, past7DaysWorkHours: [7, 8, 7, 6, 8, 7, 6] },
  { name: 'Ankit Verma', currentShiftHours: 0, past7DaysWorkHours: [9, 9, 8, 9, 8, 7, 9] },
  { name: 'Pradeep Jain', currentShiftHours: 0, past7DaysWorkHours: [6, 8, 7, 7, 6, 8, 7] },
  { name: 'Rohit Agarwal', currentShiftHours: 0, past7DaysWorkHours: [8, 7, 8, 9, 7, 8, 8] }
];

const routesData = [
  { routeId: 'RT001', distanceKm: 15.5, trafficLevel: 'Low', baseTimeMinutes: 45, description: 'Downtown to Mall Road' },
  { routeId: 'RT002', distanceKm: 22.3, trafficLevel: 'Medium', baseTimeMinutes: 65, description: 'City Center to Airport' },
  { routeId: 'RT003', distanceKm: 8.7, trafficLevel: 'High', baseTimeMinutes: 35, description: 'Business District Loop' },
  { routeId: 'RT004', distanceKm: 31.2, trafficLevel: 'Low', baseTimeMinutes: 85, description: 'Suburbs to Industrial Area' },
  { routeId: 'RT005', distanceKm: 18.9, trafficLevel: 'Medium', baseTimeMinutes: 55, description: 'University to Tech Park' },
  { routeId: 'RT006', distanceKm: 12.4, trafficLevel: 'High', baseTimeMinutes: 40, description: 'Hospital Circuit' },
  { routeId: 'RT007', distanceKm: 25.8, trafficLevel: 'Low', baseTimeMinutes: 70, description: 'Outer Ring Road' },
  { routeId: 'RT008', distanceKm: 14.6, trafficLevel: 'Medium', baseTimeMinutes: 50, description: 'Shopping District Round' }
];

// Function to generate random orders
const generateOrdersData = (routes) => {
  const orders = [];
  const now = new Date();
  
  for (let i = 1; i <= 50; i++) {
    const orderNumber = i.toString().padStart(3, '0');
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    
    // Generate delivery timestamp within next 3 days
    const deliveryDate = new Date(now.getTime() + (Math.random() * 3 * 24 * 60 * 60 * 1000));
    
    // Generate order value with some high-value orders
    let orderValue;
    if (Math.random() < 0.3) { // 30% chance of high-value order
      orderValue = Math.round((Math.random() * 4000 + 1000) * 100) / 100; // ₹1000-5000
    } else {
      orderValue = Math.round((Math.random() * 800 + 200) * 100) / 100; // ₹200-1000
    }
    
    orders.push({
      orderId: `ORD${orderNumber}`,
      value_rs: orderValue,
      assignedRoute: randomRoute._id,
      deliveryTimestamp: deliveryDate,
      status: 'pending',
      customerAddress: `Address ${i}, City District`,
      customerPhone: `98765${i.toString().padStart(5, '0')}`
    });
  }
  
  return orders;
};

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Driver.deleteMany({});
    await Route.deleteMany({});
    await Order.deleteMany({});

    // Seed drivers
    console.log('👥 Seeding drivers...');
    const drivers = await Driver.insertMany(driversData);
    console.log(`✅ Created ${drivers.length} drivers`);

    // Seed routes
    console.log('🛣️ Seeding routes...');
    const routes = await Route.insertMany(routesData);
    console.log(`✅ Created ${routes.length} routes`);

    // Generate and seed orders
    console.log('📦 Seeding orders...');
    const ordersData = generateOrdersData(routes);
    const orders = await Order.insertMany(ordersData);
    console.log(`✅ Created ${orders.length} orders`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Orders: ${orders.length}`);
    
    // Display some sample data
    console.log('\n🔍 Sample Data:');
    console.log('First Driver:', drivers[0].name);
    console.log('First Route:', routes[0].routeId, '-', routes[0].description);
    console.log('First Order:', orders[0].orderId, '- ₹' + orders[0].value_rs);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
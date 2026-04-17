const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Route = require('./models/Route');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transport_pass_system';

// Seed data
const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Route.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@transport.com',
      password: adminPassword,
      phone: '9876543210',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    });
    await admin.save();
    console.log('Created admin user');

    // Create test users
    const testUserPassword = await bcrypt.hash('password123', 10);
    
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: testUserPassword,
        phone: '9876543211',
        role: 'user',
        address: {
          street: '456 User Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: testUserPassword,
        phone: '9876543212',
        role: 'user',
        address: {
          street: '789 User Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001'
        }
      },
      {
        name: 'Robert Johnson',
        email: 'robert@example.com',
        password: testUserPassword,
        phone: '9876543213',
        role: 'user',
        address: {
          street: '321 User Road',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001'
        }
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
    }
    console.log('Created test users');

    // Create Tamil Nadu-only route network
    const tnCities = [
      { name: 'chennai', lat: 13.0827, lng: 80.2707, hub: 'metro' },
      { name: 'coimbatore', lat: 11.0168, lng: 76.9558, hub: 'city' },
      { name: 'madurai', lat: 9.9252, lng: 78.1198, hub: 'city' },
      { name: 'trichy', lat: 10.7905, lng: 78.7047, hub: 'city' },
      { name: 'salem', lat: 11.6643, lng: 78.146, hub: 'city' },
      { name: 'erode', lat: 11.341, lng: 77.7172, hub: 'city' },
      { name: 'tirunelveli', lat: 8.7139, lng: 77.7567, hub: 'city' },
      { name: 'thanjavur', lat: 10.7867, lng: 79.1378, hub: 'town' },
      { name: 'vellore', lat: 12.9165, lng: 79.1325, hub: 'city' },
      { name: 'tiruppur', lat: 11.1085, lng: 77.3411, hub: 'city' },
      { name: 'dindigul', lat: 10.3673, lng: 77.9803, hub: 'town' },
      { name: 'theni', lat: 10.0104, lng: 77.4777, hub: 'town' },
      { name: 'villupuram', lat: 11.9391, lng: 79.4861, hub: 'town' },
      { name: 'kanchipuram', lat: 12.8342, lng: 79.7036, hub: 'town' },
      { name: 'nagercoil', lat: 8.1833, lng: 77.4119, hub: 'city' },
      { name: 'kumbakonam', lat: 10.9629, lng: 79.3918, hub: 'town' }
    ];

    const calculateDistance = (from, to) => {
      const latDiff = from.lat - to.lat;
      const lngDiff = from.lng - to.lng;
      return Math.max(25, Math.round(Math.sqrt((latDiff * latDiff) + (lngDiff * lngDiff)) * 105));
    };

    const calculateBasePrice = (distance) => {
      return Math.max(80, Math.round(distance * 0.85));
    };

    const calculateStops = (source, destination) => {
      const middleStops = [];

      if ((source === 'chennai' && destination === 'coimbatore') || (source === 'coimbatore' && destination === 'chennai')) {
        middleStops.push('vellore', 'salem', 'erode');
      } else if ((source === 'chennai' && destination === 'madurai') || (source === 'madurai' && destination === 'chennai')) {
        middleStops.push('villupuram', 'trichy', 'dindigul');
      } else if ((source === 'trichy' && destination === 'coimbatore') || (source === 'coimbatore' && destination === 'trichy')) {
        middleStops.push('karur', 'tiruppur');
      } else if ((source === 'madurai' && destination === 'tirunelveli') || (source === 'tirunelveli' && destination === 'madurai')) {
        middleStops.push('virudhunagar', 'kovilpatti');
      } else if ((source === 'thanjavur' && destination === 'trichy') || (source === 'trichy' && destination === 'thanjavur')) {
        middleStops.push('vallam');
      } else if ((source === 'chennai' && destination === 'vellore') || (source === 'vellore' && destination === 'chennai')) {
        middleStops.push('kanchipuram');
      } else if ((source === 'coimbatore' && destination === 'tiruppur') || (source === 'tiruppur' && destination === 'coimbatore')) {
        middleStops.push('ganapathy');
      } else if ((source === 'madurai' && destination === 'theni') || (source === 'theni' && destination === 'madurai')) {
        middleStops.push('usilampatti');
      } else if ((source === 'salem' && destination === 'erode') || (source === 'erode' && destination === 'salem')) {
        middleStops.push('sankagiri');
      } else if ((source === 'chennai' && destination === 'nagercoil') || (source === 'nagercoil' && destination === 'chennai')) {
        middleStops.push('villupuram', 'trichy', 'madurai', 'tirunelveli');
      }

      return middleStops.map((name, index) => ({ name, order: index + 1 }));
    };

    const routes = [];

    for (const sourceCity of tnCities) {
      for (const destinationCity of tnCities) {
        if (sourceCity.name === destinationCity.name) {
          continue;
        }

        const distance = calculateDistance(sourceCity, destinationCity);
        const routeType = distance > 260 ? 'train' : 'bus';

        routes.push({
          state: 'Tamil Nadu',
          source: sourceCity.name,
          destination: destinationCity.name,
          basePrice: calculateBasePrice(distance),
          distance,
          estimatedTime: `${Math.max(1, Math.round(distance / 55))} hours`,
          routeType,
          stops: calculateStops(sourceCity.name, destinationCity.name)
        });
      }
    }

    for (const routeData of routes) {
      const route = new Route(routeData);
      await route.save();
    }
    console.log('Created routes');

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nAdmin Login:');
    console.log('Email: admin@transport.com');
    console.log('Password: admin123');
    console.log('\nTest Users:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    console.log('\nEmail: jane@example.com');
    console.log('Password: password123');
    console.log('\nEmail: robert@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run seed function
seedData();

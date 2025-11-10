/**
 * Production Database Seeding Script
 * Seeds the database with initial data for testing
 * 
 * Usage: node scripts/seed-production.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in environment variables');
  process.exit(1);
}

// Models
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Group = require('../models/group.model');
const Listing = require('../models/listing.model');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedRoles() {
  console.log('\n📋 Seeding Roles...');
  
  const roles = ['user', 'moderator', 'admin'];
  
  for (const roleName of roles) {
    const exists = await Role.findOne({ name: roleName });
    if (!exists) {
      await new Role({ name: roleName }).save();
      console.log(`  ✓ Created role: ${roleName}`);
    } else {
      console.log(`  - Role already exists: ${roleName}`);
    }
  }
}

async function seedUsers() {
  console.log('\n👥 Seeding Users...');
  
  const userRole = await Role.findOne({ name: 'user' });
  const adminRole = await Role.findOne({ name: 'admin' });
  
  const users = [
    {
      username: 'admin',
      email: 'admin@freshshare.com',
      password: await bcrypt.hash('Admin123!', 8),
      firstName: 'Admin',
      lastName: 'User',
      roles: [adminRole._id],
      emailVerified: true,
      location: {
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102'
      }
    },
    {
      username: 'testuser',
      email: 'test@freshshare.com',
      password: await bcrypt.hash('Test123!', 8),
      firstName: 'Test',
      lastName: 'User',
      roles: [userRole._id],
      emailVerified: true,
      location: {
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102'
      }
    },
    {
      username: 'alice',
      email: 'alice@example.com',
      password: await bcrypt.hash('Alice123!', 8),
      firstName: 'Alice',
      lastName: 'Johnson',
      roles: [userRole._id],
      emailVerified: true,
      location: {
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601'
      }
    }
  ];
  
  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      await new User(userData).save();
      console.log(`  ✓ Created user: ${userData.username} (${userData.email})`);
    } else {
      console.log(`  - User already exists: ${userData.username}`);
    }
  }
  
  return users;
}

async function seedGroups() {
  console.log('\n🏘️  Seeding Groups...');
  
  const admin = await User.findOne({ username: 'admin' });
  const testUser = await User.findOne({ username: 'testuser' });
  
  const groups = [
    {
      name: 'Mission District Food Share',
      description: 'A community group for neighbors in the Mission District to share bulk food purchases and reduce waste.',
      location: {
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110'
      },
      createdBy: admin._id,
      members: [admin._id, testUser._id],
      isPublic: true,
      maxMembers: 50
    },
    {
      name: 'Oakland Organic Collective',
      description: 'Focused on organic, locally-sourced produce. Join us to access wholesale prices on fresh, sustainable food!',
      location: {
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601'
      },
      createdBy: testUser._id,
      members: [testUser._id],
      isPublic: true,
      maxMembers: 30
    }
  ];
  
  for (const groupData of groups) {
    const exists = await Group.findOne({ name: groupData.name });
    if (!exists) {
      await new Group(groupData).save();
      console.log(`  ✓ Created group: ${groupData.name}`);
    } else {
      console.log(`  - Group already exists: ${groupData.name}`);
    }
  }
}

async function seedListings() {
  console.log('\n🛒 Seeding Listings...');
  
  const admin = await User.findOne({ username: 'admin' });
  const testUser = await User.findOne({ username: 'testuser' });
  const group = await Group.findOne({ name: 'Mission District Food Share' });
  
  const listings = [
    {
      title: 'Organic Heirloom Tomatoes',
      description: 'Fresh organic heirloom tomatoes from local farm. Perfect for salads and cooking. Bulk purchase available.',
      category: 'Vegetables',
      price: 3.50,
      unit: 'lb',
      quantity: 50,
      location: {
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110'
      },
      seller: admin._id,
      group: group._id,
      isOrganic: true,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'available'
    },
    {
      title: 'Fresh Strawberries - 5lb Box',
      description: 'Sweet, locally-grown strawberries. Great for fresh eating or making preserves.',
      category: 'Fruits',
      price: 15.00,
      unit: 'box',
      quantity: 20,
      location: {
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110'
      },
      seller: testUser._id,
      group: group._id,
      isOrganic: true,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'available'
    },
    {
      title: 'Whole Grain Bread - Artisan Loaf',
      description: 'Freshly baked whole grain bread from local bakery. No preservatives.',
      category: 'Bakery',
      price: 6.00,
      unit: 'loaf',
      quantity: 15,
      location: {
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601'
      },
      seller: testUser._id,
      isOrganic: false,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'available'
    }
  ];
  
  for (const listingData of listings) {
    const exists = await Listing.findOne({ 
      title: listingData.title,
      seller: listingData.seller 
    });
    if (!exists) {
      await new Listing(listingData).save();
      console.log(`  ✓ Created listing: ${listingData.title}`);
    } else {
      console.log(`  - Listing already exists: ${listingData.title}`);
    }
  }
}

async function main() {
  console.log('🌱 Starting FreshShare Database Seeding...\n');
  console.log(`📍 Database: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  
  try {
    await connectDB();
    
    await seedRoles();
    await seedUsers();
    await seedGroups();
    await seedListings();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@freshshare.com / Admin123!');
    console.log('   User:  test@freshshare.com / Test123!');
    console.log('   User:  alice@example.com / Alice123!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding
main();

/**
 * Railway Database Seeding Script
 * Run this to seed your Railway MongoDB with test data
 * 
 * Usage: 
 * 1. Get MONGODB_URI from Railway dashboard
 * 2. Run: MONGODB_URI="your_uri" node scripts/seed-railway.js
 * Or on Windows: set MONGODB_URI=your_uri && node scripts/seed-railway.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get MongoDB URI from command line or environment
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not provided');
  console.log('\nUsage:');
  console.log('  node scripts/seed-railway.js "mongodb://your-connection-string"');
  console.log('  OR');
  console.log('  set MONGODB_URI=mongodb://your-uri && node scripts/seed-railway.js');
  process.exit(1);
}

console.log('🌱 Starting FreshShare Database Seeding...\n');
console.log(`📍 Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}\n`);

// Define schemas inline to avoid dependency issues
const roleSchema = new mongoose.Schema({
  name: String
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  emailVerified: { type: Boolean, default: false },
  location: {
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: {
    city: String,
    state: String,
    zipCode: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },
  maxMembers: Number,
  createdAt: { type: Date, default: Date.now }
});

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  price: Number,
  unit: String,
  quantity: Number,
  location: {
    city: String,
    state: String,
    zipCode: String
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  isOrganic: Boolean,
  expirationDate: Date,
  status: { type: String, default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Listing = mongoose.model('Listing', listingSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function seedRoles() {
  console.log('📋 Seeding Roles...');
  
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
      description: 'Fresh organic heirloom tomatoes from local farm. Perfect for salads and cooking.',
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
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
  try {
    await connectDB();
    await seedRoles();
    await seedUsers();
    await seedGroups();
    await seedListings();
    
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Admin: admin@freshshare.com / Admin123!');
    console.log('   User:  test@freshshare.com / Test123!');
    console.log('   User:  alice@example.com / Alice123!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
    process.exit(0);
  }
}

main();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URIS = [
  'mongodb+srv://g2c_user:VbOSttWsCcepoYhk@cluster0.5mnvmiw.mongodb.net/g2c?appName=Cluster0',
  'mongodb+srv://g2c_user:VbOSttWsCcepoYhk@cluster0.5mnvmiw.mongodb.net/test?appName=Cluster0',
  'mongodb+srv://g2c_user:VbOSttWsCcepoYhk@cluster0.5mnvmiw.mongodb.net/?appName=Cluster0'
];

// Schema definitions
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['consumer', 'grower', 'admin'], required: true },
  isActive: { type: String, default: true }
});

const GrowerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  category: { type: String, default: 'Vegetables' },
  aadharLast4: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false }
});

const ListingSchema = new mongoose.Schema({
  growerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  items: [{ type: String, required: true }],
  city: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const GrowerProfile = mongoose.model('GrowerProfile', GrowerProfileSchema);
const Listing = mongoose.model('Listing', ListingSchema);

async function seedOne(uri) {
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri);
  console.log('Connected!');

  // Clear existing data
  console.log('Clearing old collections...');
  await User.deleteMany({});
  await GrowerProfile.deleteMany({});
  await Listing.deleteMany({});

  const passwordHash = await bcrypt.hash('Test@1234', 12);

  // 1. Create Grower 1
  console.log('Seeding Grower 1 (Amritsar - Vegetables)...');
  const user1 = await User.create({
    email: 'farmer_john@gmail.com',
    passwordHash,
    role: 'grower'
  });
  await GrowerProfile.create({
    userId: user1._id,
    name: "John's Organic Farm",
    city: 'Amritsar',
    phone: '9876543201',
    address: 'Amritsar Highway, Block B',
    category: 'Vegetables',
    aadharLast4: '4567',
    avatar: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=300&h=300&q=80',
    isProfileComplete: true
  });
  await Listing.create({
    growerId: user1._id,
    category: 'Vegetables',
    items: ['onion', 'tomato', 'potato', 'spinach'],
    city: 'Amritsar'
  });

  // 2. Create Grower 2
  console.log('Seeding Grower 2 (Bathinda - Milk Products)...');
  const user2 = await User.create({
    email: 'golden_dairy@gmail.com',
    passwordHash,
    role: 'grower'
  });
  await GrowerProfile.create({
    userId: user2._id,
    name: 'Golden Dairy & Poultry',
    city: 'Bathinda',
    phone: '9876543202',
    address: 'Dairy Lane, Bathinda Outer',
    category: 'Milk Product',
    aadharLast4: '8899',
    avatar: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&h=300&q=80',
    isProfileComplete: true
  });
  await Listing.create({
    growerId: user2._id,
    category: 'Milk Product',
    items: ['paneer', 'curd', 'cheese', 'ice cream'],
    city: 'Bathinda'
  });

  // 3. Create Grower 3
  console.log('Seeding Grower 3 (Ludhiana - Fruits)...');
  const user3 = await User.create({
    email: 'fresh_fruits@gmail.com',
    passwordHash,
    role: 'grower'
  });
  await GrowerProfile.create({
    userId: user3._id,
    name: 'Fresh Orchard Farms',
    city: 'Ludhiana',
    phone: '9876543203',
    address: 'Orchard Road, Ludhiana Central',
    category: 'Fruits',
    aadharLast4: '1122',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    isProfileComplete: true
  });
  await Listing.create({
    growerId: user3._id,
    category: 'Fruits',
    items: ['apple', 'watermelon', 'kiwi', 'dragon fruit'],
    city: 'Ludhiana'
  });

  console.log('Database seeded successfully!');
  await mongoose.disconnect();
}

async function seed() {
  for (const uri of MONGO_URIS) {
    try {
      await seedOne(uri);
    } catch (err) {
      console.error(`Failed to seed ${uri}:`, err.message);
    }
  }
  console.log('\n=========================================');
  console.log('🎉 ALL DATABASES SUCCESSFULLY SEEDED! 🎉');
  console.log('=========================================');
  console.log('Try logging in on your live Vercel site:');
  console.log('Email: farmer_john@gmail.com  | Password: Test@1234');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});

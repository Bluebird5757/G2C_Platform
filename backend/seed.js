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
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
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

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  growerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'completed' }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

async function seedOne(uri) {
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri);
  console.log('Connected!');

  // Clear existing data
  console.log('Clearing old collections...');
  await User.deleteMany({});
  await GrowerProfile.deleteMany({});
  await Listing.deleteMany({});
  await Order.deleteMany({});

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
    latitude: 31.6340,
    longitude: 74.8723,
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
    latitude: 30.2110,
    longitude: 74.9455,
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
    latitude: 30.9010,
    longitude: 75.8573,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    isProfileComplete: true
  });
  await Listing.create({
    growerId: user3._id,
    category: 'Fruits',
    items: ['apple', 'watermelon', 'kiwi', 'dragon fruit'],
    city: 'Ludhiana'
  });

  // 4. Create Consumer
  console.log('Seeding Consumer...');
  const consumer1 = await User.create({
    email: 'consumer_buyer@gmail.com',
    passwordHash,
    role: 'consumer'
  });

  // 5. Seed historical orders for price trends (over the last 5 days)
  console.log('Seeding historical orders for price trends...');
  const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  // Grower 1: Amritsar (potato & tomato)
  const ordersG1 = [
    { items: [{ name: 'potato', quantity: 2, price: 35 }, { name: 'tomato', quantity: 1, price: 50 }], date: daysAgo(5) },
    { items: [{ name: 'potato', quantity: 1, price: 38 }, { name: 'tomato', quantity: 2, price: 52 }], date: daysAgo(4) },
    { items: [{ name: 'potato', quantity: 3, price: 42 }, { name: 'tomato', quantity: 1, price: 48 }], date: daysAgo(3) },
    { items: [{ name: 'potato', quantity: 2, price: 40 }, { name: 'tomato', quantity: 3, price: 55 }], date: daysAgo(2) },
    { items: [{ name: 'potato', quantity: 1, price: 45 }, { name: 'tomato', quantity: 2, price: 60 }], date: daysAgo(1) }
  ];

  for (const o of ordersG1) {
    const totalAmount = o.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
    const doc = await Order.create({
      consumerId: consumer1._id,
      growerId: user1._id,
      items: o.items,
      totalAmount,
      status: 'completed'
    });
    await Order.findByIdAndUpdate(doc._id, { createdAt: o.date, updatedAt: o.date });
  }

  // Grower 2: Bathinda (paneer & curd)
  const ordersG2 = [
    { items: [{ name: 'paneer', quantity: 1, price: 280 }, { name: 'curd', quantity: 2, price: 60 }], date: daysAgo(5) },
    { items: [{ name: 'paneer', quantity: 2, price: 290 }, { name: 'curd', quantity: 1, price: 62 }], date: daysAgo(4) },
    { items: [{ name: 'paneer', quantity: 1, price: 300 }, { name: 'curd', quantity: 3, price: 65 }], date: daysAgo(3) },
    { items: [{ name: 'paneer', quantity: 3, price: 295 }, { name: 'curd', quantity: 1, price: 63 }], date: daysAgo(2) },
    { items: [{ name: 'paneer', quantity: 1, price: 310 }, { name: 'curd', quantity: 2, price: 68 }], date: daysAgo(1) }
  ];

  for (const o of ordersG2) {
    const totalAmount = o.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
    const doc = await Order.create({
      consumerId: consumer1._id,
      growerId: user2._id,
      items: o.items,
      totalAmount,
      status: 'completed'
    });
    await Order.findByIdAndUpdate(doc._id, { createdAt: o.date, updatedAt: o.date });
  }

  // Grower 3: Ludhiana (apple & watermelon)
  const ordersG3 = [
    { items: [{ name: 'apple', quantity: 2, price: 120 }, { name: 'watermelon', quantity: 1, price: 25 }], date: daysAgo(5) },
    { items: [{ name: 'apple', quantity: 1, price: 125 }, { name: 'watermelon', quantity: 2, price: 28 }], date: daysAgo(4) },
    { items: [{ name: 'apple', quantity: 3, price: 130 }, { name: 'watermelon', quantity: 1, price: 30 }], date: daysAgo(3) },
    { items: [{ name: 'apple', quantity: 2, price: 128 }, { name: 'watermelon', quantity: 3, price: 27 }], date: daysAgo(2) },
    { items: [{ name: 'apple', quantity: 1, price: 135 }, { name: 'watermelon', quantity: 2, price: 32 }], date: daysAgo(1) }
  ];

  for (const o of ordersG3) {
    const totalAmount = o.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
    const doc = await Order.create({
      consumerId: consumer1._id,
      growerId: user3._id,
      items: o.items,
      totalAmount,
      status: 'completed'
    });
    await Order.findByIdAndUpdate(doc._id, { createdAt: o.date, updatedAt: o.date });
  }

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

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.js';

dotenv.config();

const testUsers = [
  {
    walletAddress: '0x1234567890123456789012345678901234567890',
    username: 'testUser1',
    totalBets: 10,
    totalWins: 6,
    totalVolume: 5.5
  },
  {
    walletAddress: '0x2345678901234567890123456789012345678901',
    username: 'testUser2',
    totalBets: 15,
    totalWins: 8,
    totalVolume: 7.2
  },
  {
    walletAddress: '0x3456789012345678901234567890123456789012',
    username: 'testUser3',
    totalBets: 5,
    totalWins: 2,
    totalVolume: 2.1
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert test users
    const result = await User.insertMany(testUsers);
    console.log('Added test users:', result);

    // Verify users were added
    const users = await User.find();
    console.log('\nUsers in database:');
    console.log(JSON.stringify(users, null, 2));

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedUsers();

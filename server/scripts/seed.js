import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createSeedUsers, removeSeedUsers } from '../config/seedUsers.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main seeding function
const runSeed = async () => {
  try {
    await connectDB();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'create':
        await createSeedUsers();
        break;
      case 'remove':
        await removeSeedUsers();
        break;
      case 'reset':
        await removeSeedUsers();
        await createSeedUsers();
        break;
      default:
        console.log('📖 Usage:');
        console.log('  npm run seed create  - Create seed users');
        console.log('  npm run seed remove  - Remove seed users');
        console.log('  npm run seed reset   - Remove and recreate seed users');
        break;
    }
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

runSeed();
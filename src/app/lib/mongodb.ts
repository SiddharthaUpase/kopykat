import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

async function connectDB() {
  try {
    const opts = {
      bufferCommands: false,
    };

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, opts);
      console.log('Connected to MongoDB');
      //print the database name
      console.log('Database name:', mongoose.connection.db?.databaseName);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB; 
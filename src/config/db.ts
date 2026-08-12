import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MONGODB_URI = 'mongodb+srv://offydhiva27_db_user:dhiva27_02dt@marketmindai.yobenav.mongodb.net/marketmindai?retryWrites=true&w=majority';

export const connectDB = async () => {
  let uri = (process.env.MONGODB_URI || '').trim();

  // If env var is missing or invalid, fall back to default URI
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.warn('⚠️ Invalid or missing MONGODB_URI env var. Using fallback connection string.');
    uri = DEFAULT_MONGODB_URI;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

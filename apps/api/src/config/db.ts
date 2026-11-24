import mongoose from 'mongoose';

export async function connectDB(uri?: string): Promise<void> {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teamproof';
  try {
    await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    throw error;
  }
}

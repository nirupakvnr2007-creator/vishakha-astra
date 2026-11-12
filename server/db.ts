import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Vishakha_ASTRA DB] MONGODB_URI not set. Running in local in-memory fallback store.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Vishakha_ASTRA DB] Successfully connected to MongoDB Atlas Cluster 0: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error('[Vishakha_ASTRA DB] MongoDB Atlas connection error:', error.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

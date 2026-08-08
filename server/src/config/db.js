import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Establishes the MongoDB connection.
 * Not called at startup yet — reserved for a later step.
 */
export async function connectDB() {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI);

  return mongoose.connection;
}

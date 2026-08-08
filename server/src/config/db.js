import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

function sanitizeMongoError(error) {
  const raw = error?.message || String(error);
  return raw.replace(/mongodb(\+srv)?:\/\/[^\s)]+/gi, 'mongodb://[REDACTED]');
}

function isSrvDnsFailure(error) {
  return error?.code === 'ECONNREFUSED' && /querySrv/i.test(error?.message || '');
}

async function connectWithUri() {
  await mongoose.connect(env.MONGODB_URI);
}

/**
 * Connects to MongoDB using the validated MONGODB_URI.
 * Does not log credentials or the connection string.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    try {
      await connectWithUri();
    } catch (error) {
      // Some local DNS resolvers refuse Node SRV lookups for mongodb+srv://.
      if (!isSrvDnsFailure(error)) {
        throw error;
      }

      console.warn(
        'MongoDB SRV DNS lookup failed via the system resolver; retrying with public DNS resolvers...',
      );
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      await connectWithUri();
    }

    const { readyState, name, host } = mongoose.connection;
    console.log(
      `MongoDB connected (readyState=${readyState}, db=${name || 'n/a'}, host=${host || 'n/a'})`,
    );

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', sanitizeMongoError(error));
    throw error;
  }
}

/**
 * Closes the MongoDB connection during graceful shutdown.
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

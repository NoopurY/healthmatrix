import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

if (MONGODB_URI.includes('<db_password>')) {
  throw new Error(
    'Incomplete MONGODB_URI: You MUST replace <db_password> with your actual password in .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    
    // Log the connection attempt for diagnostics
    console.log(`[Database] Attempting connection. URI present: ${!!MONGODB_URI}`);
    if (!process.env.MONGODB_URI) {
      console.warn('[Database] MONGODB_URI not found in environment. Falling back to localhost.');
    } else if (MONGODB_URI.includes('<db_password>')) {
      console.error('[Database] ERROR: You must replace <db_password> in your .env.local with your actual MongoDB password.');
      throw new Error('Incomplete MongoDB connection string: <db_password> placeholder detected.');
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('[Database] Connection established successfully.');
        return m;
      })
      .catch((err) => {
        console.error('[Database] Connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;

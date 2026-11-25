import mongoose from 'mongoose';

/**
 * Masks username and password from a MongoDB URI for safe logging.
 */
function maskMongoUri(uri) {
  try {
    return uri.replace(/\/\/(.*?)@/, (_, userPass) => {
      const parts = userPass.split(':');
      const user = parts[0] || '***';
      return `//${user}:*****@`;
    });
  } catch {
    return 'mongodb+srv://[masked]';
  }
}

let isConnecting = false;

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    const errorMsg = '[MongoDB] MONGODB_URI environment variable is not defined.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isConnecting) {
    // Wait for in-flight connection
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose;
  }

  isConnecting = true;
  const masked = maskMongoUri(mongoUri);

  try {
    console.log(`[MongoDB] Connecting to cluster: ${masked}...`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.name || 'default'}`);
    isConnecting = false;
    return mongoose;
  } catch (error) {
    const localFallbackUri = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/teamproof';
    if (mongoUri !== localFallbackUri) {
      console.warn(`[MongoDB] Primary connection failed to ${masked} (${error.message}). Attempting automatic fallback to local MongoDB (${localFallbackUri})...`);
      try {
        await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 3000,
          socketTimeoutMS: 45000,
        });
        console.log(`[MongoDB] Successfully connected to fallback local database: ${mongoose.connection.name || 'default'}`);
        isConnecting = false;
        return mongoose;
      } catch (localErr) {
        console.error(`[MongoDB] Local MongoDB fallback connection also failed: ${localErr.message}`);
      }
    }

    isConnecting = false;
    console.error(`[MongoDB] Connection failed to ${masked}. Reason:`, error?.message || error);
    throw error;
  }
}

// Global connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection interrupted or lost.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime database connection error:', err?.message || err);
});

// Graceful shutdown handling
export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    console.log('[MongoDB] Closing database connection gracefully...');
    await mongoose.disconnect();
    console.log('[MongoDB] Connection closed.');
  }
}

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

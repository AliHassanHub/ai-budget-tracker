import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app from './app.js';

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`Server listening on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        try {
          await disconnectDB();
          process.exit(0);
        } catch (error) {
          console.error('Error while closing MongoDB connection:', error.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });
    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  } catch {
    console.error('Server startup aborted because MongoDB is unavailable.');
    process.exit(1);
  }
}

void startServer();


import mongoose from 'mongoose';
import { logger } from './logger';

// Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-service';

// Function to establish MongoDB connection
export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

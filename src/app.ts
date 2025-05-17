
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import notificationRoutes from './routes/notification-routes';
import { connectToDatabase } from './config/database';
import { startEmailWorker } from './workers/email-worker';
import { startSmsWorker } from './workers/sms-worker';
import { startInAppWorker } from './workers/in-app-worker';
import { logger } from './config/logger';

// Create Express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Request logging
app.use(morgan('dev', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// API routes
app.use('/api/notifications', notificationRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Swagger documentation
app.get('/api-docs', (req, res) => {
  res.redirect('https://swagger-url-here'); // Replace with actual Swagger URL
});

// 404 handler
app.use(notFoundHandler);

// Error handler middleware
app.use(errorHandler);

// Function to start the server
export async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Start worker processes
    startEmailWorker();
    startSmsWorker();
    startInAppWorker();
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export the app for testing
export default app;

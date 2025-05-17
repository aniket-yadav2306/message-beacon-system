
import { inAppQueue } from '../config/queue';
import { getNotificationById, markNotificationAsDelivered, markNotificationAsFailed } from '../services/notification-service';
import { logger } from '../config/logger';

// Process in-app notifications
export function startInAppWorker() {
  inAppQueue.process(async (job) => {
    const { notificationId } = job.data;
    logger.info(`Processing in-app notification: ${notificationId}`);
    
    try {
      // Get notification details
      const notification = await getNotificationById(notificationId);
      
      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }
      
      // For in-app notifications, we only need to mark them as delivered
      // since they're already stored in the database
      await markNotificationAsDelivered(notificationId);
      logger.info(`In-app notification ${notificationId} processed successfully`);
      
      return { success: true };
    } catch (error) {
      logger.error(`Failed to process in-app notification ${notificationId}:`, error);
      
      // Mark notification as failed and set retry count
      await markNotificationAsFailed(notificationId, error, job.attemptsMade);
      
      // Rethrow error for Bull to handle retry logic
      throw error;
    }
  });
  
  logger.info('In-app worker started');
}

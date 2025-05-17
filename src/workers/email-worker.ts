
import { emailQueue } from '../config/queue';
import { getNotificationById, markNotificationAsDelivered, markNotificationAsFailed } from '../services/notification-service';
import { sendEmail } from '../services/email-service';
import { logger } from '../config/logger';
import User from '../models/User';

// Process email notifications
export function startEmailWorker() {
  emailQueue.process(async (job) => {
    const { notificationId } = job.data;
    logger.info(`Processing email notification: ${notificationId}`);
    
    try {
      // Get notification details
      const notification = await getNotificationById(notificationId);
      
      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }
      
      // Get user details to find email address
      const user = await User.findById(notification.userId);
      
      if (!user) {
        throw new Error(`User ${notification.userId} not found`);
      }
      
      // Send the email
      await sendEmail(
        user.email, 
        notification.metadata?.subject || 'New Notification', 
        notification.message
      );
      
      // Mark notification as delivered
      await markNotificationAsDelivered(notificationId);
      logger.info(`Email notification ${notificationId} delivered successfully`);
      
      return { success: true };
    } catch (error) {
      logger.error(`Failed to process email notification ${notificationId}:`, error);
      
      // Mark notification as failed and set retry count
      await markNotificationAsFailed(notificationId, error, job.attemptsMade);
      
      // Rethrow error for Bull to handle retry logic
      throw error;
    }
  });
  
  logger.info('Email worker started');
}

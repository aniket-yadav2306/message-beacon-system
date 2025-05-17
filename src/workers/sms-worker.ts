
import { smsQueue } from '../config/queue';
import { getNotificationById, markNotificationAsDelivered, markNotificationAsFailed } from '../services/notification-service';
import { sendSMS } from '../services/sms-service';
import { logger } from '../config/logger';
import User from '../models/User';

// Process SMS notifications
export function startSmsWorker() {
  smsQueue.process(async (job) => {
    const { notificationId } = job.data;
    logger.info(`Processing SMS notification: ${notificationId}`);
    
    try {
      // Get notification details
      const notification = await getNotificationById(notificationId);
      
      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }
      
      // Get user details to find phone number
      const user = await User.findById(notification.userId);
      
      if (!user) {
        throw new Error(`User ${notification.userId} not found`);
      }
      
      if (!user.phone) {
        throw new Error(`User ${notification.userId} does not have a phone number`);
      }
      
      // Send the SMS
      await sendSMS(user.phone, notification.message);
      
      // Mark notification as delivered
      await markNotificationAsDelivered(notificationId);
      logger.info(`SMS notification ${notificationId} delivered successfully`);
      
      return { success: true };
    } catch (error) {
      logger.error(`Failed to process SMS notification ${notificationId}:`, error);
      
      // Mark notification as failed and set retry count
      await markNotificationAsFailed(notificationId, error, job.attemptsMade);
      
      // Rethrow error for Bull to handle retry logic
      throw error;
    }
  });
  
  logger.info('SMS worker started');
}

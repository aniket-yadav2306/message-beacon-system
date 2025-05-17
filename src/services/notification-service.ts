
import { getQueueByType, calculateBackoff } from '../config/queue';
import Notification, { NotificationType, NotificationStatus, INotification } from '../models/Notification';
import { logger } from '../config/logger';
import User from '../models/User';

// Add a notification to the appropriate queue
export async function queueNotification(userId: string, type: NotificationType, message: string, metadata?: Record<string, any>) {
  try {
    // Check if user exists and has enabled this notification type
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Check user preferences
    let shouldSend = true;
    if (type === NotificationType.EMAIL && !user.preferences.email) {
      shouldSend = false;
    } else if (type === NotificationType.SMS && !user.preferences.sms) {
      shouldSend = false;
    } else if (type === NotificationType.IN_APP && !user.preferences.inApp) {
      shouldSend = false;
    }
    
    if (!shouldSend) {
      logger.info(`Notification of type ${type} skipped for user ${userId} due to preferences`);
      return null;
    }
    
    // Create notification record
    const notification = await Notification.create({
      userId,
      type,
      message,
      status: NotificationStatus.PENDING,
      metadata: metadata || {}
    });
    
    // Get the appropriate queue for this notification type
    const queue = getQueueByType(type);
    
    // Add to queue with exponential backoff for retries (up to 3 attempts)
    const job = await queue.add(
      { notificationId: notification._id },
      { 
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000 // Base delay of 5 seconds
        }
      }
    );
    
    logger.info(`Notification ${notification._id} of type ${type} queued with job ID ${job.id}`);
    
    return notification;
  } catch (error) {
    logger.error('Failed to queue notification:', error);
    throw error;
  }
}

// Get all in-app notifications for a user
export async function getUserNotifications(userId: string, limit = 50, page = 1) {
  try {
    // Calculate skip amount for pagination
    const skip = (page - 1) * limit;
    
    // Find notifications with pagination
    const notifications = await Notification.find({
      userId,
      type: NotificationType.IN_APP
    })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .skip(skip);
    
    // Get total count for pagination
    const total = await Notification.countDocuments({
      userId,
      type: NotificationType.IN_APP
    });
    
    // Calculate pagination details
    const totalPages = Math.ceil(total / limit);
    
    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    logger.error('Failed to get user notifications:', error);
    throw error;
  }
}

// Mark notification as delivered
export async function markNotificationAsDelivered(notificationId: string) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: NotificationStatus.DELIVERED },
      { new: true }
    );
    
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    
    return notification;
  } catch (error) {
    logger.error(`Failed to mark notification ${notificationId} as delivered:`, error);
    throw error;
  }
}

// Mark notification as failed
export async function markNotificationAsFailed(notificationId: string, error: any, retryCount: number) {
  try {
    // Calculate next retry time using exponential backoff
    const nextRetry = retryCount < 3 ? new Date(Date.now() + calculateBackoff(retryCount)) : null;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        status: nextRetry ? NotificationStatus.PENDING : NotificationStatus.FAILED,
        retryCount,
        nextRetry,
        'metadata.lastError': error.message || String(error)
      },
      { new: true }
    );
    
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    
    return notification;
  } catch (dbError) {
    logger.error(`Failed to mark notification ${notificationId} as failed:`, dbError);
    throw dbError;
  }
}

// Get a notification by ID
export async function getNotificationById(id: string) {
  return Notification.findById(id);
}


import { Request, Response } from 'express';
import { queueNotification, getUserNotifications } from '../services/notification-service';
import { NotificationType } from '../models/Notification';
import { logger } from '../config/logger';

// Create a new notification
export async function createNotification(req: Request, res: Response) {
  try {
    const { userId, type, message, metadata } = req.body;
    
    // Validate required fields
    if (!userId || !type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, and message are required'
      });
    }
    
    // Validate notification type
    if (!Object.values(NotificationType).includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid notification type: must be one of ${Object.values(NotificationType).join(', ')}`
      });
    }
    
    // Queue notification
    const notification = await queueNotification(userId, type, message, metadata);
    
    // Return success response
    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

// Get notifications for a user
export async function getNotificationsForUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Convert query params to numbers
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    
    // Get notifications
    const result = await getUserNotifications(id, limitNum, pageNum);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}


import { Router } from 'express';
import { createNotification, getNotificationsForUser } from '../controllers/notification-controller';

const router = Router();

/**
 * @route POST /api/notifications
 * @description Create a new notification
 * @body { userId, type, message, metadata? }
 * @access Public
 */
router.post('/', createNotification);

/**
 * @route GET /api/users/:id/notifications
 * @description Get all in-app notifications for a user
 * @param {string} id - User ID
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Number of records per page (default: 50)
 * @access Public
 */
router.get('/users/:id/notifications', getNotificationsForUser);

export default router;


import * as Bull from 'bull';
import { logger } from './logger';
import { NotificationType } from '../models/Notification';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create individual queues for each notification type
const emailQueue = new Bull('email-notifications', REDIS_URL);
const smsQueue = new Bull('sms-notifications', REDIS_URL);
const inAppQueue = new Bull('in-app-notifications', REDIS_URL);

// Function to get the appropriate queue based on notification type
export function getQueueByType(type: NotificationType): Bull.Queue {
  switch (type) {
    case NotificationType.EMAIL:
      return emailQueue;
    case NotificationType.SMS:
      return smsQueue;
    case NotificationType.IN_APP:
      return inAppQueue;
    default:
      throw new Error(`Unsupported notification type: ${type}`);
  }
}

// Function to set up queue error handling
function setupQueueErrorHandling(queue: Bull.Queue) {
  queue.on('error', (error) => {
    logger.error(`Queue ${queue.name} error:`, error);
  });

  queue.on('failed', (job, error) => {
    logger.error(`Job ${job.id} in queue ${queue.name} failed:`, error);
  });
}

// Set up error handling for all queues
setupQueueErrorHandling(emailQueue);
setupQueueErrorHandling(smsQueue);
setupQueueErrorHandling(inAppQueue);

// Calculate exponential backoff time (in ms)
export function calculateBackoff(attemptsMade: number): number {
  // Base delay is 5 seconds
  const baseDelay = 5000;
  // Max delay is 1 hour
  const maxDelay = 60 * 60 * 1000;
  
  // Exponential backoff formula: baseDelay * 2^attemptsMade
  const delay = baseDelay * Math.pow(2, attemptsMade);
  
  // Add some randomness to prevent thundering herd problem
  const jitter = Math.random() * 1000;
  
  // Return the calculated delay, but not more than maxDelay
  return Math.min(delay + jitter, maxDelay);
}

export { emailQueue, smsQueue, inAppQueue };

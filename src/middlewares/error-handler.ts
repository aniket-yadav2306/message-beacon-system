
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logger.error('Unhandled error:', err);
  
  // Send an appropriate response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Unknown error'
  });
}

export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
}

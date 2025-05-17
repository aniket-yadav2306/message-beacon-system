
import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in-app'
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  retryCount: number;
  nextRetry?: Date;
  metadata?: Record<string, any>;
}

const NotificationSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    required: true,
    enum: Object.values(NotificationType)
  },
  message: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  nextRetry: {
    type: Date,
    default: null
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for querying user notifications efficiently
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

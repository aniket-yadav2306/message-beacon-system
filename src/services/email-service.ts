
import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

// Create a test account for development
let transporter: nodemailer.Transporter;

// Initialize nodemailer transporter
async function initializeTransporter() {
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    // Use production SMTP server
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Use ethereal email for development/testing
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    logger.info('Using ethereal email for testing');
  }
}

// Send an email notification
export async function sendEmail(to: string, subject: string, message: string) {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      await initializeTransporter();
    }
    
    // Send mail
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Notification Service" <notifications@example.com>',
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${message}</div>`
    });
    
    logger.info(`Email sent: ${info.messageId}`);
    
    // Log preview URL in development environment
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

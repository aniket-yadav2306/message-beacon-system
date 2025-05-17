
# Notification Service

A backend service for managing and sending notifications through multiple channels (email, SMS, and in-app).

## 🚀 Features

- **Multi-channel notifications**: Support for email, SMS, and in-app notifications
- **Queue system**: Reliable delivery with Bull and Redis
- **Retry logic**: Exponential backoff for failed notifications (up to 3 retries)
- **MongoDB storage**: Persistent storage for notification history
- **RESTful API**: Clean API for sending and retrieving notifications

## 📋 API Documentation

### Create a notification

```
POST /api/notifications
```

**Request body:**

```json
{
  "userId": "user123",
  "type": "email", // "email", "sms", or "in-app"
  "message": "Hello, this is a test notification",
  "metadata": {
    "subject": "Test Notification" // Optional metadata, useful for emails
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "60d21b4967d0d8992e610c85",
    "userId": "user123",
    "type": "email",
    "message": "Hello, this is a test notification",
    "status": "pending",
    "createdAt": "2023-06-22T10:00:00.000Z",
    "updatedAt": "2023-06-22T10:00:00.000Z",
    "retryCount": 0,
    "metadata": {
      "subject": "Test Notification"
    }
  }
}
```

### Get user notifications

```
GET /api/users/{userId}/notifications?page=1&limit=50
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4967d0d8992e610c85",
      "userId": "user123",
      "type": "in-app",
      "message": "Hello, this is a test notification",
      "status": "delivered",
      "createdAt": "2023-06-22T10:00:00.000Z",
      "updatedAt": "2023-06-22T10:00:00.000Z",
      "retryCount": 0,
      "metadata": {}
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## 🔧 Setup and Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis

### Environment Variables

Create a `.env` file with the following variables:

```
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/notification-service

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASSWORD=yourpassword
EMAIL_FROM=notifications@example.com

# Logging
LOG_LEVEL=info
```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/notification-service.git
   cd notification-service
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the service
   ```
   npm run dev
   ```

### Docker (optional)

```
docker-compose up -d
```

## 🏗️ Architecture

```
notification-service/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── workers/          # Background workers
│   ├── middlewares/      # Express middlewares
│   ├── app.ts            # Express app setup
│   └── server.ts         # Entry point
└── README.md
```

## 🧪 Testing

```
npm test
```

## 📝 License

MIT


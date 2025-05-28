# MongoDB Connection Configuration

This project supports both local development and Docker-based development. Choose the approach that works best for your setup.

## Local Development (Current Setup)

Your application is now configured to run locally with MongoDB running on your system.

### Prerequisites
- MongoDB installed locally via Homebrew
- MongoDB service running: `brew services start mongodb-community`

### Environment Configuration
The `.env` file is configured for local development:
```
DATABASE_URI=mongodb://127.0.0.1:27017/video-directory-backend
```

### Running the Application
```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3001
- Network: http://192.168.1.229:3001
- Admin Panel: http://localhost:3001/admin

## Docker Development (Alternative)

If you prefer to run everything in containers, you can use Docker Compose.

### Environment Configuration for Docker
Update your `.env` file:
```
DATABASE_URI=mongodb://mongo/video-directory-backend
```

### Running with Docker
```bash
docker-compose up
```

This will:
- Start a MongoDB container
- Start the Payload CMS application container
- Make the application available at http://localhost:3000

## Switching Between Modes

### To switch to Docker mode:
1. Update `.env`: `DATABASE_URI=mongodb://mongo/video-directory-backend`
2. Run: `docker-compose up`

### To switch to local mode:
1. Update `.env`: `DATABASE_URI=mongodb://127.0.0.1:27017/video-directory-backend`
2. Ensure MongoDB is running: `brew services start mongodb-community`
3. Run: `npm run dev`

## Common Issues and Solutions

### Connection Refused Error
- **Local**: Make sure MongoDB service is running: `brew services restart mongodb-community`
- **Docker**: Make sure containers are running: `docker-compose up`

### Port Conflicts
- **Local**: Default port is 3001
- **Docker**: Default port is 3000
- Check if ports are available: `lsof -i :3001` or `lsof -i :3000`

### Database Connection String Issues
Some users report better success with different connection string formats:
- Try `mongodb://127.0.0.1:27017/database-name` instead of `mongodb://localhost:27017/database-name`
- For IPv6 issues, you might need `mongodb://0.0.0.0:27017/database-name`

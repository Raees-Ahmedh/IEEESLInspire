# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

### 1. Database Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ieeeslinspire?schema=public"
```

### 2. JWT Authentication
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 3. Cloudinary Configuration (for file uploads)
```env
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 4. Server Configuration
```env
PORT=4000
NODE_ENV=development
```

## Setup Steps

1. **Create the .env file:**
   ```bash
   cd server
   touch .env
   ```

2. **Add the environment variables above to your .env file**

3. **Install dependencies:**
   ```bash
   # Server dependencies
   cd server
   npm install
   
   # Client dependencies
   cd ../client
   npm install
   ```

4. **Set up the database:**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development servers:**
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev
   
   # Terminal 2 - Client
   cd client
   npm run dev
   ```

## Common Issues

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Run `npx prisma generate` after schema changes

### File Upload Issues
- Set up Cloudinary account
- Add Cloudinary credentials to .env
- Test upload functionality

### Authentication Issues
- Set a strong JWT_SECRET
- Check token expiration settings
- Verify middleware configuration

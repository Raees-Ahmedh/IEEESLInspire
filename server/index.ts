import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import database configuration and routes
import { prisma, testConnection } from './src/config/database';
import savedCoursesRoutes from './src/routes/savedCourses';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Test database connection on startup
testConnection();

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'PERN Stack Backend Server is running!',
    version: '1.0.0',
    database: 'PostgreSQL with Prisma ORM',
    endpoints: {
      health: '/health',
      universities: '/api/universities',
      courses: '/api/courses',
      savedCourses: '/api/saved-courses'
    }
  });
});

// Health check route with Prisma
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT NOW()`;
    
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      orm: 'prisma',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Example API route using Prisma
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    // Test Prisma query
    const result = await prisma.$queryRaw`SELECT version()` as any[];
    
    res.json({
      message: 'Database query successful with Prisma',
      version: result[0]?.version || 'Unknown',
      orm: 'prisma'
    });
  } catch (error: any) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Example route to test your universities
app.get('/api/universities', async (req: Request, res: Response) => {
  try {
    const universities = await prisma.university.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        website: true,
        address: true
      },
      take: 10 // Limit to 10 for testing
    });
    
    res.json({
      message: 'Universities fetched successfully',
      count: universities.length,
      data: universities
    });
  } catch (error: any) {
    console.error('Universities query error:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

// Example route to test your courses
app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isActive: true
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        faculty: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 10 // Limit to 10 for testing
    });
    
    res.json({
      message: 'Courses fetched successfully',
      count: courses.length,
      data: courses
    });
  } catch (error: any) {
    console.error('Courses query error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Mount the real saved courses API routes
app.use('/api/saved-courses', savedCoursesRoutes);

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/test',
      'GET /api/universities',
      'GET /api/courses',
      'GET /api/saved-courses/:userId',
      'POST /api/saved-courses/toggle',
      'GET /api/saved-courses/check/:userId/:courseId',
      'PUT /api/saved-courses/:bookmarkId/notes',
      'DELETE /api/saved-courses/:bookmarkId'
    ]
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎓 Universities: http://localhost:${PORT}/api/universities`);
  console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
  console.log(`🔖 Saved Courses: http://localhost:${PORT}/api/saved-courses/1`);
  console.log(`🎯 Available routes: http://localhost:${PORT}/nonexistent`);
});

// Graceful shutdown with Prisma
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT. Graceful shutdown...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM. Graceful shutdown...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Export for testing purposes
export default app;
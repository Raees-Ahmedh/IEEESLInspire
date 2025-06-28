import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import database configuration and routes
import { prisma, testConnection } from './src/config/database';
import savedCoursesRoutes from './src/routes/savedCourses';
import streamRoutes from './src/routes/streamRoutes';

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
      savedCourses: '/api/saved-courses',
      subjects: '/api/subjects',
      streams: '/api/streams',
      streamClassification: '/api/streams/classify'
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

// Example route to get all subjects with better error handling
app.get('/api/subjects', async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    
    const whereClause: any = { isActive: true };
    if (level && typeof level === 'string') {
      whereClause.level = level.toUpperCase();
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        name: true,
        level: true
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' }
      ]
    });
    
    res.json({
      message: 'Subjects fetched successfully',
      count: subjects.length,
      level: level || 'all',
      data: subjects
    });
  } catch (error: any) {
    console.error('Subjects query error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Example route to get AL subjects only
app.get('/api/subjects/al', async (req: Request, res: Response) => {
  try {
    const alSubjects = await prisma.subject.findMany({
      where: {
        level: 'AL',
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true
      },
      orderBy: {
        id: 'asc' // Order by ID (1-63) to match the insertion order
      }
    });
    
    res.json({
      message: 'A/L subjects fetched successfully',
      count: alSubjects.length,
      data: alSubjects,
      note: 'Subject IDs 1-63 correspond to A/L subjects in order'
    });
  } catch (error: any) {
    console.error('AL subjects query error:', error);
    res.status(500).json({ error: 'Failed to fetch A/L subjects' });
  }
});

// Quick demo endpoint for testing stream classification
app.get('/api/demo/classify/:id1/:id2/:id3', async (req: Request, res: Response) => {
  try {
    const { id1, id2, id3 } = req.params;
    const subjectIds = [parseInt(id1), parseInt(id2), parseInt(id3)];

    if (subjectIds.some(id => isNaN(id))) {
      res.status(400).json({
        error: 'All subject IDs must be valid numbers',
        example: '/api/demo/classify/6/1/2'
      });
      return;
    }

    // Import the service dynamically to avoid circular imports
    const { default: streamService } = await import('./src/services/streamClassificationService');
    const result = await streamService.classifySubjects(subjectIds);

    res.json({
      success: true,
      input: { subjectIds },
      result: result,
      example_combinations: {
        physical_science: [6, 1, 2],
        biological_science: [5, 2, 1],
        commerce: [27, 17, 28],
        arts_national_languages: [50, 51, 52]
      }
    });

  } catch (error: any) {
    console.error('Demo classification error:', error);
    res.status(500).json({ error: 'Demo classification failed' });
  }
});

// Mount API routes
app.use('/api/saved-courses', savedCoursesRoutes);
app.use('/api/streams', streamRoutes);

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
      'GET /api/subjects?level=AL',
      'GET /api/subjects/al',
      'GET /api/demo/classify/6/1/2',
      'GET /api/saved-courses/:userId',
      'POST /api/saved-courses/toggle',
      'GET /api/saved-courses/check/:userId/:courseId',
      'PUT /api/saved-courses/:bookmarkId/notes',
      'DELETE /api/saved-courses/:bookmarkId',
      'GET /api/streams',
      'GET /api/streams/:id', 
      'POST /api/streams/classify',
      'POST /api/streams/classify/batch',
      'GET /api/streams/validate/:subjectId1/:subjectId2/:subjectId3'
    ],
    examples: {
      classification: {
        url: 'POST /api/streams/classify',
        body: { subjectIds: [6, 1, 2] },
        description: 'Classify Combined Math + Physics + Chemistry'
      },
      quick_demo: {
        url: 'GET /api/demo/classify/6/1/2',
        description: 'Quick demo classification via URL'
      }
    }
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
  console.log(`📖 Subjects: http://localhost:${PORT}/api/subjects`);
  console.log(`📋 A/L Subjects: http://localhost:${PORT}/api/subjects/al`);
  console.log(`🔖 Saved Courses: http://localhost:${PORT}/api/saved-courses/1`);
  console.log(`🌊 Streams: http://localhost:${PORT}/api/streams`);
  console.log(`🔍 Stream Classification: http://localhost:${PORT}/api/streams/classify`);
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
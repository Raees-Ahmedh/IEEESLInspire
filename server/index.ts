// server/index.ts - Fixed version without duplicate imports
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'http';

// Import database configuration and routes
import { prisma, testConnection } from './src/config/database';
import savedCoursesRoutes from './src/routes/savedCourses';
import simpleSearchRoutes from './src/routes/simpleSearch';
import subjectsRoutes from './src/routes/subjects';
import eventsRoutes from './src/routes/events';
import streamRoutes from './src/routes/streamRoutes';
// FIXED: Import enhanced routes only once
import courseRoutes from './src/routes/courseRoutes';
import adminRoutes from './src/routes/adminRoutes';
import authRoutes from './src/routes/authRoutes';
import newsRoutes from './src/routes/newsRoutes';
import universitiesRoutes from './src/routes/universitiesRoutes';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/api/news', newsRoutes);
app.use('/api/universities', universitiesRoutes);

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
      subjectsAL: '/api/subjects/al',
      subjectsOL: '/api/subjects/ol',
      events: '/api/events',
      eventsUpcoming: '/api/events/filter/upcoming',
      eventsByMonth: '/api/events/by-month/:year/:month'
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
app.use('/api/simple-search', simpleSearchRoutes);
app.use('/api/saved-courses', savedCoursesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/streams', streamRoutes);
// FIXED: Mount enhanced routes only once
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/courses',
      'POST /api/courses',
      'GET /api/courses/:id',
      'PUT /api/courses/:id',
      'DELETE /api/courses/:id',
      'GET /api/admin/universities',
      'GET /api/admin/faculties',
      'GET /api/admin/departments',
      'GET /api/admin/subjects',
      'GET /api/admin/streams',
      'GET /api/admin/frameworks',
      'POST /api/admin/career-pathways',
      'GET /api/test',
      'GET /api/universities',
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
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Enhanced server startup and graceful shutdown
let server: Server;

const startServer = async (): Promise<void> => {
  try {
    server = app.listen(PORT, () => {
      console.log('🚀 Server started successfully');
      console.log(`📍 Server running on http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('📡 Available endpoints:');
      console.log('   GET  / - Server info');
      console.log('   GET  /health - Health check');
      console.log('   GET  /api/simple-search - Course search');
      console.log('   GET  /api/subjects - Subjects');
      console.log('   GET  /api/events - Events');
      console.log('   GET  /api/saved-courses - Saved courses');
      console.log('   GET  /api/courses - Enhanced course management');
      console.log('   GET  /api/admin/* - Enhanced admin endpoints');
      console.log('✅ Server ready to accept connections');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Try running: taskkill /f /im node.exe (Windows) or killall node (Mac/Linux)');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Enhanced graceful shutdown function
const performGracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal} signal. Starting graceful shutdown...`);
  
  const shutdownTimeout = setTimeout(() => {
    console.error('❌ Graceful shutdown timed out. Forcing exit...');
    process.exit(1);
  }, 10000); // 10 second timeout

  try {
    // Stop accepting new connections
    if (server) {
      console.log('📴 Closing HTTP server...');
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            console.error('❌ Error closing server:', err);
            reject(err);
          } else {
            console.log('✅ HTTP server closed');
            resolve();
          }
        });
      });
    }

    // Close database connection
    console.log('🔌 Closing database connection...');
    await prisma.$disconnect();
    console.log('✅ Database connection closed');

    // Clear timeout and exit gracefully
    clearTimeout(shutdownTimeout);
    console.log('✅ Graceful shutdown completed');
    process.exit(0);

  } catch (error) {
    clearTimeout(shutdownTimeout);
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Enhanced signal handlers
const setupGracefulShutdown = (): void => {
  // Handle different termination signals
  process.on('SIGINT', () => performGracefulShutdown('SIGINT'));   // Ctrl+C
  process.on('SIGTERM', () => performGracefulShutdown('SIGTERM')); // Termination request
  process.on('SIGQUIT', () => performGracefulShutdown('SIGQUIT')); // Quit request

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    performGracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    performGracefulShutdown('unhandledRejection');
  });

  // Handle nodemon restart (SIGUSR2)
  process.once('SIGUSR2', () => {
    console.log('🔄 Nodemon restart detected...');
    performGracefulShutdown('SIGUSR2').then(() => {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
};

// Start the server
const main = async (): Promise<void> => {
  console.log('🔥 Starting SLI Inspire Server...');
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  
  // Setup graceful shutdown handlers
  setupGracefulShutdown();
  
  // Start the server
  await startServer();
};

// Execute main function
main().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

export default app;

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'PERN Stack Backend Server is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      savedCourses: '/api/saved-courses'
    }
  });
});

// Health check route
app.get('/health', async (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Mock saved courses data (temporary - until your database is ready)
const mockSavedCourses = [
  {
    id: 1,
    courseId: 1,
    notes: "Interested in this program",
    course: {
      id: 1,
      name: "Computer Science",
      specialisation: ["Software Engineering", "AI"],
      courseCode: "CS101",
      courseUrl: "https://cmb.ac.lk/cs",
      durationMonths: 48,
      description: "Comprehensive computer science program",
      studyMode: "Full-time",
      courseType: "Undergraduate",
      feeType: "Government",
      feeAmount: 50000,
      university: {
        id: 1,
        name: "University of Colombo",
        type: "Government"
      },
      faculty: {
        id: 1,
        name: "Faculty of Science"
      }
    }
  },
  {
    id: 2,
    courseId: 2,
    notes: "",
    course: {
      id: 2,
      name: "Medicine",
      specialisation: ["General Medicine"],
      courseCode: "MED101",
      courseUrl: "https://pdn.ac.lk/medicine",
      durationMonths: 60,
      description: "Medical degree program",
      studyMode: "Full-time",
      courseType: "Undergraduate",
      feeType: "Government",
      feeAmount: 75000,
      university: {
        id: 2,
        name: "University of Peradeniya",
        type: "Government"
      },
      faculty: {
        id: 2,
        name: "Faculty of Medicine"
      }
    }
  }
];

// Saved Courses API Routes

// Get all saved courses for a user
app.get('/api/saved-courses/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Return mock data for now
    res.json({
      success: true,
      message: 'Saved courses retrieved successfully',
      data: mockSavedCourses
    });
  } catch (error) {
    console.error('Error fetching saved courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved courses'
    });
  }
});

// Toggle bookmark status (add/remove)
app.post('/api/saved-courses/toggle', (req: Request, res: Response) => {
  try {
    const { courseId, userId, notes } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({ error: 'Course ID and User ID are required' });
    }

    // Mock logic - in real app, this would check database
    const isBookmarked = Math.random() > 0.5; // Random for testing

    if (isBookmarked) {
      res.json({
        success: true,
        action: 'removed',
        message: 'Course removed from saved courses',
        data: null
      });
    } else {
      res.json({
        success: true,
        action: 'added',
        message: 'Course added to saved courses',
        data: mockSavedCourses[0]
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle bookmark'
    });
  }
});

// Check if course is bookmarked
app.get('/api/saved-courses/check/:userId/:courseId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const courseId = parseInt(req.params.courseId);

    if (isNaN(userId) || isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid user ID or course ID' });
    }

    // Mock response
    res.json({
      success: true,
      isBookmarked: true,
      bookmarkId: 1
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check bookmark status'
    });
  }
});

// Update bookmark notes
app.put('/api/saved-courses/:bookmarkId/notes', (req: Request, res: Response) => {
  try {
    const bookmarkId = parseInt(req.params.bookmarkId);
    const { notes } = req.body;

    if (isNaN(bookmarkId)) {
      return res.status(400).json({ error: 'Invalid bookmark ID' });
    }

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: mockSavedCourses[0]
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notes'
    });
  }
});

// Remove saved course
app.delete('/api/saved-courses/:bookmarkId', (req: Request, res: Response) => {
  try {
    const bookmarkId = parseInt(req.params.bookmarkId);

    if (isNaN(bookmarkId)) {
      return res.status(400).json({ error: 'Invalid bookmark ID' });
    }

    res.json({
      success: true,
      message: 'Saved course removed successfully'
    });
  } catch (error) {
    console.error('Error removing saved course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove saved course'
    });
  }
});

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /health',
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
  console.log(`🔖 Saved Courses: http://localhost:${PORT}/api/saved-courses/1`);
  console.log(`🎯 Available routes listed at: http://localhost:${PORT}/nonexistent`);
});

export default app;
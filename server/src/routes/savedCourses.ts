import express, { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/saved-courses/:userId - Get user's saved courses
const getSavedCourses: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
      return;
    }

    // First, let's try to get data without the problematic joins
    // This will help us isolate the issue
    console.log(`📚 Fetching saved courses for user ${userId}...`);

    try {
      // Simple query first to test basic functionality
      const simpleBookmarks = await prisma.studentBookmark.findMany({
        where: {
          userId: userId
        },
        select: {
          id: true,
          courseId: true,
          notes: true
        },
        take: 5 // Limit results for testing
      });

      console.log(`✅ Found ${simpleBookmarks.length} bookmarks`);

      if (simpleBookmarks.length === 0) {
        res.json({
          success: true,
          message: 'No saved courses found for this user',
          data: []
        });
        return;
      }

      // If simple query works, try with course details
      const savedCourses = await prisma.studentBookmark.findMany({
        where: {
          userId: userId
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              specialisation: true,
              courseCode: true,
              courseUrl: true,
              durationMonths: true,
              description: true,
              studyMode: true,
              courseType: true,
              feeType: true,
              feeAmount: true
            }
          }
        },
        orderBy: {
          id: 'desc'
        },
        take: 10 // Limit for safety
      });

      // Get university and faculty data separately to avoid join issues
      const coursesWithDetails = await Promise.all(
        savedCourses.map(async (bookmark) => {
          try {
            const courseWithUniversity = await prisma.course.findUnique({
              where: { id: bookmark.courseId },
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
              }
            });

            return {
              id: bookmark.id,
              courseId: bookmark.courseId,
              notes: bookmark.notes,
              course: {
                id: bookmark.course.id,
                name: bookmark.course.name,
                specialisation: bookmark.course.specialisation,
                courseCode: bookmark.course.courseCode,
                courseUrl: bookmark.course.courseUrl,
                durationMonths: bookmark.course.durationMonths,
                description: bookmark.course.description,
                studyMode: bookmark.course.studyMode,
                courseType: bookmark.course.courseType,
                feeType: bookmark.course.feeType,
                feeAmount: bookmark.course.feeAmount ? Number(bookmark.course.feeAmount) : undefined,
                university: courseWithUniversity?.university || {
                  id: 0,
                  name: "Unknown University",
                  type: "unknown"
                },
                faculty: courseWithUniversity?.faculty || {
                  id: 0,
                  name: "Unknown Faculty"
                }
              }
            };
          } catch (error) {
            console.error(`Error fetching details for course ${bookmark.courseId}:`, error);
            // Return bookmark with minimal course info if detailed fetch fails
            return {
              id: bookmark.id,
              courseId: bookmark.courseId,
              notes: bookmark.notes,
              course: {
                id: bookmark.course.id,
                name: bookmark.course.name,
                specialisation: bookmark.course.specialisation,
                courseCode: bookmark.course.courseCode,
                courseUrl: bookmark.course.courseUrl,
                durationMonths: bookmark.course.durationMonths,
                description: bookmark.course.description,
                studyMode: bookmark.course.studyMode,
                courseType: bookmark.course.courseType,
                feeType: bookmark.course.feeType,
                feeAmount: bookmark.course.feeAmount ? Number(bookmark.course.feeAmount) : undefined,
                university: {
                  id: 0,
                  name: "University Info Unavailable",
                  type: "unknown"
                },
                faculty: {
                  id: 0,
                  name: "Faculty Info Unavailable"
                }
              }
            };
          }
        })
      );

      res.json({
        success: true,
        message: 'Saved courses retrieved successfully',
        data: coursesWithDetails
      });

    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      
      // If database query fails, return mock data for testing
      console.log('🔄 Falling back to mock data due to database issue...');
      
      const mockData = [
        {
          id: 1,
          courseId: 1,
          notes: "Sample saved course - Computer Science",
          course: {
            id: 1,
            name: "Computer Science",
            specialisation: ["Software Engineering", "Data Science"],
            courseCode: "CS-001",
            courseUrl: "https://example.com/cs",
            durationMonths: 48,
            description: "Computer Science program",
            studyMode: "fulltime",
            courseType: "internal",
            feeType: "free",
            feeAmount: 0,
            university: {
              id: 1,
              name: "Sample University",
              type: "government"
            },
            faculty: {
              id: 1,
              name: "Faculty of Science"
            }
          }
        }
      ];

      res.json({
        success: true,
        message: 'Saved courses retrieved (mock data due to database issue)',
        data: mockData,
        warning: 'Using mock data - database connection issue'
      });
    }

  } catch (error: any) {
    console.error('Error fetching saved courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved courses',
      details: error.message
    });
  }
};

// POST /api/saved-courses/toggle - Toggle bookmark
const toggleBookmark: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, userId, notes } = req.body;

    if (!courseId || !userId) {
      res.status(400).json({
        success: false,
        error: 'Course ID and User ID are required'
      });
      return;
    }

    console.log(`🔖 Toggling bookmark for course ${courseId}, user ${userId}`);

    // Check if bookmark already exists
    const existingBookmark = await prisma.studentBookmark.findFirst({
      where: {
        userId: parseInt(userId),
        courseId: parseInt(courseId)
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.studentBookmark.delete({
        where: { id: existingBookmark.id }
      });

      console.log(`✅ Removed bookmark for course ${courseId}, user ${userId}`);
      
      res.json({
        success: true,
        action: 'removed',
        message: 'Bookmark removed successfully',
        data: {
          id: existingBookmark.id,
          courseId: parseInt(courseId),
          userId: parseInt(userId)
        }
      });
    } else {
      // Add bookmark
      const newBookmark = await prisma.studentBookmark.create({
        data: {
          userId: parseInt(userId),
          courseId: parseInt(courseId),
          notes: notes || '',
          auditInfo: {
            createdBy: userId,
            createdAt: new Date().toISOString(),
            lastModifiedBy: userId,
            lastModifiedAt: new Date().toISOString()
          }
        },
        include: {
          course: {
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
            }
          }
        }
      });

      console.log(`✅ Added bookmark for course ${courseId}, user ${userId}`);

      res.json({
        success: true,
        action: 'added',
        message: 'Bookmark added successfully',
        data: {
          id: newBookmark.id,
          courseId: newBookmark.courseId,
          userId: newBookmark.userId,
          notes: newBookmark.notes,
          course: {
            id: newBookmark.course.id,
            name: newBookmark.course.name,
            specialisation: newBookmark.course.specialisation,
            courseCode: newBookmark.course.courseCode,
            courseUrl: newBookmark.course.courseUrl,
            durationMonths: newBookmark.course.durationMonths,
            description: newBookmark.course.description,
            studyMode: newBookmark.course.studyMode,
            courseType: newBookmark.course.courseType,
            feeType: newBookmark.course.feeType,
            feeAmount: newBookmark.course.feeAmount ? Number(newBookmark.course.feeAmount) : undefined,
            university: newBookmark.course.university,
            faculty: newBookmark.course.faculty
          }
        }
      });
    }

  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle bookmark',
      details: error.message
    });
  }
};

// GET /api/saved-courses/check/:userId/:courseId - Check bookmark status
const checkBookmarkStatus: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const courseId = parseInt(req.params.courseId);

    if (isNaN(userId) || isNaN(courseId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID or course ID'
      });
      return;
    }

    console.log(`🔍 Checking bookmark status for course ${courseId}, user ${userId}`);

    // Check if bookmark exists
    const bookmark = await prisma.studentBookmark.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    res.json({
      success: true,
      isBookmarked: !!bookmark,
      bookmarkId: bookmark?.id || null
    });

  } catch (error: any) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check bookmark status'
    });
  }
};

// PUT /api/saved-courses/:bookmarkId/notes - Update notes (mock)
const updateNotes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Notes update feature coming soon'
  });
};

const removeBookmark: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmarkId = parseInt(req.params.bookmarkId);

    if (isNaN(bookmarkId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid bookmark ID'
      });
      return;
    }

    console.log(`🗑️ Removing bookmark with ID: ${bookmarkId}`);

    // Check if bookmark exists first
    const existingBookmark = await prisma.studentBookmark.findUnique({
      where: { id: bookmarkId }
    });

    if (!existingBookmark) {
      res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
      return;
    }

    // Delete the bookmark from database
    await prisma.studentBookmark.delete({
      where: { id: bookmarkId }
    });

    console.log(`✅ Successfully removed bookmark with ID: ${bookmarkId}`);

    res.json({
      success: true,
      message: 'Bookmark removed successfully',
      bookmarkId: bookmarkId
    });

  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove bookmark',
      details: error.message
    });
  }
};

// Register routes with authentication
router.get('/:userId', authenticateToken, getSavedCourses);
router.post('/toggle', authenticateToken, toggleBookmark);
router.get('/check/:userId/:courseId', authenticateToken, checkBookmarkStatus);
router.put('/:bookmarkId/notes', authenticateToken, updateNotes);
router.delete('/:bookmarkId', authenticateToken, removeBookmark);

export default router;
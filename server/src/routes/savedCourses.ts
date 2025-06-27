// server/src/routes/savedCourses.ts (Fixed TypeScript version)
import express, { Request, Response, RequestHandler } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

// Interface for request/response types
interface SavedCourseResponse {
  id: number;
  courseId: number;
  notes?: string;
  course: {
    id: number;
    name: string;
    specialisation: string[];
    courseCode?: string;
    courseUrl: string;
    durationMonths?: number;
    description?: string;
    studyMode: string;
    courseType: string;
    feeType: string;
    feeAmount?: number;
    university: {
      id: number;
      name: string;
      type: string;
    };
    faculty: {
      id: number;
      name: string;
    };
  };
}

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

    const savedCourses = await prisma.studentBookmark.findMany({
      where: {
        userId: userId
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
      },
      orderBy: {
        id: 'desc' // Most recently saved first
      }
    });

    // Transform the data to match frontend expectations
    const transformedCourses: SavedCourseResponse[] = savedCourses.map(bookmark => ({
      id: bookmark.id,
      courseId: bookmark.courseId,
      notes: bookmark.notes || undefined,
      course: {
        id: bookmark.course.id,
        name: bookmark.course.name,
        specialisation: bookmark.course.specialisation,
        courseCode: bookmark.course.courseCode || undefined,
        courseUrl: bookmark.course.courseUrl,
        durationMonths: bookmark.course.durationMonths || undefined,
        description: bookmark.course.description || undefined,
        studyMode: bookmark.course.studyMode,
        courseType: bookmark.course.courseType,
        feeType: bookmark.course.feeType,
        feeAmount: bookmark.course.feeAmount ? Number(bookmark.course.feeAmount) : undefined,
        university: bookmark.course.university,
        faculty: bookmark.course.faculty
      }
    }));

    res.json({
      success: true,
      data: transformedCourses,
      count: transformedCourses.length
    });

  } catch (error: any) {
    console.error('Error fetching saved courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved courses',
      details: error.message
    });
  }
};

// POST /api/saved-courses/toggle - Toggle bookmark status
const toggleBookmark: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, userId, notes } = req.body;
    
    if (!courseId || isNaN(courseId)) {
      res.status(400).json({
        success: false,
        error: 'Valid course ID is required'
      });
      return;
    }

    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Valid user ID is required'
      });
      return;
    }

    // Check if course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!courseExists) {
      res.status(404).json({
        success: false,
        error: 'Course not found'
      });
      return;
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.studentBookmark.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    let result;
    let action: 'added' | 'removed';

    if (existingBookmark) {
      // Remove bookmark
      await prisma.studentBookmark.delete({
        where: { id: existingBookmark.id }
      });
      result = null;
      action = 'removed';
    } else {
      // Add bookmark
      result = await prisma.studentBookmark.create({
        data: {
          userId: userId,
          courseId: courseId,
          notes: notes || null,
          auditInfo: {
            createdAt: new Date().toISOString(),
            createdBy: userId,
            action: 'bookmark_added'
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
      action = 'added';
    }

    res.json({
      success: true,
      action: action,
      data: result ? {
        id: result.id,
        courseId: result.courseId,
        notes: result.notes,
        course: {
          id: result.course.id,
          name: result.course.name,
          specialisation: result.course.specialisation,
          courseCode: result.course.courseCode,
          courseUrl: result.course.courseUrl,
          durationMonths: result.course.durationMonths,
          description: result.course.description,
          studyMode: result.course.studyMode,
          courseType: result.course.courseType,
          feeType: result.course.feeType,
          feeAmount: result.course.feeAmount ? Number(result.course.feeAmount) : undefined,
          university: result.course.university,
          faculty: result.course.faculty
        }
      } : null
    });

  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle bookmark',
      details: error.message
    });
  }
};

// PUT /api/saved-courses/:bookmarkId/notes - Update bookmark notes
const updateBookmarkNotes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmarkId = parseInt(req.params.bookmarkId);
    const { notes } = req.body;
    
    if (isNaN(bookmarkId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid bookmark ID'
      });
      return;
    }

    const updatedBookmark = await prisma.studentBookmark.update({
      where: { id: bookmarkId },
      data: { 
        notes: notes || null,
        auditInfo: {
          updatedAt: new Date().toISOString(),
          action: 'notes_updated'
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

    res.json({
      success: true,
      data: {
        id: updatedBookmark.id,
        courseId: updatedBookmark.courseId,
        notes: updatedBookmark.notes,
        course: {
          id: updatedBookmark.course.id,
          name: updatedBookmark.course.name,
          specialisation: updatedBookmark.course.specialisation,
          courseCode: updatedBookmark.course.courseCode,
          courseUrl: updatedBookmark.course.courseUrl,
          durationMonths: updatedBookmark.course.durationMonths,
          description: updatedBookmark.course.description,
          studyMode: updatedBookmark.course.studyMode,
          courseType: updatedBookmark.course.courseType,
          feeType: updatedBookmark.course.feeType,
          feeAmount: updatedBookmark.course.feeAmount ? Number(updatedBookmark.course.feeAmount) : undefined,
          university: updatedBookmark.course.university,
          faculty: updatedBookmark.course.faculty
        }
      }
    });

  } catch (error: any) {
    console.error('Error updating bookmark notes:', error);
    
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update bookmark notes',
      details: error.message
    });
  }
};

// DELETE /api/saved-courses/:bookmarkId - Remove specific bookmark
const removeSavedCourse: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmarkId = parseInt(req.params.bookmarkId);
    
    if (isNaN(bookmarkId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid bookmark ID'
      });
      return;
    }

    await prisma.studentBookmark.delete({
      where: { id: bookmarkId }
    });

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Bookmark not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to remove bookmark',
      details: error.message
    });
  }
};

// GET /api/saved-courses/check/:userId/:courseId - Check if course is bookmarked
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
      error: 'Failed to check bookmark status',
      details: error.message
    });
  }
};

// Route definitions
router.get('/:userId', getSavedCourses);
router.post('/toggle', toggleBookmark);
router.put('/:bookmarkId/notes', updateBookmarkNotes);
router.delete('/:bookmarkId', removeSavedCourse);
router.get('/check/:userId/:courseId', checkBookmarkStatus);

export default router;
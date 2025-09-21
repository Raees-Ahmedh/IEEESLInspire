// server/src/routes/enhancedSearch.ts - Enhanced search for navbar
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

interface NavbarSearchRequest {
  query?: string;
  limit?: number;
}

// GET /api/search/navbar - Optimized search for navbar dropdown
router.get('/navbar', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      query = '', 
      limit = 6
    }: NavbarSearchRequest = req.query as any;

    console.log(`🔍 Navbar Search Request: "${query}"`);

    if (!query || query.trim().length < 2) {
      res.json({
        success: true,
        courses: [],
        total: 0,
        query: query
      });
      return;
    }

    const searchLimit = Math.min(parseInt(String(limit)) || 6, 10);

    // Build optimized search conditions for navbar
    const searchConditions: any = {
      isActive: true,
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          courseCode: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          university: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        {
          faculty: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        {
          department: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        }
      ]
    };

    // Fetch courses with minimal required data for navbar
    const courses = await prisma.course.findMany({
      where: searchConditions,
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
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: searchLimit,
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Transform courses for navbar display
    const transformedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      feeType: course.feeType,
      feeAmount: course.feeAmount ? Number(course.feeAmount) : undefined,
      studyMode: course.studyMode,
      durationMonths: course.durationMonths,
      description: course.description,
      university: {
        id: course.university.id,
        name: course.university.name,
        type: course.university.type
      },
      faculty: {
        id: course.faculty.id,
        name: course.faculty.name
      },
      department: course.department?.name
    }));

    console.log(`✅ Found ${transformedCourses.length} courses for navbar`);

    res.json({
      success: true,
      courses: transformedCourses,
      total: transformedCourses.length,
      query: query,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Navbar search error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to search courses',
      details: error.message,
      courses: [],
      total: 0,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/search/suggestions - Auto-complete suggestions for navbar
router.get('/suggestions', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string || '';
    const limit = parseInt(req.query.limit as string) || 5;

    if (query.length < 2) {
      res.json({
        success: true,
        suggestions: []
      });
      return;
    }

    // Get course name suggestions
    const courseSuggestions = await prisma.course.findMany({
      where: {
        isActive: true,
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
        courseCode: true
      },
      take: limit,
      distinct: ['name']
    });

    // Get university name suggestions
    const universitySuggestions = await prisma.university.findMany({
      where: {
        isActive: true,
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
        uniCode: true
      },
      take: limit,
      distinct: ['name']
    });

    const suggestions = [
      ...courseSuggestions.map(c => ({ 
        type: 'course', 
        value: c.name, 
        code: c.courseCode 
      })),
      ...universitySuggestions.map(u => ({ 
        type: 'university', 
        value: u.name, 
        code: u.uniCode 
      }))
    ].slice(0, limit);

    res.json({
      success: true,
      suggestions: suggestions,
      query: query
    });

  } catch (error: any) {
    console.error('❌ Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
      suggestions: []
    });
  }
});

// GET /api/search/quick/:query - Quick search endpoint for testing
router.get('/quick/:query', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit as string) || 3;

    if (!query || query.length < 2) {
      res.json({
        success: true,
        results: [],
        message: 'Query too short'
      });
      return;
    }

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            university: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        university: {
          select: {
            name: true
          }
        }
      },
      take: limit
    });

    const results = courses.map(course => ({
      id: course.id,
      name: course.name,
      university: course.university.name,
      url: course.courseUrl
    }));

    res.json({
      success: true,
      results: results,
      total: results.length,
      query: query
    });

  } catch (error: any) {
    console.error('❌ Quick search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      results: []
    });
  }
});

export default router;
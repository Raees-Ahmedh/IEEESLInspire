// server/src/routes/simpleSearch.ts - Phase 3 Real Implementation
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

interface SearchRequest {
  query?: string;
  userQualifications?: any;
  filters?: {
    universityType?: 'government' | 'private' | 'all';
    feeType?: 'free' | 'paid' | 'all';
    studyMode?: 'fulltime' | 'parttime' | 'all';
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
}

// POST /api/simple-search/courses - Real database search
router.post('/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      query = '', 
      userQualifications, 
      filters = {},
      pagination = {}
    }: SearchRequest = req.body;

    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 10, 50); // Max 50 results
    const skip = (page - 1) * limit;

    console.log('🔍 Real Simple Search Request:');
    console.log(`   Query: "${query}"`);
    console.log(`   Filters:`, filters);
    console.log(`   Page: ${page}, Limit: ${limit}`);

    // Build search conditions for Prisma
    const searchConditions: any = {
      isActive: true, // Only active courses
    };

    // Text search across multiple fields
    if (query && query.trim()) {
      searchConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
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
          specialisation: {
            hasSome: query.split(' ').filter(word => word.length > 2)
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
      ];
    }

    // Apply filters
    if (filters.universityType && filters.universityType !== 'all') {
      searchConditions.university = {
        ...searchConditions.university,
        type: filters.universityType
      };
    }

    if (filters.feeType && filters.feeType !== 'all') {
      searchConditions.feeType = filters.feeType;
    }

    if (filters.studyMode && filters.studyMode !== 'all') {
      searchConditions.studyMode = filters.studyMode;
    }

    // Get total count for pagination
    const totalCourses = await prisma.course.count({
      where: searchConditions
    });

    // Fetch courses with related data
    const courses = await prisma.course.findMany({
      where: searchConditions,
      include: {
        university: {
          select: {
            id: true,
            name: true,
            type: true,
            website: true,
            uniCode: true
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
      orderBy: [
        // Prioritize government universities (free education)
        { university: { type: 'asc' } },
        // Then sort by course name
        { name: 'asc' }
      ],
      skip: skip,
      take: limit
    });

    // Transform data to match frontend expectations
    const transformedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      specialisation: course.specialisation,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      durationMonths: course.durationMonths,
      description: course.description,
      studyMode: course.studyMode,
      courseType: course.courseType,
      feeType: course.feeType,
      feeAmount: course.feeAmount ? Number(course.feeAmount) : 0,
      university: {
        id: course.university.id,
        name: course.university.name,
        type: course.university.type
      },
      faculty: {
        id: course.faculty.id,
        name: course.faculty.name
      },
      // Additional metadata
      department: course.department?.name,
      universityCode: course.university.uniCode,
      website: course.university.website
    }));

    console.log(`✅ Found ${transformedCourses.length} courses (${totalCourses} total)`);

    // Return successful response
    res.json({
      success: true,
      courses: transformedCourses,
      total: totalCourses,
      query: query,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalResults: totalCourses,
        resultsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCourses / limit),
        hasPrevPage: page > 1
      },
      filters: filters,
      timestamp: new Date().toISOString(),
      source: 'database' // Indicates real data, not mock
    });

  } catch (error: any) {
    console.error('❌ Simple search database error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to search courses',
      details: error.message,
      courses: [], // Empty array for frontend compatibility
      total: 0,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/simple-search/test - Test endpoint to verify database connection
router.get('/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const courseCount = await prisma.course.count({ where: { isActive: true } });
    const universityCount = await prisma.university.count({ where: { isActive: true } });
    
    res.json({
      success: true,
      message: 'Simple search API is working with real database!',
      database: 'connected',
      data: {
        activeCourses: courseCount,
        activeUniversities: universityCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Database connection issue',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/simple-search/suggestions - Auto-complete suggestions
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

// GET /api/simple-search/filter-options - Get available filter options
router.get('/filter-options', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get unique universities with their types
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        uniCode: true
      },
      orderBy: [
        { type: 'asc' }, // Government first
        { name: 'asc' }
      ]
    });

    // Get unique faculties
    const faculties = await prisma.faculty.findMany({
      where: { 
        university: { isActive: true }
      },
      select: {
        id: true,
        name: true,
        university: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get course metadata for ranges
    const courseStats = await prisma.course.aggregate({
      where: { isActive: true },
      _min: { 
        durationMonths: true, 
        feeAmount: true 
      },
      _max: { 
        durationMonths: true, 
        feeAmount: true 
      }
    });

    // Get available study modes and fee types
    const studyModes = await prisma.course.findMany({
      where: { isActive: true },
      select: { studyMode: true },
      distinct: ['studyMode']
    });

    const feeTypes = await prisma.course.findMany({
      where: { isActive: true },
      select: { feeType: true },
      distinct: ['feeType']
    });

    res.json({
      success: true,
      filterOptions: {
        universities: universities,
        faculties: faculties,
        universityTypes: ['government', 'private'],
        studyModes: studyModes.map(sm => sm.studyMode),
        feeTypes: feeTypes.map(ft => ft.feeType),
        durationRange: {
          min: courseStats._min.durationMonths || 12,
          max: courseStats._max.durationMonths || 72
        },
        feeRange: {
          min: courseStats._min.feeAmount ? Number(courseStats._min.feeAmount) : 0,
          max: courseStats._max.feeAmount ? Number(courseStats._max.feeAmount) : 1000000
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Filter options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filter options',
      filterOptions: {}
    });
  }
});

// GET /api/simple-search/health - Health check specifically for search
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Promise.all([
      prisma.course.count({ where: { isActive: true } }),
      prisma.university.count({ where: { isActive: true } }),
      prisma.faculty.count(),
    ]);

    res.json({
      success: true,
      status: 'healthy',
      service: 'Simple Search API',
      database: 'connected',
      data: {
        activeCourses: stats[0],
        activeUniversities: stats[1],
        faculties: stats[2]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      service: 'Simple Search API',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
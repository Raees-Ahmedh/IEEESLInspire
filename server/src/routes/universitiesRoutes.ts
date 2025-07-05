// server/src/routes/universitiesRoutes.ts - Add limit parameter support
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

// GET /api/universities - Get universities with optional limit
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit, status = 'active', type, location } = req.query;
    
    console.log('🔄 Fetching universities...');
    console.log('Query params:', { limit, status, type, location });

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.isActive = status === 'active';
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    if (location && location !== 'all') {
      // Check both address and additionalDetails for location
      whereClause.OR = [
        { address: { contains: location as string, mode: 'insensitive' } },
        { additionalDetails: { path: ['location'], equals: location } }
      ];
    }

    // Fetch universities with optional limit
    const universities = await prisma.university.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
        website: true,
        imageUrl: true,
        logoUrl: true,
        galleryImages: true,
        additionalDetails: true,
        isActive: true,
        faculties: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { type: 'asc' }, // Government first
        { name: 'asc' }
      ],
      // Apply limit if provided
      ...(limit ? { take: parseInt(limit as string) } : {})
    });

    // Transform data to match frontend expectations
    const transformedUniversities = universities.map(university => {
      // Extract data from additionalDetails JSON
      const additionalDetails = university.additionalDetails as any || {};
      
      return {
        id: university.id,
        name: university.name,
        location: additionalDetails.location || university.address || 'Unknown',
        type: university.type,
        website: university.website,
        imageUrl: university.imageUrl,
        logoUrl: university.logoUrl,
        galleryImages: Array.isArray(university.galleryImages) ? university.galleryImages : [],
        additionalDetails: {
          established: additionalDetails.established || additionalDetails.establishedYear || undefined,
          students: additionalDetails.students || additionalDetails.studentCount || undefined,
          faculties: university.faculties.length || undefined,
        }
      };
    });

    console.log(`✅ Found ${transformedUniversities.length} universities`);

    // Return successful response
    res.json({
      success: true,
      universities: transformedUniversities,
      count: transformedUniversities.length,
      total: transformedUniversities.length, // You might want to get total count separately if using limit
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Universities fetch error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch universities',
      details: error.message,
      universities: [], // Empty array for frontend compatibility
      count: 0,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/universities/:id - Get single university details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Fetching university details for ID: ${id}`);

    const university = await prisma.university.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        faculties: {
          include: {
            departments: true,
            courses: {
              where: { isActive: true },
              take: 5 // Limit courses for preview
            }
          }
        }
      }
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        error: 'University not found',
        university: null
      });
    }

    // Extract data from additionalDetails JSON
    const additionalDetails = university.additionalDetails as any || {};

    // Transform university data
    const transformedUniversity = {
      id: university.id,
      name: university.name,
      location: additionalDetails.location || university.address || 'Unknown',
      type: university.type,
      website: university.website,
      additionalDetails: {
        established: additionalDetails.established || additionalDetails.establishedYear || undefined,
        faculties: university.faculties.length,
        students: additionalDetails.students || additionalDetails.studentCount || undefined,
      },
      faculties: university.faculties.map(faculty => ({
        id: faculty.id,
        name: faculty.name,
        departments: faculty.departments.length,
        courses: faculty.courses.length
      })),
      sampleCourses: university.faculties.flatMap(f => f.courses).slice(0, 5)
    };

    res.json({
      success: true,
      university: transformedUniversity,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ University details fetch error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch university details',
      details: error.message,
      university: null,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
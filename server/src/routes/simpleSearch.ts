// server/src/routes/simpleSearch.ts - Phase 3 Real Implementation
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

// Flexible eligibility checking function
async function filterEligibleCourses(courses: any[], userQualifications: any): Promise<any[]> {
  const eligibleCourses: any[] = [];

  // Handle null or undefined userQualifications
  if (!userQualifications) {
    console.log('⚠️ No user qualifications provided, returning all courses');
    return courses.map(course => ({
      ...course,
      eligibilityScore: 0,
      maxScore: 0,
      eligibilityPercentage: 0
    }));
  }

  for (const course of courses) {
    let eligibilityScore = 0;
    let maxScore = 0;
    let isEligible = true;

    // Check if course has requirements
    if (course.requirements) {
      const requirements = course.requirements;

      // 1. Check minimum qualification requirement (MANDATORY)
      if (requirements.minRequirement) {
        maxScore += 10;
        if (userQualifications.maxQualification === 'OL' && requirements.minRequirement === 'ALPass') {
          isEligible = false; // OL students cannot apply for AL courses
        } else if (userQualifications.maxQualification === 'AL' && requirements.minRequirement === 'Graduate') {
          isEligible = false; // AL students cannot apply for Graduate courses
        } else {
          eligibilityScore += 10; // Meets minimum requirement
        }
      }

      // 1.5. Check basic grade requirements (MANDATORY - exclude S and F grades)
      if (isEligible && userQualifications.alResults && userQualifications.alResults.length > 0) {
        const hasFailingGrades = userQualifications.alResults.some((result: any) => 
          result.grade === 'S' || result.grade === 'F'
        );
        if (hasFailingGrades) {
          isEligible = false; // Students with S or F grades are not eligible for university courses
        }
      }

      // 2. Check stream requirements (STRICT - must match stream to be eligible)
      if (isEligible && userQualifications.maxQualification === 'AL' && requirements.stream && requirements.stream.length > 0) {
        maxScore += 20;
        const userStream = userQualifications.alResults ? determineStreamFromSubjects(userQualifications.alResults) : null;
        
        // Check if user has explicitly selected a stream (from stream selection)
        const userSelectedStream = userQualifications.selectedStreamId;
        
        if (userStream) {
          // User has subjects that determine a stream
          if (requirements.stream.includes(userStream)) {
            eligibilityScore += 20; // Perfect stream match
          } else {
            isEligible = false; // Different stream - exclude this course
          }
        } else if (userSelectedStream) {
          // User has selected a stream but no subjects (or subjects don't determine stream)
          if (requirements.stream.includes(userSelectedStream)) {
            eligibilityScore += 20; // Perfect stream match
          } else {
            isEligible = false; // Different stream - exclude this course
          }
        } else {
          // No stream information at all - show all courses
          eligibilityScore += 10;
        }
      }

      // 3. Check subject requirements (FLEXIBLE - more subjects = better match)
      if (isEligible && requirements.ruleSubjectBasket && userQualifications.alResults) {
        maxScore += 30;
        const userSubjectIds = userQualifications.alResults.map((r: any) => r.subjectId) || [];
        const subjectMatchScore = checkSubjectBasketRequirementsFlexible(requirements.ruleSubjectBasket, userSubjectIds);
        eligibilityScore += subjectMatchScore;
      }

      // 4. Check grade requirements (FLEXIBLE - better grades = better match)
      if (isEligible && requirements.ruleSubjectGrades && userQualifications.alResults) {
        maxScore += 20;
        const gradeMatchScore = checkGradeRequirementsFlexible(requirements.ruleSubjectGrades, userQualifications.alResults);
        eligibilityScore += gradeMatchScore;
      }

      // 5. Check OL grade requirements (FLEXIBLE)
      if (isEligible && requirements.ruleOLGrades && userQualifications.olResults) {
        maxScore += 10;
        const olMatchScore = checkOLGradeRequirementsFlexible(requirements.ruleOLGrades, userQualifications.olResults);
        eligibilityScore += olMatchScore;
      }

      // 6. Check Z-Score requirements (FLEXIBLE)
      if (isEligible && userQualifications.zScore && course.zscore) {
        maxScore += 10;
        const zScoreMatch = checkZScoreRequirements(course.zscore, userQualifications.zScore);
        eligibilityScore += zScoreMatch;
      }
    }

    // Calculate eligibility percentage
    const eligibilityPercentage = maxScore > 0 ? (eligibilityScore / maxScore) * 100 : 100;

    // Show courses with at least 30% eligibility or if no requirements
    if (isEligible && (eligibilityPercentage >= 30 || maxScore === 0)) {
      eligibleCourses.push({
        ...course,
        eligibilityScore: eligibilityScore,
        maxScore: maxScore,
        eligibilityPercentage: Math.round(eligibilityPercentage)
      });
    }
  }

  // Sort by eligibility percentage (highest first)
  return eligibleCourses.sort((a, b) => b.eligibilityPercentage - a.eligibilityPercentage);
}

// Determine stream from AL subjects (FLEXIBLE)
function determineStreamFromSubjects(alResults: any[]): number | null {
  if (!alResults || alResults.length === 0) return null;

  const subjectIds = alResults.map(r => r.subjectId).sort();
  
  // Define stream mappings based on subject combinations
  const streamMappings: { [key: string]: number } = {
    // Physical Science Stream (4)
    '1,2,3': 4, // Physics, Chemistry, Mathematics
    '1,2,6': 4, // Physics, Chemistry, Combined Mathematics
    '1,2,7': 4, // Physics, Chemistry, Higher Mathematics
    '1,3,6': 4, // Physics, Mathematics, Combined Mathematics
    '1,3,7': 4, // Physics, Mathematics, Higher Mathematics
    '2,3,6': 4, // Chemistry, Mathematics, Combined Mathematics
    '2,3,7': 4, // Chemistry, Mathematics, Higher Mathematics
    
    // Biological Science Stream (3) - Biology is the key indicator
    '1,2,5': 3, // Physics, Chemistry, Biology
    '2,4,5': 3, // Chemistry, Agricultural Science, Biology
    '4,5,6': 3, // Agricultural Science, Biology, Combined Mathematics
    '1,4,5': 3, // Physics, Agricultural Science, Biology
    '2,5,6': 3, // Chemistry, Biology, Combined Mathematics
    '1,5,6': 3, // Physics, Biology, Combined Mathematics
    '3,4,5': 3, // Mathematics, Agricultural Science, Biology
    '3,5,6': 3, // Mathematics, Biology, Combined Mathematics
    
    // Arts Stream (1) - Arts and Languages subjects
    '38,50,52': 1, // Art, Sinhala, English
    '38,50,51': 1, // Art, Sinhala, Tamil
    '38,51,52': 1, // Art, Tamil, English
    '17,18,21': 1, // Economics, Geography, History
    '17,18,22': 1, // Economics, Geography, History
    '17,18,23': 1, // Economics, Geography, History
    '26,27,28': 1, // Business Statistics, Business Studies, Accounting
    '8,9,10': 1, // Common General Test, General English, Civil Technology
    '3,8,9': 1, // Mathematics, Common General Test, General English
    '6,8,9': 1, // Combined Mathematics, Common General Test, General English
  };

  // Try exact match first
  const key = subjectIds.join(',');
  if (streamMappings[key]) {
    return streamMappings[key];
  }

  // Try partial matches for flexibility
  for (const [pattern, stream] of Object.entries(streamMappings)) {
    const patternSubjects = pattern.split(',').map(Number);
    const hasCommonSubjects = patternSubjects.some(subjectId => subjectIds.includes(subjectId));
    if (hasCommonSubjects) {
      return stream;
    }
  }

  return null;
}

// Check subject basket requirements (FLEXIBLE - returns score)
function checkSubjectBasketRequirementsFlexible(subjectBaskets: any[], userSubjectIds: number[]): number {
  if (!subjectBaskets || subjectBaskets.length === 0) return 30; // No requirements = full score
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const basket of subjectBaskets) {
    if (basket.subjects && Array.isArray(basket.subjects)) {
      const requiredSubjects = basket.subjects;
      const basketScore = requiredSubjects.length * 10; // Each subject worth 10 points
      maxScore += basketScore;
      
      // Calculate how many required subjects the user has
      const userHasSubjects = requiredSubjects.filter((subjectId: number) => 
        userSubjectIds.includes(subjectId)
      );
      
      // Partial credit for partial matches
      const matchPercentage = userHasSubjects.length / requiredSubjects.length;
      totalScore += basketScore * matchPercentage;
    }
  }
  
  return maxScore > 0 ? totalScore : 30; // Default score if no requirements
}

// Check grade requirements (FLEXIBLE - returns score)
function checkGradeRequirementsFlexible(ruleSubjectGrades: any, alResults: any[]): number {
  if (!ruleSubjectGrades || !alResults) return 20; // No requirements = full score
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const rule of ruleSubjectGrades) {
    if (rule.subjectId && rule.grade) {
      maxScore += 10;
      const userSubject = alResults.find(r => r.subjectId === rule.subjectId);
      if (userSubject && meetsGradeRequirement(userSubject.grade, rule.grade)) {
        totalScore += 10; // Perfect grade match
      } else if (userSubject) {
        totalScore += 5; // Partial credit for having the subject
      }
    }
  }
  
  return maxScore > 0 ? totalScore : 20; // Default score if no requirements
}

// Check OL grade requirements (FLEXIBLE - returns score)
function checkOLGradeRequirementsFlexible(ruleOLGrades: any, olResults: any[]): number {
  if (!ruleOLGrades || !olResults) return 10; // No requirements = full score
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const rule of ruleOLGrades) {
    if (rule.subjectId && rule.minimumGrade) {
      maxScore += 5;
      const userSubject = olResults.find(r => r.subjectId === rule.subjectId);
      if (userSubject && meetsGradeRequirement(userSubject.grade, rule.minimumGrade)) {
        totalScore += 5; // Perfect grade match
      } else if (userSubject) {
        totalScore += 2; // Partial credit for having the subject
      }
    }
  }
  
  return maxScore > 0 ? totalScore : 10; // Default score if no requirements
}

// Check Z-Score requirements (FLEXIBLE - returns score)
function checkZScoreRequirements(courseZScore: any, userZScore: number): number {
  if (!courseZScore || !userZScore) return 10; // No requirements = full score
  
  const cutoff = courseZScore['2024']?.cutoff || courseZScore.cutoff;
  if (!cutoff) return 10; // No cutoff = full score
  
  if (userZScore >= cutoff) {
    return 10; // Meets requirement
  } else if (userZScore >= cutoff * 0.8) {
    return 7; // Close to requirement
  } else if (userZScore >= cutoff * 0.6) {
    return 5; // Somewhat close
  } else {
    return 2; // Far from requirement but still show
  }
}

// Check OL grade requirements
function checkOLGradeRequirements(ruleOLGrades: any, olResults: any[]): boolean {
  // This is a simplified implementation
  // You may need to implement more complex logic based on your OL requirements
  if (!ruleOLGrades || !olResults) return true;

  // Check if user has required OL subjects with minimum grades
  for (const rule of ruleOLGrades) {
    if (rule.subjectId && rule.minimumGrade) {
      const userSubject = olResults.find(r => r.subjectId === rule.subjectId);
      if (!userSubject || !meetsGradeRequirement(userSubject.grade, rule.minimumGrade)) {
        return false;
      }
    }
  }
  return true;
}

// Check if grade meets requirement
function meetsGradeRequirement(userGrade: string, requiredGrade: string): boolean {
  // Grade order: A (best) > B > C > S > F (worst)
  const gradeOrder = ['A', 'B', 'C', 'S', 'F'];
  const userIndex = gradeOrder.indexOf(userGrade);
  const requiredIndex = gradeOrder.indexOf(requiredGrade);
  
  // If either grade is not found, return false (fail)
  if (userIndex === -1 || requiredIndex === -1) return false;
  
  // User meets requirement if their grade is better than or equal to required grade
  return userIndex <= requiredIndex;
}

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

          // Test database connection first
          try {
            await prisma.$queryRaw`SELECT 1`;
            console.log('✅ Database connection is working');
          } catch (dbError) {
            console.error('❌ Database connection failed:', dbError);
            throw new Error('Database connection failed');
          }

          const page = pagination.page || 1;
          const limit = Math.min(pagination.limit || 10, 1000); // Max 1000 results to show all courses
          const skip = (page - 1) * limit;

          console.log('🔍 Real Simple Search Request:');
          console.log(`   Query: "${query}"`);
          console.log(`   User Qualifications:`, userQualifications);
          console.log(`   User Qualifications type:`, typeof userQualifications);
          console.log(`   User Qualifications is null:`, userQualifications === null);
          console.log(`   User Qualifications is undefined:`, userQualifications === undefined);
          console.log(`   Filters:`, filters);
          console.log(`   Page: ${page}, Limit: ${limit}`);

    // Build search conditions for Prisma
    const searchConditions: any = {
      isActive: true, // Only active courses
    };

    // Add eligibility filtering based on user qualifications
    if (userQualifications) {
      console.log('🎯 Filtering courses based on user qualifications:', userQualifications);
      
      // Filter by study mode preference if available
      if (userQualifications.preferredStudyMode) {
        searchConditions.studyMode = userQualifications.preferredStudyMode;
      }
      
      // Filter by fee type preference if available
      if (userQualifications.preferredFeeType) {
        searchConditions.feeType = userQualifications.preferredFeeType;
      }
      
      // Filter by university type preference if available
      if (userQualifications.preferredUniversityType) {
        searchConditions.university = {
          ...searchConditions.university,
          type: userQualifications.preferredUniversityType
        };
      }
    }

    // Text search across multiple fields
    if (query && query.trim()) {
      const textSearchConditions = [
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
      
      // Combine text search with existing OR conditions
      if (searchConditions.OR) {
        searchConditions.AND = [
          { OR: searchConditions.OR },
          { OR: textSearchConditions }
        ];
        delete searchConditions.OR;
      } else {
        searchConditions.OR = textSearchConditions;
      }
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

    // Get total count for pagination (will be updated after eligibility filtering)
    let totalCourses = await prisma.course.count({
      where: searchConditions
    });

    // Fetch courses with related data
    console.log('🔍 Executing database query with conditions:', JSON.stringify(searchConditions, null, 2));
    
    const allCourses = await prisma.course.findMany({
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
        },
        requirements: true
      },
      orderBy: [
        // Prioritize government universities (free education)
        { university: { type: 'asc' } },
        // Then sort by course name
        { name: 'asc' }
      ]
    });
    
    console.log(`📊 Database query returned ${allCourses.length} courses`);

    // Filter courses based on eligibility if user qualifications are provided
    let eligibleCourses = allCourses;
    if (userQualifications) {
      console.log('🔍 Checking eligibility for', allCourses.length, 'courses');
      try {
        eligibleCourses = await filterEligibleCourses(allCourses, userQualifications);
        console.log('✅ Found', eligibleCourses.length, 'eligible courses');
      } catch (eligibilityError) {
        console.error('❌ Error in eligibility filtering:', eligibilityError);
        // Fallback: return all courses without eligibility filtering
        eligibleCourses = allCourses.map(course => ({
          ...course,
          eligibilityScore: 0,
          maxScore: 0,
          eligibilityPercentage: 0
        }));
        console.log('⚠️ Using fallback: returning all courses without eligibility filtering');
      }
    }

    // Update total count to reflect eligible courses
    totalCourses = eligibleCourses.length;

    // For simple search, return all eligible courses (no server-side pagination)
    // The frontend will handle pagination if needed
    const courses = eligibleCourses;

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
      medium: course.medium,
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
      website: course.university.website,
      // Eligibility information (using type assertion to handle dynamic properties)
      eligibilityScore: (course as any).eligibilityScore,
      maxScore: (course as any).maxScore,
      eligibilityPercentage: (course as any).eligibilityPercentage,
      requirements: course.requirements
    }));

    console.log(`✅ Found ${transformedCourses.length} courses (${totalCourses} total)`);

    // Debug: Log course IDs for debugging
    console.log('🔍 Course IDs returned:', transformedCourses.map(c => c.id));
    console.log('🔍 Total courses in database:', totalCourses);
    console.log('🔍 Limit applied:', limit);
    console.log('🔍 Skip applied:', skip);

    // Return successful response
    res.json({
      success: true,
      courses: transformedCourses,
      total: totalCourses,
      query: query,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: totalCourses,
        resultsPerPage: totalCourses,
        hasNextPage: false,
        hasPrevPage: false
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
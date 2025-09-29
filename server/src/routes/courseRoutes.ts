// server/src/routes/courseRoutes.ts - Fixed TypeScript errors
import express from "express";
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { authenticateToken, requireAdminOrManagerOrEditor } from "../middleware/authMiddleware";
import { createAuditInfo, updateAuditInfo, deleteAuditInfo, getUserEmailFromRequest } from "../utils/auditUtils";

const router = express.Router();

/**
 * Add a course to valid combinations based on its stream requirements
 */
async function addCourseToValidCombinations(courseId: number, streamIds: number[]): Promise<void> {
  try {
    console.log(`🔄 Adding course ${courseId} to valid combinations for streams:`, streamIds);
    
    // Get all valid combinations for the course's required streams
    const validCombinations = await prisma.validCombination.findMany({
      where: {
        streamId: { in: streamIds },
      },
      select: { id: true, courseId: true },
    });

    console.log(`📋 Found ${validCombinations.length} valid combinations to update`);

    let updatedCount = 0;
    
    // Update each combination to include this course ID
    for (const combination of validCombinations) {
      const currentCourseIds = combination.courseId || [];
      
      // Only add if not already present
      if (!currentCourseIds.includes(courseId)) {
        const updatedCourseIds = [...currentCourseIds, courseId];
        
        await prisma.validCombination.update({
          where: { id: combination.id },
          data: {
            courseId: updatedCourseIds,
            auditInfo: {
              updatedBy: "system-course-creation",
              updatedAt: new Date().toISOString(),
              courseAdded: courseId,
            },
          },
        });
        
        updatedCount++;
        console.log(`   ✅ Added course ${courseId} to combination ${combination.id}`);
      } else {
        console.log(`   ℹ️  Course ${courseId} already exists in combination ${combination.id}`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} valid combinations`);
  } catch (error) {
    console.error('❌ Error adding course to valid combinations:', error);
    throw error;
  }
}

/**
 * Remove a course from all valid combinations
 */
async function removeCourseFromValidCombinations(courseId: number): Promise<void> {
  try {
    console.log(`🔄 Removing course ${courseId} from all valid combinations...`);
    
    // Get all combinations that contain this course
    const validCombinations = await prisma.validCombination.findMany({
      where: {
        courseId: { has: courseId },
      },
      select: { id: true, courseId: true },
    });

    console.log(`📋 Found ${validCombinations.length} valid combinations to update`);

    let updatedCount = 0;
    
    // Update each combination to remove this course ID
    for (const combination of validCombinations) {
      const currentCourseIds = combination.courseId || [];
      const updatedCourseIds = currentCourseIds.filter(id => id !== courseId);
      
      await prisma.validCombination.update({
        where: { id: combination.id },
        data: {
          courseId: updatedCourseIds,
          auditInfo: {
            updatedBy: "system-course-removal",
            updatedAt: new Date().toISOString(),
            courseRemoved: courseId,
          },
        },
      });
      
      updatedCount++;
      console.log(`   ✅ Removed course ${courseId} from combination ${combination.id}`);
    }
    
    console.log(`✅ Successfully updated ${updatedCount} valid combinations`);
  } catch (error) {
    console.error('❌ Error removing course from valid combinations:', error);
    throw error;
  }
}

// GET /api/courses - Get courses with university recognition criteria
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      limit = "20",
      offset = "0",
      search,
      status = "all",
      universityId,
      facultyId,
      departmentId,
      courseType,
      feeType,
      studyMode,
      frameworkId,
      recognitionCriteria,
    } = req.query;

    const whereClause: any = {};

    // Editor permission filtering - editors can only see courses from their assigned universities
    if (req.user?.role === 'editor') {
      console.log('🔍 Editor accessing courses - checking permissions for user:', req.user.id);
      
      const editorPermissions = await prisma.userPermission.findMany({
        where: {
          userId: req.user.id,
          permissionType: 'university_editor',
          isActive: true
        },
        select: {
          permissionDetails: true
        }
      });

      const assignedUniversityIds = editorPermissions
        .map(p => (p.permissionDetails as any)?.universityId)
        .filter(id => id !== undefined);

      console.log('🔍 Editor assigned university IDs:', assignedUniversityIds);

      // Debug specific course ID 35
      if (assignedUniversityIds.length > 0) {
        const course35 = await prisma.course.findUnique({
          where: { id: 35 },
          include: {
            university: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        });
        console.log('🔍 Course ID 35 details:', course35);
        console.log('🔍 Course 35 university ID:', course35?.universityId);
        console.log('🔍 Course 35 university name:', course35?.university?.name);
        console.log('🔍 Course 35 in assigned universities:', assignedUniversityIds.includes(course35?.universityId || 0));
      }

      if (assignedUniversityIds.length === 0) {
        // Editor has no assigned universities, return empty result
        return res.json({
          success: true,
          data: [],
          total: 0,
          message: "No assigned universities found"
        });
      }

      // Filter courses to only show those from assigned universities
      whereClause.universityId = {
        in: assignedUniversityIds
      };
    }

    // Status filter: all | active | inactive
    if (status && status !== "all") {
      whereClause.isActive = status === "active";
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { courseCode: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (universityId)
      whereClause.universityId = parseInt(universityId as string);
    if (facultyId) whereClause.facultyId = parseInt(facultyId as string);
    if (departmentId)
      whereClause.departmentId = parseInt(departmentId as string);
    if (courseType && courseType !== "all") whereClause.courseType = courseType;
    if (feeType && feeType !== "all") whereClause.feeType = feeType;
    if (studyMode && studyMode !== "all") whereClause.studyMode = studyMode;
    if (frameworkId) whereClause.frameworkId = parseInt(frameworkId as string);

    // Filter by university recognition criteria
    if (recognitionCriteria && recognitionCriteria !== "all") {
      whereClause.university = {
        recognitionCriteria: {
          has: recognitionCriteria as string,
        },
      };
    }

    // Debug: Log the whereClause for editors
    if (req.user?.role === 'editor') {
      console.log('🔍 WhereClause for editor:', JSON.stringify(whereClause, null, 2));
    }

    // Use any type to bypass TypeScript issues with new fields
    const courses: any[] = await prisma.course.findMany({
      where: whereClause,
      include: {
        university: true,
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        framework: {
          select: {
            id: true,
            type: true,
            level: true,
            qualificationCategory: true,
          },
        },
        requirements: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { name: "asc" },
    });

    // Debug: Log raw course data for editors
    if (req.user?.role === 'editor') {
      console.log('🔍 Raw courses from database:', courses.length);
      console.log('🔍 Raw course IDs:', courses.map(c => c.id));
      const course35Raw = courses.find(c => c.id === 35);
      if (course35Raw) {
        console.log('🔍 Course 35 raw data:', course35Raw);
      } else {
        console.log('🔍 Course 35 NOT found in raw database results');
      }
    }

    // Transform courses to include new fields
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      description: course.description,
      isActive: course.isActive,
      universityId: course.universityId,
      facultyId: course.facultyId,
      departmentId: course.departmentId,
      courseType: course.courseType,
      studyMode: course.studyMode,
      feeType: course.feeType,
      feeAmount: course.feeAmount,
      durationMonths: course.durationMonths,
      medium: course.medium,

      // Related data with new fields
      university: {
        id: course.university?.id,
        name: course.university?.name,
        type: course.university?.type,
        recognitionCriteria: course.university?.recognitionCriteria || [],
      },
      faculty: course.faculty,
      department: course.department,
      framework: course.framework,

      // Requirements with new OL grades field
      requirements: course.requirements
        ? {
            id: course.requirements.id,
            minRequirement: course.requirements.minRequirement,
            stream: course.requirements.stream,
            ruleSubjectBasket: course.requirements.ruleSubjectBasket,
            ruleSubjectGrades: course.requirements.ruleSubjectGrades,
            ruleOLGrades: course.requirements.ruleOLGrades,
          }
        : null,
    }));

    // Debug: Check if course 35 is in the results
    const course35InResults = transformedCourses.find(c => c.id === 35);
    console.log('🔍 Course 35 in results:', course35InResults ? 'YES' : 'NO');
    if (course35InResults) {
      console.log('🔍 Course 35 details in results:', course35InResults);
    }

    // Debug: Log all course IDs for editor
    if (req.user?.role === 'editor') {
      console.log('🔍 All course IDs returned for editor:', transformedCourses.map(c => c.id));
      console.log('🔍 Course names returned for editor:', transformedCourses.map(c => ({ id: c.id, name: c.name, universityId: c.universityId, universityName: c.university?.name })));
    }

    res.json({
      success: true,
      data: transformedCourses,
      count: transformedCourses.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: transformedCourses.length === parseInt(limit as string),
      },
    });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
      details: error.message,
    });
  }
});

// GET /api/courses/:id - Get single course with complete details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    // Use any type to handle new fields
    const course: any = await prisma.course.findUnique({
      where: {
        id: courseId,
        isActive: true,
      },
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
        requirements: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Transform course data with new fields
    const transformedCourse = {
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      description: course.description,
      specialisation: course.specialisation,
      universityId: course.universityId,
      facultyId: course.facultyId,
      departmentId: course.departmentId,
      subfieldId: course.subfieldId,
      careerId: course.careerId,
      studyMode: course.studyMode,
      courseType: course.courseType,
      feeType: course.feeType,
      feeAmount: course.feeAmount,
      durationMonths: course.durationMonths,
      medium: course.medium,
      zscore: course.zscore,
      additionalDetails: course.additionalDetails,
      materialIds: course.materialIds,

      // Related data with new fields
      university: {
        id: course.university?.id,
        name: course.university?.name,
        type: course.university?.type,
        website: course.university?.website,
        recognitionCriteria: course.university?.recognitionCriteria || [],
        imageUrl: course.university?.imageUrl,
        logoUrl: course.university?.logoUrl,
      },
      faculty: course.faculty,
      department: course.department,
      framework: course.framework,

      // Requirements with new OL grades field
      requirements: course.requirements
        ? {
            id: course.requirements.id,
            minRequirement: course.requirements.minRequirement,
            stream: course.requirements.stream,
            ruleSubjectBasket: course.requirements.ruleSubjectBasket,
            ruleSubjectGrades: course.requirements.ruleSubjectGrades,
            ruleOLGrades: course.requirements.ruleOLGrades,
          }
        : null,

      // Materials - fetch separately using materialIds
      materials: course.materialIds && course.materialIds.length > 0 ? 
        await prisma.courseMaterial.findMany({
          where: {
            id: { in: course.materialIds }
          },
          select: {
            id: true,
            materialType: true,
            fileName: true,
            filePath: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
          }
        }) : [],
    };

    res.json({
      success: true,
      data: transformedCourse,
    });
  } catch (error: any) {
    console.error("Error fetching course details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course details",
      details: error.message,
    });
  }
});

// POST /api/courses - Create course with requirements including OL grades
router.post("/", authenticateToken, requireAdminOrManagerOrEditor, async (req: Request, res: Response) => {
  try {
    const {
      name,
      courseCode,
      courseUrl,
      specialisation,
      universityId,
      facultyId,
      departmentId,
      subfieldId,
      careerId,
      courseType,
      studyMode,
      feeType,
      feeAmount,
      frameworkId,
      durationMonths,
      medium,
      description,
      zscore,
      additionalDetails,
      materialIds,
      requirements,
    } = req.body;

    // Faculty and department are now optional - provide defaults if not selected
    let finalFacultyId = (facultyId && facultyId !== 0 && facultyId !== null) ? Number(facultyId) : null;
    let finalDepartmentId = (departmentId && departmentId !== 0 && departmentId !== null) ? Number(departmentId) : null;

    // If faculty/department not provided, get defaults from the university
    if (!finalFacultyId || !finalDepartmentId) {
      const university = await prisma.university.findUnique({
        where: { id: Number(universityId) },
        include: {
          faculties: {
            take: 1,
            where: { isActive: true }
          }
        }
      });

      if (university?.faculties?.[0]) {
        finalFacultyId = finalFacultyId || university.faculties[0].id;
        
        // Get first department from the faculty
        const faculty = await prisma.faculty.findUnique({
          where: { id: finalFacultyId },
          include: {
            departments: {
              take: 1,
              where: { isActive: true }
            }
          }
        });
        
        finalDepartmentId = finalDepartmentId || faculty?.departments?.[0]?.id || 1;
      } else {
        // Fallback to first available faculty and department
        const firstFaculty = await prisma.faculty.findFirst({ where: { isActive: true } });
        const firstDepartment = await prisma.department.findFirst({ where: { isActive: true } });
        
        finalFacultyId = finalFacultyId || firstFaculty?.id || 1;
        finalDepartmentId = finalDepartmentId || firstDepartment?.id || 1;
      }
    }

    // Permission check for editors - they can only create courses for assigned universities
    if (req.user?.role === 'editor') {
      console.log('🔍 Editor permission check for course creation');
      console.log('🔍 Editor user ID:', req.user.id);
      console.log('🔍 Course university ID:', universityId);
      
      const editorPermissions = await prisma.userPermission.findMany({
        where: {
          userId: req.user.id,
          permissionType: 'university_editor'
        },
        select: {
          permissionDetails: true
        }
      });

      console.log('🔍 Editor permissions found:', editorPermissions);

      const assignedUniversityIds = editorPermissions
        .map(p => (p.permissionDetails as any)?.universityId)
        .filter(id => id !== undefined);

      console.log('🔍 Assigned university IDs:', assignedUniversityIds);
      console.log('🔍 University ID match:', assignedUniversityIds.includes(universityId));

      if (!assignedUniversityIds.includes(universityId)) {
        console.log('❌ Permission denied - course university not in assigned list');
        return res.status(403).json({
          success: false,
          error: 'You can only create courses for your assigned universities'
        });
      }
      
      console.log('✅ Permission granted - course university is in assigned list');
    }

    // Debug: Log materialIds to identify the issue
    if (materialIds && Array.isArray(materialIds)) {
      console.log('🔍 Material IDs received:', materialIds);
      console.log('🔍 Material IDs types:', materialIds.map(id => typeof id));
      console.log('🔍 Material IDs values:', materialIds.map(id => Number(id)));
    }

    // Validate required fields
    if (!name || !universityId || !courseUrl || !frameworkId) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: name, universityId, courseUrl, frameworkId",
      });
    }

    // Faculty and department are now optional - we'll handle them if provided
    // No validation required for these fields

    // Create audit info with actual user email
    const userEmail = getUserEmailFromRequest(req);
    const auditInfo = createAuditInfo(userEmail);

    // Verify the framework exists
    const framework = await prisma.framework.findUnique({
      where: { id: frameworkId },
    });

    if (!framework) {
      return res.status(400).json({
        success: false,
        error: "Invalid framework ID",
      });
    }

    // Generate course code if not provided or check if provided one is unique
    let finalCourseCode = courseCode;
    
    if (!finalCourseCode) {
      // Generate a unique course code based on course name and university
      const university = await prisma.university.findUnique({
        where: { id: Number(universityId) },
        select: { name: true }
      });
      
      const universityAbbr = university?.name.split(' ').map((word: string) => word.charAt(0)).join('').substring(0, 3).toUpperCase() || 'UNI';
      const courseAbbr = name.split(' ').map((word: string) => word.charAt(0)).join('').substring(0, 4).toUpperCase();
      const year = new Date().getFullYear();
      
      let counter = 1;
      do {
        finalCourseCode = `${courseAbbr}-${year}-${counter}`;
        const existingCourse = await prisma.course.findUnique({
          where: { courseCode: finalCourseCode }
        });
        if (!existingCourse) break;
        counter++;
      } while (counter < 1000); // Safety limit
      
      console.log(`🔧 Generated course code: ${finalCourseCode}`);
    } else {
      // Check if provided course code already exists
      const existingCourse = await prisma.course.findUnique({
        where: { courseCode: finalCourseCode },
        select: { id: true, name: true, courseCode: true }
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          error: `Course code '${finalCourseCode}' already exists. Please use a different course code.`,
          details: {
            existingCourse: {
              id: existingCourse.id,
              name: existingCourse.name,
              courseCode: existingCourse.courseCode
            }
          }
        });
      }
    }

    // Create course using relation connects to satisfy Prisma required relations
    const course: any = await prisma.course.create({
      data: {
        name,
        courseCode: finalCourseCode,
        courseUrl,
        specialisation: specialisation || [],
        // Relations via connect
        university: { connect: { id: Number(universityId) } },
        framework: { connect: { id: Number(frameworkId) } },
        // Use final faculty and department values (with defaults if not provided)
        faculty: { connect: { id: finalFacultyId } },
        department: { connect: { id: finalDepartmentId } },

        // Scalars/arrays
        subfieldId: subfieldId || [],
        careerId: careerId || [],
        courseType: courseType || "internal",
        studyMode: studyMode || "fulltime",
        feeType: feeType || "free",
        feeAmount: feeAmount ? parseFloat(feeAmount) : null,
        durationMonths: durationMonths ? parseInt(durationMonths) : null,
        medium: medium || [],
        description: description || null,
        // zscore can arrive as string (JSON) or already parsed object
        zscore:
          zscore === undefined || zscore === null
            ? undefined
            : typeof zscore === "string"
            ? (() => {
                try {
                  return JSON.parse(zscore);
                } catch {
                  return undefined;
                }
              })()
            : zscore,
        additionalDetails: additionalDetails || {},
        materialIds: [], // Will be updated after course creation
        auditInfo: auditInfo as any,
      },
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
      },
    });

    // Create course requirements if provided (including new ruleOLGrades)
    console.log('🔍 Requirements check:', {
      hasRequirements: !!requirements,
      hasStreams: !!(requirements && requirements.streams),
      streamsLength: requirements?.streams?.length || 0,
      hasSubjectBaskets: !!(requirements && requirements.subjectBaskets),
      basketsLength: requirements?.subjectBaskets?.length || 0
    });

    if (
      requirements &&
      ((requirements.streams && requirements.streams.length > 0) ||
       (requirements.subjectBaskets && requirements.subjectBaskets.length > 0))
    ) {
      console.log('✅ Creating course requirements for course ID:', course.id);
      
      const requirementAuditInfo = createAuditInfo(userEmail);

      const ruleSubjectBasket =
        requirements.subjectBaskets?.length > 0
          ? requirements.subjectBaskets
          : undefined;

      const ruleSubjectGrades =
        requirements.customRules || requirements.basketRelationships?.length > 0
          ? {
              customRules: requirements.customRules || [],
              basketRelationships: requirements.basketRelationships || [],
            }
          : undefined;

      // Handle OL grades rule
      const ruleOLGrades = requirements.ruleOLGrades
        ? requirements.ruleOLGrades
        : undefined;

      // Use raw SQL to create requirement with ruleOLGrades
      console.log('📝 Inserting course requirement with data:', {
        courseId: course.id,
        minRequirement: requirements.minRequirement || "OLPass",
        streams: requirements.streams,
        hasRuleSubjectBasket: !!ruleSubjectBasket,
        hasRuleSubjectGrades: !!ruleSubjectGrades,
        hasRuleOLGrades: !!ruleOLGrades
      });

      const createdRequirement: any = await prisma.$queryRaw`
        INSERT INTO course_requirements (
          course_id, min_requirement, stream, "rule_subjectBasket", 
          "rule_subjectGrades", "rule_OLGrades", audit_info, is_active
        ) VALUES (
          ${course.id}, ${requirements.minRequirement || "OLPass"}, ${
        requirements.streams || []
      }::int[],
          ${
            ruleSubjectBasket ? JSON.stringify(ruleSubjectBasket) : null
          }::jsonb,
          ${
            ruleSubjectGrades ? JSON.stringify(ruleSubjectGrades) : null
          }::jsonb,
          ${ruleOLGrades ? JSON.stringify(ruleOLGrades) : null}::jsonb,
          ${JSON.stringify(requirementAuditInfo)}::jsonb, true
        ) RETURNING requirement_id
      `;

      const newRequirementId = Array.isArray(createdRequirement)
        ? createdRequirement[0]?.requirement_id
        : createdRequirement?.requirement_id;

      if (newRequirementId) {
        // Link requirement back to course via requirement_id column
        await prisma.course.update({
          where: { id: course.id },
          data: { requirementId: Number(newRequirementId) },
        });
        console.log('✅ Course requirements created and linked (requirementId):', newRequirementId);
      } else {
        console.warn('⚠️ Requirement created but requirement_id not returned. Linking skipped.');
      }
    } else {
      console.log('❌ Requirements not created - condition failed:', {
        hasRequirements: !!requirements,
        hasStreams: !!(requirements && requirements.streams),
        streamsLength: requirements?.streams?.length || 0
      });
    }

    // Add course to valid combinations based on stream requirements
    if (requirements && requirements.streams && requirements.streams.length > 0) {
      console.log('🔄 Adding course to valid combinations...');
      try {
        await addCourseToValidCombinations(course.id, requirements.streams);
        console.log('✅ Course added to valid combinations successfully');
      } catch (comboError) {
        console.error('⚠️ Error adding course to valid combinations:', comboError);
        // Don't fail the course creation if combination linking fails
      }
    } else {
      console.log('⚠️ No stream requirements found, skipping valid combination linking');
    }

    // Link materials to course if materialIds are provided
    if (Array.isArray(materialIds) && materialIds.length > 0) {
      console.log('🔗 Linking materials to course:', materialIds);
      console.log('🔗 Course ID:', course.id);
      
      // Filter and validate material IDs
      const validMaterialIds = materialIds.filter(id => Number.isInteger(Number(id)) && Number(id) > 0 && Number(id) <= 2147483647);
      console.log('🔗 Valid material IDs:', validMaterialIds);
      
      try {
        // Update course with material IDs
        const updatedCourse = await prisma.course.update({
          where: { id: course.id },
          data: {
            materialIds: validMaterialIds
          }
        });

        console.log('✅ Materials linked to course successfully');
        console.log('✅ Updated course materialIds:', updatedCourse.materialIds);
      } catch (materialError) {
        console.error('⚠️ Error linking materials to course:', materialError);
        // Don't fail the course creation if material linking fails
      }
    } else {
      console.log('ℹ️ No material IDs provided or empty array');
    }

    // Fetch the final course with updated material IDs
    const finalCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
      }
    });

    res.status(201).json({
      success: true,
      data: finalCourse,
      message: "Course created successfully",
    });
  } catch (error: any) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: error.message,
    });
  }
});

// PUT /api/courses/:id - Update course including requirements with OL grades
router.put("/:id", authenticateToken, requireAdminOrManagerOrEditor, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    const updateData = { ...req.body };

    // Remove id and other fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.university;
    delete updateData.faculty;
    delete updateData.department;
    delete updateData.framework;

    // Get current course
    const currentCourse: any = await prisma.course.findUnique({
      where: { id: courseId },
      include: { requirements: true },
    });

    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Permission check for editors - they can only edit courses for assigned universities
    if (req.user?.role === 'editor') {
      console.log('🔍 Editor permission check for course:', courseId);
      console.log('🔍 Editor user ID:', req.user.id);
      
      const editorPermissions = await prisma.userPermission.findMany({
        where: {
          userId: req.user.id,
          permissionType: 'university_editor'
        },
        select: {
          permissionDetails: true
        }
      });

      console.log('🔍 Editor permissions found:', editorPermissions);

      const assignedUniversityIds = editorPermissions
        .map(p => (p.permissionDetails as any)?.universityId)
        .filter(id => id !== undefined);

      console.log('🔍 Assigned university IDs:', assignedUniversityIds);
      console.log('🔍 Course university ID:', currentCourse.universityId);
      console.log('🔍 University ID match:', assignedUniversityIds.includes(currentCourse.universityId));

      if (!assignedUniversityIds.includes(currentCourse.universityId)) {
        console.log('❌ Permission denied - course university not in assigned list');
        return res.status(403).json({
          success: false,
          error: 'You can only edit courses for your assigned universities'
        });
      }
      
      console.log('✅ Permission granted - course university is in assigned list');
    }

    // Update audit info with actual user email
    const userEmail = getUserEmailFromRequest(req);
    const currentAuditInfo = currentCourse.auditInfo as any;
    updateData.auditInfo = updateAuditInfo(currentAuditInfo, userEmail) as any;

    // Handle requirements update (including new ruleOLGrades)
    const { requirements: newRequirements, ...courseUpdateData } = updateData;

    // Update course
    const updatedCourse: any = await prisma.course.update({
      where: { id: courseId },
      data: courseUpdateData,
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
        requirements: true,
      },
    });

    // Update or create requirements if provided
    if (newRequirements) {
      const requirementAuditInfo = createAuditInfo(userEmail);

      const ruleSubjectBasket =
        newRequirements.subjectBaskets?.length > 0
          ? newRequirements.subjectBaskets
          : null;

      const ruleSubjectGrades = newRequirements.customRules
        ? {
            customRules: newRequirements.customRules,
            basketRelationships: newRequirements.basketRelationships || [],
          }
        : null;

      const ruleOLGrades = newRequirements.ruleOLGrades || null;

      if (currentCourse.requirements) {
        // Update existing requirement using raw SQL
        await prisma.$queryRaw`
          UPDATE course_requirements SET
            min_requirement = ${newRequirements.minRequirement || "OLPass"},
            stream = ${newRequirements.streams || []}::int[],
            "rule_subjectBasket" = ${
              ruleSubjectBasket ? JSON.stringify(ruleSubjectBasket) : null
            }::jsonb,
            "rule_subjectGrades" = ${
              ruleSubjectGrades ? JSON.stringify(ruleSubjectGrades) : null
            }::jsonb,
            "rule_OLGrades" = ${
              ruleOLGrades ? JSON.stringify(ruleOLGrades) : null
            }::jsonb,
            audit_info = ${JSON.stringify(requirementAuditInfo)}::jsonb
          WHERE requirement_id = ${currentCourse.requirements.id}
        `;
      } else {
        // Create new requirement using raw SQL and link it back
        const createdRequirement: any = await prisma.$queryRaw`
          INSERT INTO course_requirements (
            course_id, min_requirement, stream, "rule_subjectBasket", 
            "rule_subjectGrades", "rule_OLGrades", audit_info, is_active
          ) VALUES (
            ${courseId}, ${newRequirements.minRequirement || "OLPass"}, ${
          newRequirements.streams || []
        }::int[],
            ${
              ruleSubjectBasket ? JSON.stringify(ruleSubjectBasket) : null
            }::jsonb,
            ${
              ruleSubjectGrades ? JSON.stringify(ruleSubjectGrades) : null
            }::jsonb,
            ${ruleOLGrades ? JSON.stringify(ruleOLGrades) : null}::jsonb,
            ${JSON.stringify(requirementAuditInfo)}::jsonb, true
          ) RETURNING requirement_id
        `;

        const newRequirementId = Array.isArray(createdRequirement)
          ? createdRequirement[0]?.requirement_id
          : createdRequirement?.requirement_id;

        if (newRequirementId) {
          await prisma.course.update({
            where: { id: courseId },
            data: { requirementId: Number(newRequirementId) },
          });
        }
      }
    }

    // Handle valid combinations when isActive status changes
    if (updateData.hasOwnProperty('isActive') && updateData.isActive !== currentCourse.isActive) {
      console.log(`🔄 Course ${courseId} isActive changed from ${currentCourse.isActive} to ${updateData.isActive}`);
      
      if (updateData.isActive === false) {
        // Course is being deactivated, remove from valid combinations
        try {
          await removeCourseFromValidCombinations(courseId);
          console.log('✅ Course removed from valid combinations due to deactivation');
        } catch (comboError) {
          console.error('⚠️ Error removing course from valid combinations:', comboError);
        }
      } else if (updateData.isActive === true && currentCourse.requirements?.stream) {
        // Course is being activated, add to valid combinations if it has stream requirements
        try {
          await addCourseToValidCombinations(courseId, currentCourse.requirements.stream);
          console.log('✅ Course added to valid combinations due to activation');
        } catch (comboError) {
          console.error('⚠️ Error adding course to valid combinations:', comboError);
        }
      }
    }

    res.json({
      success: true,
      data: updatedCourse,
      message: "Course updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update course",
      details: error.message,
    });
  }
});

// DELETE /api/courses/:id - Soft delete course
router.delete("/:id", authenticateToken, requireAdminOrManagerOrEditor, async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    // Get current course
    const currentCourse: any = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Permission check for editors - they can only delete courses for assigned universities
    if (req.user?.role === 'editor') {
      const editorPermissions = await prisma.userPermission.findMany({
        where: {
          userId: req.user.id,
          permissionType: 'university_editor'
        },
        select: {
          permissionDetails: true
        }
      });

      const assignedUniversityIds = editorPermissions
        .map(p => (p.permissionDetails as any)?.universityId)
        .filter(id => id !== undefined);

      if (!assignedUniversityIds.includes(currentCourse.universityId)) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete courses for your assigned universities'
        });
      }
    }

    // Update audit info for soft delete
    const currentAuditInfo = currentCourse.auditInfo as any;
    const userEmail = getUserEmailFromRequest(req);
    const updatedAuditInfo = deleteAuditInfo(currentAuditInfo, userEmail);

    // Soft delete by setting isActive to false
    await prisma.course.update({
      where: { id: courseId },
      data: {
        isActive: false,
        auditInfo: updatedAuditInfo as any,
      },
    });

    // Remove course from valid combinations
    try {
      await removeCourseFromValidCombinations(courseId);
      console.log('✅ Course removed from valid combinations successfully');
    } catch (comboError) {
      console.error('⚠️ Error removing course from valid combinations:', comboError);
      // Don't fail the deletion if combination removal fails
    }

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete course",
      details: error.message,
    });
  }
});

// GET /api/courses/search/by-recognition - Search courses by university recognition criteria
router.get("/search/by-recognition", async (req: Request, res: Response) => {
  try {
    const { criteria, limit = "20" } = req.query;

    if (!criteria) {
      return res.status(400).json({
        success: false,
        error: "Recognition criteria is required",
      });
    }

    // Use raw SQL to bypass TypeScript issues with recognitionCriteria
    const courses: any[] = await prisma.$queryRaw`
  SELECT 
    c.course_id as id, 
    c.name, 
    c.course_code as "courseCode", 
    c.course_url as "courseUrl", 
    c.description,
    json_build_object(
      'id', u.university_id,
      'name', u.name,
      'type', u.type,
      'recognitionCriteria', u.recognition_criteria
    ) as university,
    json_build_object(
      'id', f.faculty_id,
      'name', f.name
    ) as faculty,
    json_build_object(
      'id', d.department_id,
      'name', d.name
    ) as department
  FROM courses c
  JOIN universities u ON c.university_id = u.university_id
  LEFT JOIN faculties f ON c.faculty_id = f.faculty_id
  LEFT JOIN departments d ON c.department_id = d.department_id
  WHERE c.is_active = true 
    AND u.is_active = true
    AND ${criteria}::text = ANY(u.recognition_criteria)
  ORDER BY c.name ASC
  LIMIT ${parseInt(limit as string)}
`;

    // Transform courses to include recognition criteria
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      description: course.description,
      university: {
        id: course.university?.id,
        name: course.university?.name,
        type: course.university?.type,
        recognitionCriteria: course.university?.recognitionCriteria || [],
      },
      faculty: course.faculty,
      department: course.department,
    }));

    res.json({
      success: true,
      data: transformedCourses,
      count: transformedCourses.length,
      searchCriteria: criteria,
    });
  } catch (error: any) {
    console.error("Error searching courses by recognition criteria:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search courses",
      details: error.message,
    });
  }
});

export default router;
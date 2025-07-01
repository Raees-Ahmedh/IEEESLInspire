import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

// GET /api/courses - Fetch all courses with enhanced filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { institute, courseType, frameworkType, frameworkLevel, feeType, search } = req.query;

    const whereClause: any = {
      isActive: true
    };

    // Apply filters
    if (institute) {
      whereClause.university = {
        name: {
          contains: institute as string,
          mode: 'insensitive'
        }
      };
    }

    if (courseType) {
      whereClause.courseType = courseType;
    }

    if (frameworkLevel) {
      whereClause.frameworkLevel = parseInt(frameworkLevel as string);
    }

    if (feeType) {
      whereClause.feeType = feeType;
    }

    // Framework type filter (requires joining with frameworks table)
    if (frameworkType) {
      whereClause.framework = {
        type: frameworkType
      };
    }

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          courseCode: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          university: {
            name: {
              contains: search as string,
              mode: 'insensitive'
            }
          }
        },
        {
          specialisation: {
            hasSome: [(search as string)]
          }
        }
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
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
        },
        framework: {
          select: {
            id: true,
            type: true,
            qualificationCategory: true,
            level: true,
            year: true
          }
        },
        requirements: {
          include: {
            // Add relations for requirements if needed
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Transform the data to include proper audit info structure
    const transformedCourses = courses.map(course => ({
      ...course,
      auditInfo: course.auditInfo as {
        createdAt: string;
        createdBy: string;
        updatedAt: string;
        updatedBy: string;
      }
    }));

    res.json({
      success: true,
      data: transformedCourses,
      count: transformedCourses.length
    });

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
      details: error.message
    });
  }
});

// GET /api/courses/:id - Fetch single course with full details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isActive: true
      },
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
        requirements: true,
        materials: true // Include course materials
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error: any) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course',
      details: error.message
    });
  }
});

// POST /api/courses - Create new course with enhanced features
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      courseCode,
      courseUrl,
      specialisation,
      universityId,
      facultyId,
      departmentId,
      courseType,
      studyMode,
      feeType,
      feeAmount,
      frameworkType,
      frameworkLevel,
      durationMonths,
      description,
      zscore,
      intakeCount,
      syllabus,
      dynamicFields,
      courseMaterials,
      careerPathways,
      requirements
    } = req.body;

    // Validate required fields
    if (!name || !universityId || !courseUrl || !frameworkType || !frameworkLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, universityId, courseUrl, frameworkType, frameworkLevel'
      });
    }

    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: 'admin@system.com', // Get from auth context
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@system.com'
    };

    // First, find or create framework
    let framework = await prisma.framework.findFirst({
      where: {
        type: frameworkType,
        level: frameworkLevel
      }
    });

    if (!framework) {
      framework = await prisma.framework.create({
        data: {
          type: frameworkType,
          qualificationCategory: frameworkType === 'SLQF' ? 'Degree' : 'Certificate',
          level: frameworkLevel,
          year: new Date().getFullYear()
        }
      });
    }

    // Prepare additional details
    const additionalDetails = {
      intakeCount,
      syllabus,
      dynamicFields: dynamicFields || [],
      courseMaterials: courseMaterials || [],
      careerPathways: careerPathways || []
    };

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        courseCode: courseCode || null,
        courseUrl,
        specialisation: specialisation || [],
        universityId,
        facultyId: facultyId || null,
        departmentId: departmentId || null,
        subfieldId: [], // Add logic for subfields
        careerId: [], // Add logic for career paths
        courseType: courseType || 'internal',
        studyMode: studyMode || 'fulltime',
        feeType: feeType || 'free',
        feeAmount: feeAmount ? parseFloat(feeAmount) : null,
        frameworkLevel: framework.id,
        durationMonths: durationMonths ? parseInt(durationMonths) : null,
        description: description || null,
        zscore: zscore ? JSON.parse(zscore) : undefined,
        additionalDetails,
        auditInfo
      },
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true
      }
    });

    // Create course requirements if provided
    if (requirements && requirements.streams && requirements.streams.length > 0) {
      const requirementAuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: 'admin@system.com',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin@system.com'
      };

      const ruleSubjectBasket = requirements.subjectBaskets?.length > 0 ? requirements.subjectBaskets : undefined;
      const ruleSubjectGrades = (requirements.customRules || requirements.basketRelationships?.length > 0) ? {
        basketRelationships: requirements.basketRelationships || [],
        customRules: requirements.customRules || ''
      } : undefined;

      const courseRequirement = await prisma.courseRequirement.create({
        data: {
          courseId: course.id,
          minRequirement: requirements.minRequirement || 'ALPass',
          stream: requirements.streams.map((s: any) => s.id),
          ruleSubjectBasket,
          ruleSubjectGrades,
          auditInfo: requirementAuditInfo
        }
      });

      // Update course with requirement ID
      await prisma.course.update({
        where: { id: course.id },
        data: { requirementId: courseRequirement.id }
      });
    }

    // Create course materials if provided
    if (courseMaterials && courseMaterials.length > 0) {
      const materialsData = courseMaterials.map((material: any) => ({
        courseId: course.id,
        materialType: material.materialType,
        fileName: material.fileName,
        filePath: material.filePath,
        fileType: material.fileType || null,
        fileSize: material.fileSize || null,
        uploadedBy: 1, // Default admin user ID
        auditInfo
      }));

      await prisma.courseMaterial.createMany({
        data: materialsData
      });
    }

    // Create career pathways if provided
    if (careerPathways && careerPathways.length > 0) {
      const careerData = careerPathways.map((career: any) => ({
        jobTitle: career.jobTitle,
        industry: career.industry || null,
        description: career.description || null,
        salaryRange: career.salaryRange || null,
        auditInfo
      }));

      const createdCareers = await prisma.careerPathway.createMany({
        data: careerData,
        skipDuplicates: true
      });

      // Note: You might want to link careers to courses via a junction table
      // For now, we'll store career IDs in the course's careerId array
    }

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });

  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create course',
      details: error.message
    });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', async (req: Request, res: Response) => {
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
    const currentCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { auditInfo: true }
    });

    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Update audit info
    const currentAuditInfo = currentCourse.auditInfo as any;
    updateData.auditInfo = {
      ...currentAuditInfo,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@system.com' // Get from auth context
    };

    const course = await prisma.course.update({
      where: {
        id: courseId
      },
      data: updateData,
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true
      }
    });

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update course',
      details: error.message
    });
  }
});

// DELETE /api/courses/:id - Soft delete course
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);

    // Get current audit info
    const currentCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { auditInfo: true }
    });

    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const currentAuditInfo = currentCourse.auditInfo as any;

    await prisma.course.update({
      where: {
        id: courseId
      },
      data: {
        isActive: false,
        auditInfo: {
          ...currentAuditInfo,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin@system.com' // Get from auth context
        }
      }
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete course',
      details: error.message
    });
  }
});

export default router;

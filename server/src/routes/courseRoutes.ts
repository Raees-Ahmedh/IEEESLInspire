// server/src/routes/courseRoutes.ts - Fixed TypeScript errors
import express from "express";
import { Request, Response } from "express";
import { prisma } from "../config/database";

const router = express.Router();

// GET /api/courses - Get courses with university recognition criteria
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      limit = "20",
      offset = "0",
      search,
      universityId,
      facultyId,
      departmentId,
      courseType,
      feeType,
      studyMode,
      frameworkId,
      recognitionCriteria,
    } = req.query;

    const whereClause: any = { isActive: true };

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

    // Transform courses to include new fields
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      description: course.description,
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
router.post("/", async (req: Request, res: Response) => {
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

    // Validate required fields
    if (!name || !universityId || !courseUrl || !frameworkId) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: name, universityId, courseUrl, frameworkId",
      });
    }

    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: "admin@system.com",
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@system.com",
    };

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

    // Create course using any type to handle all fields
    const course: any = await prisma.course.create({
      data: {
        name,
        courseCode: courseCode || null,
        courseUrl,
        specialisation: specialisation || [],
        universityId,
        facultyId: facultyId || null,
        departmentId: departmentId || null,
        subfieldId: subfieldId || [],
        careerId: careerId || [],
        courseType: courseType || "internal",
        studyMode: studyMode || "fulltime",
        feeType: feeType || "free",
        feeAmount: feeAmount ? parseFloat(feeAmount) : null,
        frameworkId: frameworkId,
        durationMonths: durationMonths ? parseInt(durationMonths) : null,
        medium: medium || [],
        description: description || null,
        zscore: zscore ? JSON.parse(zscore) : undefined,
        additionalDetails: additionalDetails || {},
        materialIds: materialIds || [],
        auditInfo,
      },
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
      },
    });

    // Create course requirements if provided (including new ruleOLGrades)
    if (
      requirements &&
      requirements.streams &&
      requirements.streams.length > 0
    ) {
      const requirementAuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: "admin@system.com",
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@system.com",
      };

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
      await prisma.$queryRaw`
        INSERT INTO course_requirements (
          course_id, min_requirement, stream, rule_subjectBasket, 
          rule_subjectGrades, rule_OLGrades, audit_info, is_active
        ) VALUES (
          ${course.id}, ${requirements.minRequirement || "OLPass"}, ${
        requirements.streams
      }::int[],
          ${
            ruleSubjectBasket ? JSON.stringify(ruleSubjectBasket) : null
          }::jsonb,
          ${
            ruleSubjectGrades ? JSON.stringify(ruleSubjectGrades) : null
          }::jsonb,
          ${ruleOLGrades ? JSON.stringify(ruleOLGrades) : null}::jsonb,
          ${JSON.stringify(requirementAuditInfo)}::jsonb, true
        )
      `;
    }

    res.status(201).json({
      success: true,
      data: course,
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
router.put("/:id", async (req: Request, res: Response) => {
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

    // Update audit info
    const currentAuditInfo = currentCourse.auditInfo as any;
    updateData.auditInfo = {
      ...currentAuditInfo,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@system.com",
    };

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
      const requirementAuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: "admin@system.com",
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@system.com",
      };

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
            rule_subjectBasket = ${
              ruleSubjectBasket ? JSON.stringify(ruleSubjectBasket) : null
            }::jsonb,
            rule_subjectGrades = ${
              ruleSubjectGrades ? JSON.stringify(ruleSubjectGrades) : null
            }::jsonb,
            rule_OLGrades = ${
              ruleOLGrades ? JSON.stringify(ruleOLGrades) : null
            }::jsonb,
            audit_info = ${JSON.stringify(requirementAuditInfo)}::jsonb
          WHERE requirement_id = ${currentCourse.requirements.id}
        `;
      } else {
        // Create new requirement using raw SQL
        await prisma.$queryRaw`
          INSERT INTO course_requirements (
            course_id, min_requirement, stream, rule_subjectBasket, 
            rule_subjectGrades, rule_OLGrades, audit_info, is_active
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
          )
        `;
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
router.delete("/:id", async (req: Request, res: Response) => {
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

    // Update audit info for soft delete
    const currentAuditInfo = currentCourse.auditInfo as any;
    const updatedAuditInfo = {
      ...currentAuditInfo,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@system.com",
      deletedAt: new Date().toISOString(),
      deletedBy: "admin@system.com",
    };

    // Soft delete by setting isActive to false
    await prisma.course.update({
      where: { id: courseId },
      data: {
        isActive: false,
        auditInfo: updatedAuditInfo,
      },
    });

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

import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { addCourse, uploadCourseMaterial} from '../controllers/courseController';
import { authenticateToken, requireAdmin, requireAdminOrManager, requireAdminOrManagerOrEditor } from "../middleware/authMiddleware";

const router = express.Router();

// Type definitions for JSON fields
interface ProfileData {
  registrationDate?: string;
  registrationMethod?: string;
  university?: string;
  position?: string;
  department?: string;
  [key: string]: any;
}

interface AuditInfo {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  [key: string]: any;
}

// ======================== MANAGER MANAGEMENT ENDPOINTS (PROTECTED) ========================

// POST /api/admin/managers - Create new manager (Admin only)
router.post(
  "/managers",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Validation
      if (!email || !password || !firstName) {
        return res.status(400).json({
          success: false,
          error: "Email, password, and first name are required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Please provide a valid email address",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      console.log("👥 Creating new manager:", firstName, lastName);

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Audit info
      const auditInfo: AuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: (req as any).user?.email || "admin",
        updatedAt: new Date().toISOString(),
        updatedBy: (req as any).user?.email || "admin",
      };

      // Create manager user
      const newManager = await prisma.user.create({
        data: {
          userType: "manager",
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          role: "manager",
          profileData: {
            registrationDate: new Date().toISOString(),
            registrationMethod: "admin_created",
            position: "University Manager",
            department: "Academic Affairs",
          },
          isActive: true,
          auditInfo,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          profileData: true,
        },
      });

      console.log("✅ Manager created successfully:", newManager.id);

      res.status(201).json({
        success: true,
        data: {
          id: newManager.id.toString(),
          name: `${newManager.firstName} ${newManager.lastName || ""}`.trim(),
          email: newManager.email,
          isActive: newManager.isActive,
          role: newManager.role,
        },
        message: "Manager created successfully",
      });
    } catch (error: any) {
      console.error("❌ Error creating manager:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create manager",
        details: error.message,
      });
    }
  }
);

// GET /api/admin/managers - Get all managers (Admin only)
router.get(
  "/managers",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      console.log("👥 Fetching all managers...");

      const managers = await prisma.user.findMany({
        where: {
          role: "manager",
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          profileData: true,
          lastLogin: true,
          auditInfo: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      // Transform data for frontend
      const transformedManagers = managers.map(
        (manager: {
          id: number;
          email: string;
          firstName: string | null;
          lastName: string | null;
          phone: string | null;
          isActive: boolean;
          profileData: any;
          lastLogin: Date | null;
          auditInfo: any;
        }) => {
          const profileData = manager.profileData as ProfileData;
          const auditInfo = manager.auditInfo as AuditInfo;

          return {
            id: manager.id.toString(),
            name: `${manager.firstName} ${manager.lastName || ""}`.trim(),
            email: manager.email,
            university: "N/A",
            isActive: manager.isActive,
            createdAt: auditInfo?.createdAt || null,
            lastLogin: manager.lastLogin,
          };
        }
      );

      console.log(`✅ Found ${transformedManagers.length} managers`);

      res.json({
        success: true,
        data: transformedManagers,
        count: transformedManagers.length,
      });
    } catch (error: any) {
      console.error("❌ Error fetching managers:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch managers",
        details: error.message,
      });
    }
  }
);

// PUT /api/admin/managers/:id/toggle-status - Toggle manager active status (Admin only)
router.put(
  "/managers/:id/toggle-status",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const managerId = parseInt(req.params.id);

      if (isNaN(managerId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid manager ID",
        });
      }

      // Find the manager
      const manager = await prisma.user.findFirst({
        where: {
          id: managerId,
          role: "manager",
        },
      });

      if (!manager) {
        return res.status(404).json({
          success: false,
          error: "Manager not found",
        });
      }

      // Type-safe access to auditInfo
      const currentAuditInfo = manager.auditInfo as AuditInfo;
      const updatedAuditInfo = {
        ...(currentAuditInfo || {}),
        updatedAt: new Date().toISOString(),
        updatedBy: (req as any).user?.email || "admin",
      };

      // Toggle active status
      const updatedManager = await prisma.user.update({
        where: { id: managerId },
        data: {
          isActive: !manager.isActive,
          auditInfo: updatedAuditInfo,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          profileData: true,
        },
      });

      console.log(
        `✅ Manager ${updatedManager.isActive ? "activated" : "deactivated"}:`,
        updatedManager.email
      );

      res.json({
        success: true,
        data: {
          id: updatedManager.id.toString(),
          name: `${updatedManager.firstName} ${
            updatedManager.lastName || ""
          }`.trim(),
          email: updatedManager.email,
          isActive: updatedManager.isActive,
        },
        message: `Manager ${
          updatedManager.isActive ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error: any) {
      console.error("❌ Error toggling manager status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update manager status",
        details: error.message,
      });
    }
  }
);

// ======================== UNIVERSITY MANAGEMENT ENDPOINTS ========================

// GET /api/admin/universities - Get all universities with recognition criteria
router.get("/universities", async (req: Request, res: Response) => {
  try {
    const { limit = "50", search, type, recognitionCriteria } = req.query;

    const whereClause: any = { isActive: true };

    if (search) {
      whereClause.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    if (type && type !== "all") {
      whereClause.type = type;
    }

    // Filter by recognition criteria
    if (recognitionCriteria && recognitionCriteria !== "all") {
      whereClause.recognitionCriteria = {
        has: recognitionCriteria as string,
      };
    }

    // Use any type to bypass TypeScript issues
    const universities: any[] = await prisma.university.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            faculties: true,
            courses: true,
          },
        },
      },
      take: parseInt(limit as string),
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    const transformedUniversities = universities.map((uni: any) => ({
      id: uni.id,
      name: uni.name,
      type: uni.type,
      uniCode: uni.uniCode,
      address: uni.address,
      website: uni.website,
      recognitionCriteria: uni.recognitionCriteria || [],
      imageUrl: uni.imageUrl,
      logoUrl: uni.logoUrl,
      galleryImages: uni.galleryImages,
      additionalDetails: uni.additionalDetails,
      contactInfo: uni.contactInfo,
      facultiesCount: uni._count?.faculties || 0,
      coursesCount: uni._count?.courses || 0,
      isActive: uni.isActive,
      auditInfo: uni.auditInfo,
    }));

    res.json({
      success: true,
      data: transformedUniversities,
      count: transformedUniversities.length,
    });
  } catch (error: any) {
    console.error("Error fetching universities:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch universities",
      details: error.message,
    });
  }
});

// POST /api/admin/universities - Create university with recognition criteria
router.post(
  "/universities",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        type,
        uniCode,
        address,
        contactInfo,
        website,
        recognitionCriteria,
        imageUrl,
        logoUrl,
        galleryImages,
        additionalDetails,
      } = req.body;

      // Validation
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: "Name and type are required",
        });
      }

      const auditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: "admin@system.com",
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@system.com",
      };

      // Use raw query to create university with recognition criteria
      const university = await prisma.$queryRaw`
      INSERT INTO universities (
        name, type, uni_code, address, contact_info, website, 
        recognition_criteria, image_url, logo_url, gallery_images, 
        additional_details, audit_info, is_active
      ) VALUES (
        ${name}, ${type}, ${uniCode || null}, ${address || null},
        ${contactInfo ? JSON.stringify(contactInfo) : null}::jsonb,
        ${website || null}, ${recognitionCriteria || []}::text[],
        ${imageUrl || null}, ${logoUrl || null},
        ${galleryImages ? JSON.stringify(galleryImages) : null}::jsonb,
        ${additionalDetails ? JSON.stringify(additionalDetails) : null}::jsonb,
        ${JSON.stringify(auditInfo)}::jsonb, true
      ) RETURNING *
    `;

      res.status(201).json({
        success: true,
        data: university,
        message: "University created successfully",
      });
    } catch (error: any) {
      console.error("Error creating university:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create university",
        details: error.message,
      });
    }
  }
);

// PUT /api/admin/universities/:id - Update university with recognition criteria
router.put(
  "/universities/:id",
  authenticateToken,
  requireAdminOrManager,
  async (req: Request, res: Response) => {
    try {
      const universityId = parseInt(req.params.id);
      const updateData = { ...req.body };

      if (isNaN(universityId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid university ID",
        });
      }

      // Get current university
      const currentUniversity: any = await prisma.university.findUnique({
        where: { id: universityId },
      });

      if (!currentUniversity) {
        return res.status(404).json({
          success: false,
          error: "University not found",
        });
      }

      // Update audit info
      const currentAuditInfo = currentUniversity.auditInfo as any;
      updateData.auditInfo = {
        ...currentAuditInfo,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@system.com",
      };

      // Use raw query for update to handle recognition criteria
      const updatedUniversity = await prisma.$queryRaw`
      UPDATE universities SET
        name = COALESCE(${updateData.name}, name),
        type = COALESCE(${updateData.type}, type),
        uni_code = COALESCE(${updateData.uniCode}, uni_code),
        address = COALESCE(${updateData.address}, address),
        contact_info = COALESCE(${
          updateData.contactInfo ? JSON.stringify(updateData.contactInfo) : null
        }::jsonb, contact_info),
        website = COALESCE(${updateData.website}, website),
        recognition_criteria = COALESCE(${
          updateData.recognitionCriteria || []
        }::text[], recognition_criteria),
        image_url = COALESCE(${updateData.imageUrl}, image_url),
        logo_url = COALESCE(${updateData.logoUrl}, logo_url),
        gallery_images = COALESCE(${
          updateData.galleryImages
            ? JSON.stringify(updateData.galleryImages)
            : null
        }::jsonb, gallery_images),
        additional_details = COALESCE(${
          updateData.additionalDetails
            ? JSON.stringify(updateData.additionalDetails)
            : null
        }::jsonb, additional_details),
        audit_info = ${JSON.stringify(updateData.auditInfo)}::jsonb
      WHERE university_id = ${universityId}
      RETURNING *
    `;

      res.json({
        success: true,
        data: updatedUniversity,
        message: "University updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating university:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update university",
        details: error.message,
      });
    }
  }
);

// PUT /api/admin/universities/:id/images - Update university images
router.put(
  "/universities/:id/images",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const universityId = parseInt(req.params.id);
      const { imageUrl, logoUrl, galleryImages } = req.body;

      // Use raw query to update images
      const updatedUniversity = await prisma.$queryRaw`
      UPDATE universities SET
        image_url = ${imageUrl || null},
        logo_url = ${logoUrl || null},
        gallery_images = ${
          galleryImages ? JSON.stringify(galleryImages) : null
        }::jsonb,
        audit_info = jsonb_set(
          audit_info,
          '{updatedAt}',
          to_jsonb(${new Date().toISOString()}::text)
        )
      WHERE university_id = ${universityId}
      RETURNING university_id as id, name, image_url as "imageUrl", logo_url as "logoUrl", gallery_images as "galleryImages"
    `;

      console.log(`✅ Updated images for university: ${universityId}`);

      res.json({
        success: true,
        data: updatedUniversity,
        message: "University images updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Error updating university images:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update university images",
        details: error.message,
      });
    }
  }
);

// POST /api/admin/universities/bulk-update-images - Bulk update images
router.post(
  "/universities/bulk-update-images",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const updates = req.body.updates || [];

      const results = [];
      for (const update of updates) {
        try {
          const updatedUniversity = await prisma.$queryRaw`
          UPDATE universities SET
            image_url = ${update.imageUrl || null},
            logo_url = ${update.logoUrl || null},
            gallery_images = ${
              update.galleryImages ? JSON.stringify(update.galleryImages) : null
            }::jsonb
          WHERE name = ${update.name}
        `;
          results.push({ name: update.name, success: true });
        } catch (error: any) {
          results.push({
            name: update.name,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(
        `✅ Bulk updated images for ${
          results.filter((r) => r.success).length
        } universities`
      );

      res.json({
        success: true,
        data: results,
        message: "Bulk image update completed",
      });
    } catch (error: any) {
      console.error("❌ Error in bulk update:", error);
      res.status(500).json({
        success: false,
        error: "Failed to bulk update images",
        details: error.message,
      });
    }
  }
);

// ======================== COURSE REQUIREMENTS MANAGEMENT ========================

// GET /api/admin/course-requirements - Get all course requirements with OL grades
router.get("/course-requirements", async (req: Request, res: Response) => {
  try {
    const { limit = "50", courseId } = req.query;

    const whereClause: any = { isActive: true };

    if (courseId) {
      whereClause.courseId = parseInt(courseId as string);
    }

    // Use any type to handle ruleOLGrades
    const requirements: any[] = await prisma.courseRequirement.findMany({
      where: whereClause,
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            courseCode: true,
            university: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: parseInt(limit as string),
      orderBy: { id: "desc" },
    });

    // Transform to include ruleOLGrades
    const transformedRequirements = requirements.map((req: any) => ({
      id: req.id,
      courseId: req.courseId,
      minRequirement: req.minRequirement,
      stream: req.stream,
      ruleSubjectBasket: req.ruleSubjectBasket,
      ruleSubjectGrades: req.ruleSubjectGrades,
      ruleOLGrades: req.ruleOLGrades,
      isActive: req.isActive,
      courses: req.courses,
    }));

    res.json({
      success: true,
      data: transformedRequirements,
      count: transformedRequirements.length,
    });
  } catch (error: any) {
    console.error("Error fetching course requirements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course requirements",
      details: error.message,
    });
  }
});

// POST /api/admin/course-requirements - Create course requirement with OL grades
router.post(
  "/course-requirements",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const {
        courseId,
        minRequirement,
        stream,
        ruleSubjectBasket,
        ruleSubjectGrades,
        ruleOLGrades,
      } = req.body;

      // Validation
      if (!minRequirement || !stream || !Array.isArray(stream)) {
        return res.status(400).json({
          success: false,
          error: "minRequirement and stream array are required",
        });
      }

      const auditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: "admin@system.com",
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@system.com",
      };

      // Use raw query to create requirement with ruleOLGrades
      const requirement = await prisma.$queryRaw`
      INSERT INTO course_requirements (
        course_id, min_requirement, stream, rule_subjectBasket, 
        rule_subjectGrades, rule_OLGrades, audit_info, is_active
      ) VALUES (
        ${courseId || null}, ${minRequirement}, ${stream}::int[],
        ${ruleSubjectBasket ? JSON.stringify(ruleSubjectBasket) : null}::jsonb,
        ${ruleSubjectGrades ? JSON.stringify(ruleSubjectGrades) : null}::jsonb,
        ${ruleOLGrades ? JSON.stringify(ruleOLGrades) : null}::jsonb,
        ${JSON.stringify(auditInfo)}::jsonb, true
      ) RETURNING *
    `;

      res.status(201).json({
        success: true,
        data: requirement,
        message: "Course requirement created successfully",
      });
    } catch (error: any) {
      console.error("Error creating course requirement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create course requirement",
        details: error.message,
      });
    }
  }
);

// PUT /api/admin/course-requirements/:id - Update course requirement with OL grades
router.put(
  "/course-requirements/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const requirementId = parseInt(req.params.id);
      const updateData = { ...req.body };

      if (isNaN(requirementId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid requirement ID",
        });
      }

      // Get current requirement
      const currentRequirement: any = await prisma.courseRequirement.findUnique(
        {
          where: { id: requirementId },
        }
      );

      if (!currentRequirement) {
        return res.status(404).json({
          success: false,
          error: "Course requirement not found",
        });
      }

      // Update audit info
      const currentAuditInfo = currentRequirement.auditInfo as any;
      updateData.auditInfo = {
        ...currentAuditInfo,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@system.com",
      };

      // Use raw query for update
      const updatedRequirement = await prisma.$queryRaw`
      UPDATE course_requirements SET
        course_id = COALESCE(${updateData.courseId}, course_id),
        min_requirement = COALESCE(${
          updateData.minRequirement
        }, min_requirement),
        stream = COALESCE(${updateData.stream || []}::int[], stream),
        rule_subjectBasket = COALESCE(${
          updateData.ruleSubjectBasket
            ? JSON.stringify(updateData.ruleSubjectBasket)
            : null
        }::jsonb, rule_subjectBasket),
        rule_subjectGrades = COALESCE(${
          updateData.ruleSubjectGrades
            ? JSON.stringify(updateData.ruleSubjectGrades)
            : null
        }::jsonb, rule_subjectGrades),
        rule_OLGrades = COALESCE(${
          updateData.ruleOLGrades
            ? JSON.stringify(updateData.ruleOLGrades)
            : null
        }::jsonb, rule_OLGrades),
        audit_info = ${JSON.stringify(updateData.auditInfo)}::jsonb
      WHERE requirement_id = ${requirementId}
      RETURNING *
    `;

      res.json({
        success: true,
        data: updatedRequirement,
        message: "Course requirement updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating course requirement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update course requirement",
        details: error.message,
      });
    }
  }
);

// ======================== COURSE SEARCH AND MANAGEMENT ENDPOINTS ========================

// GET /api/admin/courses - Get all courses with filtering (Admin/Manager access)
router.get("/courses", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const {
      limit = "50",
      offset = "0",
      search,
      institute,
      courseType,
      frameworkType,
      frameworkLevel,
      feeType,
      studyMode,
      status = "all"
    } = req.query;

    const whereClause: any = {};

    // Status filter: all | active | inactive
    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { courseCode: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } }
      ];
    }

    // Institute filter
    if (institute) {
      whereClause.university = {
        name: { contains: institute as string, mode: "insensitive" }
      };
    }

    // Course type filter
    if (courseType) {
      whereClause.courseType = courseType;
    }

    // Framework type filter
    if (frameworkType) {
      whereClause.framework = {
        type: frameworkType
      };
    }

    // Framework level filter
    if (frameworkLevel) {
      whereClause.framework = {
        ...whereClause.framework,
        qualificationCategory: frameworkLevel
      };
    }

    // Fee type filter
    if (feeType) {
      whereClause.feeType = feeType;
    }

    // Study mode filter
    if (studyMode) {
      whereClause.studyMode = studyMode;
    }

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    console.log('🔍 Admin courses query:', { whereClause, limitNum, offsetNum });

    // First, let's check if there are any courses at all
    const totalCoursesCount = await prisma.course.count();
    console.log(`📊 Total courses in database: ${totalCoursesCount}`);

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
            level: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ],
      take: limitNum,
      skip: offsetNum
    });

    const totalCount = await prisma.course.count({ where: whereClause });

    console.log(`✅ Found ${courses.length} courses (total: ${totalCount})`);

    res.json({
      success: true,
      data: courses,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/courses/search - Search courses by name (FIXED - Complete functionality restored)
router.get("/courses/search", async (req: Request, res: Response) => {
  try {
    const { name, limit = 10 } = req.query;

    if (!name || (name as string).length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Search courses with comprehensive details for auto-fill functionality
    const courses = await prisma.course.findMany({
      where: {
        name: {
          contains: name as string,
          mode: "insensitive",
        },
        isActive: true,
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
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
      orderBy: { name: "asc" },
    });

    // Transform the response to include fields needed for auto-fill
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      description: course.description,
      specialisation: course.specialisation,
      universityId: course.universityId,
      facultyId: course.facultyId,
      departmentId: course.departmentId,
      studyMode: course.studyMode,
      courseType: course.courseType,
      frameworkId: course.frameworkId,
      feeType: course.feeType,
      feeAmount: course.feeAmount,
      durationMonths: course.durationMonths,
      medium: course.medium,
      zscore: course.zscore,
      subfieldId: course.subfieldId,
      careerId: course.careerId,
      materialIds: course.materialIds,
      additionalDetails: course.additionalDetails,

      // Related data for auto-fill
      university: course.university,
      faculty: course.faculty,
      department: course.department,
      framework: course.framework,
      requirements: course.requirements
        ? {
            id: course.requirements.id,
            minRequirement: course.requirements.minRequirement,
            stream: course.requirements.stream,
            ruleSubjectBasket: course.requirements.ruleSubjectBasket,
            ruleSubjectGrades: course.requirements.ruleSubjectGrades,
            ruleOLGrades: (course.requirements as any).ruleOLGrades,
          }
        : null,
    }));

    res.json({
      success: true,
      data: transformedCourses,
    });
  } catch (error: any) {
    console.error("Error searching courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search courses",
      details: error.message,
    });
  }
});

// GET /api/admin/courses/:id - Get full course details for editing (RESTORED complete functionality)
router.get("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    // Use any type for course to handle new fields
    const course: any = await prisma.course.findUnique({
      where: {
        id: courseId,
        // isActive: true,
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

    // Get career pathways by IDs (RESTORED)
    let careerPathways: Array<{
      id: number;
      jobTitle: string;
      industry: string | null;
      description: string | null;
      salaryRange: string | null;
    }> = [];

    if (course.careerId && course.careerId.length > 0) {
      careerPathways = await prisma.careerPathway.findMany({
        where: {
          id: { in: course.careerId },
          isActive: true,
        },
        select: {
          id: true,
          jobTitle: true,
          industry: true,
          description: true,
          salaryRange: true,
        },
      });
    }

    // Get course materials by IDs (RESTORED)
    let courseMaterials: Array<{
      id: number;
      materialType: string;
      fileName: string;
      filePath: string;
      fileType: string | null;
      fileSize: number | null;
    }> = [];

    if (course.materialIds && course.materialIds.length > 0) {
      courseMaterials = await prisma.courseMaterial.findMany({
        where: {
          id: { in: course.materialIds },
        },
        select: {
          id: true,
          materialType: true,
          fileName: true,
          filePath: true,
          fileType: true,
          fileSize: true,
        },
      });
    }

    // Get sub fields by IDs (RESTORED)
    let subFields: Array<{
      id: number;
      name: string;
      description: string | null;
      majorField: {
        id: number;
        name: string;
      };
    }> = [];

    let majorFields: Array<{
      id: number;
      name: string;
    }> = [];

    if (course.subfieldId && course.subfieldId.length > 0) {
      subFields = await prisma.subField.findMany({
        where: {
          id: { in: course.subfieldId },
          isActive: true,
        },
        include: {
          majorField: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Extract unique major fields from sub fields
      const majorFieldMap = new Map<number, { id: number; name: string }>();
      subFields.forEach((sf) => {
        if (sf.majorField) {
          majorFieldMap.set(sf.majorField.id, sf.majorField);
        }
      });
      majorFields = Array.from(majorFieldMap.values());
    }

    // Transform the data to include new fields (COMPLETE RESTORATION)
    const courseData = {
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      courseUrl: course.courseUrl,
      description: course.description,
      specialisation: course.specialisation,
      universityId: course.universityId,
      facultyId: course.facultyId,
      departmentId: course.departmentId,
      studyMode: course.studyMode,
      courseType: course.courseType,
      frameworkId: course.frameworkId,
      framework: course.framework,
      feeType: course.feeType,
      feeAmount: course.feeAmount,
      durationMonths: course.durationMonths,
      medium: course.medium,
      zscore: course.zscore,

      // Transform related data based on your schema (RESTORED)
      majorFieldIds: majorFields.map((mf) => mf.id),
      subFieldIds: course.subfieldId,
      careerId: course.careerId,
      materialIds: course.materialIds,

      // Requirements data with new OL grades field
      requirements: course.requirements
        ? {
            id: course.requirements.id,
            minRequirement: course.requirements.minRequirement,
            stream: course.requirements.stream,
            ruleSubjectBasket: course.requirements.ruleSubjectBasket,
            ruleSubjectGrades: course.requirements.ruleSubjectGrades,
            ruleOLGrades: course.requirements.ruleOLGrades, // NEW: Include OL grades rule
          }
        : null,

      // Additional details (JSON field from your schema)
      additionalDetails: course.additionalDetails || {},

      // Related models with new fields (RESTORED)
      university: {
        ...course.university,
        recognitionCriteria: course.university?.recognitionCriteria || [],
      },
      faculty: course.faculty,
      department: course.department,
      careerPathways: careerPathways, // RESTORED
      courseMaterials: courseMaterials, // RESTORED
      subFields: subFields, // RESTORED
      majorFields: majorFields, // RESTORED
    };

    res.json({
      success: true,
      data: courseData,
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

// ======================== PUBLIC/LESS RESTRICTED ENDPOINTS ========================

// GET /api/admin/faculties - Get faculties by university
router.get("/faculties", async (req: Request, res: Response) => {
  try {
    const { universityId } = req.query;

    const whereClause: any = { isActive: true };
    if (universityId) {
      whereClause.universityId = parseInt(universityId as string);
    }

    const faculties = await prisma.faculty.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        universityId: true,
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: faculties,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch faculties",
      details: error.message,
    });
  }
});

// GET /api/admin/departments - Get departments by faculty
router.get("/departments", async (req: Request, res: Response) => {
  try {
    const { facultyId } = req.query;

    const whereClause: any = { isActive: true };
    if (facultyId) {
      whereClause.facultyId = parseInt(facultyId as string);
    }

    const departments = await prisma.department.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        facultyId: true,
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
      details: error.message,
    });
  }
});

// GET /api/admin/subjects - Get subjects by level
router.get("/subjects", async (req: Request, res: Response) => {
  try {
    const { level } = req.query;

    const whereClause: any = { isActive: true };
    if (level) {
      whereClause.level = (level as string).toUpperCase();
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
      },
      orderBy: [{ level: "asc" }, { code: "asc" }],
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch subjects",
      details: error.message,
    });
  }
});

// GET /api/admin/streams - Get all streams
router.get("/streams", async (req: Request, res: Response) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: streams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch streams",
      details: error.message,
    });
  }
});

// GET /api/admin/frameworks - Get frameworks by type
router.get("/frameworks", async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const whereClause: any = {};
    if (type) {
      whereClause.type = type as string;
    }

    const frameworks = await prisma.framework.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        qualificationCategory: true,
        level: true,
        year: true,
      },
      orderBy: [{ type: "asc" }, { level: "asc" }],
    });

    res.json({
      success: true,
      data: frameworks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch frameworks",
      details: error.message,
    });
  }
});

// POST /api/admin/frameworks - Create a new framework
router.post(
  "/frameworks",
  authenticateToken,
  requireAdminOrManager,
  async (req: Request, res: Response) => {
    try {
      const { type, qualificationCategory, level, year } = req.body as {
        type?: "SLQF" | "NVQ";
        qualificationCategory?: string;
        level?: number;
        year?: number;
      };

      if (!type || (type !== "SLQF" && type !== "NVQ")) {
        return res.status(400).json({
          success: false,
          error: "Invalid framework type. Must be 'SLQF' or 'NVQ'",
        });
      }
      if (!qualificationCategory || !qualificationCategory.trim()) {
        return res.status(400).json({
          success: false,
          error: "Qualification category is required",
        });
      }
      if (typeof level !== "number" || level < 1 || level > 10) {
        return res.status(400).json({
          success: false,
          error: "Level must be a number between 1 and 10",
        });
      }

      const framework = await prisma.framework.create({
        data: {
          type: type as any,
          qualificationCategory: qualificationCategory.trim(),
          level,
          year: typeof year === "number" ? year : null,
        },
        select: {
          id: true,
          type: true,
          qualificationCategory: true,
          level: true,
          year: true,
        },
      });

      return res.status(201).json({ success: true, data: framework });
    } catch (error: any) {
      console.error("Error creating framework:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create framework",
        details: error.message,
      });
    }
  }
);

// PUT /api/admin/frameworks/:id - Update an existing framework
router.put(
  "/frameworks/:id",
  authenticateToken,
  requireAdminOrManager,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid framework ID" });
      }

      const { type, qualificationCategory, level, year } = req.body as {
        type?: "SLQF" | "NVQ";
        qualificationCategory?: string;
        level?: number;
        year?: number | null;
      };

      const data: any = {};
      if (type) {
        if (type !== "SLQF" && type !== "NVQ") {
          return res.status(400).json({ success: false, error: "Invalid framework type" });
        }
        data.type = type as any;
      }
      if (qualificationCategory !== undefined) {
        if (!qualificationCategory || !qualificationCategory.trim()) {
          return res.status(400).json({ success: false, error: "Qualification category is required" });
        }
        data.qualificationCategory = qualificationCategory.trim();
      }
      if (level !== undefined) {
        if (typeof level !== "number" || level < 1 || level > 10) {
          return res.status(400).json({ success: false, error: "Level must be 1-10" });
        }
        data.level = level;
      }
      if (year !== undefined) {
        data.year = typeof year === "number" ? year : null;
      }

      const updated = await prisma.framework.update({
        where: { id },
        data,
        select: { id: true, type: true, qualificationCategory: true, level: true, year: true }
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error("Error updating framework:", error);
      return res.status(500).json({ success: false, error: "Failed to update framework", details: error.message });
    }
  }
);

// Get unique framework types
router.get("/framework-types", async (req: Request, res: Response) => {
  try {
    const uniqueTypes = await prisma.framework.findMany({
      select: { type: true },
      distinct: ["type"],
      orderBy: { type: "asc" },
    });

    res.json({
      success: true,
      data: uniqueTypes.map((f: { type: string }) => f.type),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch framework types",
      details: error.message,
    });
  }
});

// Get levels by framework type
router.get("/framework-levels/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    const frameworks = await prisma.framework.findMany({
      where: { type: type as "SLQF" | "NVQ" },
      select: { id: true, level: true },
      orderBy: { level: "asc" },
    });

    res.json({
      success: true,
      data: frameworks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch framework levels",
      details: error.message,
    });
  }
});

// GET /api/admin/major-fields - Fetch all major fields
router.get("/major-fields", async (req: Request, res: Response) => {
  try {
    console.log("📚 Fetching major fields...");

    const majorFields = await prisma.majorField.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        auditInfo: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`✅ Found ${majorFields.length} major fields`);

    res.json({
      success: true,
      data: majorFields,
      count: majorFields.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching major fields:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch major fields",
      details: error.message,
    });
  }
});

// GET /api/admin/sub-fields - Fetch all sub fields
router.get("/sub-fields", async (req: Request, res: Response) => {
  try {
    console.log("📋 Fetching sub fields...");

    const subFields = await prisma.subField.findMany({
      where: {
        isActive: true,
      },
      include: {
        majorField: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ majorId: "asc" }, { name: "asc" }],
    });

    const transformedSubFields = subFields.map(
      (subField: {
        id: number;
        name: string;
        majorId: number;
        description: string | null;
        isActive: boolean;
        auditInfo: any;
        majorField: {
          id: number;
          name: string;
        };
      }) => ({
        id: subField.id,
        name: subField.name,
        majorId: subField.majorId,
        description: subField.description,
        majorField: subField.majorField,
        isActive: subField.isActive,
        auditInfo: subField.auditInfo,
      })
    );

    console.log(`✅ Found ${transformedSubFields.length} sub fields`);

    res.json({
      success: true,
      data: transformedSubFields,
      count: transformedSubFields.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching sub fields:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch sub fields",
      details: error.message,
    });
  }
});

// GET /api/admin/sub-fields/by-major/:majorId - Fetch sub fields for specific major
router.get(
  "/sub-fields/by-major/:majorId",
  async (req: Request, res: Response) => {
    try {
      const majorId = parseInt(req.params.majorId);

      if (isNaN(majorId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid major field ID",
        });
      }

      console.log(`📋 Fetching sub fields for major ID: ${majorId}`);

      const subFields = await prisma.subField.findMany({
        where: {
          majorId: majorId,
          isActive: true,
        },
        include: {
          majorField: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      console.log(
        `✅ Found ${subFields.length} sub fields for major ID ${majorId}`
      );

      res.json({
        success: true,
        data: subFields,
        count: subFields.length,
      });
    } catch (error: any) {
      console.error("❌ Error fetching sub fields by major:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sub fields for major",
        details: error.message,
      });
    }
  }
);

// ======================== PROTECTED CREATION/MODIFICATION ENDPOINTS ========================

// GET /api/admin/career-pathways/search - Search career pathways
router.get("/career-pathways/search", async (req: Request, res: Response) => {
  try {
    const { jobTitle, industry } = req.query;

    let whereClause: any = { isActive: true };

    if (jobTitle) {
      whereClause.jobTitle = {
        contains: jobTitle as string,
        mode: "insensitive",
      };
    }

    if (industry) {
      whereClause.industry = {
        contains: industry as string,
        mode: "insensitive",
      };
    }

    const careerPathways = await prisma.careerPathway.findMany({
      where: whereClause,
      select: {
        id: true,
        jobTitle: true,
        industry: true,
        description: true,
        salaryRange: true,
      },
      take: 10,
      orderBy: { jobTitle: "asc" },
    });

    res.json({
      success: true,
      data: careerPathways,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to search career pathways",
      details: error.message,
    });
  }
});

// GET /api/admin/career-pathways - Get all career pathways
router.get("/career-pathways", async (req: Request, res: Response) => {
  try {
    const careerPathways = await prisma.careerPathway.findMany({
      where: { isActive: true },
      orderBy: { jobTitle: "asc" },
    });

    res.json({
      success: true,
      data: careerPathways,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch career pathways",
      details: error.message,
    });
  }
});

// POST /api/admin/career-pathways - Create career pathway
router.post(
  "/career-pathways",
  authenticateToken,
  requireAdminOrManagerOrEditor,
  async (req: Request, res: Response) => {
    try {
      const { jobTitle, industry, description, salaryRange } = req.body;

      if (!jobTitle) {
        return res.status(400).json({
          success: false,
          error: "Job title is required",
        });
      }

      const auditInfo: AuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: (req as any).user?.email || "admin",
        updatedAt: new Date().toISOString(),
        updatedBy: (req as any).user?.email || "admin",
      };

      const careerPathway = await prisma.careerPathway.create({
        data: {
          jobTitle,
          industry: industry || null,
          description: description || null,
          salaryRange: salaryRange || null,
          auditInfo,
        },
      });

      res.status(201).json({
        success: true,
        data: careerPathway,
        message: "Career pathway created successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to create career pathway",
        details: error.message,
      });
    }
  }
);

// POST /api/admin/major-fields - Create new major field
router.post(
  "/major-fields",
  authenticateToken,
  requireAdminOrManager,
  async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Major field name is required",
        });
      }

      console.log("📚 Creating new major field:", name);

      const auditInfo: AuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: (req as any).user?.email || "admin",
        updatedAt: new Date().toISOString(),
        updatedBy: (req as any).user?.email || "admin",
      };

      const majorField = await prisma.majorField.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          isActive: true,
          auditInfo,
        },
      });

      console.log("✅ Major field created successfully:", majorField.id);

      res.status(201).json({
        success: true,
        data: majorField,
        message: "Major field created successfully",
      });
    } catch (error: any) {
      console.error("❌ Error creating major field:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create major field",
        details: error.message,
      });
    }
  }
);

// POST /api/admin/sub-fields - Create new sub field
router.post(
  "/sub-fields",
  authenticateToken,
  requireAdminOrManager,
  async (req: Request, res: Response) => {
    try {
      const { name, majorId, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Sub field name is required",
        });
      }

      if (!majorId || isNaN(parseInt(majorId))) {
        return res.status(400).json({
          success: false,
          error: "Valid major field ID is required",
        });
      }

      console.log("📋 Creating new sub field:", name, "for major ID:", majorId);

      const majorField = await prisma.majorField.findUnique({
        where: { id: parseInt(majorId) },
      });

      if (!majorField) {
        return res.status(404).json({
          success: false,
          error: "Major field not found",
        });
      }

      const auditInfo: AuditInfo = {
        createdAt: new Date().toISOString(),
        createdBy: (req as any).user?.email || "admin",
        updatedAt: new Date().toISOString(),
        updatedBy: (req as any).user?.email || "admin",
      };

      const subField = await prisma.subField.create({
        data: {
          name: name.trim(),
          majorId: parseInt(majorId),
          description: description?.trim() || null,
          isActive: true,
          auditInfo,
        },
        include: {
          majorField: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      console.log("✅ Sub field created successfully:", subField.id);

      res.status(201).json({
        success: true,
        data: subField,
        message: "Sub field created successfully",
      });
    } catch (error: any) {
      console.error("❌ Error creating sub field:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create sub field",
        details: error.message,
      });
    }
  }
);

// PUT /api/admin/major-fields/:id - Update major field
router.put(
  "/major-fields/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, isActive } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid major field ID",
        });
      }

      console.log("📚 Updating major field ID:", id);

      const existingMajorField = await prisma.majorField.findUnique({
        where: { id },
      });

      if (!existingMajorField) {
        return res.status(404).json({
          success: false,
          error: "Major field not found",
        });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined)
        updateData.description = description?.trim() || null;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      // Update audit info
      const currentAuditInfo = existingMajorField.auditInfo as AuditInfo;
      updateData.auditInfo = {
        ...currentAuditInfo,
        updatedAt: new Date().toISOString(),
        updatedBy: (req as any).user?.email || "admin",
      };

      const updatedMajorField = await prisma.majorField.update({
        where: { id },
        data: updateData,
      });

      console.log("✅ Major field updated successfully:", id);

      res.json({
        success: true,
        data: updatedMajorField,
        message: "Major field updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Error updating major field:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update major field",
        details: error.message,
      });
    }
  }
);

// DELETE /api/admin/major-fields/:id - Delete (soft delete) major field
router.delete(
  "/major-fields/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid major field ID",
        });
      }

      console.log("🗑️ Soft deleting major field ID:", id);

      const existingMajorField = await prisma.majorField.findUnique({
        where: { id },
      });

      if (!existingMajorField) {
        return res.status(404).json({
          success: false,
          error: "Major field not found",
        });
      }

      // Check if there are active sub fields using this major field
      const activeSubFields = await prisma.subField.count({
        where: {
          majorId: id,
          isActive: true,
        },
      });

      if (activeSubFields > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete major field. There are ${activeSubFields} active sub fields using this major field.`,
          details: "Please deactivate or delete the sub fields first.",
        });
      }

      // Soft delete by setting isActive to false
      const currentAuditInfo = existingMajorField.auditInfo as AuditInfo;
      const updatedMajorField = await prisma.majorField.update({
        where: { id },
        data: {
          isActive: false,
          auditInfo: {
            ...currentAuditInfo,
            updatedAt: new Date().toISOString(),
            updatedBy: (req as any).user?.email || "admin",
            deletedAt: new Date().toISOString(),
            deletedBy: (req as any).user?.email || "admin",
          },
        },
      });

      console.log("✅ Major field soft deleted successfully:", id);

      res.json({
        success: true,
        data: updatedMajorField,
        message: "Major field deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Error deleting major field:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete major field",
        details: error.message,
      });
    }
  }
);

// ======================== STUDENT MANAGEMENT ENDPOINTS ========================

// GET /api/admin/students - Get all students (Admin/Manager only)
router.get("/students", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'student'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        auditInfo: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Transform the data to include created date
    const transformedStudents = students.map(student => ({
      ...student,
      createdAt: (student.auditInfo as any)?.createdAt || new Date().toISOString()
    }));

    res.json({
      success: true,
      data: transformedStudents,
      total: transformedStudents.length
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
      details: error.message
    });
  }
});

// PUT /api/admin/students/:id/toggle-status - Toggle student active status (Admin/Manager only)
router.put("/students/:id/toggle-status", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.id);
    const { isActive } = req.body;

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID'
      });
    }

    // Check if student exists
    const existingStudent = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: 'student'
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Update student status
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { 
        isActive: isActive,
        auditInfo: {
          ...(existingStudent.auditInfo as any),
          updatedAt: new Date().toISOString(),
          updatedBy: req.user?.id?.toString() || 'admin'
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedStudent
    });
  } catch (error: any) {
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student status',
      details: error.message
    });
  }
});

// ======================== STATISTICS ENDPOINTS ========================

// GET /api/admin/statistics/overview - Get system overview statistics
router.get("/statistics/overview", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    // Get total counts
    const [
      totalCourses,
      totalUsers,
      totalEditors,
      totalManagers,
      totalStudents,
      activeCourses,
      inactiveCourses
    ] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'editor' } }),
      prisma.user.count({ where: { role: 'manager' } }),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.course.count({ where: { isActive: false } })
    ]);

    // Get recent activities from multiple sources (last 15 activities)
    const recentActivities = [];

    // Get recent course activities
    const recentCourses = await prisma.course.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: {
        university: {
          select: { name: true }
        }
      }
    });

    // Get recent news
    const recentNews = await prisma.newsArticle.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });

    // Format course activities
    for (const course of recentCourses) {
      const auditInfo = course.auditInfo as any;
      const createdBy = auditInfo?.createdBy || 'Unknown';
      const updatedBy = auditInfo?.updatedBy || 'Unknown';
      const createdAt = auditInfo?.createdAt ? new Date(auditInfo.createdAt) : new Date();
      const updatedAt = auditInfo?.updatedAt ? new Date(auditInfo.updatedAt) : null;

      // Add creation activity
      recentActivities.push({
        id: `course-${course.id}-created`,
        type: 'course',
        action: 'created',
        description: `Course "${course.name}" created by ${createdBy}`,
        details: `University: ${course.university?.name || 'Unknown'}`,
        timestamp: createdAt,
        user: createdBy
      });

      // Add update activity if different from creation
      if (updatedAt && updatedAt > createdAt && updatedBy !== createdBy) {
        recentActivities.push({
          id: `course-${course.id}-updated`,
          type: 'course',
          action: 'updated',
          description: `Course "${course.name}" updated by ${updatedBy}`,
          details: `University: ${course.university?.name || 'Unknown'}`,
          timestamp: updatedAt,
          user: updatedBy
        });
      }
    }

    // Format news activities
    for (const news of recentNews) {
      const auditInfo = news.auditInfo as any;
      const createdBy = auditInfo?.createdBy || 'Unknown';
      const updatedBy = auditInfo?.updatedBy || 'Unknown';
      const createdAt = auditInfo?.createdAt ? new Date(auditInfo.createdAt) : new Date();
      const updatedAt = auditInfo?.updatedAt ? new Date(auditInfo.updatedAt) : null;

      recentActivities.push({
        id: `news-${news.id}-created`,
        type: 'news',
        action: 'created',
        description: `News "${news.title}" created by ${createdBy}`,
        details: `Category: ${news.category || 'General'}`,
        timestamp: createdAt,
        user: createdBy
      });

      if (updatedAt && updatedAt > createdAt && updatedBy !== createdBy) {
        recentActivities.push({
          id: `news-${news.id}-updated`,
          type: 'news',
          action: 'updated',
          description: `News "${news.title}" updated by ${updatedBy}`,
          details: `Category: ${news.category || 'General'}`,
          timestamp: updatedAt,
          user: updatedBy
        });
      }
    }

    // Sort all activities by timestamp and take the last 15
    const formattedActivities = recentActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 15)
      .map(activity => ({
        id: activity.id,
        type: activity.type,
        action: activity.action,
        description: activity.description,
        details: activity.details,
        timestamp: activity.timestamp.toLocaleString(),
        user: activity.user
      }));

    res.json({
      success: true,
      data: {
        totalCourses,
        totalUsers,
        totalEditors,
        totalManagers,
        totalStudents,
        activeCourses,
        inactiveCourses,
        recentActivities: formattedActivities
      }
    });
  } catch (error: any) {
    console.error("Error fetching overview statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch overview statistics",
      details: error.message,
    });
  }
});

// GET /api/admin/statistics/editors - Get editor activities
router.get("/statistics/editors", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const editors = await prisma.user.findMany({
      where: { role: 'editor' },
      include: {
        permissions: {
          include: {
            user: true
          }
        }
      }
    });

    const editorActivities = await Promise.all(editors.map(async (editor) => {
      // Get courses added by this editor
      const coursesAdded = await prisma.course.count({
        where: {
          auditInfo: {
            path: ['createdBy'],
            equals: editor.email
          }
        }
      });

      // Get courses updated by this editor
      const coursesUpdated = await prisma.course.count({
        where: {
          auditInfo: {
            path: ['updatedBy'],
            equals: editor.email
          }
        }
      });

      // Get assigned universities by fetching university names from permission details
      const universityPermissions = editor.permissions.filter(p => p.resourceType === 'university');
      const assignedUniversities = await Promise.all(
        universityPermissions.map(async (permission) => {
          const details = permission.permissionDetails as any;
          const universityId = details?.universityId || details?.university?.id;
          
          if (universityId) {
            const university = await prisma.university.findUnique({
              where: { id: universityId },
              select: { name: true }
            });
            return university?.name || 'Unknown University';
          }
          
          return details?.universityName || 'Unknown University';
        })
      );

      // Get last activity
      const lastActivity = editor.lastLogin 
        ? new Date(editor.lastLogin).toLocaleDateString()
        : 'Never';

      return {
        id: editor.id,
        name: `${editor.firstName} ${editor.lastName}`,
        email: editor.email,
        coursesAdded,
        coursesUpdated,
        lastActivity,
        assignedUniversities,
        totalActivities: coursesAdded + coursesUpdated
      };
    }));

    res.json({
      success: true,
      data: editorActivities
    });
  } catch (error: any) {
    console.error("Error fetching editor statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch editor statistics",
      details: error.message,
    });
  }
});

// GET /api/admin/statistics/managers - Get manager activities
router.get("/statistics/managers", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'manager' }
    });

    const managerActivities = await Promise.all(managers.map(async (manager) => {
      // Get tasks assigned by this manager
      const tasksAssigned = await prisma.task.count({
        where: { assignedBy: manager.id }
      });

      // Get events created by this manager
      const eventsCreated = await prisma.event.count({
        where: { createdBy: manager.id }
      });

      // Get news published by this manager
      const newsPublished = await prisma.newsArticle.count({
        where: { authorId: manager.id }
      });

      // Get last activity
      const lastActivity = manager.lastLogin 
        ? new Date(manager.lastLogin).toLocaleDateString()
        : 'Never';

      return {
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`,
        email: manager.email,
        tasksAssigned,
        eventsCreated,
        newsPublished,
        lastActivity,
        totalActivities: tasksAssigned + eventsCreated + newsPublished
      };
    }));

    res.json({
      success: true,
      data: managerActivities
    });
  } catch (error: any) {
    console.error("Error fetching manager statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch manager statistics",
      details: error.message,
    });
  }
});

// GET /api/admin/statistics/courses - Get course statistics
router.get("/statistics/courses", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    // Get total courses
    const totalCourses = await prisma.course.count();

    // Get courses by university
    const coursesByUniversity = await prisma.course.groupBy({
      by: ['universityId'],
      _count: {
        id: true
      }
    });

    // Get university names separately
    const universityIds = coursesByUniversity.map(item => item.universityId);
    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
      select: { id: true, name: true }
    });

    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Get courses by type
    const coursesByType = await prisma.course.groupBy({
      by: ['courseType'],
      _count: {
        id: true
      }
    });

    // Get courses by framework
    const coursesByFramework = await prisma.course.groupBy({
      by: ['frameworkId'],
      _count: {
        id: true
      }
    });

    // Get framework details separately
    const frameworkIds = coursesByFramework.map(item => item.frameworkId).filter(id => id !== null);
    const frameworks = await prisma.framework.findMany({
      where: { id: { in: frameworkIds } },
      select: { id: true, type: true, level: true }
    });

    const frameworkMap = new Map(frameworks.map(f => [f.id, f]));

    // Get recent courses
    const recentCourses = await prisma.course.findMany({
      take: 10,
      orderBy: {
        id: 'desc'
      },
      include: {
        university: {
          select: {
            name: true
          }
        }
      }
    });

    const formattedCoursesByUniversity = coursesByUniversity.map(item => ({
      university: universityMap.get(item.universityId) || 'Unknown',
      count: item._count.id
    }));

    const formattedCoursesByType = coursesByType.map(item => ({
      type: item.courseType,
      count: item._count.id
    }));

    const formattedCoursesByFramework = coursesByFramework.map(item => {
      const framework = item.frameworkId ? frameworkMap.get(item.frameworkId) : null;
      return {
        framework: framework ? `${framework.type} Level ${framework.level}` : 'Unknown',
        count: item._count.id
      };
    });

    const formattedRecentCourses = recentCourses.map(course => ({
      name: course.name,
      university: course.university?.name || 'Unknown',
      isActive: course.isActive,
      createdAt: new Date().toLocaleDateString() // Using current date as fallback
    }));

    res.json({
      success: true,
      data: {
        totalCourses,
        coursesByUniversity: formattedCoursesByUniversity,
        coursesByType: formattedCoursesByType,
        coursesByFramework: formattedCoursesByFramework,
        recentCourses: formattedRecentCourses
      }
    });
  } catch (error: any) {
    console.error("Error fetching course statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course statistics",
      details: error.message,
    });
  }
});

export default router;

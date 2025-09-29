import express from "express";
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { authenticateToken, requireAdmin, requireAdminOrManager } from "../middleware/authMiddleware";

const router = express.Router();

// ======================== EDITOR MANAGEMENT ENDPOINTS ========================

// GET /api/editors - Get all editors
router.get("/", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const editors = await prisma.user.findMany({
      where: { role: 'editor' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        profileData: true,
        auditInfo: true
      },
      orderBy: { firstName: 'asc' }
    });

    res.json({
      success: true,
      data: editors,
      count: editors.length
    });
  } catch (error: any) {
    console.error("Error fetching editors:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch editors",
      details: error.message
    });
  }
});

// POST /api/editors - Create new editor (managers and admins)
router.post("/", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone
    } = req.body;

    const managerId = (req as any).user.id;
    const managerEmail = (req as any).user.email || 'system@admin.com';

    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and first name are required"
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists"
      });
    }

    // Create new editor
    const newEditor = await prisma.user.create({
      data: {
        userType: 'editor',
        email,
        passwordHash: password, // Note: In production, this should be hashed
        firstName,
        lastName: lastName || null,
        phone: phone || null,
        role: 'editor',
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: managerEmail,
          updatedAt: new Date().toISOString(),
          updatedBy: managerEmail
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        role: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Editor created successfully",
      data: newEditor
    });

  } catch (error: any) {
    console.error("Error creating editor:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create editor",
      details: error.message
    });
  }
});

// PUT /api/editors/:id/status - Update editor status (managers and admins)
router.put("/:id/status", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const editorId = parseInt(req.params.id);
    const { isActive } = req.body;
    const managerEmail = (req as any).user.email || 'system@admin.com';

    if (isNaN(editorId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid editor ID"
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "isActive must be a boolean value"
      });
    }

    // Check if editor exists
    const existingEditor = await prisma.user.findUnique({
      where: { id: editorId, role: 'editor' }
    });

    if (!existingEditor) {
      return res.status(404).json({
        success: false,
        error: "Editor not found"
      });
    }

    // Update editor status
    const updatedEditor = await prisma.user.update({
      where: { id: editorId },
      data: {
        isActive: isActive,
        auditInfo: {
          ...(existingEditor.auditInfo as any || {}),
          updatedAt: new Date().toISOString(),
          updatedBy: managerEmail
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: `Editor ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedEditor
    });

  } catch (error: any) {
    console.error("Error updating editor status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update editor status",
      details: error.message
    });
  }
});

// GET /api/editors/:id/assignments - Get editor's university assignments
router.get("/:id/assignments", authenticateToken, async (req: Request, res: Response) => {
  try {
    const editorId = parseInt(req.params.id);
    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;
    
    if (isNaN(editorId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid editor ID"
      });
    }

    // Check authorization: editors can only access their own assignments, admins can access any
    if (currentUserRole === 'editor' && currentUserId !== editorId) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view your own assignments."
      });
    }

    if (currentUserRole !== 'admin' && currentUserRole !== 'editor' && currentUserRole !== 'manager') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin, manager, or editor role required."
      });
    }

    // Get editor's university assignments through permissions
    console.log('🔍 Looking for assignments for editor ID:', editorId);
    const assignments = await prisma.userPermission.findMany({
      where: {
        userId: editorId,
        permissionType: 'university_editor',
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        grantor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('🔍 Found assignments:', assignments.length);
    console.log('🔍 Assignments data:', JSON.stringify(assignments, null, 2));

    // Get university details for each assignment
    console.log('🔍 Processing assignments with universities...');
    const assignmentsWithUniversities = await Promise.all(
      assignments.map(async (assignment) => {
        const universityId = (assignment.permissionDetails as any)?.universityId;
        console.log('🔍 Assignment permissionDetails:', assignment.permissionDetails);
        console.log('🔍 University ID from assignment:', universityId);
        
        if (!universityId) {
          console.log('❌ No university ID found in assignment');
          return null;
        }

        const university = await prisma.university.findUnique({
          where: { id: universityId },
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true
          }
        });

        console.log('🔍 Found university:', university);

        return {
          id: assignment.id,
          university: university,
          assignedBy: assignment.grantor,
          assignedAt: assignment.grantedAt,
          permissions: assignment.permissionDetails,
          isActive: assignment.isActive
        };
      })
    );

    const validAssignments = assignmentsWithUniversities.filter(Boolean);
    console.log('🔍 Valid assignments after processing:', validAssignments.length);
    console.log('🔍 Final assignments data:', JSON.stringify(validAssignments, null, 2));

    res.json({
      success: true,
      data: validAssignments,
      count: validAssignments.length
    });
  } catch (error: any) {
    console.error("Error fetching editor assignments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch editor assignments",
      details: error.message
    });
  }
});

// POST /api/editors/:id/assign - Assign editor to university
router.post("/:id/assign", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const editorId = parseInt(req.params.id);
    const { universityId, permissions } = req.body;
    const adminId = (req as any).user.id;

    if (isNaN(editorId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid editor ID"
      });
    }

    if (!universityId) {
      return res.status(400).json({
        success: false,
        error: "University ID is required"
      });
    }

    // Check if editor exists and is actually an editor
    const editor = await prisma.user.findFirst({
      where: { id: editorId, role: 'editor' }
    });

    if (!editor) {
      return res.status(404).json({
        success: false,
        error: "Editor not found"
      });
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId }
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        error: "University not found"
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.userPermission.findFirst({
      where: {
        userId: editorId,
        permissionType: 'university_editor',
        permissionDetails: {
          path: ['universityId'],
          equals: universityId
        },
        isActive: true
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: "Editor is already assigned to this university"
      });
    }

    // Create the assignment
    const assignment = await prisma.userPermission.create({
      data: {
        userId: editorId,
        permissionType: 'university_editor',
        resourceType: 'university',
        permissionDetails: {
          universityId: universityId,
          permissions: permissions || {
            canAddCourses: true,
            canEditCourses: true,
            canDeleteCourses: false,
            canManageMaterials: true,
            canViewAnalytics: true
          }
        },
        grantedBy: adminId,
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'admin@system.com',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin@system.com'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        grantor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Editor assigned to university successfully",
      data: assignment
    });
  } catch (error: any) {
    console.error("Error assigning editor to university:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign editor to university",
      details: error.message
    });
  }
});

// DELETE /api/editors/:id/unassign/:universityId - Unassign editor from university
router.delete("/:id/unassign/:universityId", authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const editorId = parseInt(req.params.id);
    const universityId = parseInt(req.params.universityId);

    if (isNaN(editorId) || isNaN(universityId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid editor ID or university ID"
      });
    }

    // Find and deactivate the assignment
    const assignment = await prisma.userPermission.findFirst({
      where: {
        userId: editorId,
        permissionType: 'university_editor',
        permissionDetails: {
          path: ['universityId'],
          equals: universityId
        },
        isActive: true
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found"
      });
    }

    // Deactivate the assignment
    await prisma.userPermission.update({
      where: { id: assignment.id },
      data: {
        isActive: false,
        auditInfo: {
          ...(assignment.auditInfo as any || {}),
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin@system.com'
        }
      }
    });

    res.json({
      success: true,
      message: "Editor unassigned from university successfully"
    });
  } catch (error: any) {
    console.error("Error unassigning editor from university:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unassign editor from university",
      details: error.message
    });
  }
});

// GET /api/editors/analytics/:id - Get editor analytics
router.get("/analytics/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const editorId = parseInt(req.params.id);
    const timeRange = req.query.timeRange as string || '30d';
    
    if (isNaN(editorId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid editor ID"
      });
    }

    // Check if user can access this analytics (admin or own analytics)
    if (req.user?.role !== 'admin' && req.user?.id !== editorId) {
      return res.status(403).json({
        success: false,
        error: "You can only view your own analytics"
      });
    }

    // Calculate date range
    const currentDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(currentDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(currentDate.getDate() - 30);
    }

    // Get editor's assigned universities
    const editorPermissions = await prisma.userPermission.findMany({
      where: {
        userId: editorId,
        permissionType: 'university_editor'
      },
      select: {
        permissionDetails: true
      }
    });

    const assignedUniversityIds = editorPermissions
      .map(p => (p.permissionDetails as any)?.universityId)
      .filter(id => id !== undefined);

    console.log('🔍 Analytics API - Editor permissions:', editorPermissions);
    console.log('🔍 Analytics API - Assigned university IDs:', assignedUniversityIds);
    console.log('🔍 Analytics API - Editor ID:', editorId);

    // If no assigned universities, return empty analytics
    if (assignedUniversityIds.length === 0) {
      console.log('🔍 Analytics API - No assigned universities, returning empty analytics');
      return res.json({
        success: true,
        data: {
          totalCourses: 0,
          coursesByUniversity: [],
          coursesByStatus: { active: 0, inactive: 0 },
          coursesByType: { internal: 0, external: 0 },
          coursesByStudyMode: { fulltime: 0, parttime: 0 },
          materialsStats: { totalMaterials: 0, materialsByType: [] },
          recentActivities: [],
          monthlyStats: []
        }
      });
    }
    
    // Get all courses for assigned universities
    console.log('🔍 Analytics API - Querying courses for university IDs:', assignedUniversityIds);
    
    const allCourses = await prisma.course.findMany({
      where: {
        universityId: { in: assignedUniversityIds }
      },
      select: {
        id: true,
        name: true,
        courseCode: true,
        courseType: true,
        studyMode: true,
        isActive: true,
        universityId: true,
        university: {
          select: {
            id: true,
            name: true
          }
        },
        auditInfo: true,
        materialIds: true
      }
    });

    console.log('🔍 Analytics API - Found courses:', allCourses.length);
    console.log('🔍 Analytics API - Courses details:', allCourses.map(c => ({ 
      id: c.id, 
      name: c.name, 
      universityId: c.universityId, 
      isActive: c.isActive,
      createdBy: (c.auditInfo as any)?.createdBy,
      updatedBy: (c.auditInfo as any)?.updatedBy
    })));

    // Get course materials
    const courseMaterialIds = allCourses.flatMap(course => course.materialIds || []);
    console.log('🔍 Analytics API - Course material IDs:', courseMaterialIds);
    
    const materials = await prisma.courseMaterial.findMany({
      where: {
        id: { in: courseMaterialIds }
      },
      select: {
        id: true,
        materialType: true,
        uploadedAt: true,
        uploadedBy: true
      }
    });

    // Calculate analytics data
    const totalCourses = allCourses.length;
    console.log('🔍 Analytics API - Total courses calculated:', totalCourses);
    
    const coursesByUniversity = assignedUniversityIds.map(uniId => {
      const university = allCourses.find(c => c.universityId === uniId)?.university;
      const courseCount = allCourses.filter(c => c.universityId === uniId).length;
      return {
        universityId: uniId,
        universityName: university?.name || 'Unknown University',
        courseCount
      };
    });

    const coursesByStatus = {
      active: allCourses.filter(c => c.isActive).length,
      inactive: allCourses.filter(c => !c.isActive).length
    };

    const coursesByType = {
      internal: allCourses.filter(c => c.courseType === 'internal').length,
      external: allCourses.filter(c => c.courseType === 'external').length
    };

    const coursesByStudyMode = {
      fulltime: allCourses.filter(c => c.studyMode === 'fulltime').length,
      parttime: allCourses.filter(c => c.studyMode === 'parttime').length
    };

    // Get recent activities with real timestamps from audit info
    const recentActivities = allCourses
      .map((course) => {
        const auditInfo = course.auditInfo as any;
        const updatedAt = auditInfo?.updatedAt || auditInfo?.createdAt;
        return {
          id: course.id,
          action: auditInfo?.updatedAt ? 'updated' : 'created',
          courseName: course.name,
          universityName: course.university?.name || 'Unknown',
          timestamp: updatedAt || new Date().toISOString()
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Materials statistics
    const materialsStats = {
      totalMaterials: materials.length,
      materialsByType: materials.reduce((acc, material) => {
        const type = material.materialType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Convert materialsByType to array format
    const materialsByTypeArray = Object.entries(materialsStats.materialsByType).map(([type, count]) => ({
      type,
      count
    }));

    // Calculate monthly stats from real data
    const now = new Date();
    const monthlyStats = [];
    
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Count courses created/updated in this month
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      const coursesInMonth = allCourses.filter(course => {
        const auditInfo = course.auditInfo as any;
        const createdAt = new Date(auditInfo?.createdAt || course.id);
        const updatedAt = new Date(auditInfo?.updatedAt || auditInfo?.createdAt || course.id);
        
        return (createdAt >= monthStart && createdAt <= monthEnd) || 
               (updatedAt >= monthStart && updatedAt <= monthEnd);
      });
      
      const coursesCreated = coursesInMonth.filter(course => {
        const auditInfo = course.auditInfo as any;
        const createdAt = new Date(auditInfo?.createdAt || course.id);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;
      
      const coursesUpdated = coursesInMonth.filter(course => {
        const auditInfo = course.auditInfo as any;
        const updatedAt = new Date(auditInfo?.updatedAt || auditInfo?.createdAt || course.id);
        return updatedAt >= monthStart && updatedAt <= monthEnd;
      }).length;
      
      // Count materials uploaded in this month
      const materialsInMonth = materials.filter(material => {
        const uploadedAt = new Date(material.uploadedAt || new Date());
        return uploadedAt >= monthStart && uploadedAt <= monthEnd;
      }).length;
      
      monthlyStats.push({
        month: monthName,
        coursesCreated,
        coursesUpdated,
        materialsUploaded: materialsInMonth
      });
    }

    const responseData = {
      success: true,
      data: {
        totalCourses,
        coursesByUniversity,
        coursesByStatus,
        coursesByType,
        coursesByStudyMode,
        recentActivities,
        monthlyStats,
        materialsStats: {
          totalMaterials: materialsStats.totalMaterials,
          materialsByType: materialsByTypeArray
        }
      }
    };

    console.log('🔍 Analytics API Response:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (error: any) {
    console.error("Error fetching editor analytics:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to fetch editor analytics",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

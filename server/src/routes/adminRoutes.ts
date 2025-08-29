import express from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

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
router.post('/managers', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and first name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    console.log('👥 Creating new manager:', firstName, lastName);

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Audit info
    const auditInfo: AuditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || 'admin',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin'
    };

    // Create manager user
    const newManager = await prisma.user.create({
      data: {
        userType: 'manager',
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'manager', // Set role to manager by default
        profileData: {
          registrationDate: new Date().toISOString(),
          registrationMethod: 'admin_created',
          position: 'University Manager',
          department: 'Academic Affairs'
        },
        isActive: true,
        auditInfo
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        profileData: true
      }
    });

    console.log('✅ Manager created successfully:', newManager.id);

    res.status(201).json({
      success: true,
      data: {
        id: newManager.id.toString(),
        name: `${newManager.firstName} ${newManager.lastName || ''}`.trim(),
        email: newManager.email,
        isActive: newManager.isActive,
        role: newManager.role
      },
      message: 'Manager created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating manager:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manager',
      details: error.message
    });
  }
});

// GET /api/admin/managers - Get all managers (Admin only)
router.get('/managers', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('👥 Fetching all managers...');

    const managers = await prisma.user.findMany({
      where: {
        role: 'manager'
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
        auditInfo: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Transform data for frontend
    const transformedManagers = managers.map(manager => {
      // Type-safe access to JSON fields
      const profileData = manager.profileData as ProfileData;
      const auditInfo = manager.auditInfo as AuditInfo;
      
      return {
        id: manager.id.toString(),
        name: `${manager.firstName} ${manager.lastName || ''}`.trim(),
        email: manager.email,
        university: 'N/A',
        isActive: manager.isActive,
        createdAt: auditInfo?.createdAt || null,
        lastLogin: manager.lastLogin
      };
    });

    console.log(`✅ Found ${transformedManagers.length} managers`);

    res.json({
      success: true,
      data: transformedManagers,
      count: transformedManagers.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching managers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch managers',
      details: error.message
    });
  }
});

// PUT /api/admin/managers/:id/toggle-status - Toggle manager active status (Admin only)
router.put('/managers/:id/toggle-status', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const managerId = parseInt(req.params.id);

    if (isNaN(managerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid manager ID'
      });
    }

    // Find the manager
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: 'manager'
      }
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        error: 'Manager not found'
      });
    }

    // Type-safe access to auditInfo
    const currentAuditInfo = manager.auditInfo as AuditInfo;
    const updatedAuditInfo = {
      ...(currentAuditInfo || {}),
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin'
    };

    // Toggle active status
    const updatedManager = await prisma.user.update({
      where: { id: managerId },
      data: {
        isActive: !manager.isActive,
        auditInfo: updatedAuditInfo
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        profileData: true
      }
    });

    console.log(`✅ Manager ${updatedManager.isActive ? 'activated' : 'deactivated'}:`, updatedManager.email);

    res.json({
      success: true,
      data: {
        id: updatedManager.id.toString(),
        name: `${updatedManager.firstName} ${updatedManager.lastName || ''}`.trim(),
        email: updatedManager.email,
        isActive: updatedManager.isActive
      },
      message: `Manager ${updatedManager.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error: any) {
    console.error('❌ Error toggling manager status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update manager status',
      details: error.message
    });
  }
});

// ======================== PUBLIC/LESS RESTRICTED ENDPOINTS ========================

// GET /api/admin/universities - Get all universities for dropdown (UPDATED with image fields)
router.get('/universities', async (req: Request, res: Response) => {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        uniCode: true,
        address: true,
        contactInfo: true,
        website: true,
        // ADD THESE IMAGE FIELDS
        imageUrl: true,
        logoUrl: true,
        galleryImages: true,
        additionalDetails: true,
        isActive: true,
        auditInfo: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`✅ Fetched ${universities.length} universities with image data`);

    res.json({
      success: true,
      data: universities
    });
  } catch (error: any) {
    console.error('❌ Error fetching universities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch universities',
      details: error.message
    });
  }
});

// GET /api/admin/faculties - Get faculties by university
router.get('/faculties', async (req: Request, res: Response) => {
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
        universityId: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: faculties
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculties',
      details: error.message
    });
  }
});

// GET /api/admin/departments - Get departments by faculty
router.get('/departments', async (req: Request, res: Response) => {
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
        facultyId: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments',
      details: error.message
    });
  }
});

// GET /api/admin/subjects - Get subjects by level
router.get('/subjects', async (req: Request, res: Response) => {
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
        level: true
      },
      orderBy: [{ level: 'asc' }, { code: 'asc' }]
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects',
      details: error.message
    });
  }
});

// GET /api/admin/streams - Get all streams
router.get('/streams', async (req: Request, res: Response) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: streams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch streams',
      details: error.message
    });
  }
});

// GET /api/admin/frameworks - Get frameworks by type
router.get('/frameworks', async (req: Request, res: Response) => {
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
        year: true
      },
      orderBy: [{ type: 'asc' }, { level: 'asc' }]
    });

    res.json({
      success: true,
      data: frameworks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frameworks',
      details: error.message
    });
  }
});

// Get unique framework types
router.get('/framework-types', async (req: Request, res: Response) => {
  try {
    const uniqueTypes = await prisma.framework.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' }
    });

    res.json({
      success: true,
      data: uniqueTypes.map(f => f.type)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch framework types',
      details: error.message
    });
  }
});

//  Get levels by framework type
router.get('/framework-levels/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    const frameworks = await prisma.framework.findMany({
      where: { type: type as 'SLQF' | 'NVQ' },
      select: { id: true, level: true },
      orderBy: { level: 'asc' }
    });

    res.json({
      success: true,
      data: frameworks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch framework levels',
      details: error.message
    });
  }
});

// GET /api/admin/major-fields - Fetch all major fields
router.get('/major-fields', async (req: Request, res: Response) => {
  try {
    console.log('📚 Fetching major fields...');

    const majorFields = await prisma.majorField.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        auditInfo: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${majorFields.length} major fields`);

    res.json({
      success: true,
      data: majorFields,
      count: majorFields.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching major fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch major fields',
      details: error.message
    });
  }
});

// GET /api/admin/sub-fields - Fetch all sub fields
router.get('/sub-fields', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching sub fields...');

    const subFields = await prisma.subField.findMany({
      where: {
        isActive: true
      },
      include: {
        majorField: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { majorId: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform data to match frontend expectations
    const transformedSubFields = subFields.map(subField => ({
      id: subField.id,
      name: subField.name,
      majorId: subField.majorId,
      description: subField.description,
      majorField: subField.majorField,
      isActive: subField.isActive,
      auditInfo: subField.auditInfo
    }));

    console.log(`✅ Found ${transformedSubFields.length} sub fields`);

    res.json({
      success: true,
      data: transformedSubFields,
      count: transformedSubFields.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching sub fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sub fields',
      details: error.message
    });
  }
});

// GET /api/admin/sub-fields/by-major/:majorId - Fetch sub fields for specific major
router.get('/sub-fields/by-major/:majorId', async (req: Request, res: Response) => {
  try {
    const majorId = parseInt(req.params.majorId);
    
    if (isNaN(majorId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid major field ID'
      });
    }

    console.log(`📋 Fetching sub fields for major ID: ${majorId}`);

    const subFields = await prisma.subField.findMany({
      where: {
        majorId: majorId,
        isActive: true
      },
      include: {
        majorField: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Found ${subFields.length} sub fields for major ID ${majorId}`);

    res.json({
      success: true,
      data: subFields,
      count: subFields.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching sub fields by major:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sub fields for major',
      details: error.message
    });
  }
});

// ======================== PROTECTED CREATION/MODIFICATION ENDPOINTS ========================

// GET /api/admin/career-pathways/search - Search career pathways
router.get('/career-pathways/search', async (req: Request, res: Response) => {
  try {
    const { jobTitle, industry } = req.query;
    
    let whereClause: any = { isActive: true };
    
    if (jobTitle) {
      whereClause.jobTitle = {
        contains: jobTitle as string,
        mode: 'insensitive'
      };
    }
    
    if (industry) {
      whereClause.industry = {
        contains: industry as string,
        mode: 'insensitive'
      };
    }

    const careerPathways = await prisma.careerPathway.findMany({
      where: whereClause,
      select: {
        id: true,
        jobTitle: true,
        industry: true,
        description: true,
        salaryRange: true
      },
      take: 10, // Limit suggestions
      orderBy: { jobTitle: 'asc' }
    });

    res.json({
      success: true,
      data: careerPathways
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to search career pathways',
      details: error.message
    });
  }
});

// GET /api/admin/career-pathways - Get all career pathways
router.get('/career-pathways', async (req: Request, res: Response) => {
  try {
    const careerPathways = await prisma.careerPathway.findMany({
      where: { isActive: true },
      orderBy: { jobTitle: 'asc' }
    });

    res.json({
      success: true,
      data: careerPathways
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch career pathways',
      details: error.message
    });
  }
});

// POST /api/admin/career-pathways - Create career pathway
router.post('/career-pathways', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { jobTitle, industry, description, salaryRange } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        error: 'Job title is required'
      });
    }

    const auditInfo: AuditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || 'admin',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin'
    };

    const careerPathway = await prisma.careerPathway.create({
      data: {
        jobTitle,
        industry: industry || null,
        description: description || null,
        salaryRange: salaryRange || null,
        auditInfo
      }
    });

    res.status(201).json({
      success: true,
      data: careerPathway,
      message: 'Career pathway created successfully'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to create career pathway',
      details: error.message
    });
  }
});

// POST /api/admin/major-fields - Create new major field
router.post('/major-fields', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Major field name is required'
      });
    }

    console.log('📚 Creating new major field:', name);

    const auditInfo: AuditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || 'admin',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin'
    };

    const majorField = await prisma.majorField.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: true,
        auditInfo
      }
    });

    console.log('✅ Major field created successfully:', majorField.id);

    res.status(201).json({
      success: true,
      data: majorField,
      message: 'Major field created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating major field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create major field',
      details: error.message
    });
  }
});

// POST /api/admin/sub-fields - Create new sub field
router.post('/sub-fields', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, majorId, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Sub field name is required'
      });
    }

    if (!majorId || isNaN(parseInt(majorId))) {
      return res.status(400).json({
        success: false,
        error: 'Valid major field ID is required'
      });
    }

    console.log('📋 Creating new sub field:', name, 'for major ID:', majorId);

    // Verify major field exists
    const majorField = await prisma.majorField.findUnique({
      where: { id: parseInt(majorId) }
    });

    if (!majorField) {
      return res.status(404).json({
        success: false,
        error: 'Major field not found'
      });
    }

    const auditInfo: AuditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || 'admin',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin'
    };

    const subField = await prisma.subField.create({
      data: {
        name: name.trim(),
        majorId: parseInt(majorId),
        description: description?.trim() || null,
        isActive: true,
        auditInfo
      },
      include: {
        majorField: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Sub field created successfully:', subField.id);

    res.status(201).json({
      success: true,
      data: subField,
      message: 'Sub field created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating sub field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sub field',
      details: error.message
    });
  }
});

// PUT /api/admin/major-fields/:id - Update major field
router.put('/major-fields/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, isActive } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid major field ID'
      });
    }

    console.log('📚 Updating major field ID:', id);

    const existingMajorField = await prisma.majorField.findUnique({
      where: { id }
    });

    if (!existingMajorField) {
      return res.status(404).json({
        success: false,
        error: 'Major field not found'
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Update audit info
    const currentAuditInfo = existingMajorField.auditInfo as AuditInfo;
    updateData.auditInfo = {
      ...currentAuditInfo,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'admin'
    };

    const updatedMajorField = await prisma.majorField.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Major field updated successfully:', id);

    res.json({
      success: true,
      data: updatedMajorField,
      message: 'Major field updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating major field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update major field',
      details: error.message
    });
  }
});

// DELETE /api/admin/major-fields/:id - Delete (soft delete) major field
router.delete('/major-fields/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid major field ID'
      });
    }

    console.log('🗑️ Soft deleting major field ID:', id);

    const existingMajorField = await prisma.majorField.findUnique({
      where: { id }
    });

    if (!existingMajorField) {
      return res.status(404).json({
        success: false,
        error: 'Major field not found'
      });
    }

    // Check if there are active sub fields using this major field
    const activeSubFields = await prisma.subField.count({
      where: {
        majorId: id,
        isActive: true
      }
    });

    if (activeSubFields > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete major field. There are ${activeSubFields} active sub fields using this major field.`,
        details: 'Please deactivate or delete the sub fields first.'
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
          updatedBy: req.user?.email || 'admin',
          deletedAt: new Date().toISOString(),
          deletedBy: req.user?.email || 'admin'
        }
      }
    });

    console.log('✅ Major field soft deleted successfully:', id);

    res.json({
      success: true,
      data: updatedMajorField,
      message: 'Major field deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting major field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete major field',
      details: error.message
    });
  }
});

// PUT /api/admin/universities/:id/images - Update university images
router.put('/universities/:id/images', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const universityId = parseInt(req.params.id);
    const { imageUrl, logoUrl, galleryImages } = req.body;

    const updatedUniversity = await prisma.university.update({
      where: { id: universityId },
      data: {
        imageUrl: imageUrl || null,
        logoUrl: logoUrl || null,
        galleryImages: galleryImages || null,
        auditInfo: {
          ...(req.body.auditInfo as AuditInfo || {}),
          updatedAt: new Date().toISOString(),
          updatedBy: req.user?.email || 'admin'
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        logoUrl: true,
        galleryImages: true
      }
    });

    console.log(`✅ Updated images for university: ${updatedUniversity.name}`);

    res.json({
      success: true,
      data: updatedUniversity,
      message: 'University images updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating university images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update university images',
      details: error.message
    });
  }
});

// POST /api/admin/universities/bulk-update-images - Bulk update images
router.post('/universities/bulk-update-images', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body.updates || [];
    
    const results = [];
    for (const update of updates) {
      try {
        const updatedUniversity = await prisma.university.updateMany({
          where: { name: update.name },
          data: {
            imageUrl: update.imageUrl,
            logoUrl: update.logoUrl,
            galleryImages: update.galleryImages
          }
        });
        results.push({ name: update.name, success: true, count: updatedUniversity.count });
      } catch (error: any) {
        results.push({ name: update.name, success: false, error: error.message });
      }
    }

    console.log(`✅ Bulk updated images for ${results.filter(r => r.success).length} universities`);

    res.json({
      success: true,
      data: results,
      message: 'Bulk image update completed'
    });

  } catch (error: any) {
    console.error('❌ Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update images',
      details: error.message
    });
  }
});

export default router;
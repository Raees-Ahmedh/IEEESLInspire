import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

// GET /api/admin/universities - Get all universities for dropdown
router.get('/universities', async (req: Request, res: Response) => {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: universities
    });
  } catch (error: any) {
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

// POST /api/admin/career-pathways - Create career pathway
router.post('/career-pathways', async (req: Request, res: Response) => {
  try {
    const { jobTitle, industry, description, salaryRange } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        error: 'Job title is required'
      });
    }

    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: 'admin@system.com',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@system.com'
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

// POST /api/admin/major-fields - Create new major field
router.post('/major-fields', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Major field name is required'
      });
    }

    console.log('📚 Creating new major field:', name);

    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: 'admin@system.com', // You might want to get this from auth context
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@system.com'
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
router.post('/sub-fields', async (req: Request, res: Response) => {
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

    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: 'admin@system.com',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@system.com'
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
router.put('/major-fields/:id', async (req: Request, res: Response) => {
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
    const currentAuditInfo = existingMajorField.auditInfo as any;
    updateData.auditInfo = {
      ...currentAuditInfo,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@system.com'
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
router.delete('/major-fields/:id', async (req: Request, res: Response) => {
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
    const currentAuditInfo = existingMajorField.auditInfo as any;
    const updatedMajorField = await prisma.majorField.update({
      where: { id },
      data: {
        isActive: false,
        auditInfo: {
          ...currentAuditInfo,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin@system.com',
          deletedAt: new Date().toISOString(),
          deletedBy: 'admin@system.com'
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

export default router;

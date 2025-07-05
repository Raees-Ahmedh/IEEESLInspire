// server/src/routes/adminRoutes.ts - Updated to include image fields
import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';

const router = express.Router();

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

// GET /api/admin/faculties - Get faculties by university (keep existing)
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

// GET /api/admin/departments - Get departments by faculty (keep existing)
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

// NEW: PUT /api/admin/universities/:id/images - Update university images
router.put('/universities/:id/images', async (req: Request, res: Response) => {
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
          ...req.body.auditInfo || {},
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin' // You can get this from auth context
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

// NEW: POST /api/admin/universities/bulk-update-images - Bulk update images
router.post('/universities/bulk-update-images', async (req: Request, res: Response) => {
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
import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { PrismaClient } from '@prisma/client';
import https from 'https';
import http from 'http';
import { authenticateToken, requireAdminOrManagerOrEditor } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow common document and image formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, and TXT files are allowed.'));
    }
  }
});

// POST /api/upload/course-material - Upload course material file to Cloudinary
router.post('/course-material', authenticateToken, requireAdminOrManagerOrEditor, upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { materialType, uploadedBy, courseId } = req.body;

    if (!materialType || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: materialType, uploadedBy'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      // Determine resource type based on file type
      let resourceType: 'raw' | 'image' | 'video' | 'auto' = 'raw';
      if (req.file!.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (req.file!.mimetype.startsWith('video/')) {
        resourceType = 'video';
      }

      // Generate public_id with course context and unique naming
      const originalName = req.file!.originalname;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const coursePrefix = courseId ? `course-${courseId}` : 'temp';
      const publicId = `${coursePrefix}-material-${timestamp}-${randomId}-${originalName}`;

      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'course-materials',
          public_id: publicId,
          // Only apply transformations for images
          ...(resourceType === 'image' && {
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          })
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file!.buffer);
    });

    const cloudinaryResult = result as any;
    
    // Debug: Log the Cloudinary result
    console.log('📤 Cloudinary upload result:', {
      secure_url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      format: cloudinaryResult.format,
      resource_type: cloudinaryResult.resource_type
    });

    // Save to database (without courseId since CourseMaterial doesn't have this field)
    const courseMaterial = await prisma.courseMaterial.create({
      data: {
        materialType,
        fileName: req.file!.originalname,
        filePath: cloudinaryResult.secure_url,
        fileType: req.file!.mimetype,
        fileSize: req.file!.size,
        uploadedBy: parseInt(uploadedBy),
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      }
    });

    // If courseId is provided, add this material to the course's materialIds array
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(courseId) },
        select: { materialIds: true }
      });

      if (course) {
        const currentMaterialIds = course.materialIds || [];
        const updatedMaterialIds = [...currentMaterialIds, courseMaterial.id];
        
        await prisma.course.update({
          where: { id: parseInt(courseId) },
          data: { materialIds: updatedMaterialIds }
        });
        
        console.log(`✅ Added material ${courseMaterial.id} to course ${courseId}`);
      }
    }

    res.json({
      success: true,
      data: {
        id: courseMaterial.id,
        materialType: courseMaterial.materialType,
        fileName: courseMaterial.fileName,
        filePath: courseMaterial.filePath,
        fileType: courseMaterial.fileType,
        fileSize: courseMaterial.fileSize,
        uploadedAt: courseMaterial.uploadedAt
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'File upload failed'
    });
  }
});

// POST /api/upload/multiple-course-materials - Upload multiple course material files
router.post('/multiple-course-materials', authenticateToken, requireAdminOrManagerOrEditor, upload.array('files', 10), async (req: any, res: any) => {
  try {
    const files = req.files as any[];
    const { materials, uploadedBy, courseId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    if (!materials || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: materials, uploadedBy'
      });
    }

    const materialsData = JSON.parse(materials);
    
    if (files.length !== materialsData.length) {
      return res.status(400).json({
        success: false,
        error: 'Number of files must match number of materials'
      });
    }

    const uploadedMaterials = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const materialData = materialsData[i];

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        // Determine resource type based on file type
        let resourceType: 'raw' | 'image' | 'video' | 'auto' = 'raw';
        if (file.mimetype.startsWith('image/')) {
          resourceType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          resourceType = 'video';
        }

        // Generate public_id with course context and unique naming
        const originalName = file.originalname;
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const coursePrefix = courseId ? `course-${courseId}` : 'temp';
        const publicId = `${coursePrefix}-material-${timestamp}-${randomId}-${originalName}`;

        cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: 'course-materials',
            public_id: publicId,
            // Only apply transformations for images
            ...(resourceType === 'image' && {
              transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            })
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(file.buffer);
      });

      const cloudinaryResult = result as any;
      
      // Debug: Log the Cloudinary result
      console.log('📤 Cloudinary upload result (multiple):', {
        secure_url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        format: cloudinaryResult.format,
        resource_type: cloudinaryResult.resource_type
      });

      // Save to database (without courseId since CourseMaterial doesn't have this field)
      const courseMaterial = await prisma.courseMaterial.create({
        data: {
          materialType: materialData.materialType,
          fileName: file.originalname,
          filePath: cloudinaryResult.secure_url,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedBy: parseInt(uploadedBy),
          auditInfo: {
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            updatedAt: new Date().toISOString(),
            updatedBy: 'system'
          }
        }
      });

      uploadedMaterials.push({
        id: courseMaterial.id,
        materialType: courseMaterial.materialType,
        fileName: courseMaterial.fileName,
        filePath: courseMaterial.filePath,
        fileType: courseMaterial.fileType,
        fileSize: courseMaterial.fileSize,
        uploadedAt: courseMaterial.uploadedAt
      });
    }

    // If courseId is provided, add all uploaded materials to the course's materialIds array
    if (courseId && uploadedMaterials.length > 0) {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(courseId) },
        select: { materialIds: true }
      });

      if (course) {
        const currentMaterialIds = course.materialIds || [];
        const newMaterialIds = uploadedMaterials.map(material => material.id);
        const updatedMaterialIds = [...currentMaterialIds, ...newMaterialIds];
        
        await prisma.course.update({
          where: { id: parseInt(courseId) },
          data: { materialIds: updatedMaterialIds }
        });
        
        console.log(`✅ Added ${newMaterialIds.length} materials to course ${courseId}`);
      }
    }

    res.json({
      success: true,
      data: uploadedMaterials
    });

  } catch (error: any) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'File upload failed'
    });
  }
});

// GET /api/upload/download/:id - Download course material
router.get('/download/:id', async (req: any, res: any) => {
  try {
    const materialId = parseInt(req.params.id);
    
    if (isNaN(materialId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid material ID'
      });
    }

    // Get material from database
    const material = await prisma.courseMaterial.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    // If it's a Cloudinary URL, fetch the file and stream it
    if (material.filePath.includes('cloudinary.com')) {
      try {
        const url = new URL(material.filePath);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        
        // Set appropriate headers
        res.setHeader('Content-Type', material.fileType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
        
        // Make request to Cloudinary
        const request = httpModule.get(material.filePath, (response) => {
          // Set content length if available
          if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
          }
          
          // Stream the file to the client
          response.pipe(res);
        });
        
        request.on('error', (error) => {
          console.error('Error fetching from Cloudinary:', error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: 'Failed to download file from storage'
            });
          }
        });
        
      } catch (fetchError) {
        console.error('Error fetching from Cloudinary:', fetchError);
        return res.status(500).json({
          success: false,
          error: 'Failed to download file from storage'
        });
      }
    } else {
      // For non-Cloudinary URLs, redirect to the URL
      res.redirect(material.filePath);
    }

  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Download failed'
    });
  }
});

// DELETE /api/upload/course-material/:id - Delete course material
router.delete('/course-material/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid material ID'
      });
    }

    // Get material details
    const material = await prisma.courseMaterial.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    // Delete from Cloudinary
    try {
      const publicId = material.filePath.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`course-materials/${publicId}`);
      }
    } catch (cloudinaryError) {
      console.warn('Failed to delete from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database (check if record exists first)
    const existingMaterial = await prisma.courseMaterial.findUnique({
      where: { id: materialId }
    });

    if (!existingMaterial) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    // Remove this material ID from all courses' materialIds arrays
    const coursesWithThisMaterial = await prisma.course.findMany({
      where: {
        materialIds: {
          has: materialId
        }
      },
      select: { id: true, materialIds: true }
    });

    // Update each course to remove this material ID
    for (const course of coursesWithThisMaterial) {
      const updatedMaterialIds = course.materialIds.filter(id => id !== materialId);
      await prisma.course.update({
        where: { id: course.id },
        data: { materialIds: updatedMaterialIds }
      });
    }

    console.log(`✅ Removed material ${materialId} from ${coursesWithThisMaterial.length} courses`);

    await prisma.courseMaterial.delete({
      where: { id: materialId }
    });

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete material'
    });
  }
});

export default router;

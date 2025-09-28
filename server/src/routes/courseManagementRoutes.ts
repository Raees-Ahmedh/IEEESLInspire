import express from 'express';
import { courseManagementController } from '../controllers/courseManagementController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Role-based authorization middleware
const requireRole = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware for admin, manager, and editor roles
const requireManagementRole = requireRole(['admin', 'manager', 'editor']);

// Form data endpoint - GET form data for course creation (must be before /:id route)
router.get('/form-data', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.getFormData
);

// Course CRUD endpoints
router.get('/', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.getCourses
);

router.get('/:id', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.getCourseById
);

router.post('/', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.createCourse
);

router.put('/:id', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.updateCourse
);

router.delete('/:id', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.deleteCourse
);

// Course materials endpoint
router.post('/:id/materials', 
  authenticateToken, 
  requireManagementRole, 
  courseManagementController.uploadCourseMaterial
);

export default router;
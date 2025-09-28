import { Request, Response } from 'express';
import { courseManagementService, AddCourseData } from '../services/courseManagementService';

export class CourseManagementController {
  // GET /api/admin/courses/form-data - Get all data needed for course form
  async getFormData(req: Request, res: Response) {
    try {
      const result = await courseManagementService.getFormData();
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getFormData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching form data'
      });
    }
  }

  // POST /api/admin/courses - Create new course
  async createCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      // Validate required fields
      const requiredFields = [
        'name', 'courseUrl', 'universityId', 'facultyId', 'departmentId',
        'studyMode', 'courseType', 'feeType', 'medium'
      ];

      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate enums
      const validStudyModes = ['fulltime', 'parttime'];
      const validCourseTypes = ['internal', 'external'];
      const validFeeTypes = ['free', 'paid'];
      const validMinRequirements = ['noNeed', 'OLPass', 'ALPass', 'Graduate'];

      if (!validStudyModes.includes(req.body.studyMode)) {
        return res.status(400).json({
          success: false,
          error: `Invalid study mode. Must be one of: ${validStudyModes.join(', ')}`
        });
      }

      if (!validCourseTypes.includes(req.body.courseType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid course type. Must be one of: ${validCourseTypes.join(', ')}`
        });
      }

      if (!validFeeTypes.includes(req.body.feeType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid fee type. Must be one of: ${validFeeTypes.join(', ')}`
        });
      }

      if (req.body.requirements && !validMinRequirements.includes(req.body.requirements.minRequirement)) {
        return res.status(400).json({
          success: false,
          error: `Invalid minimum requirement. Must be one of: ${validMinRequirements.join(', ')}`
        });
      }

      // Validate fee amount if feeType is 'paid'
      if (req.body.feeType === 'paid' && (!req.body.feeAmount || req.body.feeAmount <= 0)) {
        return res.status(400).json({
          success: false,
          error: 'Fee amount is required and must be greater than 0 for paid courses'
        });
      }

      // Validate arrays
      if (!Array.isArray(req.body.medium) || req.body.medium.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Medium must be a non-empty array'
        });
      }

      if (!Array.isArray(req.body.subfieldId) || req.body.subfieldId.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one subfield must be selected'
        });
      }

      // Prepare course data
      const courseData: AddCourseData = {
        name: req.body.name?.trim(),
        courseCode: req.body.courseCode?.trim() || undefined,
        courseUrl: req.body.courseUrl?.trim(),
        description: req.body.description?.trim() || undefined,
        specialisation: Array.isArray(req.body.specialisation) 
          ? req.body.specialisation.filter((s: string) => s?.trim()).map((s: string) => s.trim())
          : [],
        
        // University structure
        universityId: parseInt(req.body.universityId),
        facultyId: parseInt(req.body.facultyId),
        departmentId: parseInt(req.body.departmentId),
        subfieldId: req.body.subfieldId.map((id: string) => parseInt(id)),

        // Course configuration
        studyMode: req.body.studyMode,
        courseType: req.body.courseType,
        frameworkId: req.body.frameworkId ? parseInt(req.body.frameworkId) : undefined,

        // Fees & Duration
        feeType: req.body.feeType,
        feeAmount: req.body.feeType === 'paid' ? parseFloat(req.body.feeAmount) : undefined,
        durationMonths: req.body.durationMonths ? parseInt(req.body.durationMonths) : undefined,
        medium: req.body.medium,

        // Complex data
        zscore: req.body.zscore || undefined,
        additionalDetails: {
          intakeCount: req.body.intakeCount ? parseInt(req.body.intakeCount) : undefined,
          syllabus: req.body.syllabus?.trim() || undefined,
          customFields: req.body.customFields || {}
        },

        // Requirements
        requirements: req.body.requirements ? {
          minRequirement: req.body.requirements.minRequirement || 'ALPass',
          streams: Array.isArray(req.body.requirements.streams) 
            ? req.body.requirements.streams.map((id: string) => parseInt(id))
            : [],
          ruleSubjectBasket: req.body.requirements.ruleSubjectBasket || undefined,
          ruleSubjectGrades: req.body.requirements.ruleSubjectGrades || undefined,
          ruleOLGrades: req.body.requirements.ruleOLGrades || undefined
        } : {
          minRequirement: 'ALPass',
          streams: [],
          ruleSubjectBasket: undefined,
          ruleSubjectGrades: undefined,
          ruleOLGrades: undefined
        },

        // Career pathways
        careerPathways: Array.isArray(req.body.careerPathways) ? req.body.careerPathways : []
      };

      // Create the course
      const result = await courseManagementService.createCourse(courseData, userId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createCourse:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while creating course'
      });
    }
  }

  // GET /api/admin/courses - Get courses with filters
  async getCourses(req: Request, res: Response) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        search: req.query.search as string,
        universityId: req.query.universityId ? parseInt(req.query.universityId as string) : undefined,
        facultyId: req.query.facultyId ? parseInt(req.query.facultyId as string) : undefined,
        departmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
        courseType: req.query.courseType as string,
        feeType: req.query.feeType as string,
        studyMode: req.query.studyMode as string
      };

      const result = await courseManagementService.getCourses(filters);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getCourses:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching courses'
      });
    }
  }

  // GET /api/admin/courses/:id - Get single course details
  async getCourseById(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.id);
      
      if (isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID'
        });
      }

      // This would be implemented in the service
      res.status(200).json({
        success: true,
        message: 'Get course by ID - Not yet implemented',
        courseId
      });
    } catch (error) {
      console.error('Error in getCourseById:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching course'
      });
    }
  }

  // PUT /api/admin/courses/:id - Update course
  async updateCourse(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      // Validate and prepare update data similar to createCourse
      const updateData: Partial<AddCourseData> = {
        name: req.body.name?.trim(),
        courseCode: req.body.courseCode?.trim(),
        courseUrl: req.body.courseUrl?.trim(),
        description: req.body.description?.trim(),
        // ... other fields
      };

      const result = await courseManagementService.updateCourse(courseId, updateData, userId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateCourse:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while updating course'
      });
    }
  }

  // DELETE /api/admin/courses/:id - Delete course
  async deleteCourse(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      const result = await courseManagementService.deleteCourse(courseId, userId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while deleting course'
      });
    }
  }

  // POST /api/admin/courses/:id/materials - Upload course materials
  async uploadCourseMaterial(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(courseId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      // Material upload logic would go here
      res.status(200).json({
        success: true,
        message: 'Material upload - Not yet implemented',
        courseId
      });
    } catch (error) {
      console.error('Error in uploadCourseMaterial:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while uploading material'
      });
    }
  }
}

export const courseManagementController = new CourseManagementController();
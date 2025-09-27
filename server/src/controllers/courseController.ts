import { Request, Response } from 'express';
import { prisma } from '../config/database';

interface AddCourseRequest {
  // Basic Course Details
  name: string;
  courseCode?: string;
  courseUrl: string;
  description?: string;
  specialisation: string[];

  // University & Structure
  universityId: number;
  facultyId?: number;
  departmentId?: number;
  subfieldId: number[];

  // Course Configuration
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  frameworkId?: number;

  // Fees & Duration
  feeType: 'free' | 'paid';
  feeAmount?: number;
  durationMonths?: number;
  medium: string[];

  // Requirements & Complex Data
  requirements?: {
    minRequirement: string;
    streams: number[];
    ruleSubjectBasket?: any;
    ruleSubjectGrades?: any;
    ruleOLGrades?: any;
  };

  // Additional Data
  zscore?: any;
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: any;
    customFields?: any[];
  };

  // Career Paths
  careerPathways?: Array<{
    jobTitle: string;
    industry?: string;
    description?: string;
    salaryRange?: string;
  }>;
}

export const addCourse = async (req: Request, res: Response) => {
  try {
    const courseData: AddCourseRequest = req.body;

    // Validate required fields
    if (!courseData.name || !courseData.courseUrl || !courseData.universityId ) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: name, courseUrl, universityId'
      });
    }

    // Prepare audit info
    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || 'system', 
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.email || 'system'
    };

    // Step 1: Create Course Requirements if provided
    let requirementId: number | null = null;
    if (courseData.requirements) {
      const courseRequirement = await prisma.courseRequirement.create({
        data: {
          minRequirement: courseData.requirements.minRequirement,
          stream: courseData.requirements.streams || [],
          ruleSubjectBasket: courseData.requirements.ruleSubjectBasket || null,
          ruleSubjectGrades: courseData.requirements.ruleSubjectGrades || null,
          ruleOLGrades: courseData.requirements.ruleOLGrades || null,
          isActive: true,
          auditInfo: auditInfo
        }
      });
      requirementId = courseRequirement.id;
    }

    // Step 2: Create Career Pathways if provided
    const careerIds: number[] = [];
    if (courseData.careerPathways && courseData.careerPathways.length > 0) {
      for (const pathway of courseData.careerPathways) {
        const careerPathway = await prisma.careerPathway.create({
          data: {
            jobTitle: pathway.jobTitle,
            industry: pathway.industry || null,
            description: pathway.description || null,
            salaryRange: pathway.salaryRange || null,
            isActive: true,
            auditInfo: auditInfo
          }
        });
        careerIds.push(careerPathway.id);
      }
    }

    // Step 3: Prepare course data
    const courseCreateData: any = {
      name: courseData.name,
      courseCode: courseData.courseCode || null,
      courseUrl: courseData.courseUrl,
      description: courseData.description || null,
      specialisation: courseData.specialisation || [],
      
      // University Structure
      universityId: courseData.universityId,
      facultyId: courseData.facultyId,
      departmentId: courseData.departmentId,
      subfieldId: courseData.subfieldId || [],
      
      // Course Configuration
      studyMode: courseData.studyMode,
      courseType: courseData.courseType,
      frameworkId: courseData.frameworkId || null,
      
      // Fees & Duration
      feeType: courseData.feeType,
      feeAmount: courseData.feeAmount || null,
      durationMonths: courseData.durationMonths || null,
      medium: courseData.medium || [],
      
      // Linked IDs
      requirementId: requirementId,
      careerId: careerIds,
      materialIds: [], // Will be updated when materials are uploaded
      
      // Audit
      isActive: true,
      auditInfo: auditInfo
    };

    // Handle JSON fields properly - only add if they have values
    if (courseData.zscore) {
      courseCreateData.zscore = courseData.zscore;
    }

    if (courseData.additionalDetails) {
      courseCreateData.additionalDetails = courseData.additionalDetails;
    }

    // Create the main Course record
    const course = await prisma.course.create({
      data: courseCreateData,
      include: {
        university: true,
        faculty: true,
        department: true,
        framework: true,
        requirements: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        courseId: course.id,
        name: course.name,
        courseCode: course.courseCode,
        requirementId: requirementId,
        careerIds: careerIds
      }
    });

  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create course',
      details: error.message
    });
  }
};

export const uploadCourseMaterial = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { materialType, fileName, filePath, fileType, fileSize } = req.body;

    if (!courseId || !materialType || !fileName || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'courseId, materialType, fileName, and filePath are required'
      });
    }

    // Create course material record
    const material = await prisma.courseMaterial.create({
      data: {
        materialType,
        fileName,
        filePath,
        fileType: fileType || null,
        fileSize: fileSize || null,
        uploadedBy: 1, // Replace with actual user ID from auth
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'admin@system.com'
        }
      }
    });

    // Update course materialIds array
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });

    if (course) {
      await prisma.course.update({
        where: { id: parseInt(courseId) },
        data: {
          materialIds: [...course.materialIds, material.id]
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course material uploaded successfully',
      data: material
    });

  } catch (error: any) {
    console.error('Error uploading course material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload course material',
      details: error.message
    });
  }
};
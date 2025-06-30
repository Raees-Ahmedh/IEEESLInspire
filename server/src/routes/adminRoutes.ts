// Enhanced Admin Helper Routes
// File: server/src/routes/adminRoutes.ts

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

export default router;
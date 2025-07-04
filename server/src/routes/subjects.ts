// server/src/routes/subjects.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

// Get all subjects by level (AL or OL)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    
    // Validate level parameter
    if (level && !['AL', 'OL'].includes(level as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid level. Must be AL or OL'
      });
    }

    const whereClause: any = {
      isActive: true
    };

    if (level) {
      whereClause.level = level as string;
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        name: true,
        level: true
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' }
      ]
    });

    res.json({
      success: true,
      message: `${level ? level + ' ' : ''}Subjects fetched successfully`,
      count: subjects.length,
      data: subjects
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects',
      details: error.message
    });
  }
});

// Get AL subjects specifically
router.get('/al', async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        level: 'AL',
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'AL subjects fetched successfully',
      count: subjects.length,
      data: subjects
    });

  } catch (error: any) {
    console.error('Error fetching AL subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AL subjects',
      details: error.message
    });
  }
});

// Get OL subjects specifically
router.get('/ol', async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        level: 'OL',
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'OL subjects fetched successfully',
      count: subjects.length,
      data: subjects
    });

  } catch (error: any) {
    console.error('Error fetching OL subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch OL subjects',
      details: error.message
    });
  }
});

// Get subject by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
        isActive: true
      }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject fetched successfully',
      data: subject
    });

  } catch (error: any) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subject',
      details: error.message
    });
  }
});

// Get O/L core subjects (Sinhala/Tamil, English, Mathematics, Science)
router.get('/ol-core', async (req: Request, res: Response) => {
  try {
    // Define the core O/L subjects based on Sri Lankan curriculum
    const coreSubjectCodes = [
      'OL21', // Sinhala Language & Literature
      'OL22', // Tamil Language & Literature  
      'OL31', // English Language
      'OL32', // Mathematics
      'OL34'  // Science
    ];

    const coreSubjects = await prisma.subject.findMany({
      where: {
        level: 'OL',
        code: {
          in: coreSubjectCodes
        },
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        level: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    // If no subjects found in database, return mock data for development
    if (coreSubjects.length === 0) {
      const mockSubjects = [
        { id: 1001, code: 'OL21', name: 'Sinhala Language & Literature', level: 'OL' },
        { id: 1002, code: 'OL22', name: 'Tamil Language & Literature', level: 'OL' },
        { id: 1003, code: 'OL31', name: 'English Language', level: 'OL' },
        { id: 1004, code: 'OL32', name: 'Mathematics', level: 'OL' },
        { id: 1005, code: 'OL34', name: 'Science', level: 'OL' }
      ];

      return res.json({
        success: true,
        message: 'O/L core subjects fetched successfully (using mock data)',
        count: mockSubjects.length,
        data: mockSubjects
      });
    }

    res.json({
      success: true,
      message: 'O/L core subjects fetched successfully',
      count: coreSubjects.length,
      data: coreSubjects
    });

  } catch (error: any) {
    console.error('Error fetching O/L core subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch O/L core subjects',
      details: error.message
    });
  }
});

export default router;
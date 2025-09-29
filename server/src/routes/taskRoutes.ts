// server/src/routes/taskRoutes.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdminOrManager, requireAdminOrManagerOrEditor } from '../middleware/authMiddleware';

const router = Router();

// GET /api/tasks - Get all tasks (for managers) or assigned tasks (for editors)
router.get('/', authenticateToken, requireAdminOrManagerOrEditor, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;

    let whereClause: any = {};

    // If user is editor, only show tasks assigned to them
    if (userRole === 'editor') {
      whereClause.assignedTo = userId;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });

  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      details: error.message
    });
  }
});

// POST /api/tasks - Create new task (managers only)
router.post('/', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority = 'medium',
      dueDate
    } = req.body;

    const assignedBy = (req as any).user?.id;
    const userEmail = (req as any).user?.email || 'system@admin.com';

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: 'Assigned editor is required'
      });
    }

    // Verify assigned user is an editor
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedTo },
      select: { role: true }
    });

    if (!assignedUser || assignedUser.role !== 'editor') {
      return res.status(400).json({
        success: false,
        error: 'Assigned user must be an editor'
      });
    }

    const auditInfo = {
      createdAt: new Date().toISOString(),
      createdBy: userEmail,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail
    };

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        assignedTo: assignedTo,
        assignedBy: assignedBy,
        priority: priority,
        status: 'todo',
        dueDate: dueDate ? new Date(dueDate) : null,
        auditInfo: auditInfo
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assigner: {
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
      message: 'Task created successfully',
      data: task
    });

  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      details: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task status (editors can update status, managers can update all fields)
router.put('/:id', authenticateToken, requireAdminOrManagerOrEditor, async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    const userEmail = (req as any).user?.email || 'system@admin.com';

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Permission check: editors can only update tasks assigned to them
    if (userRole === 'editor' && existingTask.assignedTo !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update tasks assigned to you'
      });
    }

    const updateData: any = {
      ...req.body,
      auditInfo: {
        ...(existingTask.auditInfo as any || {}),
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail
      }
    };

    // Convert dueDate string to DateTime if provided
    if (updateData.dueDate && typeof updateData.dueDate === 'string') {
      // If it's just a date string (YYYY-MM-DD), convert to full DateTime
      if (updateData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        updateData.dueDate = new Date(updateData.dueDate + 'T00:00:00.000Z');
      } else {
        updateData.dueDate = new Date(updateData.dueDate);
      }
    }

    // If updating status, validate it
    if (updateData.status && !['todo', 'ongoing', 'complete'].includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be todo, ongoing, or complete'
      });
    }

    // If updating priority, validate it
    if (updateData.priority && !['low', 'medium', 'high'].includes(updateData.priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority. Must be low, medium, or high'
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assigner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });

  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      details: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task (managers only)
router.delete('/:id', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      details: error.message
    });
  }
});

// GET /api/tasks/editors - Get all editors for task assignment
router.get('/editors', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const editors = await prisma.user.findMany({
      where: { 
        role: 'editor',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      },
      orderBy: { firstName: 'asc' }
    });

    res.json({
      success: true,
      data: editors,
      count: editors.length
    });

  } catch (error: any) {
    console.error('Error fetching editors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch editors',
      details: error.message
    });
  }
});

export default router;

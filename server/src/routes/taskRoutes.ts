// server/src/routes/taskRoutes.ts - Task management routes for editors
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/tasks/my-tasks - Get tasks assigned to the current user (for editors)
router.get('/my-tasks', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log(`🔄 Fetching tasks for user ${user.id} (${user.role})`);

    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        taskType: true,
        status: true,
        priority: true,
        dueDate: true,
        taskData: true,
        completedAt: true,
        auditInfo: true,
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
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
        { id: 'desc' }
      ]
    });

    console.log(`✅ Found ${tasks.length} tasks for user ${user.id}`);

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching user tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      details: error.message
    });
  }
});

// PUT /api/tasks/:id/status - Update task status (for editors)
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!status || !['todo', 'ongoing', 'complete', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status required (todo, ongoing, complete, cancelled)'
      });
    }

    console.log(`🔄 Updating task ${taskId} status to ${status} by user ${user.id}`);

    // Check if task exists and user has permission to update it
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Only assigned user can update their task status
    if (existingTask.assignedTo !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update tasks assigned to you.'
      });
    }

    // Prepare update data
    const updateData: any = {
      status,
      auditInfo: {
        ...existingTask.auditInfo as object,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      }
    };

    // Set completedAt timestamp when marking as complete
    if (status === 'complete') {
      updateData.completedAt = new Date();
    } else if (existingTask.completedAt) {
      // Clear completedAt if changing from complete to another status
      updateData.completedAt = null;
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
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    console.log(`✅ Updated task ${taskId} status to ${status}`);

    res.json({
      success: true,
      data: updatedTask,
      message: `Task status updated to ${status}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error updating task status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task status',
      details: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task details (for editors - limited fields)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const taskId = parseInt(req.params.id);
    const { description, status } = req.body;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log(`🔄 Updating task ${taskId} by user ${user.id}`);

    // Check if task exists and user has permission to update it
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Only assigned user can update their task
    if (existingTask.assignedTo !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update tasks assigned to you.'
      });
    }

    // Prepare update data - editors can only update limited fields
    const updateData: any = {
      auditInfo: {
        ...existingTask.auditInfo as object,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      }
    };

    // Editors can add notes to description but not change other core details
    if (description !== undefined) {
      updateData.description = description;
    }

    // Handle status update
    if (status && ['todo', 'ongoing', 'complete'].includes(status)) {
      updateData.status = status;
      if (status === 'complete') {
        updateData.completedAt = new Date();
      } else if (existingTask.completedAt) {
        updateData.completedAt = null;
      }
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
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    console.log(`✅ Updated task ${taskId}`);

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      details: error.message
    });
  }
});

// GET /api/tasks/:id - Get single task details (for editors)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const taskId = parseInt(req.params.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log(`🔄 Fetching task ${taskId} for user ${user.id}`);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            auditInfo: 'desc'
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Only assigned user or assigner can view task details
    if (task.assignedTo !== user.id && task.assignedBy !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view tasks assigned to you or created by you.'
      });
    }

    console.log(`✅ Found task ${taskId}`);

    res.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      details: error.message
    });
  }
});

export default router;
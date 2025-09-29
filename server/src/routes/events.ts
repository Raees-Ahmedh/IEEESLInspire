// server/src/routes/events.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { authenticateToken, requireAdminOrManager } from '../middleware/authMiddleware';
import { createAuditInfo, updateAuditInfo, getUserEmailFromRequest, getUserIdFromRequest } from '../utils/auditUtils';

const router = Router();

// Types for request/response
interface EventsQuery {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  isPublic?: string;
  limit?: string;
  offset?: string;
}

interface CreateEventRequest {
  title: string;
  description?: string;
  eventType?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isPublic?: boolean;
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number;
}

// Helper function removed - now using imported createAuditInfo from utils

// GET /api/events - Fetch all events with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      isPublic, 
      limit = '50', 
      offset = '0' 
    } = req.query as EventsQuery;

    // Build where clause
    const where: Prisma.EventWhereInput = {};
    
    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    
    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }
    
    if (eventType) {
      where.eventType = eventType;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    // Fetch events
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await prisma.event.count({ where });

    // Transform events to match frontend NewsEvent interface
    const transformedEvents = events.map(event => ({
      id: event.id.toString(),
      title: event.title,
      date: event.startDate.toISOString().split('T')[0],
      endDate: event.endDate?.toISOString().split('T')[0],
      type: event.eventType || 'general',
      description: event.description || '',
      location: event.location,
      isPublic: event.isPublic,
      hasReminder: false, // This will be calculated based on user reminders
      creator: event.creator
    }));

    res.json({
      success: true,
      data: transformedEvents,
      events: transformedEvents,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + events.length < totalCount
      }
    });

  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// GET /api/events/:id - Fetch a single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        error: 'Invalid event ID',
        message: 'Event ID must be a number'
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: `Event with ID ${eventId} does not exist`
      });
    }

    // Transform event to match frontend format
    const transformedEvent = {
      id: event.id.toString(),
      title: event.title,
      date: event.startDate.toISOString().split('T')[0],
      endDate: event.endDate?.toISOString().split('T')[0],
      type: event.eventType || 'general',
      description: event.description || '',
      location: event.location,
      isPublic: event.isPublic,
      hasReminder: false,
      creator: event.creator
    };

    res.json(transformedEvent);

  } catch (error: any) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      error: 'Failed to fetch event',
      message: error.message
    });
  }
});

// POST /api/events - Create a new event (managers only)
router.post('/', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      isPublic = true
    } = req.body as CreateEventRequest;

    // Validation
    if (!title || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and start date are required'
      });
    }

    // Get the actual user ID from the JWT token
    const createdBy = getUserIdFromRequest(req);
    
    if (!createdBy || createdBy === 0) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Valid user authentication is required to create events'
      });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        isPublic,
        createdBy,
        auditInfo: createAuditInfo(getUserEmailFromRequest(req)) as any
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Transform to frontend format
    const transformedEvent = {
      id: newEvent.id.toString(),
      title: newEvent.title,
      date: newEvent.startDate.toISOString().split('T')[0],
      endDate: newEvent.endDate?.toISOString().split('T')[0],
      type: newEvent.eventType || 'general',
      description: newEvent.description || '',
      location: newEvent.location,
      isPublic: newEvent.isPublic,
      hasReminder: false,
      creator: newEvent.creator
    };

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: transformedEvent
    });

  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({
      error: 'Failed to create event',
      message: error.message
    });
  }
});

// PUT /api/events/:id - Update an existing event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const updateData = req.body as UpdateEventRequest;

    if (isNaN(eventId)) {
      return res.status(400).json({
        error: 'Invalid event ID',
        message: 'Event ID must be a number'
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        error: 'Event not found',
        message: `Event with ID ${eventId} does not exist`
      });
    }

    // Prepare update data
    const updatePayload: any = {
      auditInfo: createAuditInfo(getUserEmailFromRequest(req))
    };

    if (updateData.title) updatePayload.title = updateData.title;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.eventType) updatePayload.eventType = updateData.eventType;
    if (updateData.startDate) updatePayload.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updatePayload.endDate = new Date(updateData.endDate);
    if (updateData.location !== undefined) updatePayload.location = updateData.location;
    if (updateData.isPublic !== undefined) updatePayload.isPublic = updateData.isPublic;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updatePayload,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Transform to frontend format
    const transformedEvent = {
      id: updatedEvent.id.toString(),
      title: updatedEvent.title,
      date: updatedEvent.startDate.toISOString().split('T')[0],
      endDate: updatedEvent.endDate?.toISOString().split('T')[0],
      type: updatedEvent.eventType || 'general',
      description: updatedEvent.description || '',
      location: updatedEvent.location,
      isPublic: updatedEvent.isPublic,
      hasReminder: false,
      creator: updatedEvent.creator
    };

    res.json({
      message: 'Event updated successfully',
      event: transformedEvent
    });

  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({
      error: 'Failed to update event',
      message: error.message
    });
  }
});

// DELETE /api/events/:id - Delete an event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        error: 'Invalid event ID',
        message: 'Event ID must be a number'
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        error: 'Event not found',
        message: `Event with ID ${eventId} does not exist`
      });
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    res.json({
      message: 'Event deleted successfully',
      deletedEventId: eventId
    });

  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      error: 'Failed to delete event',
      message: error.message
    });
  }
});

// GET /api/events/upcoming - Get upcoming events (next 30 days)
router.get('/filter/upcoming', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: now,
          lte: thirtyDaysFromNow
        },
        isPublic: true
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: parseInt(limit.toString())
    });

    const transformedEvents = upcomingEvents.map(event => ({
      id: event.id.toString(),
      title: event.title,
      date: event.startDate.toISOString().split('T')[0],
      endDate: event.endDate?.toISOString().split('T')[0],
      type: event.eventType || 'general',
      description: event.description || '',
      location: event.location,
      isPublic: event.isPublic,
      hasReminder: false,
      creator: event.creator
    }));

    res.json({
      events: transformedEvents,
      count: upcomingEvents.length
    });

  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      error: 'Failed to fetch upcoming events',
      message: error.message
    });
  }
});

// GET /api/events/by-month/:year/:month - Get events for a specific month
router.get('/by-month/:year/:month', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        error: 'Invalid date parameters',
        message: 'Year must be a number and month must be between 1-12'
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const monthlyEvents = await prisma.event.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } }
            ]
          }
        ],
        isPublic: true
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    const transformedEvents = monthlyEvents.map(event => ({
      id: event.id.toString(),
      title: event.title,
      date: event.startDate.toISOString().split('T')[0],
      endDate: event.endDate?.toISOString().split('T')[0],
      type: event.eventType || 'general',
      description: event.description || '',
      location: event.location,
      isPublic: event.isPublic,
      hasReminder: false,
      creator: event.creator
    }));

    res.json({
      events: transformedEvents,
      month: month,
      year: year,
      count: monthlyEvents.length
    });

  } catch (error: any) {
    console.error('Error fetching monthly events:', error);
    res.status(500).json({
      error: 'Failed to fetch monthly events',
      message: error.message
    });
  }
});

// PUT /api/events/:id - Update event (managers only)
router.put('/:id', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      isPublic
    } = req.body as UpdateEventRequest;

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Update audit info with actual user email
    const userEmail = getUserEmailFromRequest(req);
    const currentAuditInfo = existingEvent.auditInfo as any;
    const updateData: any = {
      auditInfo: updateAuditInfo(currentAuditInfo, userEmail) as any
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        creator: {
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
      message: 'Event updated successfully',
      data: updatedEvent
    });

  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      details: error.message
    });
  }
});

// DELETE /api/events/:id - Delete event (managers only)
router.delete('/:id', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      details: error.message
    });
  }
});

// PUT /api/events/:id/status - Toggle event public status (managers only)
router.put('/:id/status', authenticateToken, requireAdminOrManager, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const { isPublic } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isPublic must be a boolean value'
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Update audit info with actual user email
    const userEmail = getUserEmailFromRequest(req);
    const currentAuditInfo = existingEvent.auditInfo as any;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        isPublic: isPublic,
        auditInfo: updateAuditInfo(currentAuditInfo, userEmail) as any
      },
      include: {
        creator: {
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
      message: `Event ${isPublic ? 'published' : 'unpublished'} successfully`,
      data: updatedEvent
    });

  } catch (error: any) {
    console.error('Error updating event status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event status',
      details: error.message
    });
  }
});

export default router;
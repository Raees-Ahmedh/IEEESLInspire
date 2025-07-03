// client/src/services/eventsService.ts
import { NewsEvent } from '../types';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface EventsResponse {
  events: NewsEvent[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  count?: number;
  month?: number;
  year?: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventType?: 'application' | 'exam' | 'result' | 'general';
  startDate: string;
  endDate?: string;
  location?: string;
  isPublic?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number;
}

export interface EventsQuery {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

class EventsService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all events with optional filtering
  async getEvents(query: EventsQuery = {}): Promise<EventsResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.startDate) searchParams.append('startDate', query.startDate);
    if (query.endDate) searchParams.append('endDate', query.endDate);
    if (query.eventType) searchParams.append('eventType', query.eventType);
    if (query.isPublic !== undefined) searchParams.append('isPublic', query.isPublic.toString());
    if (query.limit) searchParams.append('limit', query.limit.toString());
    if (query.offset) searchParams.append('offset', query.offset.toString());

    const url = `${API_BASE_URL}/events?${searchParams.toString()}`;
    return this.fetchWithErrorHandling(url);
  }

  // Get a single event by ID
  async getEventById(id: string | number): Promise<NewsEvent> {
    const url = `${API_BASE_URL}/events/${id}`;
    return this.fetchWithErrorHandling(url);
  }

  // Create a new event
  async createEvent(eventData: CreateEventRequest): Promise<{ message: string; event: NewsEvent }> {
    const url = `${API_BASE_URL}/events`;
    return this.fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Update an existing event
  async updateEvent(id: number, eventData: Partial<CreateEventRequest>): Promise<{ message: string; event: NewsEvent }> {
    const url = `${API_BASE_URL}/events/${id}`;
    return this.fetchWithErrorHandling(url, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  // Delete an event
  async deleteEvent(id: number): Promise<{ message: string; deletedEventId: number }> {
    const url = `${API_BASE_URL}/events/${id}`;
    return this.fetchWithErrorHandling(url, {
      method: 'DELETE',
    });
  }

  // Get upcoming events (next 30 days)
  async getUpcomingEvents(limit: number = 10): Promise<EventsResponse> {
    const url = `${API_BASE_URL}/events/filter/upcoming?limit=${limit}`;
    return this.fetchWithErrorHandling(url);
  }

  // Get events for a specific month
  async getEventsByMonth(year: number, month: number): Promise<EventsResponse> {
    const url = `${API_BASE_URL}/events/by-month/${year}/${month}`;
    return this.fetchWithErrorHandling(url);
  }

  // Get events for the current month
  async getCurrentMonthEvents(): Promise<EventsResponse> {
    const now = new Date();
    return this.getEventsByMonth(now.getFullYear(), now.getMonth() + 1);
  }

  // Get events for a date range
  async getEventsInDateRange(startDate: string, endDate: string): Promise<EventsResponse> {
    return this.getEvents({ startDate, endDate });
  }

  // Search events by title or description
  async searchEvents(searchTerm: string, filters: Omit<EventsQuery, 'limit' | 'offset'> = {}): Promise<EventsResponse> {
    // Note: This is a simple client-side search since we don't have full-text search in the backend yet
    // In a production app, you'd implement this on the backend
    const allEvents = await this.getEvents(filters);
    
    const filteredEvents = allEvents.events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      events: filteredEvents,
      count: filteredEvents.length
    };
  }

  // Get events by type
  async getEventsByType(eventType: 'application' | 'exam' | 'result' | 'general'): Promise<EventsResponse> {
    return this.getEvents({ eventType });
  }

  // Helper method to format events for calendar display
  formatEventsForCalendar(events: NewsEvent[]): Record<string, NewsEvent[]> {
    return events.reduce((acc, event) => {
      const dateKey = event.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, NewsEvent[]>);
  }

  // Helper method to get events for a specific date
  getEventsForDate(events: NewsEvent[], date: Date): NewsEvent[] {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  }

  // Helper method to check if an event is happening today
  isEventToday(event: NewsEvent): boolean {
    const today = new Date().toISOString().split('T')[0];
    return event.date === today;
  }

  // Helper method to check if an event is upcoming (in the future)
  isEventUpcoming(event: NewsEvent): boolean {
    const today = new Date().toISOString().split('T')[0];
    return event.date > today;
  }

  // Helper method to check if an event is in the past
  isEventPast(event: NewsEvent): boolean {
    const today = new Date().toISOString().split('T')[0];
    return event.date < today;
  }

  // Helper method to get the number of days until an event
  getDaysUntilEvent(event: NewsEvent): number {
    const today = new Date();
    const eventDate = new Date(event.date);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Helper method to get events grouped by type
  groupEventsByType(events: NewsEvent[]): Record<string, NewsEvent[]> {
    return events.reduce((acc, event) => {
      const type = event.type || 'general';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(event);
      return acc;
    }, {} as Record<string, NewsEvent[]>);
  }
}

// Create and export a singleton instance
export const eventsService = new EventsService();
export default eventsService;
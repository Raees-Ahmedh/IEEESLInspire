// client/src/store/slices/eventsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import eventsService, { 
  EventsQuery, 
  CreateEventRequest, 
  EventsResponse 
} from '../../services/eventsService';
// Import the NewsEvent and Reminder types from the Calendar component
import type { NewsEvent, Reminder } from '../../components/Calendar';

interface EventsState {
  // Events data
  events: NewsEvent[];
  currentMonthEvents: NewsEvent[];
  upcomingEvents: NewsEvent[];
  
  // Reminders data
  reminders: Reminder[];
  
  // Loading states
  eventsLoading: boolean;
  currentMonthLoading: boolean;
  upcomingEventsLoading: boolean;
  createEventLoading: boolean;
  updateEventLoading: boolean;
  deleteEventLoading: boolean;
  
  // Error states
  eventsError: string | null;
  currentMonthError: string | null;
  upcomingEventsError: string | null;
  createEventError: string | null;
  updateEventError: string | null;
  deleteEventError: string | null;
  
  // Pagination
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null;
  
  // Filter state
  filters: {
    eventType?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  };
  
  // UI state
  selectedEvent: NewsEvent | null;
  selectedDate: string | null;
  currentViewMonth: number;
  currentViewYear: number;
}

const initialState: EventsState = {
  events: [],
  currentMonthEvents: [],
  upcomingEvents: [],
  reminders: [],
  
  eventsLoading: false,
  currentMonthLoading: false,
  upcomingEventsLoading: false,
  createEventLoading: false,
  updateEventLoading: false,
  deleteEventLoading: false,
  
  eventsError: null,
  currentMonthError: null,
  upcomingEventsError: null,
  createEventError: null,
  updateEventError: null,
  deleteEventError: null,
  
  pagination: null,
  
  filters: {},
  
  selectedEvent: null,
  selectedDate: null,
  currentViewMonth: new Date().getMonth() + 1,
  currentViewYear: new Date().getFullYear(),
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (query: EventsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await eventsService.getEvents(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentMonthEvents = createAsyncThunk(
  'events/fetchCurrentMonthEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { events: EventsState };
      const { currentViewYear, currentViewMonth } = state.events;
      const response = await eventsService.getEventsByMonth(currentViewYear, currentViewMonth);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEventsByMonth = createAsyncThunk(
  'events/fetchEventsByMonth',
  async ({ year, month }: { year: number; month: number }, { rejectWithValue }) => {
    try {
      const response = await eventsService.getEventsByMonth(year, month);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcomingEvents',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await eventsService.getUpcomingEvents(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: CreateEventRequest, { rejectWithValue }) => {
    try {
      const response = await eventsService.createEvent(eventData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, data }: { id: number; data: Partial<CreateEventRequest> }, { rejectWithValue }) => {
    try {
      const response = await eventsService.updateEvent(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await eventsService.deleteEvent(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const event = await eventsService.getEventById(id);
      return event;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Events slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Clear errors
    clearEventsErrors: (state) => {
      state.eventsError = null;
      state.currentMonthError = null;
      state.upcomingEventsError = null;
      state.createEventError = null;
      state.updateEventError = null;
      state.deleteEventError = null;
    },
    
    // Set filters
    setEventFilters: (state, action: PayloadAction<Partial<EventsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearEventFilters: (state) => {
      state.filters = {};
    },
    
    // Set selected event
    setSelectedEvent: (state, action: PayloadAction<NewsEvent | null>) => {
      state.selectedEvent = action.payload;
    },
    
    // Set selected date
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    
    // Set current view month/year
    setCurrentViewDate: (state, action: PayloadAction<{ year: number; month: number }>) => {
      state.currentViewYear = action.payload.year;
      state.currentViewMonth = action.payload.month;
    },
    
    // Navigate calendar month
    navigateCalendarMonth: (state, action: PayloadAction<'prev' | 'next'>) => {
      if (action.payload === 'prev') {
        if (state.currentViewMonth === 1) {
          state.currentViewMonth = 12;
          state.currentViewYear -= 1;
        } else {
          state.currentViewMonth -= 1;
        }
      } else {
        if (state.currentViewMonth === 12) {
          state.currentViewMonth = 1;
          state.currentViewYear += 1;
        } else {
          state.currentViewMonth += 1;
        }
      }
    },
    
    // Go to today
    goToToday: (state) => {
      const today = new Date();
      state.currentViewYear = today.getFullYear();
      state.currentViewMonth = today.getMonth() + 1;
    },
    
    // Reminder management
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.reminders.push(action.payload);
      // Update the corresponding event to show it has a reminder
      const eventIndex = state.currentMonthEvents.findIndex(e => e.id === action.payload.eventId);
      if (eventIndex !== -1) {
        state.currentMonthEvents[eventIndex].hasReminder = true;
      }
    },
    
    removeReminder: (state, action: PayloadAction<string>) => {
      const reminderToRemove = state.reminders.find(r => r.id === action.payload);
      if (reminderToRemove) {
        state.reminders = state.reminders.filter(r => r.id !== action.payload);
        // Update the corresponding event
        const eventIndex = state.currentMonthEvents.findIndex(e => e.id === reminderToRemove.eventId);
        if (eventIndex !== -1) {
          const hasOtherReminders = state.reminders.some(r => r.eventId === reminderToRemove.eventId);
          state.currentMonthEvents[eventIndex].hasReminder = hasOtherReminders;
        }
      }
    },
    
    updateReminders: (state, action: PayloadAction<Reminder[]>) => {
      state.reminders = action.payload;
    },
    
    // Update event with reminder status
    updateEventReminderStatus: (state, action: PayloadAction<{ eventId: string; hasReminder: boolean }>) => {
      const { eventId, hasReminder } = action.payload;
      
      // Update in current month events
      const monthEventIndex = state.currentMonthEvents.findIndex(e => e.id === eventId);
      if (monthEventIndex !== -1) {
        state.currentMonthEvents[monthEventIndex].hasReminder = hasReminder;
      }
      
      // Update in all events
      const allEventIndex = state.events.findIndex(e => e.id === eventId);
      if (allEventIndex !== -1) {
        state.events[allEventIndex].hasReminder = hasReminder;
      }
      
      // Update in upcoming events
      const upcomingEventIndex = state.upcomingEvents.findIndex(e => e.id === eventId);
      if (upcomingEventIndex !== -1) {
        state.upcomingEvents[upcomingEventIndex].hasReminder = hasReminder;
      }
      
      // Update selected event if it matches
      if (state.selectedEvent && state.selectedEvent.id === eventId) {
        state.selectedEvent.hasReminder = hasReminder;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload.events;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload as string;
      });

    // Fetch current month events
    builder
      .addCase(fetchCurrentMonthEvents.pending, (state) => {
        state.currentMonthLoading = true;
        state.currentMonthError = null;
      })
      .addCase(fetchCurrentMonthEvents.fulfilled, (state, action) => {
        state.currentMonthLoading = false;
        state.currentMonthEvents = action.payload.events;
      })
      .addCase(fetchCurrentMonthEvents.rejected, (state, action) => {
        state.currentMonthLoading = false;
        state.currentMonthError = action.payload as string;
      });

    // Fetch events by month
    builder
      .addCase(fetchEventsByMonth.pending, (state) => {
        state.currentMonthLoading = true;
        state.currentMonthError = null;
      })
      .addCase(fetchEventsByMonth.fulfilled, (state, action) => {
        state.currentMonthLoading = false;
        state.currentMonthEvents = action.payload.events;
        if (action.payload.year && action.payload.month) {
          state.currentViewYear = action.payload.year;
          state.currentViewMonth = action.payload.month;
        }
      })
      .addCase(fetchEventsByMonth.rejected, (state, action) => {
        state.currentMonthLoading = false;
        state.currentMonthError = action.payload as string;
      });

    // Fetch upcoming events
    builder
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.upcomingEventsLoading = true;
        state.upcomingEventsError = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.upcomingEventsLoading = false;
        state.upcomingEvents = action.payload.events;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.upcomingEventsLoading = false;
        state.upcomingEventsError = action.payload as string;
      });

    // Create event
    builder
      .addCase(createEvent.pending, (state) => {
        state.createEventLoading = true;
        state.createEventError = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.createEventLoading = false;
        state.events.push(action.payload.event);
        // Add to current month events if it belongs to the current view
        const eventDate = new Date(action.payload.event.date);
        if (eventDate.getFullYear() === state.currentViewYear && 
            eventDate.getMonth() + 1 === state.currentViewMonth) {
          state.currentMonthEvents.push(action.payload.event);
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.createEventLoading = false;
        state.createEventError = action.payload as string;
      });

    // Update event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.updateEventLoading = true;
        state.updateEventError = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.updateEventLoading = false;
        const updatedEvent = action.payload.event;
        
        // Update in all events array
        const allEventsIndex = state.events.findIndex(e => e.id === updatedEvent.id);
        if (allEventsIndex !== -1) {
          state.events[allEventsIndex] = updatedEvent;
        }
        
        // Update in current month events
        const monthEventsIndex = state.currentMonthEvents.findIndex(e => e.id === updatedEvent.id);
        if (monthEventsIndex !== -1) {
          state.currentMonthEvents[monthEventsIndex] = updatedEvent;
        }
        
        // Update selected event if it matches
        if (state.selectedEvent && state.selectedEvent.id === updatedEvent.id) {
          state.selectedEvent = updatedEvent;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.updateEventLoading = false;
        state.updateEventError = action.payload as string;
      });

    // Delete event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.deleteEventLoading = true;
        state.deleteEventError = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.deleteEventLoading = false;
        const deletedId = action.payload.deletedEventId.toString();
        
        // Remove from all arrays
        state.events = state.events.filter(e => e.id !== deletedId);
        state.currentMonthEvents = state.currentMonthEvents.filter(e => e.id !== deletedId);
        state.upcomingEvents = state.upcomingEvents.filter(e => e.id !== deletedId);
        
        // Clear selected event if it was deleted
        if (state.selectedEvent && state.selectedEvent.id === deletedId) {
          state.selectedEvent = null;
        }
        
        // Remove related reminders
        state.reminders = state.reminders.filter(r => r.eventId !== deletedId);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.deleteEventLoading = false;
        state.deleteEventError = action.payload as string;
      });

    // Fetch event by ID
    builder
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
      });
  },
});

export const {
  clearEventsErrors,
  setEventFilters,
  clearEventFilters,
  setSelectedEvent,
  setSelectedDate,
  setCurrentViewDate,
  navigateCalendarMonth,
  goToToday,
  addReminder,
  removeReminder,
  updateReminders,
  updateEventReminderStatus
} = eventsSlice.actions;

export default eventsSlice.reducer;
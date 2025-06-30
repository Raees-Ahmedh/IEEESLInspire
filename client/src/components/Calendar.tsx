// client/src/components/Calendar.tsx - Part 1: Main Structure and Logic
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, X, Plus, Filter, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  navigateCalendarMonth, 
  goToToday as goToTodayAction, 
  addReminder, 
  removeReminder, 
  updateEventReminderStatus,
  setSelectedEvent,
  setSelectedDate,
  setCurrentViewDate
} from '../store/slices/eventsSlice';

// Updated NewsEvent interface to match the backend response
export interface NewsEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'application' | 'exam' | 'result' | 'general';
  description: string;
  location?: string;
  isPublic?: boolean;
  hasReminder: boolean;
  creator?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface Reminder {
  id: string;
  eventId: string;
  reminderDate: string;
  reminderTime: string;
}

interface CalendarProps {
  events: NewsEvent[];
  reminders: Reminder[];
  onEventUpdate: (events: NewsEvent[]) => void;
  onReminderUpdate: (reminders: Reminder[]) => void;
  showCreateButton?: boolean;
  onCreateEvent?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  reminders, 
  onEventUpdate, 
  onReminderUpdate,
  showCreateButton = false,
  onCreateEvent
}) => {
  const dispatch = useAppDispatch();
  const { 
    selectedEvent, 
    selectedDate, 
    currentViewYear, 
    currentViewMonth,
    currentMonthLoading 
  } = useAppSelector((state) => state.events);

  // Local state for modals and UI
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  // Create current date object from Redux state
  const currentDate = new Date(currentViewYear, currentViewMonth - 1, 1);

  // Helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filteredEvents = events.filter(event => {
      const matchesDate = event.date === dateStr;
      const matchesFilter = eventTypeFilter === 'all' || event.type === eventTypeFilter;
      return matchesDate && matchesFilter;
    });
    return filteredEvents;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type: NewsEvent['type']) => {
    switch (type) {
      case 'application':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'result':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'general':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Event handlers
  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    dispatch(navigateCalendarMonth(direction));
  };

  const handleGoToToday = () => {
    dispatch(goToTodayAction());
  };

  const handleEventClick = (event: NewsEvent) => {
    dispatch(setSelectedEvent(event));
    setShowEventDetails(true);
  };

  const handleAddReminder = (event: NewsEvent) => {
    dispatch(setSelectedEvent(event));
    setShowReminderModal(true);
    // Default reminder date to 1 day before event
    const eventDate = new Date(event.date);
    eventDate.setDate(eventDate.getDate() - 1);
    setReminderDate(eventDate.toISOString().split('T')[0]);
    setReminderTime('09:00');
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    dispatch(setSelectedDate(dateStr));
    
    // Get events for this date
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      handleEventClick(dayEvents[0]);
    } else if (dayEvents.length > 1) {
      // Show the first event or implement a selection modal
      handleEventClick(dayEvents[0]);
    }
  };

  const saveReminder = () => {
    if (selectedEvent && reminderDate && reminderTime) {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        eventId: selectedEvent.id,
        reminderDate,
        reminderTime
      };
      
      dispatch(addReminder(newReminder));
      dispatch(updateEventReminderStatus({
        eventId: selectedEvent.id,
        hasReminder: true
      }));
      
      // Update parent component
      onReminderUpdate([...reminders, newReminder]);
      
      setShowReminderModal(false);
      dispatch(setSelectedEvent(null));
      setReminderDate('');
      setReminderTime('');
    }
  };

  const handleRemoveReminder = (eventId: string) => {
    const reminderToRemove = reminders.find(r => r.eventId === eventId);
    if (reminderToRemove) {
      dispatch(removeReminder(reminderToRemove.id));
      
      // Check if there are other reminders for this event
      const hasOtherReminders = reminders.filter(r => r.eventId === eventId).length > 1;
      dispatch(updateEventReminderStatus({
        eventId,
        hasReminder: hasOtherReminders
      }));
      
      // Update parent component
      const updatedReminders = reminders.filter(r => r.id !== reminderToRemove.id);
      onReminderUpdate(updatedReminders);
    }
  };

  // Calendar rendering function
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();

    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-100 bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = selectedDate === dateStr;

      calendarDays.push(
        <div 
          key={day} 
          className={`h-32 border border-gray-100 p-2 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
                title={event.description}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate flex-1">{event.title}</span>
                  {event.hasReminder && (
                    <Bell className="w-3 h-3 ml-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const filteredEventTypes = [...new Set(events.map(e => e.type))];

  // Main Calendar JSX (Part 1)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">News Calendar</h1>
            <div className="flex items-center space-x-2">
              {showCreateButton && onCreateEvent && (
                <button
                  onClick={onCreateEvent}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Event Type:</label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  {filteredEventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <p className="text-gray-600">
            Stay updated with important dates and events. Click on events to set reminders.
          </p>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{monthYear}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {days.map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden mb-6">
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200"></div>
            <span className="text-sm text-gray-600">Application</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded border border-red-200"></div>
            <span className="text-sm text-gray-600">Exam</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
            <span className="text-sm text-gray-600">Result</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 rounded border border-purple-200"></div>
            <span className="text-sm text-gray-600">General</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Has Reminder</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {currentMonthLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading events...</span>
          </div>
        </div>
      )}

     

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Date:</strong> {formatDate(selectedEvent.date)}
                  </p>
                  {selectedEvent.endDate && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>End Date:</strong> {formatDate(selectedEvent.endDate)}
                    </p>
                  )}
                  {selectedEvent.location && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Location:</strong> {selectedEvent.location}
                    </p>
                  )}
                  {selectedEvent.creator && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Created by:</strong> {selectedEvent.creator.firstName || selectedEvent.creator.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-700">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleAddReminder(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={selectedEvent.hasReminder}
                >
                  {selectedEvent.hasReminder ? 'Reminder Set' : 'Set Reminder'}
                </button>
                {selectedEvent.hasReminder && (
                  <button
                    onClick={() => handleRemoveReminder(selectedEvent.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Set Reminder
                </h3>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Event: <strong>{selectedEvent.title}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Event Date: <strong>{formatDate(selectedEvent.date)}</strong>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Date
                  </label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    max={selectedEvent.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set reminder date (must be before event date)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose notification time
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Reminder Preview
                      </p>
                      <p className="text-sm text-blue-700">
                        {reminderDate && reminderTime ? (
                          <>You'll be reminded on {new Date(reminderDate).toLocaleDateString()} at {reminderTime}</>
                        ) : (
                          'Please select date and time'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveReminder}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!reminderDate || !reminderTime}
                >
                  {!reminderDate || !reminderTime ? 'Set Date & Time' : 'Save Reminder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper hook for calendar functionality (optional - can be used for extended features)
export const useCalendarHelpers = () => {
  const dispatch = useAppDispatch();
  
  const navigateToMonth = (year: number, month: number) => {
    dispatch(setCurrentViewDate({ year, month }));
  };

  const goToToday = () => {
    dispatch(goToTodayAction());
  };

  const addEventReminder = (eventId: string, reminderDate: string, reminderTime: string) => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      eventId,
      reminderDate,
      reminderTime
    };
    dispatch(addReminder(reminder));
    dispatch(updateEventReminderStatus({ eventId, hasReminder: true }));
    return reminder;
  };

  const removeEventReminder = (reminderId: string, eventId: string) => {
    dispatch(removeReminder(reminderId));
    // Note: In a real app, you'd check if there are other reminders for this event
    dispatch(updateEventReminderStatus({ eventId, hasReminder: false }));
  };

  return {
    navigateToMonth,
    goToToday,
    addEventReminder,
    removeEventReminder
  };
};

export default Calendar;
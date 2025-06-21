import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, X } from 'lucide-react';

export interface NewsEvent {
  id: string;
  title: string;
  date: string;
  type: 'application' | 'exam' | 'result' | 'general';
  description: string;
  hasReminder: boolean;
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
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  reminders, 
  onEventUpdate, 
  onReminderUpdate 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
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
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'result':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleAddReminder = (event: NewsEvent) => {
    setSelectedEvent(event);
    setShowReminderModal(true);
    // Default reminder date to 1 day before event
    const eventDate = new Date(event.date);
    eventDate.setDate(eventDate.getDate() - 1);
    setReminderDate(eventDate.toISOString().split('T')[0]);
    setReminderTime('09:00');
  };

  const saveReminder = () => {
    if (selectedEvent && reminderDate && reminderTime) {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        eventId: selectedEvent.id,
        reminderDate,
        reminderTime
      };
      onReminderUpdate([...reminders, newReminder]);
      
      // Update the event to show it has a reminder
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, hasReminder: true }
          : event
      );
      onEventUpdate(updatedEvents);
      
      setShowReminderModal(false);
      setSelectedEvent(null);
      setReminderDate('');
      setReminderTime('');
    }
  };

  const removeReminder = (eventId: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.eventId !== eventId);
    onReminderUpdate(updatedReminders);
    
    const updatedEvents = events.map(event => 
      event.id === eventId 
        ? { ...event, hasReminder: false }
        : event
    );
    onEventUpdate(updatedEvents);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-100"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      calendarDays.push(
        <div 
          key={day} 
          className={`h-32 border border-gray-100 p-2 bg-white hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                onClick={() => handleAddReminder(event)}
                title={event.description}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate flex-1">{event.title}</span>
                  {event.hasReminder && (
                    <Bell className="w-3 h-3 ml-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">News Calendar</h1>
        <p className="text-gray-600">Stay updated with important dates and events. Click on events to set reminders.</p>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{monthYear}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {days.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span className="text-sm text-gray-600">Application</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span className="text-sm text-gray-600">Exam</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-sm text-gray-600">Result</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 rounded"></div>
          <span className="text-sm text-gray-600">General</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Has Reminder</span>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Set Reminder</h3>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">{selectedEvent.title}</h4>
              <p className="text-sm text-gray-600 mb-1">{selectedEvent.description}</p>
              <p className="text-sm text-gray-500">Event Date: {formatDate(selectedEvent.date)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  max={selectedEvent.date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {selectedEvent.hasReminder ? (
                <button
                  onClick={() => {
                    removeReminder(selectedEvent.id);
                    setShowReminderModal(false);
                  }}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove Reminder
                </button>
              ) : (
                <button
                  onClick={saveReminder}
                  disabled={!reminderDate || !reminderTime}
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Set Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
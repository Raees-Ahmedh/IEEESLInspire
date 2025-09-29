import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Calendar, User, MapPin, Globe, EyeOff, AlertCircle, CheckCircle, X, Clock } from 'lucide-react';
import { eventsService } from '../../services/apiService';

interface Event {
  id: number | string;
  title: string;
  description?: string;
  eventType?: string;
  type?: string; // Alternative field name
  startDate?: string;
  date?: string; // Alternative field name
  endDate?: string;
  location?: string;
  isPublic?: boolean;
  creator?: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
  auditInfo?: any;
}

interface EventsManagementProps {
  onAddEvent?: () => void;
  onEditEvent?: (event: any) => void;
}

const EventsManagement: React.FC<EventsManagementProps> = ({ onAddEvent, onEditEvent }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Filter events when search term or filters change
  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, typeFilter, statusFilter]);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading events...');
      const response = await eventsService.getAllEvents();
      console.log('🔍 Events response:', response);
      
      // Handle different response structures
      let eventsData = [];
      if (response.success && response.data) {
        eventsData = response.data;
      } else if (response.events) {
        // Handle direct events array response
        eventsData = response.events;
      } else {
        console.error('🔍 Events API error:', response.error);
        setError(response.error || 'Failed to load events');
        return;
      }
      
      setEvents(eventsData);
      console.log('🔍 Events loaded:', eventsData.length);
    } catch (error) {
      console.error('🔍 Events network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => (event.eventType || event.type) === typeFilter);
    }

    // Filter by public status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => 
        statusFilter === 'public' ? event.isPublic : !event.isPublic
      );
    }

    // Sort by start date
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await eventsService.deleteEvent(id);
      if (response.success) {
        setSuccess('Event deleted successfully!');
        loadEvents();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to delete event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    setIsSubmitting(true);
    try {
      const response = await eventsService.updateEventStatus(id, newStatus);
      if (response.success) {
        setSuccess(`Event ${newStatus ? 'published' : 'unpublished'} successfully!`);
        loadEvents();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update event status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating event status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      SLI: { bg: 'bg-blue-100', text: 'text-blue-800' },
      university: { bg: 'bg-green-100', text: 'text-green-800' },
      deadline: { bg: 'bg-red-100', text: 'text-red-800' },
      workshop: { bg: 'bg-purple-100', text: 'text-purple-800' },
      conference: { bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    const config = typeMap[type as keyof typeof typeMap] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'General'}
      </span>
    );
  };

  const getStatusBadge = (isPublic: boolean) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isPublic 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isPublic ? <Globe className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
        {isPublic ? 'Public' : 'Private'}
      </span>
    );
  };

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isEventOngoing = (startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    return now >= start && now <= end;
  };

  const getEventStatus = (event: Event) => {
    const startDate = event.startDate || event.date;
    const endDate = event.endDate;
    
    if (!startDate) {
      return { status: 'unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
    
    if (isEventOngoing(startDate, endDate)) {
      return { status: 'ongoing', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (isEventUpcoming(startDate)) {
      return { status: 'upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    } else {
      return { status: 'past', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Events Management</h1>
          <p className="text-gray-600">Manage events and announcements</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onAddEvent?.()}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
          <button
            onClick={loadEvents}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{success || error}</span>
          <button 
            onClick={() => { setSuccess(null); setError(null); }}
            className="ml-auto text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search events..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="SLI">SLI</option>
              <option value="university">University</option>
              <option value="deadline">Deadline</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first event.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            return (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {(event.eventType || event.type) && getTypeBadge(event.eventType || event.type)}
                        {getStatusBadge(event.isPublic || true)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${eventStatus.bg} ${eventStatus.color}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {eventStatus.status.charAt(0).toUpperCase() + eventStatus.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{event.description || 'No description provided.'}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Start: {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                      </div>
                      {event.endDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>End: {new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{event.creator?.firstName || 'System'} {event.creator?.lastName || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Created: {event.auditInfo?.createdAt ? new Date(event.auditInfo.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowViewModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onEditEvent) {
                          onEditEvent(event);
                        } else {
                          setSelectedEvent(event);
                          setShowEditModal(true);
                        }
                      }}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(event.id, event.isPublic)}
                      disabled={isSubmitting}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
                        event.isPublic
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {event.isPublic ? <EyeOff className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      <span>{event.isPublic ? 'Make Private' : 'Make Public'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TODO: Add modals for Add, Edit, and View events */}
    </div>
  );
};

export default EventsManagement;

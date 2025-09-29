import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { api } from '../services/apiService';

interface Event {
  id: number | string;
  title: string;
  description?: string;
  eventType?: string;
  type?: string;
  startDate?: string;
  date?: string;
  endDate?: string;
  location?: string;
  isPublic: boolean;
  creator?: {
    firstName: string;
    lastName: string;
  };
}

interface EventsSectionProps {
  onViewAllEvents?: () => void;
  onViewEvent?: (id: number) => void;
}

const EventsSection: React.FC<EventsSectionProps> = ({ 
  onViewAllEvents, 
  onViewEvent 
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('🔍 Fetching events...');
        const response = await api.events.getAllEvents();
        console.log('🔍 Events response:', response);
        
        // Handle different response structures
        let eventsData = [];
        if (response.success && response.data) {
          eventsData = response.data;
        } else if ((response as any).events) {
          eventsData = (response as any).events;
        } else if (Array.isArray(response)) {
          eventsData = response;
        }
        
        console.log('🔍 Events data:', eventsData);
        
        if (eventsData && eventsData.length > 0) {
          console.log('🔍 All events data:', eventsData);
          
          // Show all public events, sorted by date
          const publicEvents = eventsData
            .filter((event: any) => {
              console.log('🔍 Checking event:', event.title, 'isPublic:', event.isPublic, 'date:', event.startDate || event.date);
              return event.isPublic;
            })
            .sort((a: any, b: any) => {
              const dateA = new Date(a.startDate || a.date);
              const dateB = new Date(b.startDate || b.date);
              return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 3);
          
          console.log('🔍 Public events:', publicEvents);
          setEvents(publicEvents);
        } else {
          console.log('🔍 No events data found');
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-gray-600 mb-8">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest events, workshops, and important dates in the education sector.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">Check back later for new events and announcements.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {event.eventType || event.type || 'Event'}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(event.startDate || event.date || '')}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatDate(event.startDate || event.date || '')}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onViewEvent ? onViewEvent(Number(event.id)) : console.log(`View event ${event.id}`)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Events Button */}
        <div className="text-center mt-12">
          {/*<button 
            onClick={onViewAllEvents}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            View All Events
            <ArrowRight className="w-5 h-5" />
          </button>*/}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;

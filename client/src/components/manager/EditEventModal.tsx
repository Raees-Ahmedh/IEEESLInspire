import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Globe, EyeOff, FileText } from 'lucide-react';
import { eventsService } from '../../services/apiService';

interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  location: string;
  isPublic: boolean;
  status: 'draft' | 'published' | 'cancelled';
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Event | null;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, onSuccess, event }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'general',
    startDate: '',
    endDate: '',
    location: '',
    isPublic: true,
    status: 'draft' as 'draft' | 'published' | 'cancelled'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || 'general',
        startDate: event.startDate ? event.startDate.slice(0, 16) : '',
        endDate: event.endDate ? event.endDate.slice(0, 16) : '',
        location: event.location || '',
        isPublic: event.isPublic !== undefined ? event.isPublic : true,
        status: event.status || 'draft'
      });
    }
  }, [event]);

  const eventTypes = [
    { value: 'SLI', label: 'SLI Event' },
    { value: 'university', label: 'University Event' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'general', label: 'General' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!event) {
      setError('No event selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await eventsService.updateEvent(event.id, {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        location: formData.location,
        isPublic: formData.isPublic,
        status: formData.status
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setError('An error occurred while updating the event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'cancelled' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter event location"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isPublic" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              {formData.isPublic ? (
                <Globe className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span>Make this event public</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Event</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;


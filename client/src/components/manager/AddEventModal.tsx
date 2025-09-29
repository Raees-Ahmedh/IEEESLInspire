import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, Globe, EyeOff, FileText } from 'lucide-react';
import { eventsService } from '../../services/apiService';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'general',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
    location: '',
    isPublic: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await eventsService.createEvent({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        eventType: formData.eventType,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        location: formData.location.trim() || undefined,
        isPublic: formData.isPublic
      });

      if (response.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        setError(response.error || 'Failed to create event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventType: 'general',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: '',
      location: '',
      isPublic: true
    });
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter event description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter event location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div className="flex items-center space-x-2">
                {formData.isPublic ? <Globe className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                <span className="text-sm font-medium text-gray-700">
                  Make this event public
                </span>
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Public events will be visible to all users on the website
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;

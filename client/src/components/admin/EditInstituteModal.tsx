import React, { useState, useEffect } from 'react';
import { X, Building, Globe, MapPin, Code } from 'lucide-react';
import { universityService } from '../../services/apiService';

interface Institute {
  id: number;
  name: string;
  type: string;
  address?: string;
  website?: string;
  uniCode: string;
  isActive: boolean;
  location?: string;
  category?: string;
}

interface EditInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  institute: Institute | null;
}

const EditInstituteModal: React.FC<EditInstituteModalProps> = ({ isOpen, onClose, onSuccess, institute }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'University',
    address: '',
    website: '',
    uniCode: '',
    isActive: true,
    location: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when institute changes
  useEffect(() => {
    if (institute) {
      setFormData({
        name: institute.name || '',
        type: institute.type || 'University',
        address: institute.address || '',
        website: institute.website || '',
        uniCode: institute.uniCode || '',
        isActive: institute.isActive !== undefined ? institute.isActive : true,
        location: institute.location || '',
        category: institute.category || ''
      });
    }
  }, [institute]);

  const instituteTypes = [
    'University',
    'Technical College',
    'Vocational Institute',
    'Private College',
    'Government Institute',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Institute name is required');
      return;
    }

    if (!formData.uniCode.trim()) {
      setError('University code is required');
      return;
    }

    if (!institute) {
      setError('No institute selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await universityService.updateUniversity(institute.id, {
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        uniCode: formData.uniCode.trim(),
        isActive: formData.isActive,
        location: formData.location.trim() || undefined,
        category: formData.category.trim() || undefined
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update institute');
      }
    } catch (error) {
      console.error('Error updating institute:', error);
      setError('An error occurred while updating the institute');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !institute) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Institute</h2>
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
              Institute Name *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter institute name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                {instituteTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Code *
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.uniCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, uniCode: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter university code"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter institute address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter website URL"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active Institute
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
                <span>Update Institute</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInstituteModal;


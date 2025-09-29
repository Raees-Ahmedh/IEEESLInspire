import React, { useState } from 'react';
import { X } from 'lucide-react';
import { universityService } from '../../services/apiService';

interface AddInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'add' | 'edit';
  initialData?: {
    id: number;
    name: string;
    type: 'government' | 'private' | 'semi_government';
    address?: string;
    website?: string;
    uniCode: string;
    isActive: boolean;
  } | null;
}

const AddInstituteModal: React.FC<AddInstituteModalProps> = ({ isOpen, onClose, onSuccess, mode = 'add', initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'government' as 'government' | 'private' | 'semi_government',
    address: '',
    website: '',
    uniCode: '',
    isActive: true
  });
  // Prefill when editing
  React.useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        address: initialData.address || '',
        website: initialData.website || '',
        uniCode: initialData.uniCode,
        isActive: initialData.isActive
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        type: 'government',
        address: '',
        website: '',
        uniCode: '',
        isActive: true
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Institute name is required';
    }

    if (!formData.uniCode.trim()) {
      newErrors.uniCode = 'Institute code is required';
    } else if (formData.uniCode.length < 2) {
      newErrors.uniCode = 'Institute code must be at least 2 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Institute type is required';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let ok = false;
      if (mode === 'edit' && initialData) {
        const response = await universityService.updateUniversity(initialData.id, {
          name: formData.name.trim(),
          type: formData.type,
          address: formData.address.trim() || undefined,
          website: formData.website.trim() || undefined,
          uniCode: formData.uniCode.trim().toUpperCase(),
          isActive: formData.isActive
        });
        ok = response.success;
        if (!ok) setErrors({ submit: response.error || 'Failed to update institute' });
      } else {
        const response = await universityService.createUniversity({
          name: formData.name.trim(),
          type: formData.type,
          address: formData.address.trim() || undefined,
          website: formData.website.trim() || undefined,
          uniCode: formData.uniCode.trim().toUpperCase(),
          isActive: formData.isActive
        });
        ok = response.success;
        if (!ok) setErrors({ submit: response.error || 'Failed to create institute' });
      }

      if (ok) {
        // Reset form
        setFormData({
          name: '',
          type: 'government',
          address: '',
          website: '',
          uniCode: '',
          isActive: true
        });
        setErrors({});
        onSuccess();
        onClose();
      }
    } catch (error) {
      setErrors({ submit: mode === 'edit' ? 'Failed to update institute. Please try again.' : 'Failed to create institute. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{mode === 'edit' ? 'Edit Institute' : 'Add New Institute'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Institute Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institute Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., University of Colombo"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Institute Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institute Code *
            </label>
            <input
              type="text"
              value={formData.uniCode}
              onChange={(e) => handleInputChange('uniCode', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.uniCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., UC, UOC"
              disabled={isSubmitting}
            />
            {errors.uniCode && (
              <p className="text-red-500 text-sm mt-1">{errors.uniCode}</p>
            )}
          </div>

          {/* Institute Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institute Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as 'government' | 'private' | 'semi_government')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="government">Government</option>
              <option value="private">Private</option>
              <option value="semi_government">Semi-Government</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter institute address"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://www.example.com"
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active Institute
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Institute' : 'Create Institute')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInstituteModal;

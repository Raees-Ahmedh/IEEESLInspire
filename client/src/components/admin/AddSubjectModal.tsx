import React, { useState } from 'react';
import { X } from 'lucide-react';
import { subjectService } from '../../services/apiService';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'AL' as 'AL' | 'OL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Subject code must be at least 2 characters';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await subjectService.createSubject({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        level: formData.level
      });

      if (response.success) {
        // Reset form
        setFormData({ name: '', code: '', level: 'AL' });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: response.error || 'Failed to create subject' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create subject. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add New Subject</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Subject Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Mathematics, Physics"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Subject Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., MAT, PHY"
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value as 'AL' | 'OL')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.level ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="AL">Advanced Level (AL)</option>
              <option value="OL">Ordinary Level (OL)</option>
            </select>
            {errors.level && (
              <p className="text-red-500 text-sm mt-1">{errors.level}</p>
            )}
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
            <span>{isSubmitting ? 'Creating...' : 'Create Subject'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;

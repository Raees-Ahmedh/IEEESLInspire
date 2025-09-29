import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { editorService, universityService } from '../../services/apiService';

interface AddEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEditorModal: React.FC<AddEditorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accessRights: [] as string[],
    assignedUniversity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Available access rights options
  const accessRightsOptions = [
    'news_management',
    'events_management',
  ];

  // Add these new state variables after the existing states
  const [universities, setUniversities] = useState<{ id: number, name: string }[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);

  // Add this useEffect to fetch universities when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUniversities();
    }
  }, [isOpen]);

  // Add this function to fetch universities
  const fetchUniversities = async () => {
    setUniversitiesLoading(true);
    try {
      const response = await universityService.getAllUniversities();
      if (response.success && response.data) {
        setUniversities(response.data.map(uni => ({
          id: uni.id,
          name: uni.name
        })));
      }
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    } finally {
      setUniversitiesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Combine first and last name for the API
      const editorData = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        accessRights: formData.accessRights,
        assignedUniversity: formData.assignedUniversity || undefined,
        isActive: true
      };

      const response = await editorService.createEditor(editorData);

      if (response.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          password: '',
          confirmPassword: '',
          accessRights: [],
          assignedUniversity: ''
        });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: response.error || 'Failed to create editor' });
      }
    } catch (error: unknown) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create editor. Please try again.'
      });
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

  const handleAccessRightsChange = (right: string) => {
    setFormData(prev => ({
      ...prev,
      accessRights: prev.accessRights.includes(right)
        ? prev.accessRights.filter(r => r !== right)
        : [...prev.accessRights, right]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add New Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
              disabled={isSubmitting}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter last name"
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password (min 6 characters)"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm password"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Access Rights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Access Rights
            </label>
            <div className="grid grid-cols-2 gap-3">
              {accessRightsOptions.map((right) => (
                <label key={right} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.accessRights.includes(right)}
                    onChange={() => handleAccessRightsChange(right)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {right.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Assigned University */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assigned University
            </label>
            {universitiesLoading ? (
              <div className="flex items-center justify-center py-3 text-gray-500">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading universities...
              </div>
            ) : (
              <select
                value={formData.assignedUniversity}
                onChange={(e) => handleInputChange('assignedUniversity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSubmitting}
              >
                <option value="">Select a university</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id.toString()}>
                    {university.name}
                  </option>
                ))}
              </select>
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
            <span>{isSubmitting ? 'Creating...' : 'Create Editor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditorModal;

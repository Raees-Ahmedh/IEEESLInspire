import React, { useState, useEffect } from 'react';
import { X, User, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { editorService, universityService } from '../../services/apiService';

interface AssignEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editor: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  } | null;
}

interface University {
  id: number;
  name: string;
  type: string;
  location: string;
}

const AssignEditorModal: React.FC<AssignEditorModalProps> = ({ isOpen, onClose, onSuccess, editor }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [permissions, setPermissions] = useState({
    canAddCourses: true,
    canEditCourses: true,
    canDeleteCourses: false,
    canUploadMaterials: true,
    canManageNews: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUniversities();
    }
  }, [isOpen]);

  const loadUniversities = async () => {
    try {
      const response = await universityService.getAllUniversities();
      if (response.success && response.data) {
        setUniversities(response.data);
      } else {
        setError('Failed to load universities');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error loading universities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUniversity) {
      setError('Please select a university');
      return;
    }

    if (!editor) {
      setError('No editor selected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await editorService.assignEditorToUniversity(
        editor.id,
        selectedUniversity,
        permissions
      );

      if (response.success) {
        setSuccess('Editor assigned to university successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(response.error || 'Failed to assign editor to university');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error assigning editor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  if (!isOpen || !editor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Assign Editor to University</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Editor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Editor Information</h3>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">{editor.firstName} {editor.lastName || ''}</p>
                <p className="text-sm text-gray-500">{editor.email}</p>
              </div>
            </div>
          </div>

          {/* University Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select University <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedUniversity || ''}
              onChange={(e) => setSelectedUniversity(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Choose a university...</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name} ({university.type}) - {university.location}
                </option>
              ))}
            </select>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Editor Permissions
            </label>
            <div className="space-y-3">
              {[
                { key: 'canAddCourses', label: 'Can Add Courses', description: 'Create new courses for this university' },
                { key: 'canEditCourses', label: 'Can Edit Courses', description: 'Modify existing courses' },
                { key: 'canDeleteCourses', label: 'Can Delete Courses', description: 'Remove courses (use with caution)' },
                { key: 'canUploadMaterials', label: 'Can Upload Materials', description: 'Upload course materials and documents' },
                { key: 'canManageNews', label: 'Can Manage News', description: 'Create and manage news articles' }
              ].map((permission) => (
                <div key={permission.key} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={permission.key}
                    checked={permissions[permission.key as keyof typeof permissions]}
                    onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <label htmlFor={permission.key} className="text-sm font-medium text-gray-700">
                      {permission.label}
                    </label>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
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
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Building className="w-4 h-4" />
                  <span>Assign Editor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignEditorModal;

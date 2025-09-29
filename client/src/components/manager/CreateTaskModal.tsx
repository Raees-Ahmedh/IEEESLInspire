import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import { taskService } from '../../services/apiService';

interface Editor {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [editors, setEditors] = useState<Editor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load editors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEditors();
    }
  }, [isOpen]);

  const fetchEditors = async () => {
    setIsLoadingEditors(true);
    try {
      const response = await taskService.getEditorsForTasks();
      if (response.success && response.data) {
        setEditors(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch editors:', error);
    } finally {
      setIsLoadingEditors(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please select an editor';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await taskService.createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined
      });

      if (response.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          assignedTo: 0,
          priority: 'medium',
          dueDate: ''
        });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: response.error || 'Failed to create task' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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
          <h2 className="text-xl font-semibold text-gray-800">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Update course information for Computer Science"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Provide detailed description of the task..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Assign to Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Editor *
            </label>
            {isLoadingEditors ? (
              <div className="flex items-center justify-center py-3 text-gray-500">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading editors...
              </div>
            ) : (
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value={0}>Select an editor</option>
                {editors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.firstName} {editor.lastName} ({editor.email})
                  </option>
                ))}
              </select>
            )}
            {errors.assignedTo && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
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
            <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;

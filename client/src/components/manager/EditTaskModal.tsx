import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import { taskService } from '../../services/apiService';

interface Editor {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: number;
  assignedBy: number;
  status: 'todo' | 'ongoing' | 'complete';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  auditInfo: any;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'ongoing' | 'complete',
    dueDate: ''
  });
  const [editors, setEditors] = useState<Editor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || 0,
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    }
  }, [task]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.assignedTo === 0) {
      newErrors.assignedTo = 'Please select an editor';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !task) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await taskService.updateTask(task.id, {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || undefined
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ general: response.message || 'Failed to update task' });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setErrors({ general: 'An error occurred while updating the task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Editor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.assignedTo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoadingEditors}
                >
                  <option value={0}>
                    {isLoadingEditors ? 'Loading editors...' : 'Select an editor'}
                  </option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={editor.id}>
                      {editor.firstName} {editor.lastName} ({editor.email})
                    </option>
                  ))}
                </select>
              </div>
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option value="todo">To Do</option>
                <option value="ongoing">Ongoing</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
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
                <span>Update Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;


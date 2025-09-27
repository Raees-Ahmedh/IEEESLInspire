import React, { useState } from 'react';
import {
  Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building,
  GraduationCap, Newspaper, Menu, X, ClipboardList, Database, UserPlus,
  CheckCircle, Clock, AlertTriangle, FileText, Calendar, Star
} from 'lucide-react';
import { useEffect } from 'react';
import { Subject } from '../types'; // Adjust path as needed
import { subjectService, universityService, editorService, taskService, CreateTaskRequest, adminService, frameworkService } from '../services/apiService'; // Adjust path as needed
import FieldsManagement from '../components/admin/FieldsManagement';
// import Logo from '../assets/images/logo.png';

interface Task {
  id: number;
  title: string;
  description: string | null;
  assignedTo: number;
  assignedBy: number;
  status: 'todo' | 'ongoing' | 'complete' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  dueDate: string | null;

  completedAt: string | null;
  auditInfo: any;

  // Relations populated by backend
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assigner?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    comments: number;
  };
}
interface Editor {
  id: string;
  name: string;
  email: string;
  accessRights: string[]; // Make sure this is an array
  isActive: boolean;
  assignedTasks?: number; // Optional property
}



interface Institute {
  id: number; // Change from string to number
  name: string;
  type: string; // 'State University', 'Private Institute', etc.
  location?: string; // Optional as it might not be in the database
  category?: string; // Optional as it might not be in the database  
  isActive: boolean;
  auditInfo?: any; // Optional audit information
}

interface ManagerDashboardProps {
  onGoBack?: () => void;
}

// Add this AddSubjectModal component to your manager dashboard

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AddInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Complete Add Editor Modal Implementation

interface AddEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Add this interface and component to your ManagerDashboard.tsx file

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Framework {
  id: number;
  type: 'SLQF' | 'NVQ';
  qualificationCategory: string;
  level: number;
  year?: number;
}

// Add this AddFrameworkModal component after your existing modal components

// Add this AddFrameworkModal component after your existing modal components

// Add this AddFrameworkModal component after your existing modal components

// Add this AddFrameworkModal component after your existing modal components

interface AddFrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFrameworkModal: React.FC<AddFrameworkModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'SLQF' as 'SLQF' | 'NVQ',
    qualificationCategory: '',
    level: '',
    year: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Framework type options
  const frameworkTypes = [
    { value: 'SLQF', label: 'SLQF (Sri Lanka Qualifications Framework)' },
    { value: 'NVQ', label: 'NVQ (National Vocational Qualification)' }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.type) {
      newErrors.type = 'Framework type is required';
    }

    if (!formData.qualificationCategory.trim()) {
      newErrors.qualificationCategory = 'Qualification category is required';
    }

    if (!formData.level.trim()) {
      newErrors.level = 'Level is required';
    } else {
      // Check if level is a valid number
      const levelNum = parseInt(formData.level.trim());
      if (isNaN(levelNum)) {
        newErrors.level = 'Level must be a number (e.g., 1, 2, 3)';
      }
    }

    // No validation for year - it's optional and can be any value

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare framework data for API call
      const frameworkData = {
        type: formData.type,
        qualificationCategory: formData.qualificationCategory.trim(),
        level: parseInt(formData.level.trim()), // Parse as integer
        year: formData.year.trim() ? parseInt(formData.year.trim()) : undefined
      };

      console.log('Sending framework data:', frameworkData);

      // API call to create framework using frameworkService
      const response = await frameworkService.createFramework(frameworkData);

      console.log('API response:', response);

      if (response.success) {
        // Reset form
        setFormData({
          type: 'SLQF',
          qualificationCategory: '',
          level: '',
          year: ''
        });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        console.error('API error:', response.error);
        setErrors({ submit: response.error || 'Failed to create framework' });
      }
    } catch (error) {
      console.error('Request failed:', error);
      setErrors({ submit: 'Failed to create framework. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'SLQF',
      qualificationCategory: '',
      level: '',
      year: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Add New Framework</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Framework Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={isSubmitting}
            >
              {frameworkTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Qualification Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.qualificationCategory}
              onChange={(e) => handleInputChange('qualificationCategory', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.qualificationCategory ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., Bachelor Degree, Diploma, Certificate"
              disabled={isSubmitting}
            />
            {errors.qualificationCategory && (
              <p className="text-red-500 text-sm mt-1">{errors.qualificationCategory}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.level ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., 1, 2, 3, 4, 5 (numbers only)"
              disabled={isSubmitting}
            />
            {errors.level && (
              <p className="text-red-500 text-sm mt-1">{errors.level}</p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., 1, 2, 3, or any value (optional)"
              disabled={isSubmitting}
            />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <Star className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Framework'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};








const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',

    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',

  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableEditors, setAvailableEditors] = useState<Editor[]>([]);
  const [loadingEditors, setLoadingEditors] = useState(true);

  // Task type options based on database schema


  // Priority options based on database schema
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  // Load editors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadEditors();
    }
  }, [isOpen]);

  const loadEditors = async () => {
    try {
      setLoadingEditors(true);
      const response = await editorService.getAllEditors();
      if (response.success && response.data) {
        // Filter only active editors
        const activeEditors = response.data.filter((editor: { isActive: any; }) => editor.isActive);
        setAvailableEditors(activeEditors);
      } else {
        setErrors({ editors: response.error || 'Failed to load editors' });
      }
    } catch (error) {
      setErrors({ editors: 'Failed to load editors. Please try again.' });
      console.error('Error loading editors:', error);
    } finally {
      setLoadingEditors(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Task title must be at least 3 characters';
    } else if (formData.title.trim().length > 500) {
      newErrors.title = 'Task title must not exceed 500 characters';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please select an editor to assign this task';
    }



    if (!formData.priority) {
      newErrors.priority = 'Please select a priority level';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare task data for API call
      const taskPayload: CreateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assignedTo: parseInt(formData.assignedTo),

        priority: formData.priority,
        dueDate: formData.dueDate || undefined,

      };

      // REAL API CALL - Replace the mock response
      const response = await taskService.createTask(taskPayload);

      if (response.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          assignedTo: '',

          priority: 'medium',
          dueDate: '',

        });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: response.error || 'Failed to create task' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create task. Please try again.' });
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',

      priority: 'medium',
      dueDate: '',

    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Task</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter task title"
              disabled={isSubmitting}
              maxLength={500}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">{formData.title.length}/500 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Provide detailed description of the task"
              disabled={isSubmitting}
              maxLength={2000}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">{formData.description.length}/2000 characters</p>
          </div>

          {/* Row 1: Assigned To and Task Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              {loadingEditors ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500">Loading editors...</span>
                </div>
              ) : (
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select an editor</option>
                  {availableEditors.map((editor) => (
                    <option key={editor.id} value={editor.id}>
                      {editor.name} ({editor.email})
                    </option>
                  ))}
                </select>
              )}
              {errors.assignedTo && (
                <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
              )}
              {errors.editors && (
                <p className="text-red-500 text-sm mt-1">{errors.editors}</p>
              )}
            </div>


          </div>

          {/* Row 2: Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isSubmitting}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isSubmitting}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>



          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loadingEditors}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <ClipboardList className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};



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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.code ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.level ? 'border-red-500' : 'border-gray-300'
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

const AddInstituteModal: React.FC<AddInstituteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'government' as 'government' | 'private' | 'semi_government',
    address: '',
    website: '',
    uniCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Institute name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Institute type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Please enter a valid website URL (starting with http:// or https://)';
    }

    if (!formData.uniCode.trim()) {
      newErrors.uniCode = 'University code is required';
    } else if (formData.uniCode.length < 2) {
      newErrors.uniCode = 'University code must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await universityService.createUniversity({
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim(),
        website: formData.website.trim() || undefined,
        uniCode: formData.uniCode.trim().toUpperCase(),
        isActive: true
      });

      if (response.success) {
        // Reset form
        setFormData({ name: '', type: 'government', address: '', website: '', uniCode: '' });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: response.error || 'Failed to create institute' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create institute. Please try again.' });
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
          <h2 className="text-xl font-semibold text-gray-800">Add New Institute</h2>
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., University of Colombo"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Institute Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institute Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.type ? 'border-red-500' : 'border-gray-300'
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

          {/* University Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University Code *
            </label>
            <input
              type="text"
              value={formData.uniCode}
              onChange={(e) => handleInputChange('uniCode', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.uniCode ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., UOC, NSBM"
              disabled={isSubmitting}
            />
            {errors.uniCode && (
              <p className="text-red-500 text-sm mt-1">{errors.uniCode}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter the full address"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="https://www.university.ac.lk"
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website}</p>
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
            <span>{isSubmitting ? 'Creating...' : 'Create Institute'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<
    'subjects' | 'fields' | 'institutes' | 'categorization' | 'editors' |
    'tasks' | 'reports' | 'monitoring' | 'news' | 'guide' | 'events' | 'accounts'
  >('subjects');

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddInstituteModal, setShowAddInstituteModal] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editors, setEditors] = useState<Editor[]>([]);
  const [editorsLoading, setEditorsLoading] = useState(true);
  const [editorsError, setEditorsError] = useState<string | null>(null);
  const [showAddEditorModal, setShowAddEditorModal] = useState(false);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworksLoading, setFrameworksLoading] = useState(true);
  const [frameworksError, setFrameworksError] = useState<string | null>(null);
  const [showAddFrameworkModal, setShowAddFrameworkModal] = useState(false);


  // DELETE THIS ENTIRE BLOCK - it's in the wrong place
const handleFrameworkDelete = async (frameworkId: number) => {
  if (!confirm('Are you sure you want to delete this framework? This action cannot be undone.')) {
    return;
  }

  try {
    console.log('Attempting to delete framework with ID:', frameworkId);
    
    const response = await frameworkService.deleteFramework(frameworkId);
    
    console.log('Delete response:', response);
    
    if (response.success) {
      console.log('Framework deleted successfully');
      fetchFrameworks(); // Refresh the frameworks list
    } else {
      console.error('Delete failed:', response.error);
      setFrameworksError(response.error || 'Failed to delete framework');
    }
  } catch (error) {
    console.error('Delete request failed:', error);
    setFrameworksError(error instanceof Error ? error.message : 'Failed to delete framework');
  }
};

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);

      const response = await taskService.getAllTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  // Load tasks when component mounts or when tasks section is active
  useEffect(() => {
    if (activeSection === 'tasks') {
      fetchTasks();
    }
  }, [activeSection]);

  // ADD THESE FUNCTIONS (after useEffect):
  const handleTaskCreated = () => {
    fetchTasks(); // Refresh the tasks list
    console.log('Task created successfully!');
  };



  const handleTaskDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        fetchTasks(); // Refresh the tasks list
      } else {
        throw new Error(response.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasksError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const fetchFrameworks = async () => {
    try {
      setFrameworksLoading(true);
      setFrameworksError(null);

      // Using the existing adminService from your imports
      const response = await adminService.getFrameworks();

      if (response.success && response.data) {
        setFrameworks(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch frameworks');
      }
    } catch (err) {
      setFrameworksError(err instanceof Error ? err.message : 'Failed to fetch frameworks');
      console.error('Error fetching frameworks:', err);
    } finally {
      setFrameworksLoading(false);
    }
  };

  const fetchEditors = async () => {
    try {
      setEditorsLoading(true);
      setEditorsError(null);

      const response = await editorService.getAllEditors();
      if (response.success) {
        setEditors(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch editors');
      }
    } catch (err) {
      setEditorsError(err instanceof Error ? err.message : 'Failed to fetch editors');
    } finally {
      setEditorsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'editors') {
      fetchEditors();
    }
  }, [activeSection]);




  // Load tasks when component mounts or when tasks section is active




  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [institutesLoading, setInstitutesLoading] = useState(true);
  const [institutesError, setInstitutesError] = useState<string | null>(null);

  const getSectionIcon = (section: string) => {
    const iconMap = {
      subjects: BookOpen,
      fields: GraduationCap,
      institutes: Building,
      Framework: Star,
      editors: Users,
      tasks: ClipboardList,
      reports: BarChart3,
      monitoring: Database,
      news: Newspaper,
      guide: FileText,
      events: Calendar,
      accounts: User
    };
    return iconMap[section as keyof typeof iconMap] || BookOpen;
  };

  // Add this function after your fetchSubjects function
  // Replace your fetchInstitutes function with this corrected version:
  const fetchInstitutes = async () => {
    try {
      setInstitutesLoading(true);
      setInstitutesError(null);

      const response = await universityService.getAllUniversities();

      if (response.success) {
        // Transform University data to Institute format using actual University properties
        const transformedInstitutes: Institute[] = (response.data || []).map((university: any) => ({
          id: university.id,
          name: university.name,
          type: university.type,
          // Use address field if available, otherwise fallback
          location: university.address || university.location || 'Not specified',
          // Map university type to user-friendly category
          category: university.type === 'government' ? 'State University' :
            university.type === 'private' ? 'Private Institute' :
              university.type === 'semi_government' ? 'Semi-Government' : 'Not categorized',
          isActive: university.isActive ?? true,
          auditInfo: university.auditInfo
        }));
        setInstitutes(transformedInstitutes);
      } else {
        throw new Error(response.error || 'Failed to fetch institutes');
      }
    } catch (err) {
      setInstitutesError(err instanceof Error ? err.message : 'Failed to fetch institutes');
    } finally {
      setInstitutesLoading(false);
    }
  };
  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const [alResponse, olResponse] = await Promise.all([
        subjectService.getALSubjects(),
        subjectService.getOLSubjects()
      ]);

      if (alResponse.success && olResponse.success) {
        const allSubjects = [
          ...(alResponse.data || []),
          ...(olResponse.data || [])
        ].map(subject => ({
          ...subject,
          isActive: subject.isActive ?? true // Handle undefined by defaulting to true
        }));
        setSubjects(allSubjects);
      } else {
        throw new Error('Failed to fetch subjects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  // Replace your current useEffect with this:
  useEffect(() => {
    if (activeSection === 'subjects') {
      fetchSubjects();
    } else if (activeSection === 'institutes') {
      fetchInstitutes();
    } else if (activeSection === 'editors') {
      fetchEditors();
    } else if (activeSection === 'categorization') {
      fetchFrameworks();
    }

  }, [activeSection]); const getStatusBadge = (status: 'todo' | 'ongoing' | 'complete' | 'cancelled') => {
    const styles = {
      todo: 'bg-gray-100 text-gray-800',
      ongoing: 'bg-blue-100 text-blue-800',
      complete: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels = {
      todo: 'To Do',
      ongoing: 'Ongoing',
      complete: 'Complete',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };


  const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const toggleSubjectStatus = async (subjectId: number) => {
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      // Show optimistic update
      setSubjects(subjects.map(subject =>
        subject.id === subjectId
          ? { ...subject, isActive: !subject.isActive }
          : subject
      ));

      const response = await subjectService.updateSubjectStatus(subjectId, !subject.isActive);

      if (!response.success) {
        // Revert optimistic update on failure
        setSubjects(subjects.map(subject =>
          subject.id === subjectId
            ? { ...subject, isActive: subject.isActive } // Revert to original state
            : subject
        ));
        setError(response.error || 'Failed to update subject status');
      }
    } catch (err) {
      // Revert optimistic update on error
      setSubjects(subjects.map(subject =>
        subject.id === subjectId
          ? { ...subject, isActive: !subject.isActive } // Revert to original state
          : subject
      ));
      setError('Failed to update subject status');
    }
  };

  // FIXED: Toggle Editor Status Function
  const toggleEditorStatus = async (editorId: string) => {
    try {
      const editor = editors.find(e => e.id === editorId);
      if (!editor) return;

      // Show optimistic update
      setEditors(editors.map(editor =>
        editor.id === editorId
          ? { ...editor, isActive: !editor.isActive }
          : editor
      ));

      // FIXED: Call the correct API endpoint
      const response = await editorService.updateEditorStatus(editorId, !editor.isActive);

      if (!response.success) {
        // Revert optimistic update on failure
        setEditors(editors.map(editor =>
          editor.id === editorId
            ? { ...editor, isActive: editor.isActive } // Revert to original state
            : editor
        ));
        setEditorsError(response.error || 'Failed to update editor status');
      } else {
        // Refresh the editors list to get the latest data
        fetchEditors();
      }
    } catch (err) {
      // Revert optimistic update on error
      setEditors(editors.map(editor =>
        editor.id === editorId
          ? { ...editor, isActive: !editor.isActive } // Revert to original state
          : editor
      ));
      setEditorsError('Failed to update editor status');
    }
  };

  const toggleInstituteStatus = (instituteId: number) => {
    setInstitutes(institutes.map(institute =>
      institute.id === instituteId
        ? { ...institute, isActive: !institute.isActive }
        : institute
    ));
  };

  const renderContent = () => {

    // FIXED: Manager Dashboard Editor Section with corrected button trigger
    if (activeSection === 'editors') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Editor Accounts Management</h1>
              <p className="text-gray-600">Create and manage editor accounts</p>
            </div>
            <button
              onClick={() => setShowAddEditorModal(true)} // ✅ FIXED
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Editor</span>
            </button>
          </div>

          {editorsLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center text-gray-500">Loading editors...</div>
            </div>
          )}

          {editorsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">Error: {editorsError}</div>
              <button
                onClick={fetchEditors}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!editorsLoading && !editorsError && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Rights</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No editors found. Click "Add Editor" to create your first editor account.
                        </td>
                      </tr>
                    ) : (
                      editors.map((editor) => (
                        <tr key={editor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {editor.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editor.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(editor.accessRights) && editor.accessRights.length > 0 ? (
                                editor.accessRights.map((right, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {right.replace('_', ' ')}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-xs">No access rights assigned</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${editor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {editor.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            <button
                              onClick={() => toggleEditorStatus(editor.id)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${editor.isActive
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                              {editor.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    // OL AL Subjects Management
    if (activeSection === 'subjects') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">OL & AL Subjects Management</h1>
              <p className="text-gray-600">Add and update OL and AL subjects</p>
            </div>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.level === 'AL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                          {subject.level} {/* Changed from subject.type to subject.level */}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button
                          onClick={() => toggleSubjectStatus(subject.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${subject.isActive
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          {subject.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {loading && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading subjects...</div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">Error: {error}</div>
                    <button
                      onClick={fetchSubjects}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !error && subjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No subjects found
                  </div>
                )}
              </table>
            </div>
          </div>
        </div>
      );
    }
    // Replace your institutes section in renderContent() with this:
    if (activeSection === 'institutes') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Institutes Management</h1>
              <p className="text-gray-600">Add and update educational institutes</p>
            </div>
            <button
              onClick={() => setShowAddInstituteModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Institute</span>
            </button>
          </div>

          {/* Loading State */}
          {institutesLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center text-gray-500">Loading institutes...</div>
            </div>
          )}

          {/* Error State */}
          {institutesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">Error: {institutesError}</div>
              <button
                onClick={fetchInstitutes}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Institutes Table */}
          {!institutesLoading && !institutesError && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {institutes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No institutes found
                        </td>
                      </tr>
                    ) : (
                      institutes.map((institute) => (
                        <tr key={institute.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {institute.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {institute.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {institute.location || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {institute.category || 'Not categorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${institute.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {institute.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            <button
                              onClick={() => toggleInstituteStatus(institute.id)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${institute.isActive
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                              {institute.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Task Assignment & Management
    // Task Assignment & Management
    if (activeSection === 'tasks') {
      // Show loading state
      if (tasksLoading) {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mt-32">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Task Assignment</h1>
                <p className="text-gray-600">Assign and manage tasks for editors</p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>

            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading tasks...</p>
            </div>
          </div>
        );
      }

      // Show error state
      if (tasksError) {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mt-32">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Task Assignment</h1>
                <p className="text-gray-600">Assign and manage tasks for editors</p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tasks</h3>
              <p className="text-red-700 mb-4">{tasksError}</p>
              <button
                onClick={fetchTasks}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        );
      }

      // Show main content with proper task data
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Assignment</h1>
              <p className="text-gray-600">Assign and manage tasks for editors</p>
            </div>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          {/* Empty state */}
          {tasks.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tasks Yet</h3>
              <p className="text-gray-600 mb-6">Create your first task to assign work to editors</p>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Task</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}

                      </div>

                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>
                            Assigned to: {task.assignee
                              ? `${task.assignee.firstName} ${task.assignee.lastName}`
                              : `User ${task.assignedTo}`
                            }
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created: {new Date(task.auditInfo.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>

                        {task._count?.comments && task._count.comments > 0 && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{task._count.comments} comment{task._count.comments !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">


                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                          title="Edit Task"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeSection === 'categorization') { // Change to 'frameworks' if you've updated the section name
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Frameworks Management</h1>
              <p className="text-gray-600">Manage SLQF and NVQ framework levels</p>
            </div>
            <button
              onClick={() => setShowAddFrameworkModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Framework</span>
            </button>
          </div>

          {/* Loading State */}
          {frameworksLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center text-gray-500">Loading frameworks...</div>
            </div>
          )}

          {/* Error State */}
          {frameworksError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">Error: {frameworksError}</div>
              <button
                onClick={fetchFrameworks}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Frameworks Content */}
          {!frameworksLoading && !frameworksError && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Frameworks</p>
                      <p className="text-2xl font-bold text-gray-900">{frameworks.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">SLQF Frameworks</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {frameworks.filter(f => f.type === 'SLQF').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">NVQ Frameworks</p>
                      <p className="text-2xl font-bold text-green-600">
                        {frameworks.filter(f => f.type === 'NVQ').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Frameworks Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Framework Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualification Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {frameworks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No frameworks found. Click "Add Framework" to create your first framework.
                          </td>
                        </tr>
                      ) : (
                        frameworks
                          .sort((a, b) => {
                            // Sort by type first (SLQF before NVQ), then by level
                            if (a.type !== b.type) {
                              return a.type === 'SLQF' ? -1 : 1;
                            }
                            return a.level - b.level;
                          })
                          .map((framework) => (
                            <tr key={framework.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${framework.type === 'SLQF'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                                  }`}>
                                  {framework.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Level {framework.level}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {framework.qualificationCategory}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {framework.year || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleFrameworkDelete(framework.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>
          )}
        </div>
      );
    }

    // Task Status Reports
    if (activeSection === 'reports') {
      const todoTasks = tasks.filter(task => task.status === 'todo').length;
      const ongoingTasks = tasks.filter(task => task.status === 'ongoing').length;
      const completeTasks = tasks.filter(task => task.status === 'complete').length;
      const totalTasks = tasks.length;

      return (
        <div className="space-y-6 mt-32">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Task Status Reports</h1>
            <p className="text-gray-600">Monitor task completion and progress</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">To Do</p>
                  <p className="text-2xl font-bold text-yellow-600">{todoTasks}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ongoing</p>
                  <p className="text-2xl font-bold text-blue-600">{ongoingTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Complete</p>
                  <p className="text-2xl font-bold text-green-600">{completeTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">To Do</span>
                  <span className="text-sm text-gray-600">{Math.round((todoTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Ongoing</span>
                  <span className="text-sm text-gray-600">{Math.round((ongoingTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(ongoingTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Complete</span>
                  <span className="text-sm text-gray-600">{Math.round((completeTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(completeTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fields Management Section
    if (activeSection === 'fields') {
      return <FieldsManagement />;
    }

    // Placeholder content for other sections
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4 flex justify-center">
          {React.createElement(getSectionIcon(activeSection), { size: 64 })}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/([A-Z])/g, ' $1')} Section
        </h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl border-r border-gray-200 relative transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-16'
        } mt-10 flex-shrink-0`}>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          {isSidebarExpanded ? (
            <X className="w-4 h-4 text-gray-600" />
          ) : (
            <Menu className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <div className={`p-6 ${!isSidebarExpanded && 'px-3'} overflow-hidden`}>
          {/* Logo Section */}
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3 mb-8' : 'justify-center mb-6'}`}>
            {/* <img
              src={Logo}
              alt="Logo"
              className={`${isSidebarExpanded ? 'w-12 h-12' : 'w-8 h-8'} cursor-pointer`}
              onClick={onGoBack}
            /> */}
            {isSidebarExpanded && (
              <div>
                <h1 className="text-lg font-bold text-gray-800 mt-12">Manager</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            )}
          </div>

          {/* Boards Section */}
          <div className="mb-8">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                BOARDS
              </h2>
            )}
            <div className="space-y-1">
              {/* Subjects */}
              <button
                onClick={() => setActiveSection('subjects')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'subjects'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'OL AL Subjects' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'subjects' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <BookOpen className="w-4 h-4" />
                {isSidebarExpanded && <span>OL AL Subjects</span>}
              </button>

              {/* Fields */}
              <button
                onClick={() => setActiveSection('fields')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'fields'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Field of Studies' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'fields' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <GraduationCap className="w-4 h-4" />
                {isSidebarExpanded && <span>Field of Studies</span>}
              </button>

              {/* Institutes */}
              <button
                onClick={() => setActiveSection('institutes')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'institutes'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Institutes' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'institutes' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Building className="w-4 h-4" />
                {isSidebarExpanded && <span>Institutes</span>}
              </button>

              {/* Categorization */}
              <button
                onClick={() => setActiveSection('categorization')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'categorization'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Categorization' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'categorization' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Star className="w-4 h-4" />
                {isSidebarExpanded && <span>Frameworks</span>}
              </button>

              {/* Editors */}
              <button
                onClick={() => setActiveSection('editors')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'editors'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Editor Accounts' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'editors' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Users className="w-4 h-4" />
                {isSidebarExpanded && <span>Editor Accounts</span>}
              </button>

              {/* Tasks */}
              <button
                onClick={() => setActiveSection('tasks')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'tasks'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Task Assignment' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'tasks' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <ClipboardList className="w-4 h-4" />
                {isSidebarExpanded && <span>Task Assignment</span>}
              </button>

              {/* Reports */}
              <button
                onClick={() => setActiveSection('reports')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'reports'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Task Reports' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'reports' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <BarChart3 className="w-4 h-4" />
                {isSidebarExpanded && <span>Task Reports</span>}
              </button>

              {/* Monitoring
              <button
                onClick={() => setActiveSection('monitoring')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'monitoring'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Database Monitoring' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'monitoring' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Database className="w-4 h-4" />
                {isSidebarExpanded && <span>DB Monitoring</span>}
              </button> */}

              {/* News */}
              <button
                onClick={() => setActiveSection('news')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'news'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'News Section' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'news' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Newspaper className="w-4 h-4" />
                {isSidebarExpanded && <span>News Section</span>}
              </button>

              
              {/* Events */}
              <button
                onClick={() => setActiveSection('events')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'events'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'SLI Events' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'events' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Calendar className="w-4 h-4" />
                {isSidebarExpanded && <span>SLI Events</span>}
              </button>

              {/* Accounts */}
              <button
                onClick={() => setActiveSection('accounts')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'accounts'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'User Accounts' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'accounts' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <User className="w-4 h-4" />
                {isSidebarExpanded && <span>User Accounts</span>}
              </button>
            </div>
          </div>

          {/* Other Section */}
          <div className="mb-8">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                OTHER
              </h2>
            )}
            <div className="space-y-1">
              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all`}
                title={!isSidebarExpanded ? 'Settings' : ''}
              >
                {isSidebarExpanded && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                <Settings className="w-4 h-4" />
                {isSidebarExpanded && <span>Settings</span>}
              </button>
              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all`}
                title={!isSidebarExpanded ? 'Support' : ''}
              >
                {isSidebarExpanded && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                <HelpCircle className="w-4 h-4" />
                {isSidebarExpanded && <span>Support</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Manager Profile */}
        <div className={`absolute bottom-0 bg-white border-t border-gray-200 p-6 ${isSidebarExpanded ? 'w-64' : 'w-16'
          } ${!isSidebarExpanded && 'px-3'}`}>
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'}`}>
            <div className={`${isSidebarExpanded ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0`}>
              <User className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">Manager</p>
                <p className="text-xs text-gray-500 truncate">Content Manager</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <AddSubjectModal
          isOpen={showAddSubjectModal}
          onClose={() => setShowAddSubjectModal(false)}
          onSuccess={() => {
            fetchSubjects(); // Refresh the subjects list
          }}
        />
      )}

      {/* Add Editor Modal */}
      {showAddEditorModal && (
        <AddEditorModal
          isOpen={showAddEditorModal}
          onClose={() => setShowAddEditorModal(false)}
          onSuccess={() => {
            fetchEditors(); // Refresh the editors list
          }}
        />
      )}

      {/* Add Institute Modal */}
      {showAddInstituteModal && (
        <AddInstituteModal
          isOpen={showAddInstituteModal}
          onClose={() => setShowAddInstituteModal(false)}
          onSuccess={() => {
            fetchInstitutes(); // Refresh the institutes list
          }}
        />
      )}
      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSuccess={handleTaskCreated} // CHANGED: Use real function
        />
      )}
      {showAddFrameworkModal && (
        <AddFrameworkModal
          isOpen={showAddFrameworkModal}
          onClose={() => setShowAddFrameworkModal(false)}
          onSuccess={() => {
            fetchFrameworks(); // Refresh the frameworks list
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManagerDashboard;


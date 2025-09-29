import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Tag, AlertCircle, CheckCircle, X, Folder, FolderPlus } from 'lucide-react';
import adminService, { MajorField, SubField, CreateMajorFieldRequest, CreateSubFieldRequest } from '../../services/adminService';

const FieldsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'major' | 'sub'>('major');
  const [majorFields, setMajorFields] = useState<MajorField[]>([]);
  const [subFields, setSubFields] = useState<SubField[]>([]);
  const [isLoadingMajor, setIsLoadingMajor] = useState(true);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [majorForm, setMajorForm] = useState<CreateMajorFieldRequest>({
    name: '',
    description: ''
  });
  
  const [subForm, setSubForm] = useState<CreateSubFieldRequest>({
    name: '',
    description: '',
    majorId: 0
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load data on component mount
  useEffect(() => {
    loadMajorFields();
    loadSubFields();
  }, []);

  const loadMajorFields = async () => {
    setIsLoadingMajor(true);
    try {
      console.log('🔍 Loading major fields...');
      const response = await adminService.getMajorFields();
      console.log('🔍 Major fields response:', response);
      if (response.success && response.data) {
        setMajorFields(response.data);
        console.log('🔍 Major fields loaded:', response.data);
      } else {
        setError(response.error || 'Failed to load major fields');
        console.error('🔍 Failed to load major fields:', response.error);
      }
    } catch (error) {
      setError('Failed to load major fields');
      console.error('Error loading major fields:', error);
    } finally {
      setIsLoadingMajor(false);
    }
  };

  const loadSubFields = async () => {
    setIsLoadingSub(true);
    try {
      console.log('🔍 Loading sub fields...');
      const response = await adminService.getSubFields();
      console.log('🔍 Sub fields response:', response);
      if (response.success && response.data) {
        setSubFields(response.data);
        console.log('🔍 Sub fields loaded:', response.data);
      } else {
        setError(response.error || 'Failed to load sub fields');
        console.error('🔍 Failed to load sub fields:', response.error);
      }
    } catch (error) {
      setError('Failed to load sub fields');
      console.error('Error loading sub fields:', error);
    } finally {
      setIsLoadingSub(false);
    }
  };

  const validateMajorForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!majorForm.name.trim()) {
      errors.name = 'Major field name is required';
    } else if (majorForm.name.trim().length < 2) {
      errors.name = 'Major field name must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSubForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!subForm.name.trim()) {
      errors.name = 'Sub field name is required';
    } else if (subForm.name.trim().length < 2) {
      errors.name = 'Sub field name must be at least 2 characters';
    }

    if (!subForm.majorId || subForm.majorId === 0) {
      errors.majorId = 'Please select a major field';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMajorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMajorForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubForm(prev => ({
      ...prev,
      [name]: name === 'majorId' ? parseInt(value) : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetMajorForm = () => {
    setMajorForm({ name: '', description: '' });
    setValidationErrors({});
    setError(null);
    setSuccess(null);
  };

  const resetSubForm = () => {
    setSubForm({ name: '', description: '', majorId: 0 });
    setValidationErrors({});
    setError(null);
    setSuccess(null);
  };

  const handleCreateMajorField = async () => {
    if (!validateMajorForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🔍 Creating major field:', { name: majorForm.name.trim(), description: majorForm.description?.trim() });
      const response = await adminService.createMajorField({
        name: majorForm.name.trim(),
        description: majorForm.description?.trim() || undefined
      });
      console.log('🔍 Create major field response:', response);
      
      if (response.success) {
        setSuccess('Major field created successfully!');
        resetMajorForm();
        setShowMajorModal(false);
        await loadMajorFields();
      } else {
        setError(response.error || 'Failed to create major field');
        console.error('🔍 Failed to create major field:', response.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating major field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubField = async () => {
    if (!validateSubForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await adminService.createSubField({
        name: subForm.name.trim(),
        description: subForm.description?.trim() || undefined,
        majorId: subForm.majorId
      });
      
      if (response.success) {
        setSuccess('Sub field created successfully!');
        resetSubForm();
        setShowSubModal(false);
        await loadSubFields();
      } else {
        setError(response.error || 'Failed to create sub field');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating sub field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessages = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5 mt-4 sm:mt-32">Fields Management</h1>
          <p className="text-gray-600">Manage academic major fields and sub fields</p>
        </div>
        
        {/* Add buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-30 sm:mt-50">
          <button
            onClick={() => {
              resetMajorForm();
              setShowMajorModal(true);
            }}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FolderPlus className="w-5 h-5" />
            <span>Add Major Field</span>
          </button>
          <button
            onClick={() => {
              resetSubForm();
              setShowSubModal(true);
            }}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Sub Field</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{success || error}</span>
          <button 
            onClick={clearMessages}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('major')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'major'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Major Fields ({majorFields.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sub')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'sub'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Sub Fields ({subFields.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'major' ? (
        <div>
          {isLoadingMajor ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading major fields...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {majorFields.map((field) => (
                <div key={field.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1">{field.name}</h3>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        field.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {field.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  {field.description && (
                    <p className="text-gray-600 text-sm">{field.description}</p>
                  )}
                </div>
              ))}
              
              {majorFields.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No major fields found</h3>
                  <p className="text-gray-600">Create your first major field to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {isLoadingSub ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading sub fields...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subFields.map((field) => (
                <div key={field.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1">{field.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">under {field.majorField.name}</p>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        field.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {field.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  {field.description && (
                    <p className="text-gray-600 text-sm">{field.description}</p>
                  )}
                </div>
              ))}
              
              {subFields.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sub fields found</h3>
                  <p className="text-gray-600">Create your first sub field to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Major Field Modal */}
      {showMajorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Add New Major Field</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={majorForm.name}
                  onChange={handleMajorInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Engineering, Medicine, Arts"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={majorForm.description}
                  onChange={handleMajorInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this major field"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMajorModal(false);
                  resetMajorForm();
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMajorField}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Major Field'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sub Field Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Add New Sub Field</h2>
            
            <div className="space-y-4">
              {/* Major Field Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major Field <span className="text-red-500">*</span>
                </label>
                <select
                  name="majorId"
                  value={subForm.majorId}
                  onChange={handleSubInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    validationErrors.majorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Select a major field</option>
                  {majorFields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
                {validationErrors.majorId && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.majorId}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={subForm.name}
                  onChange={handleSubInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Computer Engineering, Cardiology, Fine Arts"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={subForm.description}
                  onChange={handleSubInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of this sub field"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSubModal(false);
                  resetSubForm();
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubField}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Sub Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldsManagement;

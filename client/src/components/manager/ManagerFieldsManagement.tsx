import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Tag, AlertCircle, CheckCircle, X, Folder, FolderPlus } from 'lucide-react';
import adminService, { MajorField, SubField, CreateMajorFieldRequest, CreateSubFieldRequest } from '../../services/adminService';

const ManagerFieldsManagement: React.FC = () => {
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

  const handleCreateMajorField = async () => {
    setValidationErrors({});
    
    if (!majorForm.name.trim()) {
      setValidationErrors({ name: 'Field name is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔍 Creating major field:', majorForm);
      const response = await adminService.createMajorField(majorForm);
      console.log('🔍 Create major field response:', response);
      
      if (response.success) {
        setSuccess('Major field created successfully!');
        setMajorForm({ name: '', description: '' });
        setShowMajorModal(false);
        loadMajorFields();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to create major field');
        console.error('🔍 Failed to create major field:', response.error);
      }
    } catch (error) {
      setError('Failed to create major field');
      console.error('Error creating major field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubField = async () => {
    setValidationErrors({});
    
    if (!subForm.name.trim()) {
      setValidationErrors({ name: 'Field name is required' });
      return;
    }
    
    if (!subForm.majorId) {
      setValidationErrors({ majorId: 'Please select a major field' });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔍 Creating sub field:', subForm);
      const response = await adminService.createSubField(subForm);
      console.log('🔍 Create sub field response:', response);
      
      if (response.success) {
        setSuccess('Sub field created successfully!');
        setSubForm({ name: '', description: '', majorId: 0 });
        setShowSubModal(false);
        loadSubFields();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to create sub field');
        console.error('🔍 Failed to create sub field:', response.error);
      }
    } catch (error) {
      setError('Failed to create sub field');
      console.error('Error creating sub field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMajorFieldName = (majorId: number) => {
    const majorField = majorFields.find(field => field.id === majorId);
    return majorField ? majorField.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('major')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'major'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Major Fields</span>
        </button>
        <button
          onClick={() => setActiveTab('sub')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'sub'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Sub Fields</span>
        </button>
      </div>

      {/* Major Fields Tab */}
      {activeTab === 'major' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Major Fields</h3>
            <button
              onClick={() => setShowMajorModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Major Field</span>
            </button>
          </div>

          {isLoadingMajor ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading major fields...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {majorFields.map((field) => (
                <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{field.name}</h4>
                      {field.description && (
                        <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Major
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub Fields Tab */}
      {activeTab === 'sub' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Sub Fields</h3>
            <button
              onClick={() => setShowSubModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sub Field</span>
            </button>
          </div>

          {isLoadingSub ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading sub fields...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subFields.map((field) => (
                <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{field.name}</h4>
                      {field.description && (
                        <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Under: {getMajorFieldName(field.majorId)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Sub
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Major Field Modal */}
      {showMajorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Add Major Field</h2>
              <button
                onClick={() => setShowMajorModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={majorForm.name}
                  onChange={(e) => setMajorForm({ ...majorForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Engineering, Medicine"
                  disabled={isSubmitting}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={majorForm.description}
                  onChange={(e) => setMajorForm({ ...majorForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of the field"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowMajorModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMajorField}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isSubmitting ? 'Creating...' : 'Create Field'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sub Field Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Add Sub Field</h2>
              <button
                onClick={() => setShowSubModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major Field *
                </label>
                <select
                  value={subForm.majorId}
                  onChange={(e) => setSubForm({ ...subForm, majorId: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    validationErrors.majorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Computer Science, Civil Engineering"
                  disabled={isSubmitting}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={subForm.description}
                  onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of the sub field"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSubModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubField}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isSubmitting ? 'Creating...' : 'Create Field'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerFieldsManagement;

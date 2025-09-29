import React, { useState, useEffect } from 'react';
import { Plus, Star, AlertCircle, CheckCircle, X, BookOpen, Tag } from 'lucide-react';
import { adminService } from '../../services/apiService';

interface Framework {
  id: number;
  type: 'SLQF' | 'NVQ';
  qualificationCategory: string;
  level: number;
  year?: number;
}

interface CreateFrameworkRequest {
  type: 'SLQF' | 'NVQ';
  qualificationCategory: string;
  level: number;
  year?: number;
}

const FrameworksManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slqf' | 'nvq'>('slqf');
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFramework, setEditingFramework] = useState<Framework | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateFrameworkRequest>({
    type: 'SLQF',
    qualificationCategory: '',
    level: 1,
    year: new Date().getFullYear()
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load data on component mount
  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminService.getFrameworks();
      if (response.success && response.data) {
        setFrameworks(response.data);
      } else {
        setError(response.error || 'Failed to load frameworks');
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
      setError('Failed to load frameworks');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.qualificationCategory.trim()) {
      errors.qualificationCategory = 'Qualification category is required';
    }
    
    if (formData.level < 1 || formData.level > 10) {
      errors.level = 'Level must be between 1 and 10';
    }
    
    if (formData.year && (formData.year < 2000 || formData.year > 2030)) {
      errors.year = 'Year must be between 2000 and 2030';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const isEdit = Boolean(editingFramework);
      const url = isEdit ? `/api/admin/frameworks/${editingFramework!.id}` : '/api/admin/frameworks';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSuccess(isEdit ? 'Framework updated successfully!' : 'Framework created successfully!');
        setShowAddModal(false);
        resetForm();
        setEditingFramework(null);
        loadFrameworks();
      } else {
        const data = await response.json();
        setError(data.error || (editingFramework ? 'Failed to update framework' : 'Failed to create framework'));
      }
    } catch (error) {
      console.error('Error saving framework:', error);
      setError(editingFramework ? 'Failed to update framework' : 'Failed to create framework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'SLQF',
      qualificationCategory: '',
      level: 1,
      year: new Date().getFullYear()
    });
    setValidationErrors({});
    setError(null);
    setSuccess(null);
  };

  const getFilteredFrameworks = () => {
    return frameworks.filter(framework => framework.type === activeTab.toUpperCase());
  };

  const getFrameworkTypeColor = (type: string) => {
    return type === 'SLQF' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Framework Management</h1>
          <p className="text-gray-600">Manage SLQF and NVQ qualification frameworks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Framework</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('slqf')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'slqf'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SLQF Frameworks</span>
        </button>
        <button
          onClick={() => setActiveTab('nvq')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'nvq'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>NVQ Frameworks</span>
        </button>
      </div>

      {/* Frameworks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading frameworks...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredFrameworks().length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No {activeTab.toUpperCase()} frameworks found. Click "Add Framework" to create your first framework.
                    </td>
                  </tr>
                ) : (
                  getFilteredFrameworks().map((framework) => (
                    <tr key={framework.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFrameworkTypeColor(framework.type)}`}>
                          {framework.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {framework.qualificationCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Level {framework.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {framework.year || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => {
                            setEditingFramework(framework);
                            setFormData({
                              type: framework.type,
                              qualificationCategory: framework.qualificationCategory,
                              level: framework.level,
                              year: framework.year
                            });
                            setShowAddModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
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

      {/* Add Framework Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">{editingFramework ? 'Edit Framework' : 'Add New Framework'}</h2>
            
            <div className="space-y-4">
              {/* Framework Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'SLQF' | 'NVQ' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="SLQF">SLQF</option>
                  <option value="NVQ">NVQ</option>
                </select>
              </div>

              {/* Qualification Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.qualificationCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualificationCategory: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.qualificationCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Bachelor's Degree, Certificate"
                />
                {validationErrors.qualificationCategory && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.qualificationCategory}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.level ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.level && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.level}</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={formData.year || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    validationErrors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2024"
                />
                {validationErrors.year && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.year}</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg flex items-center space-x-2 mt-4">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (editingFramework ? 'Updating...' : 'Creating...') : (editingFramework ? 'Update Framework' : 'Create Framework')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameworksManagement;

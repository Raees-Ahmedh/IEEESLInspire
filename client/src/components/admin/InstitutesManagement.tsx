import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Building, AlertCircle, CheckCircle, X, ToggleLeft, ToggleRight, Globe, MapPin } from 'lucide-react';
import { universityService } from '../../services/apiService';
import AddInstituteModal from './AddInstituteModal';

interface Institute {
  id: number;
  name: string;
  type: string;
  address?: string;
  website?: string;
  uniCode: string;
  isActive: boolean;
}

interface InstitutesManagementProps {
  onAddInstitute?: () => void;
  onEditInstitute?: (institute: Institute) => void;
}

const InstitutesManagement: React.FC<InstitutesManagementProps> = ({ onAddInstitute, onEditInstitute }) => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load institutes on mount
  useEffect(() => {
    loadInstitutes();
  }, []);

  // Filter institutes when search term or filters change
  useEffect(() => {
    filterInstitutes();
  }, [institutes, searchTerm, typeFilter, statusFilter]);

  const loadInstitutes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading institutes...');
      const response = await universityService.getAllUniversities();
      console.log('🔍 Institutes response:', response);
      
      if (response.success && response.data) {
        setInstitutes(response.data);
        console.log('🔍 Institutes loaded:', response.data.length);
      } else {
        console.error('🔍 Institutes API error:', response.error);
        setError(response.error || 'Failed to load institutes');
      }
    } catch (error) {
      console.error('🔍 Institutes network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterInstitutes = () => {
    let filtered = [...institutes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(institute =>
        institute.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institute.uniCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institute.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(institute => institute.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(institute => 
        statusFilter === 'active' ? institute.isActive : !institute.isActive
      );
    }

    setFilteredInstitutes(filtered);
  };

  const handleDeleteInstitute = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this institute?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await universityService.deleteUniversity(id);
      if (response.success) {
        setSuccess('Institute deleted successfully!');
        loadInstitutes();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to delete institute');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting institute:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    setIsSubmitting(true);
    try {
      const response = await universityService.updateUniversity(id, { isActive: newStatus });
      if (response.success) {
        setSuccess(`Institute ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        loadInstitutes();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update institute status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating institute status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      government: { bg: 'bg-blue-100', text: 'text-blue-800' },
      private: { bg: 'bg-green-100', text: 'text-green-800' },
      'semi-government': { bg: 'bg-purple-100', text: 'text-purple-800' },
      vocational: { bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    const config = typeMap[type as keyof typeof typeMap] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getUniqueTypes = () => {
    return Array.from(new Set(institutes.map(inst => inst.type).filter(Boolean)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading institutes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Institutes Management</h1>
          <p className="text-gray-600">Manage universities and educational institutes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Institute</span>
          </button>
          <button
            onClick={loadInstitutes}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{success || error}</span>
          <button 
            onClick={() => { setSuccess(null); setError(null); }}
            className="ml-auto text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search institutes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Institutes List */}
      {filteredInstitutes.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No institutes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first institute.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredInstitutes.map((institute) => (
            <div key={institute.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{institute.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(institute.type)}
                      {getStatusBadge(institute.isActive)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Code: {institute.uniCode}</span>
                    </div>
                    {institute.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{institute.address}</span>
                      </div>
                    )}
                    {institute.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={institute.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {institute.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Institute ID: {institute.id}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (onEditInstitute) {
                        onEditInstitute(institute);
                      } else {
                        setSelectedInstitute(institute);
                        setShowEditModal(true);
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(institute.id, institute.isActive)}
                    disabled={isSubmitting}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
                      institute.isActive
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {institute.isActive ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
                    <span>{institute.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteInstitute(institute.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Institute Modal */}
      <AddInstituteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadInstitutes();
          setShowAddModal(false);
        }}
      />

      {/* TODO: Add Edit Institute Modal */}
    </div>
  );
};

export default InstitutesManagement;

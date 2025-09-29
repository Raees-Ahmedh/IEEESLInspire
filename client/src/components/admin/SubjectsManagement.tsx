import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, BookOpen, AlertCircle, CheckCircle, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { subjectService } from '../../services/apiService';
import AddSubjectModal from './AddSubjectModal';
import EditSubjectModal from './EditSubjectModal';

interface Subject {
  id: number;
  name: string;
  level: 'OL' | 'AL';
  code: string;
  isActive: boolean;
}

interface SubjectsManagementProps {
  onAddSubject?: () => void;
}

const SubjectsManagement: React.FC<SubjectsManagementProps> = ({ onAddSubject }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Filter subjects when search term or filters change
  useEffect(() => {
    filterSubjects();
  }, [subjects, searchTerm, levelFilter, statusFilter]);

  const loadSubjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading subjects...');
      const response = await subjectService.getAllSubjects();
      console.log('🔍 Subjects response:', response);
      
      if (response.success && response.data) {
        setSubjects(response.data);
        console.log('🔍 Subjects loaded:', response.data.length);
      } else {
        console.error('🔍 Subjects API error:', response.error);
        setError(response.error || 'Failed to load subjects');
      }
    } catch (error) {
      console.error('🔍 Subjects network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = [...subjects];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(subject =>
        subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(subject => subject.level === levelFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(subject => 
        statusFilter === 'active' ? subject.isActive : !subject.isActive
      );
    }

    setFilteredSubjects(filtered);
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await subjectService.deleteSubject(id);
      if (response.success) {
        setSuccess('Subject deleted successfully!');
        loadSubjects();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to delete subject');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    setIsSubmitting(true);
    try {
      const response = await subjectService.updateSubjectStatus(id, newStatus);
      if (response.success) {
        setSuccess(`Subject ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        loadSubjects();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update subject status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating subject status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const levelMap = {
      OL: { bg: 'bg-blue-100', text: 'text-blue-800' },
      AL: { bg: 'bg-green-100', text: 'text-green-800' }
    };
    const config = levelMap[level as keyof typeof levelMap] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {level}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subjects Management</h1>
          <p className="text-gray-600">Manage OL and AL subjects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={loadSubjects}
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
              placeholder="Search subjects..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="OL">OL</option>
              <option value="AL">AL</option>
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

      {/* Subjects List */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first subject.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLevelBadge(subject.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subject.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setShowEditModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(subject.id, subject.isActive)}
                          disabled={isSubmitting}
                          className={`px-3 py-1.5 rounded flex items-center space-x-1 ${
                            subject.isActive
                              ? 'bg-gray-600 text-white hover:bg-gray-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {subject.isActive ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
                          <span>{subject.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadSubjects();
          setShowAddModal(false);
        }}
      />

      {/* Edit Subject Modal */}
      {selectedSubject && (
        <EditSubjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubject(null);
          }}
          onSuccess={() => {
            loadSubjects();
            setShowEditModal(false);
            setSelectedSubject(null);
          }}
          subject={selectedSubject}
        />
      )}
    </div>
  );
};

export default SubjectsManagement;

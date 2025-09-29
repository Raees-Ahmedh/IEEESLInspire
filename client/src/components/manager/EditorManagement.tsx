import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, User, Building, CheckCircle, X, AlertCircle, Users, UserPlus, Settings } from 'lucide-react';
import { editorService, universityService } from '../../services/apiService';
import AddEditorModal from './AddEditorModal';
import AssignEditorModal from './AssignEditorModal';

interface Editor {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  role: string;
}

interface EditorManagementProps {
  onAddEditor?: () => void;
}

const EditorManagement: React.FC<EditorManagementProps> = ({ onAddEditor }) => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals
  const [showAddEditorModal, setShowAddEditorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);

  useEffect(() => {
    loadEditors();
  }, []);

  const loadEditors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading editors...');
      const response = await editorService.getAllEditors();
      console.log('🔍 Editors response:', response);
      
      if (response.success && response.data) {
        setEditors(response.data);
        console.log('🔍 Editors loaded:', response.data.length);
      } else {
        console.error('🔍 Editors API error:', response.error);
        setError(response.error || 'Failed to load editors');
      }
    } catch (error) {
      console.error('🔍 Editors network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (editorId: number, currentStatus: boolean) => {
    try {
      const response = await editorService.updateEditorStatus(editorId.toString(), !currentStatus);
      
      if (response.success) {
        setEditors(prev => prev.map(editor => 
          editor.id === editorId 
            ? { ...editor, isActive: !currentStatus }
            : editor
        ));
      } else {
        setError(response.error || 'Failed to update editor status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating editor status:', error);
    }
  };

  const handleAssignEditor = (editor: Editor) => {
    setSelectedEditor(editor);
    setShowAssignModal(true);
  };

  const handleAddEditorSuccess = () => {
    loadEditors();
    setShowAddEditorModal(false);
  };

  const handleAssignSuccess = () => {
    loadEditors();
    setShowAssignModal(false);
    setSelectedEditor(null);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  const filterEditors = (editors: Editor[]) => {
    let filtered = editors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(editor =>
        editor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        editor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        editor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(editor => 
        statusFilter === 'active' ? editor.isActive : !editor.isActive
      );
    }

    return filtered;
  };

  const filteredEditors = filterEditors(editors);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading editors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Editor Management</h2>
          <p className="text-gray-600 mt-1">Manage editors and their university assignments</p>
        </div>
        <button
          onClick={() => setShowAddEditorModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Editor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search editors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editors List */}
      {filteredEditors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No editors found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria.' 
              : 'Get started by adding your first editor.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowAddEditorModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Editor
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredEditors.map((editor) => (
            <div key={editor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {editor.firstName} {editor.lastName || ''}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(editor.isActive)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{editor.email}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Editor</span>
                    </div>
                    {editor.phone && (
                      <div className="flex items-center space-x-1">
                        <span>Phone: {editor.phone}</span>
                      </div>
                    )}
                    {editor.lastLogin && (
                      <div className="flex items-center space-x-1">
                        <span>Last login: {new Date(editor.lastLogin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  ID: {editor.id}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAssignEditor(editor)}
                    className="inline-flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Building className="w-4 h-4 mr-1" />
                    Assign University
                  </button>
                  <button
                    onClick={() => handleToggleStatus(editor.id, editor.isActive)}
                    className={`inline-flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
                      editor.isActive
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {editor.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddEditorModal
        isOpen={showAddEditorModal}
        onClose={() => setShowAddEditorModal(false)}
        onSuccess={handleAddEditorSuccess}
      />

      <AssignEditorModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={handleAssignSuccess}
        editor={selectedEditor}
      />
    </div>
  );
};

export default EditorManagement;

import React, { useState, useEffect } from 'react';
import { Plus, User, Building, AlertCircle, CheckCircle, X, Eye, Trash2, Edit, BarChart3 } from 'lucide-react';

interface Editor {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  lastLogin: string;
  profileData: any;
}

interface EditorAssignment {
  id: number;
  university: {
    id: number;
    name: string;
    type: string;
    isActive: boolean;
  };
  assignedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAt: string;
  permissions: any;
  isActive: boolean;
}

const EditorManagement: React.FC = () => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [allEditorAssignments, setAllEditorAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddEditorModal, setShowAddEditorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewAssignmentsModal, setShowViewAssignmentsModal] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<number>(0);
  const [permissions, setPermissions] = useState({
    canAddCourses: true,
    canEditCourses: true,
    canDeleteCourses: false,
    canManageMaterials: true,
    canViewAnalytics: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add editor form
  const [editorForm, setEditorForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadEditors();
    loadUniversities();
    loadAllEditorAssignments();
  }, []);

  const loadEditors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/editors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEditors(data.data || []);
      } else {
        setError('Failed to load editors');
      }
    } catch (error) {
      setError('Failed to load editors');
      console.error('Error loading editors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllEditorAssignments = async () => {
    try {
      console.log('🔍 Loading all editor assignments...');
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/editors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const editors = data.data || [];
        console.log('🔍 Found editors:', editors.length);
        
        // Load assignments for each editor
        const allAssignments = [];
        for (const editor of editors) {
          try {
            console.log(`🔍 Loading assignments for editor ${editor.id} (${editor.firstName} ${editor.lastName})`);
            const assignmentResponse = await fetch(`/api/editors/${editor.id}/assignments`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (assignmentResponse.ok) {
              const assignmentData = await assignmentResponse.json();
              const assignments = assignmentData.data || [];
              console.log(`🔍 Found ${assignments.length} assignments for editor ${editor.id}`);
              allAssignments.push(...assignments.map((assignment: any) => ({
                ...assignment,
                editor: editor,
                // Flatten the permissions structure for easier access
                permissions: assignment.permissions?.permissions || assignment.permissions
              })));
            } else {
              console.error(`🔍 Failed to load assignments for editor ${editor.id}:`, assignmentResponse.status);
            }
          } catch (error) {
            console.error(`Error loading assignments for editor ${editor.id}:`, error);
          }
        }
        console.log('🔍 Total assignments loaded:', allAssignments.length);
        setAllEditorAssignments(allAssignments);
      } else {
        console.error('🔍 Failed to load editors:', response.status);
      }
    } catch (error) {
      console.error('Error loading editor assignments:', error);
    }
  };

  const loadUniversities = async () => {
    setIsLoadingUniversities(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/universities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check both possible response structures
        const universities = data.data || data.universities || [];
        setUniversities(universities);
        console.log('Loaded universities:', universities);
      } else {
        console.error('Failed to load universities:', response.status);
        setError('Failed to load universities');
      }
    } catch (error) {
      console.error('Error loading universities:', error);
      setError('Failed to load universities');
    } finally {
      setIsLoadingUniversities(false);
    }
  };

  const handleAddEditor = async () => {
    if (!editorForm.email || !editorForm.password || !editorForm.firstName) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/editors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editorForm)
      });

      if (response.ok) {
        setSuccess('Editor created successfully!');
        setShowAddEditorModal(false);
        setEditorForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: ''
        });
        loadEditors(); // Reload editors list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create editor');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating editor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignEditor = async () => {
    if (!selectedEditor || !selectedUniversity) {
      setError('Please select an editor and university');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/editors/${selectedEditor.id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          universityId: selectedUniversity,
          permissions: permissions
        })
      });

      if (response.ok) {
        setSuccess('Editor assigned to university successfully!');
        setShowAssignModal(false);
        setSelectedEditor(null);
        setSelectedUniversity(0);
        setPermissions({
          canAddCourses: true,
          canEditCourses: true,
          canDeleteCourses: false,
          canManageMaterials: true,
          canViewAnalytics: true
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to assign editor');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error assigning editor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignEditor = async (editorId: number, universityId: number) => {
    if (!confirm('Are you sure you want to unassign this editor from the university?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/editors/${editorId}/unassign/${universityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Editor unassigned from university successfully!');
        // Reload editors to refresh assignments
        loadEditors();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to unassign editor');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error unassigning editor:', error);
    }
  };

  const handleToggleEditorStatus = async (editorId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/editors/${editorId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setSuccess(`Editor ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        loadEditors(); // Reload editors list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update editor status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating editor status:', error);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5 mt-4 sm:mt-32">Editor Management</h1>
          <p className="text-gray-600">Manage editors and their university assignments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddEditorModal(true)}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Editor</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <Building className="w-5 h-5" />
            <span>Assign Editor</span>
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

      {/* Editors List */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading editors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editors.map((editor) => (
            <div key={editor.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {editor.firstName} {editor.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{editor.email}</p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    editor.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {editor.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login:</span>
                  <span className="text-sm text-gray-900">
                    {editor.lastLogin 
                      ? new Date(editor.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm text-gray-900">{editor.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assigned Universities:</span>
                  <span className="text-sm text-gray-900">
                    {allEditorAssignments.filter(assignment => 
                      assignment.editor?.id === editor.id
                    ).length} university(ies)
                  </span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedEditor(editor);
                    setShowAssignModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                >
                  <Building className="w-4 h-4" />
                  <span>Assign</span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedEditor(editor);
                    setShowViewAssignmentsModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                >
                  <Building className="w-4 h-4" />
                  <span>View Assignments</span>
                </button>
                <button
                  onClick={() => handleToggleEditorStatus(editor.id, editor.isActive)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    editor.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <span>{editor.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>
          ))}
          
          {editors.length === 0 && (
            <div className="col-span-full text-center py-20">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No editors found</h3>
              <p className="text-gray-600">No editors have been created yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Editor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Assign Editor to University</h2>
              <button
                onClick={loadUniversities}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                disabled={isLoadingUniversities}
              >
                {isLoadingUniversities ? 'Loading...' : 'Reload Universities'}
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Editor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Editor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEditor?.id || 0}
                  onChange={(e) => {
                    const editorId = parseInt(e.target.value);
                    const editor = editors.find(e => e.id === editorId);
                    setSelectedEditor(editor || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Select an editor</option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={editor.id}>
                      {editor.firstName} {editor.lastName} ({editor.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* University Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select University <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoadingUniversities}
                >
                  <option value={0}>
                    {isLoadingUniversities ? 'Loading universities...' : `Select a university (${universities.length} available)`}
                  </option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name} ({university.type})
                    </option>
                  ))}
                </select>
                {universities.length === 0 && !isLoadingUniversities && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">No universities available</p>
                    <button
                      onClick={loadUniversities}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Reload universities
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {Object.entries(permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPermissions(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEditor(null);
                  setSelectedUniversity(0);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignEditor}
                disabled={isSubmitting || !selectedEditor || !selectedUniversity}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Editor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Editor Modal */}
      {showAddEditorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Add New Editor</h2>
            
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editorForm.email}
                  onChange={(e) => setEditorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="editor@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={editorForm.password}
                  onChange={(e) => setEditorForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editorForm.firstName}
                  onChange={(e) => setEditorForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editorForm.lastName}
                  onChange={(e) => setEditorForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editorForm.phone}
                  onChange={(e) => setEditorForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEditorModal(false);
                  setEditorForm({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    phone: ''
                  });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEditor}
                disabled={isSubmitting || !editorForm.email || !editorForm.password || !editorForm.firstName}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Editor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Assignments Modal */}
      {showViewAssignmentsModal && selectedEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {selectedEditor.firstName} {selectedEditor.lastName} - University Assignments
              </h2>
              <button
                onClick={() => setShowViewAssignmentsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {allEditorAssignments
                .filter(assignment => assignment.editor?.id === selectedEditor.id)
                .map((assignment) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{assignment.university?.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Assigned on: {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                    {assignment.permissions && (
                      <div className="text-sm">
                        <p className="text-gray-700 font-medium mb-1">Permissions:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(assignment.permissions).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                value ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-gray-600">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              
              {allEditorAssignments.filter(assignment => assignment.editor?.id === selectedEditor.id).length === 0 && (
                <div className="text-center py-8">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No University Assignments</h3>
                  <p className="text-gray-600">This editor has not been assigned to any universities yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorManagement;

import React, { useState, useEffect } from 'react';
import { Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building, GraduationCap, Newspaper, Menu, X, Eye, EyeOff, AlertCircle, CheckCircle, Edit, Trash2, Upload, ClipboardList } from 'lucide-react';
import Logo from '../assets/images/logo.png';
import EditorCourseManagement from '../components/editor/EditorCourseManagement';
import EditorAnalytics from '../components/editor/EditorAnalytics';
import EditorTaskManagement from '../components/editor/EditorTaskManagement';

interface EditorDashboardProps {
  onGoBack?: () => void;
}

const EditorDashboard: React.FC<EditorDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<'courses' | 'analytics' | 'tasks' | 'profile'>('courses');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Debug sidebar state changes
  useEffect(() => {
    console.log('🔍 Sidebar expanded state changed:', isSidebarExpanded);
  }, [isSidebarExpanded]);
  
  // Debug active section changes
  useEffect(() => {
    console.log('🔍 Active section changed:', activeSection);
  }, [activeSection]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor info
  const [editorInfo, setEditorInfo] = useState<any>(null);
  const [assignedUniversities, setAssignedUniversities] = useState<any[]>([]);
  const [editorPermissions, setEditorPermissions] = useState<any>({
    canAddCourses: false,
    canEditCourses: false,
    canDeleteCourses: false,
    canManageMaterials: false,
    canViewAnalytics: false
  });

  // Load editor info on mount
  useEffect(() => {
    loadEditorInfo();
  }, []);

  const loadEditorInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 EditorDashboard - Editor info loaded:', data);
        setEditorInfo(data.user);
        await loadAssignedUniversities(data.user.id);
      } else {
        const errorData = await response.json();
        console.error('Failed to load editor info:', errorData);
        setError('Failed to load editor information');
      }
    } catch (error) {
      console.error('Error loading editor info:', error);
      setError('Failed to load editor information');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignedUniversities = async (editorId: number) => {
    try {
      console.log('🔍 Loading assigned universities for editor ID:', editorId);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/editors/${editorId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Assignments response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Assignments data:', data);
        console.log('🔍 Assignments data.data:', data.data);
        console.log('🔍 Assignments data.data length:', data.data?.length);
        console.log('🔍 Assignments data.data structure:', JSON.stringify(data.data, null, 2));
        setAssignedUniversities(data.data || []);
        
        // Extract permissions from assignments
        const permissions = data.data.reduce((acc: any, assignment: any) => {
          if (assignment.permissions && assignment.permissions.permissions) {
            return {
              ...acc,
              ...assignment.permissions.permissions
            };
          }
          return acc;
        }, {
          canAddCourses: false,
          canEditCourses: false,
          canDeleteCourses: false,
          canManageMaterials: false,
          canViewAnalytics: false
        });
        setEditorPermissions(permissions);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setError(`Failed to load universities: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setError('Network error loading assigned universities');
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'courses':
        return GraduationCap;
      case 'analytics':
        return BarChart3;
      case 'profile':
        return User;
      default:
        return BookOpen;
    }
  };

  const renderContent = () => {
    if (activeSection === 'courses') {
      return (
        <EditorCourseManagement 
          assignedUniversities={assignedUniversities}
          permissions={editorPermissions}
        />
      );
    }

    if (activeSection === 'analytics') {
      console.log('🔍 EditorDashboard - Analytics section, editorInfo:', editorInfo);
      console.log('🔍 EditorDashboard - Editor ID:', editorInfo?.id);
      console.log('🔍 EditorDashboard - Assigned Universities:', assignedUniversities);
      return (
        <EditorAnalytics 
          editorId={editorInfo?.id}
          assignedUniversities={assignedUniversities}
        />
      );
    }

    if (activeSection === 'tasks') {
      return (
        <EditorTaskManagement />
      );
    }

    if (activeSection === 'profile') {
      return (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8 mt-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5">Editor Profile</h1>
              <p className="text-gray-600">Manage your editor profile and settings</p>
            </div>
          </div>

          {editorInfo && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editorInfo.firstName} {editorInfo.lastName}
                  </h2>
                  <p className="text-gray-600">{editorInfo.email}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Editor
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-gray-900">{editorInfo.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-gray-900">{editorInfo.lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{editorInfo.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{editorInfo.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        editorInfo.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {editorInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="text-gray-900">
                        {editorInfo.lastLogin 
                          ? new Date(editorInfo.lastLogin).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="text-gray-900 capitalize">{editorInfo.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-2 rounded-md text-purple-100 hover:text-white hover:bg-purple-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img src={Logo} alt="IEEE SL Inspire" className="h-8 w-auto" />
              <h1 className="text-xl font-semibold text-white">Editor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onGoBack}
                className="text-purple-100 hover:text-white p-2 rounded-md hover:bg-purple-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`${isSidebarExpanded ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex-shrink-0`}>
          <div className="p-4">
            {/* Sidebar Heading */}
            {isSidebarExpanded && (
              <div className="mb-4 mt-2">
                <h2 className="text-md font-bold text-black">Editor</h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            )}
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveSection('courses')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'courses'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-purple-50 hover:text-purple-700'
                }`}
                title={!isSidebarExpanded ? 'Courses' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'courses' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <GraduationCap className="w-4 h-4" />
                {isSidebarExpanded && <span>Courses</span>}
              </button>

              <button 
                onClick={() => setActiveSection('analytics')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'analytics'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-purple-50 hover:text-purple-700'
                }`}
                title={!isSidebarExpanded ? 'Analytics' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'analytics' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <BarChart3 className="w-4 h-4" />
                {isSidebarExpanded && <span>Analytics</span>}
              </button>

              <button 
                onClick={() => setActiveSection('tasks')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'tasks'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-purple-50 hover:text-purple-700'
                }`}
                title={!isSidebarExpanded ? 'Tasks' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'tasks' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <ClipboardList className="w-4 h-4" />
                {isSidebarExpanded && <span>Tasks</span>}
              </button>

              <button 
                onClick={() => setActiveSection('profile')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'profile'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-purple-50 hover:text-purple-700'
                }`}
                title={!isSidebarExpanded ? 'Profile' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'profile' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <User className="w-4 h-4" />
                {isSidebarExpanded && <span>Profile</span>}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EditorDashboard;

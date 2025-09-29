import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Edit,
  Plus,
  Eye,
  Download
} from 'lucide-react';

interface EditorActivity {
  id: number;
  name: string;
  email: string;
  coursesAdded: number;
  coursesUpdated: number;
  lastActivity: string;
  assignedUniversities: string[];
  totalActivities: number;
}

interface ManagerActivity {
  id: number;
  name: string;
  email: string;
  tasksAssigned: number;
  eventsCreated: number;
  newsPublished: number;
  lastActivity: string;
  totalActivities: number;
}

interface SystemStats {
  totalCourses: number;
  totalUsers: number;
  totalEditors: number;
  totalManagers: number;
  totalStudents: number;
  activeCourses: number;
  inactiveCourses: number;
  recentActivities: any[];
}

interface CourseStats {
  totalCourses: number;
  coursesByUniversity: { university: string; count: number }[];
  coursesByType: { type: string; count: number }[];
  coursesByFramework: { framework: string; count: number }[];
  recentCourses: any[];
}

const AdminStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [editorActivities, setEditorActivities] = useState<EditorActivity[]>([]);
  const [managerActivities, setManagerActivities] = useState<ManagerActivity[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'editors' | 'managers' | 'courses'>('overview');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Load system overview statistics
      const [systemResponse, editorsResponse, managersResponse, coursesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/statistics/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/statistics/editors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/statistics/managers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/statistics/courses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        if (systemData.success) {
          setSystemStats(systemData.data);
        }
      }

      if (editorsResponse.ok) {
        const editorsData = await editorsResponse.json();
        if (editorsData.success) {
          setEditorActivities(editorsData.data);
        }
      }

      if (managersResponse.ok) {
        const managersData = await managersResponse.json();
        if (managersData.success) {
          setManagerActivities(managersData.data);
        }
      }

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        if (coursesData.success) {
          setCourseStats(coursesData.data);
        }
      }

    } catch (err: any) {
      setError(`Error loading statistics: ${err.message}`);
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats?.totalCourses || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{systemStats?.activeCourses || 0} active</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>{systemStats?.totalStudents || 0} students</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Editors</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats?.totalEditors || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Edit className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>Content creators</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-3xl font-bold text-gray-900">{systemStats?.totalManagers || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>University managers</span>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Activities</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="w-5 h-5" />
            <span>Last 15 activities</span>
          </div>
        </div>
        
        {systemStats?.recentActivities?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Activity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {systemStats.recentActivities.map((activity: any, index: number) => (
                  <tr key={activity.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${
                          activity.type === 'course' ? 'bg-blue-100' :
                          activity.type === 'news' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'course' && <BookOpen className="w-3 h-3 text-blue-600" />}
                          {activity.type === 'news' && <FileText className="w-3 h-3 text-purple-600" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{activity.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.action === 'created' ? 'bg-green-100 text-green-800' :
                        activity.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.action === 'created' && <Plus className="w-3 h-3 mr-1" />}
                        {activity.action === 'updated' && <Edit className="w-3 h-3 mr-1" />}
                        {activity.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{activity.user}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">{activity.details}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No recent activities</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditorsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Editor Activities</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last 30 days</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Editor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Courses Added</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Courses Updated</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Universities</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Activities</th>
              </tr>
            </thead>
            <tbody>
              {editorActivities.map((editor) => (
                <tr key={editor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{editor.name}</p>
                      <p className="text-sm text-gray-500">{editor.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {editor.coursesAdded}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {editor.coursesUpdated}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      {editor.assignedUniversities.slice(0, 2).join(', ')}
                      {editor.assignedUniversities.length > 2 && ` +${editor.assignedUniversities.length - 2} more`}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{editor.lastActivity}</td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{editor.totalActivities}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderManagersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Manager Activities</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last 30 days</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Manager</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tasks Assigned</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Events Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">News Published</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Activities</th>
              </tr>
            </thead>
            <tbody>
              {managerActivities.map((manager) => (
                <tr key={manager.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-500">{manager.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {manager.tasksAssigned}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {manager.eventsCreated}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {manager.newsPublished}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{manager.lastActivity}</td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{manager.totalActivities}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      {/* Course Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courseStats?.totalCourses || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">By University</p>
              <p className="text-2xl font-bold text-gray-900">{courseStats?.coursesByUniversity?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">By Framework</p>
              <p className="text-2xl font-bold text-gray-900">{courseStats?.coursesByFramework?.length || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Courses by University */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Courses by University</h3>
        <div className="space-y-4">
          {courseStats?.coursesByUniversity?.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{item.university}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {item.count} courses
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Courses</h3>
        <div className="space-y-4">
          {courseStats?.recentCourses?.slice(0, 5).map((course: any, index: number) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <BookOpen className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-500">{course.university} • {course.createdAt}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Statistics</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8 mt-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5">System Statistics</h1>
          <p className="text-gray-600">Comprehensive overview of system activities and performance</p>
        </div>
        <button
          onClick={loadStatistics}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'editors', label: 'Editors', icon: Edit },
              { id: 'managers', label: 'Managers', icon: UserPlus },
              { id: 'courses', label: 'Courses', icon: BookOpen }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'editors' && renderEditorsTab()}
          {activeTab === 'managers' && renderManagersTab()}
          {activeTab === 'courses' && renderCoursesTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;

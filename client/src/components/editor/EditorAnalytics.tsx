import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  TrendingUp, 
  Calendar,
  Building,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface EditorAnalyticsProps {
  editorId: number;
  assignedUniversities: any[];
}

interface AnalyticsData {
  totalCourses: number;
  coursesByUniversity: Array<{
    universityId: number;
    universityName: string;
    courseCount: number;
  }>;
  coursesByStatus: {
    active: number;
    inactive: number;
  };
  coursesByType: {
    internal: number;
    external: number;
  };
  coursesByStudyMode: {
    fulltime: number;
    parttime: number;
  };
  recentActivities: Array<{
    id: number;
    action: string;
    courseName: string;
    universityName: string;
    timestamp: string;
  }>;
  monthlyStats: Array<{
    month: string;
    coursesCreated: number;
    coursesUpdated: number;
    materialsUploaded: number;
  }>;
  materialsStats: {
    totalMaterials: number;
    materialsByType: Array<{
      type: string;
      count: number;
    }>;
  };
}

const EditorAnalytics: React.FC<EditorAnalyticsProps> = ({ editorId, assignedUniversities }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (editorId) {
      loadAnalyticsData();
    }
  }, [editorId, selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading analytics for editor ID:', editorId);
      console.log('🔍 Time range:', selectedTimeRange);

      const token = localStorage.getItem('auth_token');
      const url = `/api/editors/analytics/${editorId}?timeRange=${selectedTimeRange}`;
      console.log('🔍 API URL:', url);
      console.log('🔍 Token available:', !!token);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Error response:', errorText);
        throw new Error(`Failed to load analytics data: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Analytics data received:', data);
      console.log('🔍 Data structure:', {
        success: data.success,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : 'no data',
        totalCourses: data.data?.totalCourses,
        coursesByUniversity: data.data?.coursesByUniversity
      });
      setAnalyticsData(data.data || data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'uploaded':
        return <Upload className="w-4 h-4 text-purple-600" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'uploaded':
        return 'bg-purple-100 text-purple-800';
      case 'viewed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!editorId) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Editor ID Required</h3>
        <p className="text-gray-600">Please ensure you are logged in as an editor</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Activity className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Error Loading Analytics</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    console.log('🔍 No analytics data available, showing empty state');
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Start managing courses to see your analytics</p>
      </div>
    );
  }

  console.log('🔍 Rendering analytics with data:', analyticsData);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Analytics Overview</h2>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalCourses || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.coursesByStatus?.active || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Materials Uploaded</p>
              <p className="text-2xl font-bold text-purple-600">{analyticsData.materialsStats?.totalMaterials || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Universities</p>
              <p className="text-2xl font-bold text-indigo-600">{assignedUniversities.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses by University */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Courses by University</h3>
          <div className="space-y-3">
            {analyticsData.coursesByUniversity && analyticsData.coursesByUniversity.length > 0 ? (
              analyticsData.coursesByUniversity.map((university) => {
                const maxCount = Math.max(...analyticsData.coursesByUniversity.map(u => u.courseCount || 0));
                return (
                  <div key={university.universityId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{university.universityName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${maxCount > 0 ? (university.courseCount / maxCount) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{university.courseCount || 0}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No course data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Course Type</span>
              </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Internal</span>
                      <span className="text-sm font-bold text-gray-900">{analyticsData.coursesByType?.internal || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">External</span>
                      <span className="text-sm font-bold text-gray-900">{analyticsData.coursesByType?.external || 0}</span>
                    </div>
                  </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Study Mode</span>
              </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Full-time</span>
                      <span className="text-sm font-bold text-gray-900">{analyticsData.coursesByStudyMode?.fulltime || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Part-time</span>
                      <span className="text-sm font-bold text-gray-900">{analyticsData.coursesByStudyMode?.parttime || 0}</span>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {analyticsData.recentActivities && analyticsData.recentActivities.length > 0 ? (
            analyticsData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getActionIcon(activity.action)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action} <span className="font-semibold">{activity.courseName}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.universityName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                    {activity.action}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.monthlyStats && analyticsData.monthlyStats.length > 0 ? (
            analyticsData.monthlyStats.map((month) => (
              <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">{month.month}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Courses Created</span>
                    <span className="text-sm font-bold text-green-600">{month.coursesCreated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Courses Updated</span>
                    <span className="text-sm font-bold text-blue-600">{month.coursesUpdated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Materials Uploaded</span>
                    <span className="text-sm font-bold text-purple-600">{month.materialsUploaded}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No monthly data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Materials Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Materials by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analyticsData.materialsStats?.materialsByType && analyticsData.materialsStats.materialsByType.length > 0 ? (
            analyticsData.materialsStats.materialsByType.map((material) => (
              <div key={material.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 capitalize">{material.type}</p>
                <p className="text-lg font-bold text-gray-900">{material.count}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No materials uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorAnalytics;

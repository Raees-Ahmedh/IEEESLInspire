import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

// Production Analytics Interfaces
interface DashboardMetrics {
  total_courses: number;
  recent_bookmarks: number;
  active_users: number;
  pending_tasks: number;
}

interface DatabaseCompletion {
  total_tables: number;
  tables_with_data: number;
  completion_percentage: string;
  data_integrity_score: string;
  table_details: Array<{
    table_name: string;
    record_count: number;
    completion_percentage: string;
    data_quality: 'good' | 'fair' | 'poor';
  }>;
}

interface UserAnalytics {
  total_users: number;
  new_users_last_30_days: number;
  role_distribution: Array<{
    role: string;
    count: number;
    percentage: string;
  }>;
  user_activity_trend: Array<{
    month: string;
    new_users: number;
    total_users: number;
  }>;
}

interface TaskAnalytics {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: string;
  average_completion_time: number;
  status_breakdown: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  performance_metrics: {
    on_time_completion: string;
    overdue_tasks: number;
    efficiency_score: string;
  };
}

interface CourseAnalytics {
  total_courses: number;
  total_bookmarks: number;
  courses_per_university: Array<{
    university: string;
    course_count: number;
    bookmark_count: number;
  }>;
  popular_courses: Array<{
    course_title: string;
    bookmark_count: number;
    university_name: string;
  }>;
}

interface SearchAnalytics {
  total_searches: number;
  average_results_per_search: string;
  most_searched_terms: Array<{
    query_text: string;
    search_count: number;
  }>;
  search_success_rate: string;
  usage_patterns: {
    peak_search_hours: Array<{
      hour: number;
      search_count: number;
    }>;
    search_trends: Array<{
      date: string;
      search_count: number;
    }>;
  };
}

interface ProductionAnalyticsResponse {
  success: boolean;
  data: {
    dashboard_metrics: DashboardMetrics;
    database_completion: DatabaseCompletion;
    user_analytics: UserAnalytics;
    task_analytics: TaskAnalytics;
    course_analytics: CourseAnalytics;
    search_analytics: SearchAnalytics;
  };
  timestamp: string;
}

const ProductionAnalytics: React.FC = () => {
  const [data, setData] = useState<ProductionAnalyticsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchAnalytics = async () => {
    // Prevent multiple simultaneous calls
    if (refreshing || loading || hasInitialized) return;
    
    try {
      setRefreshing(true);
      console.log('🚀 Fetching SIMPLE analytics data...');
      console.log('📡 API Endpoint: http://localhost:4000/api/admin/simple-analytics');
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('http://localhost:4000/api/admin/simple-analytics', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📊 Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result: ProductionAnalyticsResponse = await response.json();
      console.log('📈 API Response:', result);
      
      if (result.success) {
        setData(result.data);
        setError(null);
        setHasInitialized(true);
        console.log('✅ Analytics data loaded successfully');
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout: The analytics data is taking too long to load. Please try again.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Error fetching analytics: ${errorMessage}`);
      }
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function for button clicks
  const handleRefresh = async () => {
    setHasInitialized(false); // Allow refresh
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, []); // Run only once on mount

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  };

  const getDataQualityColor = (quality: string): string => {
    switch (quality) {
      case 'good': return '#10B981';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833-.23 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Safety check for data structure
  if (!data.dashboard_metrics || !data.database_completion || !data.user_analytics || 
      !data.task_analytics || !data.course_analytics || !data.search_analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833-.23 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Incomplete Data</h3>
            <p className="mt-1 text-sm text-gray-500">Analytics data is incomplete. Please try refreshing.</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time insights and business metrics
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.dashboard_metrics?.total_courses || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Bookmarks</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.dashboard_metrics?.recent_bookmarks || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.dashboard_metrics?.active_users || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(data.dashboard_metrics?.pending_tasks || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Database Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Data Completion</span>
              <span className="text-lg font-bold text-green-600">{data.database_completion?.completion_percentage || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Data Integrity Score</span>
              <span className="text-lg font-bold text-blue-600">{data.database_completion?.data_integrity_score || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Tables with Data</span>
              <span className="text-sm text-gray-900">
                {data.database_completion?.tables_with_data || 0} / {data.database_completion?.total_tables || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.user_analytics?.role_distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, percentage }: any) => `${role}: ${percentage}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(data.user_analytics?.role_distribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.task_analytics?.status_breakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Tasks']} />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Completion Rate</span>
              <span className="text-lg font-bold text-green-600">{data.task_analytics?.completion_rate || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">On-Time Completion</span>
              <span className="text-lg font-bold text-blue-600">{data.task_analytics?.performance_metrics?.on_time_completion || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Efficiency Score</span>
              <span className="text-lg font-bold text-purple-600">{data.task_analytics?.performance_metrics?.efficiency_score || '0%'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Overdue Tasks</span>
              <span className="text-lg font-bold text-red-600">{formatNumber(data.task_analytics?.performance_metrics?.overdue_tasks || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Universities by Courses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(data.course_analytics?.courses_per_university || []).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="university" 
                angle={-45}
                textAnchor="end"
                height={120}
                fontSize={12}
              />
              <YAxis />
              <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Courses']} />
              <Bar dataKey="course_count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Courses</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(data.course_analytics?.popular_courses || []).slice(0, 10).map((course, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{course.course_title}</p>
                  <p className="text-xs text-gray-500">{course.university_name}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatNumber(course.bookmark_count)} bookmarks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(data.search_analytics?.total_searches || 0)}</div>
            <div className="text-sm text-gray-500">Total Searches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.search_analytics?.average_results_per_search || '0'}</div>
            <div className="text-sm text-gray-500">Avg Results per Search</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.search_analytics?.search_success_rate || '0%'}</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Most Searched Terms</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(data.search_analytics?.most_searched_terms || []).slice(0, 10).map((term, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">{term.query_text}</span>
                  <span className="text-sm font-medium text-blue-600">{formatNumber(term.search_count)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Peak Search Hours</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.search_analytics?.usage_patterns?.peak_search_hours || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Searches']} />
                <Area type="monotone" dataKey="search_count" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Database Table Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Table Status</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Quality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.database_completion?.table_details || []).map((table, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {table.table_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(table.record_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {table.completion_percentage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getDataQualityColor(table.data_quality) + '20',
                        color: getDataQualityColor(table.data_quality)
                      }}
                    >
                      {table.data_quality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionAnalytics;
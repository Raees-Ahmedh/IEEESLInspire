import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  databaseCompletion: DatabaseCompletionStatus[];
  taskStatusBreakdown: TaskStatusBreakdown[];
  taskDurationAnalytics: TaskDurationAnalytics[];
  userGrowthTrends: UserGrowthTrends[];
  searchFilterUsage: SearchFilterUsage[];
  searchPerformanceSummary: SearchPerformanceSummary;
  dailySearchTrends: DailySearchTrend[];
  topBookmarkedCourses: TopBookmarkedCourse[];
  dashboardSummary: DashboardSummary;
  generatedAt: string;
}

interface DatabaseCompletionStatus {
  entity_type: string;
  total_count: number;
  complete_count: number;
  incomplete_count: number;
  completion_percentage: any; // Can be number or PostgreSQL decimal object
}

interface TaskStatusBreakdown {
  status: string;
  taskCount: number;
  percentage: number;
  displayStatus: string;
}

interface TaskDurationAnalytics {
  status: string;
  assigneeRole: string;
  taskCount: number;
  avgDurationHours: number;
  minDurationHours: number;
  maxDurationHours: number;
  completedWithin24h: number;
  completedAfter1week: number;
  quickCompletionRate: number;
}

interface UserGrowthTrends {
  period_month: string;
  user_role: string;
  new_users_count: number;
  cumulative_total: any; // Can be number or PostgreSQL decimal object
  previous_total: any; // Can be number or PostgreSQL decimal object
  growth_rate_percentage: any; // Can be number or PostgreSQL decimal object
}

interface SearchFilterUsage {
  filterCategory: string;
  filterValue: string;
  usageCount: number;
  usagePercentage: number;
  rankInCategory: number;
}

interface SearchPerformanceSummary {
  total_searches: number;
  avg_results_per_query: number;
  zero_result_searches: number;
  zero_result_percentage: number;
  successful_searches: number;
  success_rate_percentage: number;
  unique_users_searching: number;
  unique_sessions: number;
  avg_searches_per_user: number;
  searches_last_7_days: number;
  searches_last_30_days: number;
  avg_daily_searches_7d: number;
  avg_daily_searches_30d: number;
}

interface DailySearchTrend {
  dateLabel: string;
  dailySearchCount: number;
  avgResults: number;
}

interface TopBookmarkedCourse {
  popularity_rank: number;
  course_id: number;
  course_name: string;
  course_code: string;
  university_name: string;
  university_type: string;
  faculty_name: string;
  department_name: string;
  fee_type: string;
  study_mode: string;
  duration_months: number;
  bookmark_count: number;
  unique_users_bookmarked: number;
  recent_bookmarks_7d: number;
  recent_bookmarks_30d: number;
  bookmark_to_view_ratio: number;
  activity_level: string;
  popularity_category: string;
}

interface DashboardSummary {
  total_active_universities: number;
  total_active_courses: number;
  total_active_users: number;
  total_students: number;
  total_admins: number;
  total_managers: number;
  searches_last_30_days: number;
  bookmarks_last_30_days: number;
  tasks_created_last_30_days: number;
  tasks_todo: number;
  tasks_ongoing: number;
  tasks_complete: number;
}

const AdminStatisticsSimple: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // TEMPORARY: Remove authentication for testing
      // const token = localStorage.getItem('token');
      // if (!token) {
      //   throw new Error('Authentication required. Please log in.');
      // }

      const response = await fetch('http://localhost:4000/api/admin/analytics/dashboard/overview', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Temporarily disabled
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(`Failed to fetch analytics data: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Analytics API Response:', result); // Debug log
      
      if (result.success && result.data) {
        setAnalyticsData(result.data);
        setError(null); // Clear any previous errors
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p><strong>Troubleshooting:</strong></p>
            <p>• Ensure the server is running on http://localhost:4000</p>
            <p>• Check if you have the required permissions</p>
            <p>• Verify database connection and data</p>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
          <p className="text-gray-600 mb-4">Unable to load analytics data. This might be because:</p>
          <ul className="text-sm text-gray-600 text-left mb-4 space-y-1">
            <li>• Database is empty or not properly connected</li>
            <li>• Server is not running</li>
            <li>• Analytics service is not configured</li>
          </ul>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Summary Cards Component with fallback data
  const SummaryCards = () => {
    const { dashboardSummary } = analyticsData;
    
    // Helper function to safely parse decimal values and other types
    const safeValue = (value: any) => {
      if (value === undefined || value === null) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && value.d && Array.isArray(value.d)) {
        // Handle PostgreSQL decimal format: {s: 1, e: 1, d: [91, 6700000]}
        return parseFloat(value.d.join('')) / Math.pow(10, value.e - 1);
      }
      return Number(value) || 0;
    };
    
    const cards = [
      {
        title: 'Total Universities',
        value: safeValue(dashboardSummary?.total_active_universities),
        color: 'bg-blue-100 text-blue-800',
        icon: '🏛️'
      },
      {
        title: 'Total Courses',
        value: safeValue(dashboardSummary?.total_active_courses),
        color: 'bg-green-100 text-green-800',
        icon: '📚'
      },
      {
        title: 'Active Users',
        value: safeValue(dashboardSummary?.total_active_users),
        color: 'bg-purple-100 text-purple-800',
        icon: '👥'
      },
      {
        title: 'Recent Searches',
        value: safeValue(dashboardSummary?.searches_last_30_days),
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🔍'
      },
      {
        title: 'Recent Bookmarks',
        value: safeValue(dashboardSummary?.bookmarks_last_30_days),
        color: 'bg-red-100 text-red-800',
        icon: '🔖'
      },
      {
        title: 'Pending Tasks',
        value: safeValue(dashboardSummary?.tasks_todo) + safeValue(dashboardSummary?.tasks_ongoing),
        color: 'bg-indigo-100 text-indigo-800',
        icon: '📋'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3 text-2xl`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Database Completion Status with safe access
  const DatabaseCompletionStatus = () => {
    const completionData = analyticsData.databaseCompletion || [];
    
    // Helper function to safely parse decimal values and other types
    const safeValue = (value: any) => {
      if (value === undefined || value === null) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && value.d && Array.isArray(value.d)) {
        // Handle PostgreSQL decimal format: {s: 1, e: 1, d: [91, 6700000]}
        return parseFloat(value.d.join('')) / Math.pow(10, value.e - 1);
      }
      return Number(value) || 0;
    };
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Database Completion Status</h3>
        {completionData.length > 0 ? (
          <div className="space-y-4">
            {completionData.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{item.entity_type}</h4>
                  <span className="text-sm font-bold text-blue-600">
                    {safeValue(item.completion_percentage).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${safeValue(item.completion_percentage)}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {safeValue(item.complete_count)} complete / {safeValue(item.total_count)} total
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No completion data available</p>
          </div>
        )}
      </div>
    );
  };

  // Task Status Overview with safe access
  const TaskStatusOverview = () => {
    const taskData = analyticsData.taskStatusBreakdown || [];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Task Status Overview</h3>
        {taskData.length > 0 ? (
          <div className="space-y-3">
            {taskData.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    task.status === 'todo' ? 'bg-red-400' :
                    task.status === 'ongoing' ? 'bg-yellow-400' :
                    task.status === 'complete' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium">{task.displayStatus || task.status}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{task.taskCount || 0}</div>
                  <div className="text-sm text-gray-600">{task.percentage || 0}%</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No task data available</p>
          </div>
        )}
      </div>
    );
  };

  // Search Performance Summary
  const SearchPerformanceCard = () => {
    const { searchPerformanceSummary } = analyticsData;
    
    // Helper function to safely parse decimal values and other types
    const safeValue = (value: any) => {
      if (value === undefined || value === null) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && value.d && Array.isArray(value.d)) {
        // Handle PostgreSQL decimal format: {s: 1, e: 1, d: [91, 6700000]}
        return parseFloat(value.d.join('')) / Math.pow(10, value.e - 1);
      }
      return Number(value) || 0;
    };
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Search Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {safeValue(searchPerformanceSummary?.total_searches || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Searches</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {safeValue(searchPerformanceSummary?.avg_results_per_query || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Avg Results/Query</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {safeValue(searchPerformanceSummary?.zero_result_percentage || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Zero Results</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {safeValue(searchPerformanceSummary?.success_rate_percentage || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    );
  };

  // Top Bookmarked Courses Table
  const TopBookmarkedCoursesTable = () => {
    const topCourses = analyticsData.topBookmarkedCourses.slice(0, 10);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Top Bookmarked Courses</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookmarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCourses.map((course) => (
                <tr key={course.course_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{course.popularity_rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {course.course_name}
                    </div>
                    <div className="text-sm text-gray-500">{course.course_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">
                    {course.university_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.bookmark_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.activity_level === 'High Activity' 
                        ? 'bg-green-100 text-green-800'
                        : course.activity_level === 'Moderate Activity'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.activity_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // User Growth Trends Simple Display
  const UserGrowthTrendsTable = () => {
    const recentTrends = analyticsData.userGrowthTrends.slice(0, 12);
    
    // Helper function to safely parse decimal values and other types
    const safeValue = (value: any) => {
      if (value === undefined || value === null) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && value.d && Array.isArray(value.d)) {
        // Handle PostgreSQL decimal format: {s: 1, e: 1, d: [91, 6700000]}
        return parseFloat(value.d.join('')) / Math.pow(10, value.e - 1);
      }
      return Number(value) || 0;
    };
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">User Growth Trends (Recent Months)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTrends.map((trend, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.period_month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.user_role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {safeValue(trend.new_users_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {safeValue(trend.cumulative_total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`${safeValue(trend.growth_rate_percentage) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {safeValue(trend.growth_rate_percentage) > 0 ? '+' : ''}{safeValue(trend.growth_rate_percentage).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'users', name: 'Users' },
    { id: 'search', name: 'Search' },
    { id: 'courses', name: 'Courses' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date(analyticsData.generatedAt).toLocaleString()}
          </p>
          
          {/* Debug Info */}
          <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
            <strong>API Status:</strong> Connected to http://localhost:4000 | 
            <strong> Data Status:</strong> {Object.keys(analyticsData).length} sections loaded |
            <strong> Users:</strong> {analyticsData.dashboardSummary?.total_active_users || 0} |
            <strong> Universities:</strong> {analyticsData.dashboardSummary?.total_active_universities || 0} |
            <strong> Courses:</strong> {analyticsData.dashboardSummary?.total_active_courses || 0}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DatabaseCompletionStatus />
              <TaskStatusOverview />
            </div>
            <SearchPerformanceCard />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <TaskStatusOverview />
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Task Duration Analytics</h3>
              {analyticsData.taskDurationAnalytics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Duration (hrs)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quick Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.taskDurationAnalytics.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">{item.status}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">{item.assigneeRole}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.taskCount}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.avgDurationHours}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.quickCompletionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No task duration data available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <UserGrowthTrendsTable />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchPerformanceCard />
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Search Filter Usage</h3>
              {analyticsData.searchFilterUsage.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    analyticsData.searchFilterUsage.reduce((acc, filter) => {
                      if (!acc[filter.filterCategory]) {
                        acc[filter.filterCategory] = [];
                      }
                      acc[filter.filterCategory].push(filter);
                      return acc;
                    }, {} as Record<string, typeof analyticsData.searchFilterUsage>)
                  ).map(([category, filters]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{category}</h4>
                      <div className="space-y-2">
                        {filters.map((filter, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{filter.filterValue}</span>
                            <div className="text-right">
                              <span className="font-medium">{filter.usageCount}</span>
                              <span className="text-sm text-gray-600 ml-2">({filter.usagePercentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No search filter data available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <TopBookmarkedCoursesTable />
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex items-center"
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh Analytics'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticsSimple;
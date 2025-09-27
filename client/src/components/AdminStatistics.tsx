import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUpIcon, 
  UsersIcon, 
  BookmarkIcon, 
  SearchIcon,
  TaskIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface AnalyticsData {
  databaseCompletion: any[];
  taskStatusBreakdown: any[];
  taskDurationAnalytics: any[];
  userGrowthTrends: any[];
  searchFilterUsage: any[];
  searchPerformanceSummary: any;
  dailySearchTrends: any[];
  topBookmarkedCourses: any[];
  dashboardSummary: any;
  generatedAt: string;
}

const AdminStatistics: React.FC = () => {
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
      const response = await fetch('/api/admin/analytics/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (err) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
    return <div>No data available</div>;
  }

  // Summary Cards Component
  const SummaryCards = () => {
    const { dashboardSummary } = analyticsData;
    
    const cards = [
      {
        title: 'Total Universities',
        value: dashboardSummary.totalActiveUniversities,
        icon: BuildingOfficeIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-600'
      },
      {
        title: 'Total Courses',
        value: dashboardSummary.totalActiveCourses,
        icon: AcademicCapIcon,
        color: 'bg-green-500',
        textColor: 'text-green-600'
      },
      {
        title: 'Active Users',
        value: dashboardSummary.totalActiveUsers,
        icon: UsersIcon,
        color: 'bg-purple-500',
        textColor: 'text-purple-600'
      },
      {
        title: 'Recent Searches',
        value: dashboardSummary.searchesLast30Days,
        icon: SearchIcon,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      },
      {
        title: 'Recent Bookmarks',
        value: dashboardSummary.bookmarksLast30Days,
        icon: BookmarkIcon,
        color: 'bg-red-500',
        textColor: 'text-red-600'
      },
      {
        title: 'Pending Tasks',
        value: dashboardSummary.tasksTodo + dashboardSummary.tasksOngoing,
        icon: TaskIcon,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3`}>
                <card.icon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-semibold ${card.textColor}`}>
                  {card.value?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Database Completion Chart
  const DatabaseCompletionChart = () => {
    const data = {
      labels: analyticsData.databaseCompletion.map(item => item.entityType),
      datasets: [
        {
          label: 'Completion Percentage',
          data: analyticsData.databaseCompletion.map(item => item.completionPercentage),
          backgroundColor: ['#3B82F6', '#10B981'],
          borderColor: ['#2563EB', '#059669'],
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Database Completion Status'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Bar data={data} options={options} />
      </div>
    );
  };

  // Task Status Pie Chart
  const TaskStatusChart = () => {
    const data = {
      labels: analyticsData.taskStatusBreakdown.map(item => item.displayStatus),
      datasets: [
        {
          data: analyticsData.taskStatusBreakdown.map(item => item.taskCount),
          backgroundColor: [
            '#EF4444', // To Do - Red
            '#F59E0B', // Ongoing - Yellow
            '#10B981', // Complete - Green
            '#6B7280'  // Cancelled - Gray
          ],
          borderColor: [
            '#DC2626',
            '#D97706',
            '#059669',
            '#4B5563'
          ],
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: 'Task Status Distribution'
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Doughnut data={data} options={options} />
      </div>
    );
  };

  // User Growth Trends Chart
  const UserGrowthChart = () => {
    const months = [...new Set(analyticsData.userGrowthTrends.map(item => item.periodMonth))].sort();
    const roles = [...new Set(analyticsData.userGrowthTrends.map(item => item.userRole))];
    
    const datasets = roles.map((role, index) => {
      const roleData = analyticsData.userGrowthTrends.filter(item => item.userRole === role);
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
      
      return {
        label: role,
        data: months.map(month => {
          const found = roleData.find(item => item.periodMonth === month);
          return found ? found.cumulativeTotal : 0;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        fill: false,
        tension: 0.1
      };
    });

    const data = {
      labels: months,
      datasets
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'User Growth Trends (Last 12 Months)'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Line data={data} options={options} />
      </div>
    );
  };

  // Search Performance Summary
  const SearchPerformanceSummary = () => {
    const { searchPerformanceSummary } = analyticsData;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Search Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {searchPerformanceSummary.totalSearches?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">Total Searches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {searchPerformanceSummary.avgResultsPerQuery?.toFixed(1) || 0}
            </p>
            <p className="text-sm text-gray-600">Avg Results/Query</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {searchPerformanceSummary.zeroResultPercentage?.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-gray-600">Zero Results</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {searchPerformanceSummary.successRatePercentage?.toFixed(1) || 0}%
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
                  Recent Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCourses.map((course) => (
                <tr key={course.courseId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{course.popularityRank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {course.courseName}
                    </div>
                    <div className="text-sm text-gray-500">{course.courseCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.universityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.bookmarkCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.activityLevel === 'High Activity' 
                        ? 'bg-green-100 text-green-800'
                        : course.activityLevel === 'Moderate Activity'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.activityLevel}
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
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'tasks', name: 'Tasks', icon: TaskIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'search', name: 'Search', icon: SearchIcon },
    { id: 'courses', name: 'Courses', icon: AcademicCapIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date(analyticsData.generatedAt).toLocaleString()}
          </p>
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
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
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
              <DatabaseCompletionChart />
              <TaskStatusChart />
            </div>
            <SearchPerformanceSummary />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskStatusChart />
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Task Duration Analytics</h3>
                {/* Add task duration analytics visualization here */}
                <p className="text-gray-600">Task duration analytics would be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <UserGrowthChart />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchPerformanceSummary />
            {/* Add search filter usage chart here */}
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
            <TrendingUpIcon className="w-5 h-5 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh Analytics'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
import React, { useState, useEffect } from 'react';

interface AdvancedAnalyticsData {
  data_integrity_health: {
    database_completion: any;
    data_age_report: any;
    stream_mapping_integrity: any;
  };
  team_performance: {
    task_status_breakdown: any;
    task_assignment_duration: any;
    news_publishing_queue: any;
  };
  user_engagement_insights: {
    user_growth_trends: any;
    search_analytics: any;
    top_bookmarked_courses: any;
  };
  metadata: {
    generated_at: string;
    execution_time_ms: number;
    data_freshness: string;
  };
}

const AdvancedStatisticsDashboard: React.FC = () => {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'integrity' | 'performance' | 'engagement'>('integrity');

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/statistics/advanced', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; color?: string }> = ({
    title,
    value,
    subtitle,
    color = 'blue'
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 border-${color}-500`}>
      <h4 className="text-sm font-medium text-gray-600 mb-1">{title}</h4>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const ProgressBar: React.FC<{ percentage: string; color?: string }> = ({ percentage, color = 'blue' }) => {
    const numValue = parseFloat(percentage.replace('%', ''));
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${numValue}%` }}
        ></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Statistics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchAdvancedAnalytics}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No statistics data available.</p>
      </div>
    );
  }

  const renderDataIntegritySection = () => {
    const { database_completion, data_age_report, stream_mapping_integrity } = data.data_integrity_health;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🗄️ Database Completion Status</h3>
          {database_completion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Courses</h4>
                <StatCard 
                  title="Total Courses" 
                  value={database_completion.courses.total}
                  color="blue"
                />
                <StatCard 
                  title="With Requirements" 
                  value={database_completion.courses.with_requirements}
                  subtitle={database_completion.courses.completion_percentage}
                  color="green"
                />
                <ProgressBar percentage={database_completion.courses.completion_percentage} color="green" />
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Universities</h4>
                <StatCard 
                  title="Total Universities" 
                  value={database_completion.universities.total}
                  color="purple"
                />
                <StatCard 
                  title="Complete Profiles" 
                  value={database_completion.universities.complete_profile}
                  subtitle={database_completion.universities.completion_percentage}
                  color="green"
                />
                <ProgressBar percentage={database_completion.universities.completion_percentage} color="green" />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📅 Data Recency Report</h3>
          {data_age_report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Universities</h4>
                <div className="space-y-2">
                  <StatCard 
                    title="Recently Updated" 
                    value={data_age_report.universities.recently_updated}
                    subtitle="Last 30 days"
                    color="green"
                  />
                  <StatCard 
                    title="Stale Data" 
                    value={data_age_report.universities.stale_count}
                    subtitle="Needs attention"
                    color="red"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Courses</h4>
                <div className="space-y-2">
                  <StatCard 
                    title="Recently Updated" 
                    value={data_age_report.courses.recently_updated}
                    subtitle="Last 30 days"
                    color="green"
                  />
                  <StatCard 
                    title="Stale Data" 
                    value={data_age_report.courses.stale_count}
                    subtitle="Needs attention"
                    color="red"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {stream_mapping_integrity && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔗 Stream Mapping Integrity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Total Courses" 
                value={stream_mapping_integrity.total_courses}
                color="blue"
              />
              <StatCard 
                title="Mapped Courses" 
                value={stream_mapping_integrity.courses_with_requirements}
                color="green"
              />
              <StatCard 
                title="Integrity Score" 
                value={stream_mapping_integrity.mapping_integrity_score}
                color="green"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTeamPerformanceSection = () => {
    const { task_status_breakdown, task_assignment_duration, news_publishing_queue } = data.team_performance;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Task Status Overview</h3>
          {task_status_breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                title="Total Tasks" 
                value={task_status_breakdown.total_tasks}
                color="blue"
              />
              <StatCard 
                title="Completed" 
                value={task_status_breakdown.summary.completed}
                color="green"
              />
              <StatCard 
                title="In Progress" 
                value={task_status_breakdown.summary.in_progress}
                color="yellow"
              />
              <StatCard 
                title="Pending" 
                value={task_status_breakdown.summary.pending}
                color="red"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">⏱️ Task Performance</h3>
          {task_assignment_duration && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                title="Completed Tasks" 
                value={task_assignment_duration.completed_tasks_count}
                color="green"
              />
              <StatCard 
                title="Avg Completion Time" 
                value={`${task_assignment_duration.average_completion_time_hours}h`}
                subtitle="Average hours per task"
                color="blue"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📰 Content Publishing Queue</h3>
          {news_publishing_queue && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Draft Articles" 
                  value={news_publishing_queue.summary.draft}
                  color="gray"
                />
                <StatCard 
                  title="Pending Review" 
                  value={news_publishing_queue.summary.pending}
                  color="yellow"
                />
                <StatCard 
                  title="Published" 
                  value={news_publishing_queue.summary.published}
                  color="green"
                />
              </div>
              {news_publishing_queue.pending_without_approver.count > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h4 className="font-medium text-yellow-800">⚠️ Articles Need Approval</h4>
                  <p className="text-yellow-700">
                    {news_publishing_queue.pending_without_approver.count} articles pending without assigned approver
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUserEngagementSection = () => {
    const { user_growth_trends, search_analytics, top_bookmarked_courses } = data.user_engagement_insights;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">👥 User Growth Trends</h3>
          {user_growth_trends && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                title="Total Users" 
                value={user_growth_trends.total_users}
                color="blue"
              />
              <StatCard 
                title="Students" 
                value={user_growth_trends.role_distribution.student || 0}
                color="green"
              />
              <StatCard 
                title="Managers" 
                value={user_growth_trends.role_distribution.manager || 0}
                color="purple"
              />
              <StatCard 
                title="Admins" 
                value={user_growth_trends.role_distribution.admin || 0}
                color="red"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Search Analytics</h3>
          {search_analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Total Searches" 
                value={search_analytics.total_searches}
                subtitle="Last 30 days"
                color="blue"
              />
              <StatCard 
                title="Avg Results" 
                value={search_analytics.average_results}
                subtitle="Per search"
                color="green"
              />
              <StatCard 
                title="Success Rate" 
                value={search_analytics.last_30_days_summary.success_rate}
                subtitle="Non-zero results"
                color="green"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">⭐ Top Bookmarked Courses</h3>
          {top_bookmarked_courses && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Bookmarks" 
                  value={top_bookmarked_courses.total_bookmarks}
                  color="blue"
                />
                <StatCard 
                  title="Unique Courses" 
                  value={top_bookmarked_courses.unique_courses_bookmarked}
                  color="green"
                />
                <StatCard 
                  title="Avg per Course" 
                  value={top_bookmarked_courses.average_bookmarks_per_course}
                  color="purple"
                />
              </div>
              
              {top_bookmarked_courses.top_bookmarked_courses.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Most Popular Courses</h4>
                  <div className="space-y-2">
                    {top_bookmarked_courses.top_bookmarked_courses.slice(0, 5).map((course: any) => (
                      <div key={course.course_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{course.course_name}</span>
                          <span className="text-sm text-gray-600 ml-2">({course.university_name})</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {course.bookmark_count} bookmarks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Statistics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {/* Generated: {new Date(data.metadata.generated_at).toLocaleString()} */}
            </span>
            <span className="text-sm text-gray-600">
              {/* Load time: {data.metadata.execution_time_ms}ms */}
            </span>
            <button
              onClick={fetchAdvancedAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>
        
        {/* Section Navigation */}
        <div className="flex space-x-4 border-b">
          {[
            { key: 'integrity', label: '🗄️ Data Integrity', description: 'Database health & completeness' },
            { key: 'performance', label: '👥 Team Performance', description: 'Tasks & content management' },
            { key: 'engagement', label: '📈 User Engagement', description: 'User behavior & analytics' }
          ].map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeSection === section.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div>{section.label}</div>
              <div className="text-xs text-gray-400">{section.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      {activeSection === 'integrity' && renderDataIntegritySection()}
      {activeSection === 'performance' && renderTeamPerformanceSection()}
      {activeSection === 'engagement' && renderUserEngagementSection()}
    </div>
  );
};

export default AdvancedStatisticsDashboard;
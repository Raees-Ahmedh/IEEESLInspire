import { useState, useEffect } from 'react';

const SimpleAnalyticsTest = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 Fetching analytics...');
        const response = await fetch('http://localhost:4000/api/admin/simple-analytics');
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📈 Analytics data:', result);
        
        setData(result.data);
        setError(null);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error: </strong>{error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No data received from API
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">📊 Simple Analytics Test</h1>
      
      {/* Dashboard Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📈 Dashboard Metrics</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {data.dashboard_metrics?.total_courses || 0}
            </div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {data.dashboard_metrics?.active_users || 0}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {data.dashboard_metrics?.recent_bookmarks || 0}
            </div>
            <div className="text-sm text-gray-600">Recent Bookmarks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {data.dashboard_metrics?.pending_tasks || 0}
            </div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
          </div>
        </div>
      </div>

      {/* Database Completion */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🗄️ Database Completion</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Tables with Data:</strong> {data.database_completion?.tables_with_data || 0}</p>
            <p><strong>Completion:</strong> {data.database_completion?.completion_percentage || '0%'}</p>
          </div>
          <div>
            <p><strong>Data Integrity:</strong> {data.database_completion?.data_integrity_score || '0%'}</p>
          </div>
        </div>
        
        {data.database_completion?.table_details && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Table Details:</h3>
            <div className="space-y-2">
              {data.database_completion.table_details.map((table, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span>{table.table_name}</span>
                  <div className="text-right">
                    <span className="font-medium">{table.record_count}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      table.data_quality === 'good' ? 'bg-green-100 text-green-800' :
                      table.data_quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {table.data_quality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">👥 User Analytics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Total Users:</strong> {data.user_analytics?.total_users || 0}</p>
            <p><strong>New Users (30 days):</strong> {data.user_analytics?.new_users_last_30_days || 0}</p>
          </div>
          <div>
            {data.user_analytics?.role_distribution && (
              <div>
                <p className="font-medium mb-2">Role Distribution:</p>
                {data.user_analytics.role_distribution.map((role, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{role.role}:</span>
                    <span>{role.count} ({role.percentage})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        ✅ Analytics loaded successfully!
      </div>
    </div>
  );
};

export default SimpleAnalyticsTest;
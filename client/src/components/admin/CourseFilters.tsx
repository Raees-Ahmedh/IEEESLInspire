import React, { useEffect, useState } from 'react';
import { CourseFilters as CourseFiltersType } from '../../types/course';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

interface University {
  name: string;
}

interface Framework {
  id: number;
  type: string;
  level: number;
}

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFiltersChange: (filters: CourseFiltersType) => void | Promise<void>;
  universities: University[];
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  universities 
}) => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real frameworks data from API
  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching frameworks from API...');
        
        const response = await fetch(`${API_BASE_URL}/admin/frameworks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Frameworks API Response:', result);

        if (result.success && result.data) {
          setFrameworks(result.data);
          console.log(`📋 Loaded ${result.data.length} frameworks`);
        } else {
          throw new Error(result.error || 'Failed to fetch frameworks');
        }
      } catch (err: any) {
        console.error('❌ Error fetching frameworks:', err);
        setError(err.message);
        
        // Fallback to default frameworks if API fails
        console.log('🔄 Using fallback framework data...');
        const fallbackFrameworks: Framework[] = [
          { id: 1, type: 'SLQF', level: 4 },
          { id: 2, type: 'SLQF', level: 5 },
          { id: 3, type: 'SLQF', level: 6 },
          { id: 4, type: 'SLQF', level: 7 },
          { id: 5, type: 'SLQF', level: 8 },
          { id: 6, type: 'NVQ', level: 1 },
          { id: 7, type: 'NVQ', level: 2 },
          { id: 8, type: 'NVQ', level: 3 },
          { id: 9, type: 'NVQ', level: 4 },
          { id: 10, type: 'NVQ', level: 5 },
        ];
        setFrameworks(fallbackFrameworks);
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworks();
  }, []);

  const handleFilterChange = async (key: keyof CourseFiltersType, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    console.log('🔄 Filter changed:', key, '=', value);
    
    // Call the parent's filter change handler (which may be async)
    try {
      await onFiltersChange(newFilters);
    } catch (error) {
      console.error('Error applying filter:', error);
    }
  };

  const clearAllFilters = async () => {
    const clearedFilters: CourseFiltersType = {
      institute: '',
      courseType: '',
      frameworkType: '',
      frameworkLevel: '',
      feeType: ''
    };
    
    try {
      await onFiltersChange(clearedFilters);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  // Calculate derived data
  const uniqueFrameworkTypes = [...new Set(frameworks.map(f => f.type))];
  const availableLevels = filters.frameworkType 
    ? frameworks.filter(f => f.type === filters.frameworkType).map(f => f.level)
    : frameworks.map(f => f.level);

  // Show loading state
  if (loading && frameworks.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Warning: Using fallback data. {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Institute Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute
          </label>
          <select
            value={filters.institute}
            onChange={(e) => handleFilterChange('institute', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Institutes</option>
            {universities.map((university, index) => (
              <option key={index} value={university.name}>
                {university.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Type
          </label>
          <select
            value={filters.courseType}
            onChange={(e) => handleFilterChange('courseType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Types</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>

        {/* Framework Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Framework Type
          </label>
          <select
            value={filters.frameworkType}
            onChange={(e) => handleFilterChange('frameworkType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Frameworks</option>
            {uniqueFrameworkTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Framework Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Framework Level
          </label>
          <select
            value={filters.frameworkLevel}
            onChange={(e) => handleFilterChange('frameworkLevel', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || !filters.frameworkType}
          >
            <option value="">All Levels</option>
            {[...new Set(availableLevels)].sort((a, b) => a - b).map((level) => (
              <option key={level} value={level.toString()}>
                Level {level}
              </option>
            ))}
          </select>
          {filters.frameworkType && availableLevels.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">No levels available for selected framework</p>
          )}
        </div>

        {/* Fee Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Type
          </label>
          <select
            value={filters.feeType}
            onChange={(e) => handleFilterChange('feeType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Types</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {Object.values(filters).some(f => f) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.institute && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Institute: {filters.institute}
              <button
                onClick={() => handleFilterChange('institute', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.courseType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {filters.courseType}
              <button
                onClick={() => handleFilterChange('courseType', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.frameworkType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Framework: {filters.frameworkType}
              <button
                onClick={() => handleFilterChange('frameworkType', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.frameworkLevel && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Level: {filters.frameworkLevel}
              <button
                onClick={() => handleFilterChange('frameworkLevel', '')}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.feeType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Fee: {filters.feeType}
              <button
                onClick={() => handleFilterChange('feeType', '')}
                className="ml-1 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            disabled={loading}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading indicator for filter changes */}
      {loading && frameworks.length > 0 && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Applying filters...</span>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;
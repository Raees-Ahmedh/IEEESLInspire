import React, { useEffect, useState } from 'react';
import { CourseFilters as CourseFiltersType } from '../../types/course';

interface University {
  id: number;
  name: string;
  type: 'government' | 'private' | 'semi-government';
}

interface Framework {
  id: number;
  type: string;
  level: number;
}

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFiltersChange: (filters: CourseFiltersType) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ filters, onFiltersChange }) => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockFrameworks: Framework[] = [
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

    const mockUniversities: University[] = [
      { id: 1, name: 'University of Colombo', type: 'government' },
      { id: 2, name: 'University of Peradeniya', type: 'government' },
      { id: 3, name: 'University of Sri Jayewardenepura', type: 'government' },
      { id: 4, name: 'University of Kelaniya', type: 'government' },
      { id: 5, name: 'University of Moratuwa', type: 'government' },
      { id: 6, name: 'SLIIT', type: 'private' },
      { id: 7, name: 'NSBM Green University', type: 'private' },
      { id: 8, name: 'IIT Campus', type: 'private' }
    ];

    setFrameworks(mockFrameworks);
    setUniversities(mockUniversities);
    setLoading(false);
  }, []);

  const handleFilterChange = (key: keyof CourseFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const uniqueFrameworkTypes = [...new Set(frameworks.map(f => f.type))];
  const availableLevels = filters.frameworkType 
    ? frameworks.filter(f => f.type === filters.frameworkType).map(f => f.level)
    : [...new Set(frameworks.map(f => f.level))];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Institute Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Institute
        </label>
        <select
          value={filters.institute}
          onChange={(e) => handleFilterChange('institute', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Institutes</option>
          {universities.map((uni: University) => (
            <option key={uni.id} value={uni.name}>{uni.name}</option>
          ))}
        </select>
      </div>

      {/* Course Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Type
        </label>
        <select
          value={filters.courseType}
          onChange={(e) => handleFilterChange('courseType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="internal">Internal</option>
          <option value="external">External</option>
        </select>
      </div>

      {/* Framework Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Framework Type
        </label>
        <select
          value={filters.frameworkType}
          onChange={(e) => {
            handleFilterChange('frameworkType', e.target.value);
            // Reset framework level when type changes
            if (e.target.value !== filters.frameworkType) {
              handleFilterChange('frameworkLevel', '');
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {uniqueFrameworkTypes.map(type => (
            <option key={type} value={type}>
              {type} ({type === 'SLQF' ? 'Sri Lanka Qualifications Framework' : 'National Vocational Qualifications'})
            </option>
          ))}
        </select>
      </div>

      {/* Framework Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Framework Level
        </label>
        <select
          value={filters.frameworkLevel}
          onChange={(e) => handleFilterChange('frameworkLevel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={!filters.frameworkType}
        >
          <option value="">All Levels</option>
          {availableLevels.sort((a, b) => a - b).map(level => (
            <option key={level} value={level.toString()}>
              Level {level}
            </option>
          ))}
        </select>
      </div>

      {/* Fee Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fee Type
        </label>
        <select
          value={filters.feeType}
          onChange={(e) => handleFilterChange('feeType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Fee Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>
    </div>
  );
};

export default CourseFilters;

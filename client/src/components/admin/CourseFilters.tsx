// Enhanced CourseFilters Component
// File: client/src/components/admin/CourseFilters.tsx

import React, { useEffect, useState } from 'react';
import { CourseFilters as CourseFiltersType } from '../../types/course';
import { courseApi } from '../../services/courseApi';

interface CourseFiltersProps {
  filters: CourseFiltersType;
  onFiltersChange: (filters: CourseFiltersType) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ filters, onFiltersChange }) => {
  const [universities, setUniversities] = useState<any[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [universitiesData, frameworksData] = await Promise.all([
          courseApi.fetchUniversities(),
          courseApi.fetchFrameworks()
        ]);
        
        setUniversities(universitiesData);
        setFrameworks(frameworksData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
          {universities.map(uni => (
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
              {type} ({type === 'SLQF' ? 'Sri Lanka Qualifications Framework' : 'National Vocational Qualification'})
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
            <option key={level} value={level.toString()}>Level {level}</option>
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
// client/src/components/CourseSearchExample.tsx
import React, { useState, useEffect } from 'react';
import { Search, BookmarkPlus, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  searchCourses,
  setSearchQuery,
  clearSearchResults,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
  selectSearchQuery
} from '../store/slices/coursesSlice';
import { Course } from '../types';

const CourseSearchExample: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const searchResults = useAppSelector(selectSearchResults);
  const isLoading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const searchQuery = useAppSelector(selectSearchQuery);
  
  // Local state for input
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim() !== searchQuery) {
        dispatch(setSearchQuery(inputValue));
        
        if (inputValue.trim()) {
          dispatch(searchCourses(inputValue.trim()));
        } else {
          dispatch(clearSearchResults());
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchQuery, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setInputValue('');
    dispatch(clearSearchResults());
  };

  const formatDuration = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const formatFee = (feeType: string, feeAmount?: number): string => {
    if (feeType === 'free') return 'Free';
    if (feeAmount) return `LKR ${feeAmount.toLocaleString()}`;
    return feeType.charAt(0).toUpperCase() + feeType.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Perfect Course</h1>
        <p className="text-gray-600">Search through thousands of courses from Sri Lankan universities</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for courses, universities, or specializations..."
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {inputValue && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Searching courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && searchResults.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-600">
            Found <strong>{searchResults.length}</strong> course{searchResults.length > 1 ? 's' : ''} 
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchQuery && searchResults.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No courses found for "{searchQuery}"</div>
          <p className="text-sm text-gray-400">Try searching with different keywords</p>
        </div>
      )}

    // Fixed Results Grid section with proper type handling
      {/* Results Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {searchResults.map((course: any) => {
          // Helper functions to safely access nested properties
          const getUniversityName = (courseData: any): string => {
            if (typeof courseData.university === 'string') {
              return courseData.university;
            }
            return courseData.university?.name || 'Unknown University';
          };

          const getFacultyName = (courseData: any): string => {
            if (typeof courseData.faculty === 'string') {
              return courseData.faculty;
            }
            return courseData.faculty?.name || 'Unknown Faculty';
          };

          const getDuration = (courseData: any): number => {
            return courseData.durationMonths || 48; // Default to 4 years if not specified
          };

          const getCourseUrl = (courseData: any): string | undefined => {
            return courseData.courseUrl || courseData.url;
          };

          return (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              {/* Course Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{course.name}</h3>
                  <p className="text-purple-600 font-medium">{getUniversityName(course)}</p>
                  <p className="text-gray-500 text-sm">{getFacultyName(course)}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <BookmarkPlus className="w-5 h-5" />
                  </button>
                  {getCourseUrl(course) && (
                    <a 
                      href={getCourseUrl(course)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Course Details */}
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                
                {/* Specializations */}
                {course.specialisation && course.specialisation.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Specializations: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {course.specialisation.map((spec: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Info Row */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(getDuration(course))}
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {formatFee(course.feeType || 'unknown', course.feeAmount)}
                </div>
                
                {course.studyMode && (
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {course.studyMode}
                  </div>
                )}
                
                {course.courseType && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {course.courseType}
                  </div>
                )}
                
                {course.courseCode && (
                  <div className="text-gray-500 font-mono text-xs">
                    {course.courseCode}
                  </div>
                )}

                {/* Fallback for duration if using old Course type */}
                {!course.durationMonths && course.duration && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                )}
              </div>

              {/* Course Actions */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button className="flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors">
                    <BookmarkPlus className="w-4 h-4 mr-1" />
                    Save Course
                  </button>
                  
                  <div className="flex space-x-2">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                      View Details
                    </button>
                    {getCourseUrl(course) && (
                      <a 
                        href={getCourseUrl(course)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination (if needed) */}
      {!isLoading && searchResults.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Page 1 of 1
            </span>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Empty State (when no search has been made) */}
      {!searchQuery && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Start Your Course Search</h3>
          <p className="text-gray-500 mb-6">
            Enter keywords to search for courses, universities, or specializations
          </p>
          
          {/* Quick search suggestions */}
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {['Computer Science', 'Engineering', 'Medicine', 'Business', 'Law'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Statistics */}
      {searchResults.length > 0 && !isLoading && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Search Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-800">{searchResults.length}</span>
              <span className="block">Courses Found</span>
            </div>
            <div>
              <span className="font-medium text-gray-800">
                {new Set(searchResults.map(c => c.university.name)).size}
              </span>
              <span className="block">Universities</span>
            </div>
            <div>
              <span className="font-medium text-gray-800">
                {new Set(searchResults.map(c => c.faculty?.name).filter(Boolean)).size}
              </span>
              <span className="block">Faculties</span>
            </div>
            <div>
              <span className="font-medium text-gray-800">
                {searchResults.filter(c => c.feeType === 'free').length}
              </span>
              <span className="block">Free Courses</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer with tips */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>💡 <strong>Tip:</strong> Try searching by university name, course type, or specialization for better results</p>
      </div>
    </div>
  );
};

export default CourseSearchExample;
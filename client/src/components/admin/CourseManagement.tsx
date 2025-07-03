import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import AddCourse from './AddCourse';
import CourseFilters from './CourseFilters';
import CourseList from './CourseList';
import { Course, CourseFilters as CourseFiltersType } from '../../types/course';

// API base URL - adjust this to match your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CourseFiltersType>({
    institute: '',
    courseType: '',
    frameworkType: '',
    frameworkLevel: '',
    feeType: ''
  });

  // Fetch courses from database API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching courses from database...');
        
        // Build query parameters from filters
        const params = new URLSearchParams();
        
        if (filters.institute) params.append('institute', filters.institute);
        if (filters.courseType) params.append('courseType', filters.courseType);
        if (filters.frameworkType) params.append('frameworkType', filters.frameworkType);
        if (filters.frameworkLevel) params.append('frameworkLevel', filters.frameworkLevel);
        if (filters.feeType) params.append('feeType', filters.feeType);
        if (searchQuery) params.append('search', searchQuery);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/courses${queryString ? `?${queryString}` : ''}`;
        
        console.log('📡 API Request URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ API Response:', result);

        if (result.success && result.data) {
          // Transform database response to match frontend Course interface
          const transformedCourses: Course[] = result.data.map((dbCourse: any) => ({
            id: dbCourse.id,
            name: dbCourse.name,
            courseCode: dbCourse.courseCode,
            courseUrl: dbCourse.courseUrl,
            specialisation: dbCourse.specialisation || [],
            university: {
              id: dbCourse.university.id,
              name: dbCourse.university.name,
              type: dbCourse.university.type
            },
            faculty: {
              id: dbCourse.faculty?.id || 0,
              name: dbCourse.faculty?.name || 'Not specified'
            },
            department: {
              id: dbCourse.department?.id || 0,
              name: dbCourse.department?.name || 'Not specified'
            },
            courseType: dbCourse.courseType,
            studyMode: dbCourse.studyMode,
            feeType: dbCourse.feeType,
            feeAmount: dbCourse.feeAmount,
            framework: dbCourse.framework ? {
              id: dbCourse.framework.id,
              type: dbCourse.framework.type,
              qualificationCategory: dbCourse.framework.qualificationCategory,
              level: dbCourse.framework.level
            } : undefined,
            frameworkLevel: dbCourse.frameworkLevel || dbCourse.framework?.level,
            durationMonths: dbCourse.durationMonths,
            description: dbCourse.description,
            isActive: dbCourse.isActive,
            auditInfo: dbCourse.auditInfo || {
              createdAt: new Date().toISOString(),
              createdBy: 'system',
              updatedAt: new Date().toISOString(),
              updatedBy: 'system'
            }
          }));

          setCourses(transformedCourses);
          setFilteredCourses(transformedCourses);
          console.log(`📚 Loaded ${transformedCourses.length} courses from database`);
        } else {
          throw new Error(result.error || 'Failed to fetch courses');
        }
      } catch (err: any) {
        console.error('❌ Error fetching courses:', err);
        setError(`Failed to load courses: ${err.message}`);
        
        // Fallback: show empty state instead of mock data
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Remove filters dependency to avoid infinite loop

  // Apply client-side filtering (since the API might not support all filters)
  useEffect(() => {
    let filtered = courses;

    // Apply search query (client-side filter for additional search capability)
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.specialisation.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters (client-side for immediate feedback)
    if (filters.institute) {
      filtered = filtered.filter(course => course.university.name === filters.institute);
    }
    if (filters.courseType) {
      filtered = filtered.filter(course => course.courseType === filters.courseType);
    }
    if (filters.frameworkType) {
      filtered = filtered.filter(course => course.framework?.type === filters.frameworkType);
    }
    if (filters.frameworkLevel) {
      filtered = filtered.filter(course => course.framework?.level.toString() === filters.frameworkLevel);
    }
    if (filters.feeType) {
      filtered = filtered.filter(course => course.feeType === filters.feeType);
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery, filters]);

  // Refresh courses when filters change (for server-side filtering)
  const handleFiltersChange = async (newFilters: CourseFiltersType) => {
    setFilters(newFilters);
    // Trigger a new API call with updated filters
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (newFilters.institute) params.append('institute', newFilters.institute);
      if (newFilters.courseType) params.append('courseType', newFilters.courseType);
      if (newFilters.frameworkType) params.append('frameworkType', newFilters.frameworkType);
      if (newFilters.frameworkLevel) params.append('frameworkLevel', newFilters.frameworkLevel);
      if (newFilters.feeType) params.append('feeType', newFilters.feeType);
      if (searchQuery) params.append('search', searchQuery);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/courses${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        const transformedCourses: Course[] = result.data.map((dbCourse: any) => ({
          id: dbCourse.id,
          name: dbCourse.name,
          courseCode: dbCourse.courseCode,
          courseUrl: dbCourse.courseUrl,
          specialisation: dbCourse.specialisation || [],
          university: {
            id: dbCourse.university.id,
            name: dbCourse.university.name,
            type: dbCourse.university.type
          },
          faculty: {
            id: dbCourse.faculty?.id || 0,
            name: dbCourse.faculty?.name || 'Not specified'
          },
          department: {
            id: dbCourse.department?.id || 0,
            name: dbCourse.department?.name || 'Not specified'
          },
          courseType: dbCourse.courseType,
          studyMode: dbCourse.studyMode,
          feeType: dbCourse.feeType,
          feeAmount: dbCourse.feeAmount,
          framework: dbCourse.framework ? {
            id: dbCourse.framework.id,
            type: dbCourse.framework.type,
            qualificationCategory: dbCourse.framework.qualificationCategory,
            level: dbCourse.framework.level
          } : undefined,
          frameworkLevel: dbCourse.frameworkLevel || dbCourse.framework?.level,
          durationMonths: dbCourse.durationMonths,
          description: dbCourse.description,
          isActive: dbCourse.isActive,
          auditInfo: dbCourse.auditInfo || {
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            updatedAt: new Date().toISOString(),
            updatedBy: 'system'
          }
        }));

        setCourses(transformedCourses);
        setFilteredCourses(transformedCourses);
      }
    } catch (err: any) {
      console.error('Error applying filters:', err);
      setError(`Failed to apply filters: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (newCourse: Omit<Course, 'id'>) => {
    try {
      setLoading(true);
      
      // Transform frontend Course to backend format
      const courseData = {
        name: newCourse.name,
        courseCode: newCourse.courseCode,
        courseUrl: newCourse.courseUrl,
        specialisation: newCourse.specialisation,
        universityId: newCourse.university.id,
        facultyId: newCourse.faculty.id,
        departmentId: newCourse.department.id,
        courseType: newCourse.courseType,
        studyMode: newCourse.studyMode,
        feeType: newCourse.feeType,
        feeAmount: newCourse.feeAmount,
        frameworkType: newCourse.framework?.type,
        frameworkLevel: newCourse.framework?.level,
        durationMonths: newCourse.durationMonths,
        description: newCourse.description
      };

      console.log('📝 Creating new course:', courseData);

      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('✅ Course created successfully:', result.data);
        
        // Refresh the courses list
        const refreshResponse = await fetch(`${API_BASE_URL}/courses`);
        const refreshResult = await refreshResponse.json();
        
        if (refreshResult.success && refreshResult.data) {
          const transformedCourses: Course[] = refreshResult.data.map((dbCourse: any) => ({
            id: dbCourse.id,
            name: dbCourse.name,
            courseCode: dbCourse.courseCode,
            courseUrl: dbCourse.courseUrl,
            specialisation: dbCourse.specialisation || [],
            university: {
              id: dbCourse.university.id,
              name: dbCourse.university.name,
              type: dbCourse.university.type
            },
            faculty: {
              id: dbCourse.faculty?.id || 0,
              name: dbCourse.faculty?.name || 'Not specified'
            },
            department: {
              id: dbCourse.department?.id || 0,
              name: dbCourse.department?.name || 'Not specified'
            },
            courseType: dbCourse.courseType,
            studyMode: dbCourse.studyMode,
            feeType: dbCourse.feeType,
            feeAmount: dbCourse.feeAmount,
            framework: dbCourse.framework ? {
              id: dbCourse.framework.id,
              type: dbCourse.framework.type,
              qualificationCategory: dbCourse.framework.qualificationCategory,
              level: dbCourse.framework.level
            } : undefined,
            frameworkLevel: dbCourse.frameworkLevel || dbCourse.framework?.level,
            durationMonths: dbCourse.durationMonths,
            description: dbCourse.description,
            isActive: dbCourse.isActive,
            auditInfo: dbCourse.auditInfo || {
              createdAt: new Date().toISOString(),
              createdBy: 'system',
              updatedAt: new Date().toISOString(),
              updatedBy: 'system'
            }
          }));

          setCourses(transformedCourses);
          setFilteredCourses(transformedCourses);
        }
        
        setShowAddModal(false);
      } else {
        throw new Error(result.error || 'Failed to create course');
      }
    } catch (err: any) {
      console.error('❌ Error creating course:', err);
      setError(`Failed to create course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId: number) => {
    console.log('👁️ Viewing course:', courseId);
    // Implement view course logic
    window.open(`/courses/${courseId}`, '_blank');
  };

  const handleEditCourse = (courseId: number) => {
    console.log('✏️ Editing course:', courseId);
    // Implement edit course logic
    // You can either open a modal or navigate to an edit page
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      setLoading(true);
      
      // For now, just remove from local state since DELETE endpoint may not be implemented
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses.filter(course => {
        // Apply current filters
        let matches = true;
        
        if (searchQuery) {
          matches = matches && (
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.specialisation.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        if (filters.institute) {
          matches = matches && course.university.name === filters.institute;
        }
        if (filters.courseType) {
          matches = matches && course.courseType === filters.courseType;
        }
        if (filters.frameworkType) {
          matches = matches && course.framework?.type === filters.frameworkType;
        }
        if (filters.frameworkLevel) {
          matches = matches && course.framework?.level.toString() === filters.frameworkLevel;
        }
        if (filters.feeType) {
          matches = matches && course.feeType === filters.feeType;
        }
        
        return matches;
      }));
      
      console.log('🗑️ Course deleted (local state updated)');
      
      // TODO: Implement actual API call when DELETE endpoint is available
      // const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete course');
      
    } catch (err: any) {
      console.error('❌ Error deleting course:', err);
      setError(`Failed to delete course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && courses.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses from database...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Please check:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Database server is running</li>
                  <li>Backend API is accessible at {API_BASE_URL}</li>
                  <li>Network connectivity</li>
                </ul>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by name, code, university, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filters.institute || filters.courseType || filters.frameworkType || filters.frameworkLevel || filters.feeType) && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CourseFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              universities={Array.from(new Set(courses.map(c => c.university.name))).map(name => ({ name }))}
            />
          </div>
        )}
      </div>

      {/* Course List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredCourses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? 'No courses match your search criteria.' 
                  : 'No courses available in the database.'}
              </p>
              {(searchQuery || Object.values(filters).some(f => f)) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      institute: '',
                      courseType: '',
                      frameworkType: '',
                      frameworkLevel: '',
                      feeType: ''
                    });
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-500 text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <CourseList
            courses={filteredCourses}
            onView={handleViewCourse}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
            loading={loading}
          />
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <AddCourse
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCourse}
          
        />
      )}

      {/* Loading Overlay */}
      {loading && courses.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Updating courses...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
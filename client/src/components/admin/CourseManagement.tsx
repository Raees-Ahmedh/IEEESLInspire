import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import CourseModal from './CourseModal';
import CourseFilters from './CourseFilters';
import CourseList from './CourseList';
import { Course, CourseFilters as CourseFiltersType } from '../../types/course';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCourses: Course[] = [
        {
          id: 1,
          name: 'Computer Science and Engineering',
          courseCode: 'CSE001',
          courseUrl: '/cse-degree',
          specialisation: ['Software Engineering', 'Data Science'],
          university: {
            id: 1,
            name: 'University of Colombo',
            type: 'government'
          },
          faculty: {
            id: 1,
            name: 'Faculty of Engineering'
          },
          department: {
            id: 1,
            name: 'Department of Computer Science and Engineering'
          },
          courseType: 'internal',
          studyMode: 'fulltime',
          feeType: 'free',
          framework: {
            id: 4,
            type: 'SLQF',
            qualificationCategory: 'Bachelor\'s Degree',
            level: 7
          },
          frameworkLevel: 7,
          durationMonths: 48,
          isActive: true,
          auditInfo: {
            createdAt: '2024-01-15T10:30:00Z',
            createdBy: 'admin@university.ac.lk',
            updatedAt: '2024-06-15T14:20:00Z',
            updatedBy: 'dean@engineering.ac.lk'
          }
        },
        {
          id: 2,
          name: 'Business Administration (MBA)',
          courseCode: 'MBA002',
          courseUrl: '/mba-program',
          specialisation: ['Finance', 'Marketing', 'HR Management'],
          university: {
            id: 2,
            name: 'University of Peradeniya',
            type: 'government'
          },
          faculty: {
            id: 2,
            name: 'Faculty of Management'
          },
          department: {
            id: 2,
            name: 'Department of Business Administration'
          },
          courseType: 'external',
          studyMode: 'parttime',
          feeType: 'paid',
          feeAmount: 150000,
          framework: {
            id: 5,
            type: 'SLQF',
            qualificationCategory: 'Master\'s Degree',
            level: 8
          },
          frameworkLevel: 8,
          durationMonths: 24,
          isActive: true,
          auditInfo: {
            createdAt: '2024-02-10T09:15:00Z',
            createdBy: 'admin@pdn.ac.lk',
            updatedAt: '2024-06-20T11:45:00Z',
            updatedBy: 'director@management.ac.lk'
          }
        },
        {
          id: 3,
          name: 'Medicine (MBBS)',
          courseCode: 'MED003',
          courseUrl: '/medicine-degree',
          specialisation: ['General Medicine'],
          university: {
            id: 3,
            name: 'University of Sri Jayewardenepura',
            type: 'government'
          },
          faculty: {
            id: 3,
            name: 'Faculty of Medical Sciences'
          },
          department: {
            id: 3,
            name: 'Department of Medicine'
          },
          courseType: 'internal',
          studyMode: 'fulltime',
          feeType: 'free',
          framework: {
            id: 4,
            type: 'SLQF',
            qualificationCategory: 'Bachelor\'s Degree',
            level: 7
          },
          frameworkLevel: 7,
          durationMonths: 60,
          isActive: true,
          auditInfo: {
            createdAt: '2024-01-20T08:00:00Z',
            createdBy: 'admin@sjp.ac.lk',
            updatedAt: '2024-06-25T16:30:00Z',
            updatedBy: 'dean@medicine.ac.lk'
          }
        }
      ];
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = courses;

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.specialisation.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
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

  const handleAddCourse = (newCourse: Omit<Course, 'id'>) => {
    const course: Course = {
      ...newCourse,
      id: courses.length + 1,
    };
    setCourses([...courses, course]);
    setShowAddModal(false);
  };

  const handleViewCourse = (courseId: number) => {
    console.log('View course:', courseId);
    // Implement view course logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Management</h1>
          <p className="text-gray-600">Manage university courses and their requirements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses, universities, specializations, or course codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-purple-50 border-purple-200 text-purple-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CourseFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
        {(searchQuery || Object.values(filters).some(Boolean)) && (
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
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Course List */}
      <CourseList courses={filteredCourses} onViewCourse={handleViewCourse} />

      {/* Add Course Modal */}
      {showAddModal && (
        <CourseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCourse}
        />
      )}
    </div>
  );
};

export default CourseManagement;
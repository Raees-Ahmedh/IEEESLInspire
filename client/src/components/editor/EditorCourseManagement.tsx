import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Building, AlertCircle, CheckCircle, X, Filter } from 'lucide-react';
import AddCourse from '../admin/AddCourse';
import EditCourseModal from '../admin/EditCourseModal';
import CourseViewModal from '../admin/CourseViewModal';

interface Course {
  id: number;
  name: string;
  courseCode: string;
  courseUrl: string;
  description: string;
  university: {
    id: number;
    name: string;
    type: string;
  };
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  feeType: 'free' | 'paid';
  feeAmount?: number;
  durationMonths?: number;
  medium?: string[];
  specialisation?: string[];
  isActive: boolean;
  createdAt: string;
}

interface EditorCourseManagementProps {
  assignedUniversities: any[];
  permissions: any;
}

const EditorCourseManagement: React.FC<EditorCourseManagementProps> = ({
  assignedUniversities,
  permissions
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewCourseId, setViewCourseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<number | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, [assignedUniversities]);

  // Filter courses when search term or filters change
  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedUniversity, showInactive]);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/courses?limit=1000&status=all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 All courses loaded:', data.data?.length || 0);
        console.log('🔍 Assigned universities:', assignedUniversities);
        
        // Backend now handles editor permission filtering
        console.log('🔍 Courses from API (already filtered by backend):', data.data?.length || 0);
        console.log('🔍 Course details:', data.data?.map((c: Course) => ({ id: c.id, name: c.name, universityId: c.university.id, universityName: c.university.name })));
        setCourses(data.data || []);
      } else {
        setError('Failed to load courses');
      }
    } catch (error) {
      setError('Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.university.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by university
    if (selectedUniversity !== 'all') {
      filtered = filtered.filter(course => course.university.id === selectedUniversity);
    }

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(course => course.isActive);
    }

    setFilteredCourses(filtered);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!permissions?.canDeleteCourses) {
      setError('You do not have permission to delete courses');
      return;
    }

    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Course deleted successfully!');
        loadCourses();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete course');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCourse = async (courseData: any) => {
    if (!permissions?.canAddCourses) {
      setError('You do not have permission to add courses');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Course created successfully:', data);
        setSuccess('Course created successfully!');
        // Close the modal first
        setShowAddModal(false);
        // Then reload courses
        await loadCourses();
      } else {
        const data = await response.json();
        console.error('❌ Course creation failed:', data);
        setError(data.error || 'Failed to create course');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCourse = (courseId: number) => {
    setViewCourseId(courseId);
    setViewModalOpen(true);
  };

  const handleEditCourse = (courseId: number) => {
    setEditCourseId(courseId);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5">Course Management</h1>
            <p className="text-gray-600">Manage courses for your assigned universities</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {permissions?.canAddCourses && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Course</span>
              </button>
            )}
            
            <button
              onClick={loadCourses}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-lg transition-all w-full sm:w-auto"
            >
              <Search className="w-5 h-5" />
              <span>Refresh Courses</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{success || error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search courses..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Universities</option>
              {assignedUniversities.map((assignment) => (
                <option key={assignment.university?.id} value={assignment.university?.id}>
                  {assignment.university?.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Show inactive courses</span>
            </label>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading courses...</p>
        </div>
      ) : !permissions ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading permissions...</p>
        </div>
      ) : (!assignedUniversities || assignedUniversities.length === 0) ? (
        <div className="text-center py-20">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Universities Assigned</h3>
          <p className="text-gray-600 mb-4">You haven't been assigned to any universities yet.</p>
          <p className="text-sm text-gray-500">Contact your manager to get university assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{course.courseCode}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Building className="w-4 h-4" />
                    <span>{course.university.name}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Study Mode:</span>
                  <span className="text-gray-900 capitalize">{course.studyMode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Course Type:</span>
                  <span className="text-gray-900 capitalize">{course.courseType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee Type:</span>
                  <span className="text-gray-900 capitalize">
                    {course.feeType} {course.feeAmount && `(Rs. ${course.feeAmount.toLocaleString()})`}
                  </span>
                </div>
                {course.durationMonths && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-900">{course.durationMonths} months</span>
                  </div>
                )}
              </div>
              
              {course.specialisation && course.specialisation.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {course.specialisation.slice(0, 2).map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                    {course.specialisation.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{course.specialisation.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewCourse(course.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                
                {permissions?.canEditCourses && (
                  <button
                    onClick={() => handleEditCourse(course.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-sm transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                
                {permissions?.canDeleteCourses && (
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="text-gray-400 mb-4">
                <Building className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedUniversity !== 'all' || showInactive
                  ? 'Try adjusting your filters to see more courses.'
                  : 'Get started by adding your first course.'}
              </p>
              {permissions?.canAddCourses && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Course</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* View Course Modal */}
      {viewModalOpen && (
        <CourseViewModal
          isOpen={viewModalOpen}
          courseId={viewCourseId}
          onClose={() => { setViewModalOpen(false); setViewCourseId(null); }}
        />
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <AddCourse
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCourse}
          mode="add"
          assignedUniversities={assignedUniversities.map(assignment => assignment.university).filter(Boolean)}
        />
      )}

      {/* Edit Course Modal */}
      {editModalOpen && editCourseId !== null && (
        <EditCourseModal
          isOpen={editModalOpen}
          courseId={editCourseId}
          onClose={() => { setEditModalOpen(false); setEditCourseId(null); }}
          onSaved={async () => {
            await loadCourses();
            setEditModalOpen(false);
            setEditCourseId(null);
          }}
        />
      )}
    </div>
  );
};

export default EditorCourseManagement;
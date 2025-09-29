import React, { useState } from 'react';
import { Eye, Edit, Clock, Users, DollarSign, Building, BookOpen } from 'lucide-react';
import { Course } from '../../types/course';

interface CourseListProps {
  courses: Course[];
  onView: (courseId: number) => void;
  onEdit: (courseId: number) => void;
  onDelete: (courseId: number) => void | Promise<void>;
  onToggleStatus?: (courseId: number, nextActive: boolean) => void | Promise<void>;
  loading?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false
}) => {
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const handleToggle = async (course: Course) => {
    if (!onToggleStatus) return;
    try {
      setTogglingId(course.id);
      await onToggleStatus(course.id, !course.isActive);
    } catch (e) {
      console.error('Error toggling course status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      await onDelete(courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setDeletingCourseId(null);
    }
  };

  const formatDuration = (durationMonths?: number) => {
    if (!durationMonths) return 'N/A';
    const years = Math.floor(durationMonths / 12);
    const months = durationMonths % 12;

    if (years === 0) return `${months}m`;
    if (months === 0) return `${years}y`;
    return `${years}y ${months}m`;
  };

  const formatFee = (feeType: string, feeAmount?: number) => {
    if (feeType === 'free') return 'Free';
    if (feeAmount) return `LKR ${feeAmount.toLocaleString()}`;
    return 'Paid';
  };

  // Loading skeleton
  if (loading && courses.length === 0) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No courses match your current filters or search criteria.
          </p>
        </div>
      </div>
    );
  }

  // View mode toggle
  const ViewModeToggle = () => (
    <div className="flex items-center space-x-2 px-6 py-2">
      <span className="text-sm text-gray-700">View:</span>
      <button
        onClick={() => setViewMode('table')}
        className={`px-3 py-1 text-sm rounded ${viewMode === 'table'
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        Table
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={`px-3 py-1 text-sm rounded ${viewMode === 'grid'
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        Grid
      </button>
    </div>
  );

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-4">
      {courses.map((course) => (
        <div key={course.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {course.name}
                </h3>
                {course.courseCode && (
                  <p className="text-sm text-gray-500 mb-2">{course.courseCode}</p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleToggle(course)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${course.isActive
                    ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    }`}
                  disabled={togglingId === course.id}
                  title="Toggle status"
                >
                  {togglingId === course.id ? 'Updating…' : (course.isActive ? 'Active' : 'Inactive')}
                </button>

              </div>
            </div>

            {/* University & Faculty */}
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Building className="h-4 w-4 mr-2" />
                {course.university.name}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-2" />
                {course.faculty.name}
              </div>
            </div>

            {/* Specializations */}
            {course.specialisation && course.specialisation.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {course.specialisation.slice(0, 2).map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {spec}
                    </span>
                  ))}
                  {course.specialisation.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{course.specialisation.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(course.durationMonths)}
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                {formatFee(course.feeType, course.feeAmount)}
              </div>
            </div>

            {/* Course Type & Study Mode */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${course.courseType === 'internal'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
                }`}>
                {course.courseType}
              </span>
              <span className="text-xs text-gray-500">
                {course.studyMode}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onView(course.id)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  title="View course"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(course.id)}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                  title="Edit course"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {/* External link removed per requirements */}
              </div>
              {/* Delete disabled per requirements */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table view component
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Institution
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type & Mode
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration & Fee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Framework
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated By
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {course.name}
                  </div>
                  {course.courseCode && (
                    <div className="text-sm text-gray-500">
                      {course.courseCode}
                    </div>
                  )}
                  {course.specialisation && course.specialisation.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {course.specialisation.slice(0, 2).map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {spec}
                        </span>
                      ))}
                      {course.specialisation.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{course.specialisation.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {course.university.name}
                </div>
                <div className="text-sm text-gray-500">
                  {course.faculty.name}
                </div>
                {course.department && course.department.name !== 'Not specified' && (
                  <div className="text-xs text-gray-400">
                    {course.department.name}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.courseType === 'internal'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                    }`}>
                    {course.courseType}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {course.studyMode}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {formatDuration(course.durationMonths)}
                </div>
                <div className={`text-sm ${course.feeType === 'free' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                  {formatFee(course.feeType, course.feeAmount)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {course.framework?.type || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  Level {course.framework?.level || course.frameworkLevel || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleToggle(course)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${course.isActive
                    ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    }`}
                  disabled={togglingId === course.id}
                  title="Toggle status"
                >
                  {togglingId === course.id ? 'Updating…' : (course.isActive ? 'Active' : 'Inactive')}
                </button>

              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900">
                    {course.auditInfo?.updatedAt
                      ? new Date(course.auditInfo.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                      : 'N/A'
                    }
                  </span>
                  <span className="text-xs text-gray-500">
                    {course.auditInfo?.updatedAt
                      ? new Date(course.auditInfo.updatedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : ''
                    }
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                  {course.auditInfo?.updatedBy || 'System'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(course.id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="View course"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(course.id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    title="Edit course"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {/* External link removed per requirements */}
                  {/* Delete disabled per requirements */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <ViewModeToggle />
      {viewMode === 'grid' ? <GridView /> : <TableView />}

      {/* Loading overlay */}
      {loading && courses.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Updating courses...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
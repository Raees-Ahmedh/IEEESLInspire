import React from 'react';
import { Eye, Calendar, User } from 'lucide-react';
import { Course } from '../../types/course';

interface CourseListProps {
  courses: Course[];
  onViewCourse: (courseId: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onViewCourse }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFee = (feeType: string, feeAmount?: number) => {
    if (feeType === 'free') return 'Free';
    if (feeType === 'paid' && feeAmount) return `LKR ${feeAmount.toLocaleString()}`;
    return 'N/A';
  };

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No courses found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                University
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Framework
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {course.name}
                    </div>
                    {course.courseCode && (
                      <div className="text-sm text-gray-500">
                        Code: {course.courseCode}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {course.faculty.name}
                    </div>
                    {course.specialisation && course.specialisation.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {course.specialisation.join(', ')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {course.university.name}
                  </div>
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    course.university.type === 'government'
                      ? 'bg-green-100 text-green-800'
                      : course.university.type === 'private'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.university.type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {course.framework ? (
                    <div>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        course.framework.type === 'SLQF'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {course.framework.type}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Level {course.framework.level}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Not specified</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {course.courseType} • {course.studyMode}
                  </div>
                  {course.durationMonths && (
                    <div className="text-sm text-gray-500">
                      {Math.floor(course.durationMonths / 12)} years {course.durationMonths % 12} months
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    course.feeType === 'free'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {formatFee(course.feeType, course.feeAmount)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(course.auditInfo.updatedAt)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <User className="w-3 h-3 mr-1" />
                    {course.auditInfo.updatedBy}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewCourse(course.id)}
                    className="inline-flex items-center space-x-1 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseList;
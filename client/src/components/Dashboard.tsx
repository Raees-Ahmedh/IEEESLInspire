import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { Settings, HelpCircle, Bookmark, User } from 'lucide-react';
import Logo from '../assets/images/logo.png';

interface Course {
  id: string;
  title: string;
  university: string;
  duration: string;
  isBookmarked: boolean;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Physical Education',
      university: 'Sabaragamuwa University of Sri Lanka',
      duration: '4 years',
      isBookmarked: true
    },
    {
      id: '2',
      title: 'Physical Education',
      university: 'Sabaragamuwa University of Sri Lanka',
      duration: '4 years',
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Physical Education',
      university: 'Sabaragamuwa University of Sri Lanka',
      duration: '4 years',
      isBookmarked: true
    }
  ]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleBookmark = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, isBookmarked: !course.isBookmarked }
        : course
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Logo />
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              BOARDS
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg font-medium">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Saved Courses</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              OTHER
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 w-64 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Name</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Saved Courses</h1>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-3">Offered by {course.university}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">{course.duration}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(course.id)}
                    className={`p-3 rounded-lg transition-all ${
                      course.isBookmarked 
                        ? 'text-purple-600 hover:text-purple-700 bg-purple-50' 
                        : 'text-gray-400 hover:text-gray-600 bg-gray-50'
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${course.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
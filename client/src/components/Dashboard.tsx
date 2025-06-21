import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { Settings, HelpCircle, Bookmark, User, Home, Calendar as CalendarIcon } from 'lucide-react';
import Logo from '../assets/images/logo.png';
import Calendar, { NewsEvent, Reminder } from './Calendar';

interface Course {
  id: string;
  title: string;
  university: string;
  duration: string;
  isBookmarked: boolean;
}

interface DashboardProps {
  onGoHome?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGoHome }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState<'saved-courses' | 'news-calendar'>('saved-courses');
  
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
      title: 'Computer Science',
      university: 'University of Colombo',
      duration: '4 years',
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Business Administration',
      university: 'University of Peradeniya',
      duration: '4 years',
      isBookmarked: true
    }
  ]);

  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([
    {
      id: '1',
      title: 'University of Colombo Application Deadline',
      date: '2025-07-15',
      type: 'application',
      description: 'Last date to submit applications for undergraduate programs',
      hasReminder: false
    },
    {
      id: '2',
      title: 'A/L Results Release',
      date: '2025-07-20',
      type: 'result',
      description: 'Advanced Level examination results will be released',
      hasReminder: false
    },
    {
      id: '3',
      title: 'University Aptitude Test',
      date: '2025-08-05',
      type: 'exam',
      description: 'Aptitude test for engineering faculties',
      hasReminder: false
    },
    {
      id: '4',
      title: 'University Open Day',
      date: '2025-08-12',
      type: 'general',
      description: 'Visit campuses and meet faculty members',
      hasReminder: false
    },
    {
      id: '5',
      title: 'Medicine Faculty Interview',
      date: '2025-06-28',
      type: 'exam',
      description: 'Interview session for medical faculty applicants',
      hasReminder: false
    }
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const handleLogout = () => {
    dispatch(logout());
    // Redirect to home after logout
    if (onGoHome) {
      onGoHome();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    }
  };

  const toggleBookmark = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, isBookmarked: !course.isBookmarked }
        : course
    ));
  };

  const handleEventUpdate = (updatedEvents: NewsEvent[]) => {
    setNewsEvents(updatedEvents);
  };

  const handleReminderUpdate = (updatedReminders: Reminder[]) => {
    setReminders(updatedReminders);
  };

  const renderSavedCoursesContent = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">Here are your saved courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No saved courses yet</h3>
          <p className="text-gray-600 mb-6">Start exploring and save courses you're interested in</p>
          <button 
            onClick={handleGoHome}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            Explore Courses
          </button>
        </div>
      ) : (
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
                      <span className="text-sm">Duration: {course.duration}</span>
                    </div>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View Details
                    </button>
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
      )}
    </div>
  );

  const renderMainContent = () => {
    if (activeTab === 'saved-courses') {
      return renderSavedCoursesContent();
    }

    return (
      <Calendar 
        events={newsEvents}
        reminders={reminders}
        onEventUpdate={handleEventUpdate}
        onReminderUpdate={handleReminderUpdate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-200 relative">
        <div className="p-6 border-b border-gray-200">
          <button onClick={handleGoHome} className="hover:opacity-80 transition-opacity">
            <img src={Logo} alt="PathFinder Logo" className="h-12 w-auto" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              NAVIGATION
            </h2>
            <div className="space-y-2">
              <button 
                onClick={handleGoHome}
                className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('saved-courses')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'saved-courses'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeTab === 'saved-courses' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <Bookmark className="w-4 h-4" />
                <span>Saved Courses</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('news-calendar')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'news-calendar'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeTab === 'news-calendar' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <CalendarIcon className="w-4 h-4" />
                <span>News Calendar</span>
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
              <p className="text-sm font-medium text-gray-800">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <button 
                onClick={handleLogout}
                className="text-xs text-purple-600 hover:text-purple-700 mt-1"
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
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
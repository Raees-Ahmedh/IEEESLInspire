import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { 
  fetchSavedCourses, 
  toggleCourseBookmark, 
  removeSavedCourse,
  clearErrors,
  type SavedCourse 
} from '../store/slices/coursesSlice';
import { Settings, HelpCircle, Bookmark, User, Home, Calendar as CalendarIcon, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Logo from '../assets/images/logo.png';
import Calendar, { NewsEvent, Reminder } from '../components/Calendar';

interface DashboardProps {
  onGoHome?: () => void;
}

const UserDashboard: React.FC<DashboardProps> = ({ onGoHome }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { 
    savedCourses, 
    savedCoursesLoading, 
    savedCoursesError,
    bookmarkLoading 
  } = useAppSelector((state) => state.courses);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState<'saved-courses' | 'news-calendar'>('saved-courses');

  // Calendar events state (keeping your existing logic)
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

  // Fetch saved courses when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSavedCourses(user.id));
    }
  }, [dispatch, user?.id]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    if (onGoHome) {
      onGoHome();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    }
  };

  const handleToggleBookmark = async (courseId: number) => {
    if (!user?.id) return;
    
    try {
      await dispatch(toggleCourseBookmark({ 
        courseId, 
        userId: user.id 
      })).unwrap();
      
      // Refresh the saved courses list
      dispatch(fetchSavedCourses(user.id));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleRemoveCourse = async (bookmarkId: number) => {
    if (!user?.id) return;
    
    try {
      await dispatch(removeSavedCourse(bookmarkId)).unwrap();
    } catch (error) {
      console.error('Failed to remove course:', error);
    }
  };

  const handleRefreshCourses = () => {
    if (user?.id) {
      dispatch(fetchSavedCourses(user.id));
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name || user?.email || 'User'}!
            </h1>
            <p className="text-gray-600">Here are your saved courses</p>
          </div>
          <button
            onClick={handleRefreshCourses}
            disabled={savedCoursesLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {savedCoursesLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {savedCoursesError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading saved courses</p>
            <p className="text-red-600 text-sm">{savedCoursesError}</p>
          </div>
          <button
            onClick={() => dispatch(clearErrors())}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {savedCoursesLoading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your saved courses...</p>
        </div>
      )}

      {/* Empty State */}
      {!savedCoursesLoading && savedCourses.length === 0 && !savedCoursesError && (
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
      )}

      {/* Courses List */}
      {!savedCoursesLoading && savedCourses.length > 0 && (
        <div className="space-y-6">
          {savedCourses.map((savedCourse: SavedCourse) => (
            <div key={savedCourse.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {savedCourse.course.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {savedCourse.course.university.name}
                      </p>
                      {savedCourse.course.faculty && (
                        <p className="text-sm text-gray-500 mb-2">
                          {savedCourse.course.faculty.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleBookmark(savedCourse.courseId)}
                        disabled={bookmarkLoading[savedCourse.courseId]}
                        className="p-2 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all disabled:opacity-50"
                        title="Remove from saved courses"
                      >
                        {bookmarkLoading[savedCourse.courseId] ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Bookmark className="w-5 h-5 fill-current" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveCourse(savedCourse.id)}
                        className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                        title="Remove course"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">
                        Duration: {savedCourse.course.durationMonths ? 
                          `${Math.floor(savedCourse.course.durationMonths / 12)} years` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">
                        Type: {savedCourse.course.courseType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">
                        Mode: {savedCourse.course.studyMode}
                      </span>
                    </div>
                  </div>

                  {savedCourse.course.specialisation && savedCourse.course.specialisation.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-2">
                        {savedCourse.course.specialisation.map((spec, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {savedCourse.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {savedCourse.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View Details
                    </button>
                    {savedCourse.course.courseUrl && (
                      <a 
                        href={savedCourse.course.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Visit Course Page
                      </a>
                    )}
                  </div>
                </div>
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
            <img src={Logo} alt="PathFinder Logo" className="h-20 w-auto" />
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
                {savedCourses.length > 0 && (
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    activeTab === 'saved-courses' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {savedCourses.length}
                  </span>
                )}
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
                <span>News & Calendar</span>
              </button>
            </div>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              ACCOUNT
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default UserDashboard;
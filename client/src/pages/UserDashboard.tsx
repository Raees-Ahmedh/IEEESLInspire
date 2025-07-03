import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { 
  fetchSavedCourses, 
  toggleCourseBookmark, 
  removeSavedCourse,
  clearErrors
} from '../store/slices/coursesSlice';
import {
  fetchCurrentMonthEvents,
  fetchUpcomingEvents,
  navigateCalendarMonth,
  goToToday,
  addReminder,
  removeReminder,
  updateEventReminderStatus,
  clearEventsErrors
} from '../store/slices/eventsSlice'; // Add events imports
import { SavedCourse as ApiSavedCourse } from '../services/apiService';
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
    savedCoursesError
  } = useAppSelector((state) => state.courses);
  
  // Events state from Redux
  const {
    currentMonthEvents,
    upcomingEvents,
    reminders,
    currentMonthLoading,
    upcomingEventsLoading,
    currentMonthError,
    upcomingEventsError,
    currentViewYear,
    currentViewMonth
  } = useAppSelector((state) => state.events);
  
  // Local loading state for bookmark operations
  const [bookmarkLoading, setBookmarkLoading] = useState<Record<number, boolean>>({});
  
  // Tab state management
  const [activeTab, setActiveTab] = useState<'saved-courses' | 'news-calendar'>('saved-courses');

  // Fetch data when component mounts
  useEffect(() => {
    // Fetch saved courses
    const validUserId = 1;
    dispatch(fetchSavedCourses(validUserId));
    
    // Fetch events data
    dispatch(fetchCurrentMonthEvents());
    dispatch(fetchUpcomingEvents(5));
  }, [dispatch]);

  // Fetch events when calendar month changes
  useEffect(() => {
    dispatch(fetchCurrentMonthEvents());
  }, [dispatch, currentViewYear, currentViewMonth]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
      dispatch(clearEventsErrors());
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
    const validUserId = 1;
    setBookmarkLoading(prev => ({ ...prev, [courseId]: true }));
    
    try {
      await dispatch(toggleCourseBookmark({ 
        courseId, 
        userId: validUserId 
      })).unwrap();
      dispatch(fetchSavedCourses(validUserId));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleRemoveCourse = async (bookmarkId: number) => {
    try {
      await dispatch(removeSavedCourse(bookmarkId)).unwrap();
    } catch (error) {
      console.error('Failed to remove course:', error);
    }
  };

  const handleRefreshCourses = () => {
    const validUserId = 1;
    dispatch(fetchSavedCourses(validUserId));
  };

  // Event handlers for calendar
  const handleEventUpdate = (updatedEvents: NewsEvent[]) => {
    // This is handled by Redux now, but we keep the interface for the Calendar component
    console.log('Events updated via Redux');
  };

  const handleReminderUpdate = (updatedReminders: Reminder[]) => {
    // Handle reminder updates - you might want to persist these to the backend later
    updatedReminders.forEach(reminder => {
      const existingReminder = reminders.find(r => r.id === reminder.id);
      if (!existingReminder) {
        dispatch(addReminder(reminder));
        // Update the event to show it has a reminder
        dispatch(updateEventReminderStatus({
          eventId: reminder.eventId,
          hasReminder: true
        }));
      }
    });
    
    // Remove reminders that were deleted
    reminders.forEach(existingReminder => {
      const stillExists = updatedReminders.find(r => r.id === existingReminder.id);
      if (!stillExists) {
        dispatch(removeReminder(existingReminder.id));
        // Check if this was the last reminder for the event
        const hasOtherReminders = updatedReminders.some(r => r.eventId === existingReminder.eventId);
        dispatch(updateEventReminderStatus({
          eventId: existingReminder.eventId,
          hasReminder: hasOtherReminders
        }));
      }
    });
  };

  // Helper function for event type colors (same as in Calendar component)
  const getEventTypeColor = (type: NewsEvent['type']) => {
    switch (type) {
      case 'application':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'result':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            {/* {savedCoursesLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) 
            : 
            (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            )
            } */}
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
      {!savedCoursesLoading && (!savedCourses || savedCourses.length === 0) && !savedCoursesError && (
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

      {/* Courses List - WITH COMPREHENSIVE SAFETY CHECKS */}
      {!savedCoursesLoading && savedCourses && Array.isArray(savedCourses) && savedCourses.length > 0 && (
        <div className="space-y-6">
          {savedCourses.map((savedCourse: ApiSavedCourse) => {
            // Comprehensive safety checks for nested objects
            if (!savedCourse) {
              console.warn('Saved course is null or undefined');
              return null;
            }

            const course = savedCourse?.course;
            if (!course) {
              console.warn('Course data missing for saved course:', savedCourse.id);
              return null;
            }

            const university = course?.university;
            const faculty = course?.faculty;
            const specialisation = course?.specialisation;
            
            // Safe getters with fallbacks
            const getUniversityName = (): string => {
              if (typeof university === 'string') return university;
              return university?.name || 'Unknown University';
            };

            const getFacultyName = (): string => {
              if (typeof faculty === 'string') return faculty;
              return faculty?.name || '';
            };

            const getDuration = (): string => {
              if (!course.durationMonths) return 'N/A';
              return `${Math.floor(course.durationMonths / 12)} years`;
            };

            const getCourseType = (): string => {
              return course.courseType || 'N/A';
            };

            const getStudyMode = (): string => {
              return course.studyMode || 'N/A';
            };

            const getSpecialisations = (): string[] => {
              if (!specialisation) return [];
              if (Array.isArray(specialisation)) return specialisation;
              if (typeof specialisation === 'string') return [specialisation];
              return [];
            };

            return (
              <div key={savedCourse.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {course.name || 'Unnamed Course'}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {getUniversityName()}
                        </p>
                        {getFacultyName() && (
                          <p className="text-sm text-gray-500 mb-2">
                            {getFacultyName()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* <button
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
                        </button> */}
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
                          Duration: {getDuration()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">
                          Type: {getCourseType()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">
                          Mode: {getStudyMode()}
                        </span>
                      </div>
                    </div>

                    {/* SAFE SPECIALISATION HANDLING */}
                    {(() => {
                      const specs = getSpecialisations();
                      return specs.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Specializations:</p>
                          <div className="flex flex-wrap gap-2">
                            {specs.map((spec, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

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
                      {course.courseUrl && (
                        <a 
                          href={course.courseUrl}
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
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCalendarContent = () => (
    <div>
      {/* Loading State for Calendar */}
      {currentMonthLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading calendar events...</span>
          </div>
        </div>
      )}

      {/* Error State for Calendar */}
      {(currentMonthError || upcomingEventsError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Events</h3>
            <p className="text-sm text-red-600">
              {currentMonthError || upcomingEventsError}
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Events Section */}
      {!upcomingEventsLoading && upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {event.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                  {event.hasReminder && (
                    <span className="flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Reminder set
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Component */}
      {!currentMonthLoading && (
        <Calendar
          events={currentMonthEvents}
          reminders={reminders}
          onEventUpdate={handleEventUpdate}
          onReminderUpdate={handleReminderUpdate}
        />
      )}
    </div>
  );

  const renderMainContent = () => {
    if (activeTab === 'saved-courses') {
      return renderSavedCoursesContent();
    }

    return renderCalendarContent();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 mb-2">
            <img 
              src={Logo} 
              alt="Logo" 
              className="w-20 h-20 cursor-pointer"
              onClick={handleGoHome}
            />
            {/* <h1 className="text-xl font-bold text-gray-800">Dashboard</h1> */}
          </div>

          {/* Navigation */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              MAIN NAVIGATION
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
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
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
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
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
              {/* <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button> */}
              
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
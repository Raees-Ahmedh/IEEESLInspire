import React, { useState, useEffect } from 'react';
import {
  Plus, Settings, HelpCircle, User, GraduationCap, Newspaper, Menu, X, 
  ClipboardList, AlertTriangle, Edit, ArrowLeft
} from 'lucide-react';
import { 
  courseService,
  taskService,
  newsService
} from '../services/apiService';

interface Task {
  id: number;
  title: string;
  description: string | null;
  assignedTo: number;
  assignedBy: number;
  status: 'todo' | 'ongoing' | 'complete' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  completedAt: string | null;
  auditInfo: any;
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assigner?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    comments: number;
  };
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'archived';
  tags?: any;
  publishDate?: string;
  authorId: number;
  approvedBy?: number;
  auditInfo: any;
  author?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Course {
  id: number;
  name: string;
  description?: string;
  studyMode: string;
  courseType: string;
  feeType: string;
  feeAmount?: number;
  frameworkLevel?: number;
  isActive: boolean;
  university: {
    id: number;
    name: string;
    type: string;
  };
  faculty?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

interface EditorDashboardProps {
  onGoBack?: () => void;
}

const EditorDashboard: React.FC<EditorDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState('courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Courses section state
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  
  // News section state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  
  // Tasks section state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Load data when section changes
  useEffect(() => {
    if (activeSection === 'courses') {
      loadCourses();
    } else if (activeSection === 'news') {
      loadArticles();
    } else if (activeSection === 'tasks') {
      loadTasks();
    }
  }, [activeSection]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const result = await courseService.getAllCourses();
      if (result.success && result.data) {
        setCourses(result.data);
      } else {
        setCoursesError('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCoursesError('Error loading courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadArticles = async () => {
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const result = await newsService.getNewsArticles();
      if (result.success && result.data) {
        // Filter articles created by current user
        setArticles(result.data);
      } else {
        setArticlesError('Failed to load articles');
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticlesError('Error loading articles');
    } finally {
      setArticlesLoading(false);
    }
  };

  const loadTasks = async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const result = await taskService.getMyTasks();
      if (result.success && result.data) {
        setTasks(result.data);
      } else {
        setTasksError('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasksError('Error loading tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: number, newStatus: Task['status']) => {
    try {
      const result = await taskService.updateTaskStatus(taskId, newStatus);
      if (result.success) {
        loadTasks(); // Reload tasks
      } else {
        alert('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'ongoing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'todo':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getArticleStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'approved':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'archived':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const sidebarItems = [
    {
      id: 'courses',
      label: 'Course Management',
      icon: GraduationCap,
      description: 'Manage university courses'
    },
    {
      id: 'news',
      label: 'News Articles',
      icon: Newspaper,
      description: 'Create and manage news articles'
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: ClipboardList,
      description: 'View assigned tasks'
    }
  ];

  const renderCoursesSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <button
          onClick={() => {/* Add course modal logic */}}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition-all w-fit"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course
        </button>
      </div>

      {coursesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      ) : coursesError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{coursesError}</p>
          <button
            onClick={loadCourses}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Study Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Course Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500 sm:hidden">{course.university?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-600">{course.university?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-600">{course.studyMode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-600">{course.courseType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        course.isActive 
                          ? 'text-green-600 bg-green-50 border-green-200' 
                          : 'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No courses found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNewsSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">News Articles</h2>
        <button
          onClick={() => setShowAddArticleModal(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition-all w-fit"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Article
        </button>
      </div>

      {articlesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      ) : articlesError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{articlesError}</p>
          <button
            onClick={loadArticles}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Publish Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{article.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{article.description}</div>
                      <div className="text-xs text-gray-400 sm:hidden mt-1">
                        {article.category || 'General'} • {article.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-600">{article.category || 'General'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getArticleStatusColor(article.status)}`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {article.publishDate ? new Date(article.publishDate).toLocaleDateString() : 'Not published'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {articles.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No articles found. Create your first article!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTasksSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total: {tasks.length}</span>
        </div>
      </div>

      {tasksLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      ) : tasksError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{tasksError}</p>
          <button
            onClick={loadTasks}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">{task.description}</p>
                  )}

                  <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                    <div>
                      <span className="font-medium">Assigned by:</span> {task.assigner ? `${task.assigner.firstName} ${task.assigner.lastName}` : 'Unknown'}
                    </div>
                    {task.dueDate && (
                      <div>
                        <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col gap-2">
                  {task.status === 'todo' && (
                    <button
                      onClick={() => handleTaskStatusUpdate(task.id, 'ongoing')}
                      className="px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === 'ongoing' && (
                    <button
                      onClick={() => handleTaskStatusUpdate(task.id, 'complete')}
                      className="px-3 py-2 text-xs sm:text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors whitespace-nowrap"
                    >
                      Complete
                    </button>
                  )}
                  {task.status === 'complete' && (
                    <div className="px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks assigned to you yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-purple-600 to-purple-700 flex-shrink-0">
          <div className="flex items-center">
            <User className="w-8 h-8 text-white mr-3" />
            <div>
              <h1 className="text-white font-semibold">Editor Dashboard</h1>
              <p className="text-purple-200 text-sm">Content Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white hover:text-purple-200 lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${
                  activeSection === item.id ? 'text-purple-700' : 'text-gray-400'
                }`} />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Back Button */}
        {onGoBack && (
          <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onGoBack}
              className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to Home
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 lg:hidden mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {sidebarItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-gray-500">
                  {sidebarItems.find(item => item.id === activeSection)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeSection === 'courses' && renderCoursesSection()}
            {activeSection === 'news' && renderNewsSection()}
            {activeSection === 'tasks' && renderTasksSection()}
          </div>
        </main>
      </div>

      {/* Add Article Modal */}
      {showAddArticleModal && (
        <AddArticleModal
          isOpen={showAddArticleModal}
          onClose={() => setShowAddArticleModal(false)}
          onSuccess={() => {
            loadArticles();
            setShowAddArticleModal(false);
          }}
        />
      )}
    </div>
  );
};

// Add Article Modal Component
interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddArticleModal: React.FC<AddArticleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: 'general',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'scholarship', label: 'Scholarship' },
    { value: 'intake', label: 'Intake' },
    { value: 'announcement', label: 'Announcement' }
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await newsService.createNewsArticle({
        title: formData.title,
        content: formData.content,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        status: 'pending' // Editor articles require approval
      });

      if (result.success) {
        setFormData({
          title: '',
          content: '',
          description: '',
          category: 'general',
          imageUrl: ''
        });
        setErrors({});
        onSuccess();
        alert('Article created successfully! It has been submitted for manager approval.');
      } else {
        setErrors({ submit: result.error || 'Failed to create article' });
      }
    } catch (error) {
      console.error('Error creating article:', error);
      setErrors({ submit: 'Error creating article' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create News Article</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Article title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of the article"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Article content"
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditorDashboard;
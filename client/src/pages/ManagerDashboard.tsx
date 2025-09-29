import React, { useState, useEffect } from 'react';
import {
  Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building,
  GraduationCap, Newspaper, Menu, X, ClipboardList,
  CheckCircle, Clock, AlertTriangle, Calendar, Star
} from 'lucide-react';
import { subjectService, universityService, taskService } from '../services/apiService';
import Logo from '../assets/images/logo.png';
import AddSubjectModal from '../components/admin/AddSubjectModal';
import EditSubjectModal from '../components/admin/EditSubjectModal';
import AddEditorModal from '../components/admin/AddEditorModal';
import AddInstituteModal from '../components/admin/AddInstituteModal';
import FieldsManagement from '../components/admin/FieldsManagement';
import CreateTaskModal from '../components/manager/CreateTaskModal';
import EditTaskModal from '../components/manager/EditTaskModal';
import NewsManagement from '../components/manager/NewsManagement';
import EventsManagement from '../components/manager/EventsManagement';
import AddNewsModal from '../components/manager/AddNewsModal';
import AddEventModal from '../components/manager/AddEventModal';
import EditNewsModal from '../components/manager/EditNewsModal';
import EditEventModal from '../components/manager/EditEventModal';
import AdminEditorManagement from '../components/admin/EditorManagement';
import FrameworksManagement from '../components/manager/FrameworksManagement';
import CourseManagement from '../components/admin/CourseManagement';
import StudentManagement from '../components/admin/StudentManagement';

interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: number;
  assignee?: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
  assignedBy: number;
  assigner?: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
  status: 'todo' | 'ongoing' | 'complete';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  auditInfo: any;
}


interface Subject {
  id: number;
  name: string;
  level: 'OL' | 'AL';
  code: string;
  isActive?: boolean;
}

interface Institute {
  id: number;
  name: string;
  type: string;
  address?: string;
  website?: string;
  uniCode: string;
  isActive: boolean;
  location?: string;
  category?: string;
}

interface ManagerDashboardProps {
  onGoBack?: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<
    'subjects' | 'fields' | 'institutes' | 'frameworks' | 'editors' |
    'tasks' | 'reports' | 'news' | 'events' | 'student-accounts' | 'courses'
  >('subjects');

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showAddEditorModal, setShowAddEditorModal] = useState(false);
  const [showAddInstituteModal, setShowAddInstituteModal] = useState(false);
  const [instituteModalMode, setInstituteModalMode] = useState<'add' | 'edit'>('add');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Data fetching functions
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await subjectService.getAllSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const response = await universityService.getAllUniversities();
      if (response.success && response.data) {
        // Map University data to Institute format
        const mappedInstitutes = response.data.map((uni: any) => ({
          id: uni.id,
          name: uni.name,
          type: uni.type || 'University',
          address: uni.address,
          website: uni.website,
          uniCode: uni.uniCode || uni.code || '',
          isActive: uni.isActive !== undefined ? uni.isActive : true,
          location: uni.location,
          category: uni.category
        }));
        setInstitutes(mappedInstitutes);
      }
    } catch (error) {
      console.error('Failed to fetch institutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getAllTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchSubjects();
    fetchInstitutes();
    fetchTasks();
  }, []);

  // Toggle functions
  const toggleSubjectStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await subjectService.updateSubjectStatus(id, !currentStatus);
      if (response.success) {
        fetchSubjects(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to toggle subject status:', error);
    }
  };


  const toggleInstituteStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await universityService.updateUniversity(id, { isActive: !currentStatus });
      if (response.success) {
        fetchInstitutes();
      } else {
        console.error('Failed to toggle institute status:', response.error);
      }
    } catch (error) {
      console.error('Failed to toggle institute status:', error);
    }
  };

  const getSectionIcon = (section: string) => {
    const iconMap = {
      subjects: BookOpen,
      fields: BookOpen,
      institutes: Building,
      frameworks: Star,
      editors: Users,
      tasks: ClipboardList,
      reports: BarChart3,
      news: Newspaper,
      events: Calendar,
      courses: GraduationCap,
      'student-accounts': User
    };
    return iconMap[section as keyof typeof iconMap] || BookOpen;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      todo: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertTriangle },
      complete: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };
    const config = statusMap[status as keyof typeof statusMap];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityMap[priority as keyof typeof priorityMap]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };


  const renderContent = () => {
    // OL AL Subjects Management
    if (activeSection === 'subjects') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">OL & AL Subjects Management</h1>
              <p className="text-gray-600">Add and update OL and AL subjects</p>
            </div>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading subjects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : subjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No subjects found. Click "Add Subject" to create your first subject.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.level === 'AL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {subject.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                          <button
                            onClick={() => toggleSubjectStatus(subject.id, subject.isActive || false)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${subject.isActive
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            {subject.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSubject(subject);
                              setShowEditSubjectModal(true);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // Field of Studies Management (reuse admin component for consistency)
    if (activeSection === 'fields') {
      return <FieldsManagement />;
    }

    // Framework Management
    if (activeSection === 'frameworks') {
      return <FrameworksManagement />;
    }

    // Editors Management (reuse admin component for consistency)
    if (activeSection === 'editors') {
      return <AdminEditorManagement />;
    }

    // Task Assignment & Management
    if (activeSection === 'tasks') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Assignment</h1>
              <p className="text-gray-600">Assign and manage tasks for editors</p>
            </div>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-4">Create your first task to get started with task management.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Assigned to: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName || ''}` : 'Unknown Editor'}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created: {task.auditInfo?.createdAt ? new Date(task.auditInfo.createdAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowEditTaskModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Task Status Reports
    if (activeSection === 'reports') {
      const todoTasks = tasks.filter(task => task.status === 'todo').length;
      const ongoingTasks = tasks.filter(task => task.status === 'ongoing').length;
      const completeTasks = tasks.filter(task => task.status === 'complete').length;
      const totalTasks = tasks.length;

      return (
        <div className="space-y-6 mt-32">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Task Status Reports</h1>
            <p className="text-gray-600">Monitor task completion and progress</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">To Do</p>
                  <p className="text-2xl font-bold text-yellow-600">{todoTasks}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ongoing</p>
                  <p className="text-2xl font-bold text-blue-600">{ongoingTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Complete</p>
                  <p className="text-2xl font-bold text-green-600">{completeTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">To Do</span>
                  <span className="text-sm text-gray-600">{Math.round((todoTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Ongoing</span>
                  <span className="text-sm text-gray-600">{Math.round((ongoingTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(ongoingTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Complete</span>
                  <span className="text-sm text-gray-600">{Math.round((completeTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(completeTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Institutes Management
    if (activeSection === 'institutes') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Institutes Management</h1>
              <p className="text-gray-600">Add and update educational institutes</p>
            </div>
            <button
              onClick={() => { setInstituteModalMode('add'); setSelectedInstitute(null); setShowAddInstituteModal(true); }}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Institute</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {institutes.map((institute) => (
                    <tr key={institute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{institute.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{institute.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{institute.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {institute.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${institute.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {institute.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button
                          onClick={() => toggleInstituteStatus(institute.id, institute.isActive)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${institute.isActive
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          {institute.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => { setInstituteModalMode('edit'); setSelectedInstitute(institute); setShowAddInstituteModal(true); }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // News Management
    if (activeSection === 'news') {
      return (
        <NewsManagement
          onAddNews={() => setShowAddNewsModal(true)}
          onEditNews={(news) => {
            setSelectedNews(news);
            setShowEditNewsModal(true);
          }}
        />
      );
    }

    // Events Management
    if (activeSection === 'events') {
      return (
        <EventsManagement
          onAddEvent={() => setShowAddEventModal(true)}
          onEditEvent={(event) => {
            setSelectedEvent(event);
            setShowEditEventModal(true);
          }}
        />
      );
    }

    // Course Management
    if (activeSection === 'courses') {
      return <CourseManagement />;
    }

    // Students Management
    if (activeSection === 'student-accounts') {
      return <StudentManagement />;
    }

    // Placeholder content for other sections
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4 flex justify-center">
          {React.createElement(getSectionIcon(activeSection), { size: 64 })}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {String(activeSection).replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Section
        </h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl border-r border-gray-200 relative transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-16'
        } mt-10 flex-shrink-0`}>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          {isSidebarExpanded ? (
            <X className="w-4 h-4 text-gray-600" />
          ) : (
            <Menu className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <div className={`p-6 ${!isSidebarExpanded && 'px-3'} overflow-hidden`}>
          {/* Logo Section */}
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3 mb-8' : 'justify-center mb-6'}`}>
            {/* <img
              src={Logo}
              alt="Logo"
              className={`${isSidebarExpanded ? 'w-12 h-12' : 'w-8 h-8'} cursor-pointer`}
              onClick={onGoBack}
            /> */}
            {isSidebarExpanded && (
              <div>
                <h1 className="text-lg font-bold text-gray-800 mt-12">Manager</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            )}
          </div>

          {/* User Management Section */}
          <div className="mb-6">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                USERS
              </h2>
            )}
            <div className="space-y-1">
              {/* Editors */}
              <button
                onClick={() => setActiveSection('editors')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'editors'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Editors' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'editors' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Users className="w-4 h-4" />
                {isSidebarExpanded && <span>Editors</span>}
              </button>

              {/* Students */}
              <button
                onClick={() => setActiveSection('student-accounts')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'student-accounts'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Students' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'student-accounts' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <User className="w-4 h-4" />
                {isSidebarExpanded && <span>Students</span>}
              </button>
            </div>
          </div>

          {/* Academic Management Section */}
          <div className="mb-6">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                ACADEMIC
              </h2>
            )}
            <div className="space-y-1">
              {/* Subjects */}
              <button
                onClick={() => setActiveSection('subjects')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'subjects'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'OL AL Subjects' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'subjects' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <BookOpen className="w-4 h-4" />
                {isSidebarExpanded && <span>OL AL Subjects</span>}
              </button>

              {/* Fields */}
              <button
                onClick={() => setActiveSection('fields')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'fields'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Field of Studies' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'fields' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <GraduationCap className="w-4 h-4" />
                {isSidebarExpanded && <span>Field of Studies</span>}
              </button>

              {/* Institutes */}
              <button
                onClick={() => setActiveSection('institutes')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'institutes'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Institutes' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'institutes' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Building className="w-4 h-4" />
                {isSidebarExpanded && <span>Institutes</span>}
              </button>

              {/* Frameworks */}
              <button
                onClick={() => setActiveSection('frameworks')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'frameworks'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Frameworks' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'frameworks' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Star className="w-4 h-4" />
                {isSidebarExpanded && <span>Frameworks</span>}
              </button>

              {/* Courses */}
              <button
                onClick={() => setActiveSection('courses')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'courses'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Course Management' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'courses' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <GraduationCap className="w-4 h-4" />
                {isSidebarExpanded && <span>Courses</span>}
              </button>

            </div>
          </div>

          {/* Content Management Section */}
          <div className="mb-6">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                CONTENT
              </h2>
            )}
            <div className="space-y-1">
              {/* News */}
              <button
                onClick={() => setActiveSection('news')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'news'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'News Section' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'news' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Newspaper className="w-4 h-4" />
                {isSidebarExpanded && <span>News Section</span>}
              </button>

              {/* Events */}
              <button
                onClick={() => setActiveSection('events')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'events'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'SLI Events' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'events' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <Calendar className="w-4 h-4" />
                {isSidebarExpanded && <span>SLI Events</span>}
              </button>


            </div>
          </div>

          {/* Task Management Section */}
          <div className="mb-6">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                TASKS
              </h2>
            )}
            <div className="space-y-1">
              {/* Tasks */}
              <button
                onClick={() => setActiveSection('tasks')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'tasks'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Task Assignment' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'tasks' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <ClipboardList className="w-4 h-4" />
                {isSidebarExpanded && <span>Task Assignment</span>}
              </button>

              {/* Reports */}
              <button
                onClick={() => setActiveSection('reports')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${activeSection === 'reports'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                title={!isSidebarExpanded ? 'Task Reports' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${activeSection === 'reports' ? 'bg-white' : 'bg-gray-400'
                    }`}></div>
                )}
                <BarChart3 className="w-4 h-4" />
                {isSidebarExpanded && <span>Task Reports</span>}
              </button>
            </div>
          </div>

          {/* Account Section 
          <div className="mb-8 mt-auto pt-8 border-t border-gray-200">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                ACCOUNT
              </h2>
            )}
            <div className="space-y-1">
              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all`}
                title={!isSidebarExpanded ? 'Settings' : ''}
              >
                {isSidebarExpanded && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                <Settings className="w-4 h-4" />
                {isSidebarExpanded && <span>Settings</span>}
              </button>
              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all`}
                title={!isSidebarExpanded ? 'Support' : ''}
              >
                {isSidebarExpanded && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                <HelpCircle className="w-4 h-4" />
                {isSidebarExpanded && <span>Support</span>}
              </button>
            </div>
          </div> */}

        </div>

        {/* Manager Profile
        <div className={`absolute bottom-0 bg-white border-t border-gray-200 p-6 ${isSidebarExpanded ? 'w-64' : 'w-16'
          } ${!isSidebarExpanded && 'px-3'}`}>
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'}`}>
            <div className={`${isSidebarExpanded ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0`}>
              <User className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">Manager</p>
                <p className="text-xs text-gray-500 truncate">Content Manager</p>
              </div>
            )}
          </div>
        </div> */}

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header (aligned with Admin) */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onGoBack} className="flex items-center space-x-2">
              <img src={Logo} alt="UniGuide" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-800">UniGuide</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <AddSubjectModal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        onSuccess={() => {
          fetchSubjects();
          setShowAddSubjectModal(false);
        }}
      />

      {selectedSubject && (
        <EditSubjectModal
          isOpen={showEditSubjectModal}
          onClose={() => {
            setShowEditSubjectModal(false);
            setSelectedSubject(null);
          }}
          onSuccess={() => {
            fetchSubjects();
            setShowEditSubjectModal(false);
            setSelectedSubject(null);
          }}
          subject={{
            id: selectedSubject.id,
            name: selectedSubject.name,
            level: selectedSubject.level,
            code: selectedSubject.code,
            isActive: selectedSubject.isActive || false
          }}
        />
      )}

      <AddEditorModal
        isOpen={showAddEditorModal}
        onClose={() => setShowAddEditorModal(false)}
        onSuccess={() => {
          setShowAddEditorModal(false);
        }}
      />

      <AddInstituteModal
        isOpen={showAddInstituteModal}
        onClose={() => setShowAddInstituteModal(false)}
        onSuccess={() => {
          fetchInstitutes();
          setShowAddInstituteModal(false);
        }}
        mode={instituteModalMode}
        initialData={selectedInstitute ? {
          id: selectedInstitute.id,
          name: selectedInstitute.name,
          type: selectedInstitute.type as any,
          address: selectedInstitute.address,
          website: selectedInstitute.website,
          uniCode: selectedInstitute.uniCode,
          isActive: selectedInstitute.isActive,
        } : null}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSuccess={() => {
          fetchTasks();
          setShowCreateTaskModal(false);
        }}
      />

      <AddNewsModal
        isOpen={showAddNewsModal}
        onClose={() => setShowAddNewsModal(false)}
        onSuccess={() => {
          setShowAddNewsModal(false);
        }}
      />

      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSuccess={() => {
          setShowAddEventModal(false);
        }}
      />

      <EditTaskModal
        isOpen={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          fetchTasks();
          setShowEditTaskModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      <EditNewsModal
        isOpen={showEditNewsModal}
        onClose={() => {
          setShowEditNewsModal(false);
          setSelectedNews(null);
        }}
        onSuccess={() => {
          setShowEditNewsModal(false);
          setSelectedNews(null);
        }}
        news={selectedNews}
      />

      <EditEventModal
        isOpen={showEditEventModal}
        onClose={() => {
          setShowEditEventModal(false);
          setSelectedEvent(null);
        }}
        onSuccess={() => {
          setShowEditEventModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
};

export default ManagerDashboard;
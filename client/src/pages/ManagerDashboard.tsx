import React, { useState } from 'react';
import { 
  Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building, 
  GraduationCap, Newspaper, Menu, X, ClipboardList, Database, UserPlus,
  CheckCircle, Clock, AlertTriangle, FileText, Calendar, Star
} from 'lucide-react';
// import Logo from '../assets/images/logo.png';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'todo' | 'ongoing' | 'complete';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdDate: string;
}

interface Editor {
  id: string;
  name: string;
  email: string;
  accessRights: string[];
  isActive: boolean;
  assignedTasks: number;
}

interface Subject {
  id: string;
  name: string;
  type: 'OL' | 'AL';
  code: string;
  isActive: boolean;
}

interface Institute {
  id: string;
  name: string;
  type: string;
  location: string;
  category: string;
  isActive: boolean;
}

interface ManagerDashboardProps {
  onGoBack?: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<
    'subjects' | 'fields' | 'institutes' | 'categorization' | 'editors' | 
    'tasks' | 'reports' | 'monitoring' | 'news' | 'guide' | 'events' | 'accounts'
  >('subjects');
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample data
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', type: 'AL', code: 'MAT', isActive: true },
    { id: '2', name: 'Physics', type: 'AL', code: 'PHY', isActive: true },
    { id: '3', name: 'Chemistry', type: 'AL', code: 'CHE', isActive: true },
    { id: '4', name: 'Biology', type: 'AL', code: 'BIO', isActive: true },
    { id: '5', name: 'English', type: 'OL', code: 'ENG', isActive: true },
    { id: '6', name: 'Sinhala', type: 'OL', code: 'SIN', isActive: true },
  ]);

  const [editors, setEditors] = useState<Editor[]>([
    { id: '1', name: 'John Silva', email: 'john@example.com', accessRights: ['courses', 'news'], isActive: true, assignedTasks: 5 },
    { id: '2', name: 'Mary Fernando', email: 'mary@example.com', accessRights: ['institutes', 'events'], isActive: true, assignedTasks: 3 },
    { id: '3', name: 'David Perera', email: 'david@example.com', accessRights: ['guides', 'monitoring'], isActive: false, assignedTasks: 0 },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      title: 'Update Course Information', 
      description: 'Update all computer science course details',
      assignedTo: 'John Silva',
      status: 'ongoing',
      priority: 'high',
      dueDate: '2025-07-15',
      createdDate: '2025-07-01'
    },
    { 
      id: '2', 
      title: 'Review News Articles', 
      description: 'Review and approve pending news articles',
      assignedTo: 'Mary Fernando',
      status: 'todo',
      priority: 'medium',
      dueDate: '2025-07-10',
      createdDate: '2025-07-05'
    },
    { 
      id: '3', 
      title: 'Database Cleanup', 
      description: 'Remove duplicate entries from institutes database',
      assignedTo: 'David Perera',
      status: 'complete',
      priority: 'low',
      dueDate: '2025-07-08',
      createdDate: '2025-07-02'
    },
  ]);

  const [institutes, setInstitutes] = useState<Institute[]>([
    { id: '1', name: 'University of Colombo', type: 'State University', location: 'Colombo', category: 'A+', isActive: true },
    { id: '2', name: 'University of Peradeniya', type: 'State University', location: 'Peradeniya', category: 'A+', isActive: true },
    { id: '3', name: 'SLIIT', type: 'Private Institute', location: 'Malabe', category: 'A', isActive: true },
  ]);

  const getSectionIcon = (section: string) => {
    const iconMap = {
      subjects: BookOpen,
      fields: GraduationCap,
      institutes: Building,
      categorization: Star,
      editors: Users,
      tasks: ClipboardList,
      reports: BarChart3,
      monitoring: Database,
      news: Newspaper,
      guide: FileText,
      events: Calendar,
      accounts: User
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

  const toggleSubjectStatus = (subjectId: string) => {
    setSubjects(subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, isActive: !subject.isActive }
        : subject
    ));
  };

  const toggleEditorStatus = (editorId: string) => {
    setEditors(editors.map(editor => 
      editor.id === editorId 
        ? { ...editor, isActive: !editor.isActive }
        : editor
    ));
  };

  const toggleInstituteStatus = (instituteId: string) => {
    setInstitutes(institutes.map(institute => 
      institute.id === instituteId 
        ? { ...institute, isActive: !institute.isActive }
        : institute
    ));
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
              onClick={() => setShowAddModal(true)}
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
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subject.type === 'AL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {subject.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button
                          onClick={() => toggleSubjectStatus(subject.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            subject.isActive 
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {subject.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
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

    // Editor Accounts Management
    if (activeSection === 'editors') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-32">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Editor Accounts Management</h1>
              <p className="text-gray-600">Create and manage editor accounts with customized access</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Editor</span>
            </button>
          </div>

          <div className="grid gap-6">
            {editors.map((editor) => (
              <div key={editor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{editor.name}</h3>
                      <p className="text-gray-600">{editor.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">Access Rights:</span>
                        {editor.accessRights.map((right, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {right}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Assigned Tasks</p>
                      <p className="text-lg font-semibold text-gray-800">{editor.assignedTasks}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      editor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {editor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleEditorStatus(editor.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        editor.isActive 
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {editor.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
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
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

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
                        <span>Assigned to: {task.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Created: {task.createdDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">
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
              onClick={() => setShowAddModal(true)}
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          institute.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {institute.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button
                          onClick={() => toggleInstituteStatus(institute.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            institute.isActive 
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {institute.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors">
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

    // Placeholder content for other sections
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4 flex justify-center">
          {React.createElement(getSectionIcon(activeSection), { size: 64 })}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/([A-Z])/g, ' $1')} Section
        </h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl border-r border-gray-200 relative transition-all duration-300 ${
        isSidebarExpanded ? 'w-64' : 'w-16'
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

          {/* Boards Section */}
          <div className="mb-8">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                BOARDS
              </h2>
            )}
            <div className="space-y-1">
              {/* Subjects */}
              <button 
                onClick={() => setActiveSection('subjects')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'subjects'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'OL AL Subjects' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'subjects' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <BookOpen className="w-4 h-4" />
                {isSidebarExpanded && <span>OL AL Subjects</span>}
              </button>
              
              {/* Fields */}
              <button 
                onClick={() => setActiveSection('fields')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'fields'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Field of Studies' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'fields' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <GraduationCap className="w-4 h-4" />
                {isSidebarExpanded && <span>Field of Studies</span>}
              </button>
              
              {/* Institutes */}
              <button 
                onClick={() => setActiveSection('institutes')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'institutes'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Institutes' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'institutes' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Building className="w-4 h-4" />
                {isSidebarExpanded && <span>Institutes</span>}
              </button>
              
              {/* Categorization */}
              <button 
                onClick={() => setActiveSection('categorization')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'categorization'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Categorization' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'categorization' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Star className="w-4 h-4" />
                {isSidebarExpanded && <span>Categorization</span>}
              </button>
              
              {/* Editors */}
              <button 
                onClick={() => setActiveSection('editors')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'editors'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Editor Accounts' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'editors' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Users className="w-4 h-4" />
                {isSidebarExpanded && <span>Editor Accounts</span>}
              </button>
              
              {/* Tasks */}
              <button 
                onClick={() => setActiveSection('tasks')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'tasks'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Task Assignment' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'tasks' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <ClipboardList className="w-4 h-4" />
                {isSidebarExpanded && <span>Task Assignment</span>}
              </button>
              
              {/* Reports */}
              <button 
                onClick={() => setActiveSection('reports')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'reports'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Task Reports' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'reports' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <BarChart3 className="w-4 h-4" />
                {isSidebarExpanded && <span>Task Reports</span>}
              </button>
              
              {/* Monitoring */}
              <button 
                onClick={() => setActiveSection('monitoring')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'monitoring'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Database Monitoring' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'monitoring' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Database className="w-4 h-4" />
                {isSidebarExpanded && <span>DB Monitoring</span>}
              </button>
              
              {/* News */}
              <button 
                onClick={() => setActiveSection('news')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'news'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'News Section' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'news' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Newspaper className="w-4 h-4" />
                {isSidebarExpanded && <span>News Section</span>}
              </button>
              
              {/* Guide */}
              <button 
                onClick={() => setActiveSection('guide')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'guide'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Field Guide' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'guide' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <FileText className="w-4 h-4" />
                {isSidebarExpanded && <span>Field Guide</span>}
              </button>
              
              {/* Events */}
              <button 
                onClick={() => setActiveSection('events')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'events'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'SLI Events' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'events' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Calendar className="w-4 h-4" />
                {isSidebarExpanded && <span>SLI Events</span>}
              </button>
              
              {/* Accounts */}
              <button 
                onClick={() => setActiveSection('accounts')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'accounts'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'User Accounts' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'accounts' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <User className="w-4 h-4" />
                {isSidebarExpanded && <span>User Accounts</span>}
              </button>
            </div>
          </div>

          {/* Other Section */}
          <div className="mb-8">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                OTHER
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
          </div>
        </div>

        {/* Manager Profile */}
        <div className={`absolute bottom-0 bg-white border-t border-gray-200 p-6 ${
          isSidebarExpanded ? 'w-64' : 'w-16'
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManagerDashboard;
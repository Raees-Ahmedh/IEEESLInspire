import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, ClipboardList, AlertCircle, CheckCircle, X, Clock, User, Calendar, Flag } from 'lucide-react';
import { taskService, editorService } from '../../services/apiService';
import CreateTaskModal from '../manager/CreateTaskModal';

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

interface Editor {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
}

interface TaskAssignmentsProps {
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
}

const TaskAssignments: React.FC<TaskAssignmentsProps> = ({ onAddTask, onEditTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Load tasks and editors on mount
  useEffect(() => {
    loadTasks();
    loadEditors();
  }, []);

  // Filter tasks when search term or filters change
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading tasks...');
      const response = await taskService.getAllTasks();
      console.log('🔍 Tasks response:', response);
      
      if (response.success && response.data) {
        setTasks(response.data);
        console.log('🔍 Tasks loaded:', response.data.length);
      } else {
        console.error('🔍 Tasks API error:', response.error);
        setError(response.error || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('🔍 Tasks network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEditors = async () => {
    try {
      const response = await editorService.getAllEditors();
      if (response.success && response.data) {
        setEditors(response.data);
      }
    } catch (error) {
      console.error('Failed to load editors:', error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Filter by assignee
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(task => task.assignedTo.toString() === assigneeFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await taskService.deleteTask(id);
      if (response.success) {
        setSuccess('Task deleted successfully!');
        loadTasks();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to delete task');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (id: number, newStatus: 'todo' | 'ongoing' | 'complete') => {
    setIsSubmitting(true);
    try {
      const response = await taskService.updateTask(id, { status: newStatus });
      if (response.success) {
        setSuccess(`Task status updated to ${newStatus} successfully!`);
        loadTasks();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update task status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating task status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      todo: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      complete: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.todo;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { bg: 'bg-green-100', text: 'text-green-800' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      high: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = priorityMap[priority as keyof typeof priorityMap] || priorityMap.low;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Flag className="w-3 h-3 mr-1" />
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getAssigneeName = (task: Task) => {
    if (task.assignee) {
      return `${task.assignee.firstName} ${task.assignee.lastName || ''}`.trim();
    }
    return 'Unassigned';
  };

  const getAssignerName = (task: Task) => {
    if (task.assigner) {
      return `${task.assigner.firstName} ${task.assigner.lastName || ''}`.trim();
    }
    return 'Unknown';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Assignments</h1>
          <p className="text-gray-600">Manage and track task assignments to editors</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
          <button
            onClick={loadTasks}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{success || error}</span>
          <button 
            onClick={() => { setSuccess(null); setError(null); }}
            className="ml-auto text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search tasks..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="ongoing">Ongoing</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Assignees</option>
              {editors.map(editor => (
                <option key={editor.id} value={editor.id.toString()}>
                  {editor.firstName} {editor.lastName || ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first task.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Assigned to: {getAssigneeName(task)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Assigned by: {getAssignerName(task)}</span>
                    </div>
                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue(task.dueDate) && <span className="text-red-600 font-medium">(Overdue)</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Created: {task.auditInfo?.createdAt ? new Date(task.auditInfo.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (onEditTask) {
                        onEditTask(task);
                      } else {
                        setSelectedTask(task);
                        setShowEditModal(true);
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  {task.status !== 'complete' && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, 'complete')}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                  {task.status === 'todo' && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, 'ongoing')}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Start Task</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadTasks();
          setShowAddModal(false);
        }}
      />

      {/* TODO: Add Edit Task Modal */}
    </div>
  );
};

export default TaskAssignments;

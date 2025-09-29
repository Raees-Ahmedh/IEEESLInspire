import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, User, Calendar, Edit } from 'lucide-react';
import { taskService } from '../../services/apiService';

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

const EditorTaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getAllTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        setError(response.error || 'Failed to load tasks');
      }
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: 'todo' | 'ongoing' | 'complete') => {
    setUpdatingTask(taskId);
    try {
      const response = await taskService.updateTask(taskId, { status: newStatus });
      if (response.success) {
        // Update the task in the local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        setError(response.error || 'Failed to update task status');
      }
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error updating task:', error);
    } finally {
      setUpdatingTask(null);
    }
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
      low: { bg: 'bg-gray-100', text: 'text-gray-800' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      high: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    const config = priorityMap[priority as keyof typeof priorityMap];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['todo', 'ongoing', 'complete'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchTasks}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
        <p className="text-gray-600">You don't have any tasks assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
          <p className="text-gray-600">Manage your assigned tasks and update their status</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {tasks.length} tasks
        </div>
      </div>

      <div className="grid gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
                <p className="text-gray-600 mb-3">{task.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
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
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Update Status:</span>
                {getStatusOptions(task.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateTaskStatus(task.id, status as 'todo' | 'ongoing' | 'complete')}
                    disabled={updatingTask === task.id}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      status === 'todo' 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : status === 'ongoing'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updatingTask === task.id ? 'Updating...' : `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-500">
                Last updated: {task.auditInfo?.updatedAt ? new Date(task.auditInfo.updatedAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorTaskManagement;

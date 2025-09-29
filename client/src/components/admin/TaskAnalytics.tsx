import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Calendar, PieChart, ClipboardList } from 'lucide-react';
import { taskService, editorService } from '../../services/apiService';

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

interface TaskAnalyticsProps {}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [tasksResponse, editorsResponse] = await Promise.all([
        taskService.getAllTasks(),
        editorService.getAllEditors()
      ]);
      
      if (tasksResponse.success && tasksResponse.data) {
        setTasks(tasksResponse.data);
      }
      
      if (editorsResponse.success && editorsResponse.data) {
        setEditors(editorsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate analytics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'complete').length;
    const ongoing = tasks.filter(task => task.status === 'ongoing').length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    const overdue = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'complete'
    ).length;

    return {
      total,
      completed,
      ongoing,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const getPriorityStats = () => {
    const high = tasks.filter(task => task.priority === 'high').length;
    const medium = tasks.filter(task => task.priority === 'medium').length;
    const low = tasks.filter(task => task.priority === 'low').length;

    return { high, medium, low };
  };

  const getEditorStats = () => {
    const editorTaskCounts = editors.map(editor => {
      const assignedTasks = tasks.filter(task => task.assignedTo === editor.id);
      const completedTasks = assignedTasks.filter(task => task.status === 'complete').length;
      const overdueTasks = assignedTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'complete'
      ).length;

      return {
        editor: `${editor.firstName} ${editor.lastName || ''}`.trim(),
        total: assignedTasks.length,
        completed: completedTasks,
        overdue: overdueTasks,
        completionRate: assignedTasks.length > 0 ? Math.round((completedTasks / assignedTasks.length) * 100) : 0
      };
    });

    return editorTaskCounts.sort((a, b) => b.total - a.total);
  };

  const getRecentTasks = () => {
    return tasks
      .sort((a, b) => new Date(b.auditInfo?.createdAt || 0).getTime() - new Date(a.auditInfo?.createdAt || 0).getTime())
      .slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks
      .filter(task => 
        task.dueDate && 
        new Date(task.dueDate) >= now && 
        new Date(task.dueDate) <= nextWeek &&
        task.status !== 'complete'
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  };

  const stats = getTaskStats();
  const priorityStats = getPriorityStats();
  const editorStats = getEditorStats();
  const recentTasks = getRecentTasks();
  const upcomingDeadlines = getUpcomingDeadlines();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Analytics</h1>
          <p className="text-gray-600">Overview of task performance and productivity metrics</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">To Do</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.todo}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Ongoing</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.ongoing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Complete</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">High Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{priorityStats.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Medium Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{priorityStats.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Low Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{priorityStats.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Editor Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Editor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Total Tasks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Completed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Overdue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {editorStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{stat.editor}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{stat.total}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{stat.completed}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{stat.overdue}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{stat.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Assigned to: {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName || ''}` : 'Unknown'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'complete' ? 'bg-green-100 text-green-800' :
                  task.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;

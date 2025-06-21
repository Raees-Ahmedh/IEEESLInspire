import React, { useState } from 'react';
import { Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building, GraduationCap, Newspaper } from 'lucide-react';
import Logo from '../assets/images/logo.png';

interface Manager {
  id: string;
  name: string;
  university: string;
  isActive: boolean;
}

interface AdminDashboardProps {
  onGoBack?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<'manager' | 'editor' | 'subjects' | 'institutes' | 'fields' | 'news' | 'statistics'>('manager');
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerUniversity, setNewManagerUniversity] = useState('');

  const [managers, setManagers] = useState<Manager[]>([
    { id: '1', name: 'Kamal', university: 'Uva Wellassa University', isActive: true },
    { id: '2', name: 'Nimal', university: 'University of Jaffna', isActive: true },
    { id: '3', name: 'Kamal', university: 'University of Colombo', isActive: true },
    { id: '4', name: 'Kamal', university: 'University of Peradeniya', isActive: true },
    { id: '5', name: 'Kamal', university: 'University of Sri Jayawardanapura', isActive: true },
    { id: '6', name: 'Kamal', university: 'University of Ruhuna', isActive: true },
    { id: '7', name: 'Kamal', university: 'University of Sabaragamuwa', isActive: true },
    { id: '8', name: 'Kamal', university: 'University of Wayamba', isActive: true },
    { id: '9', name: 'Kamal', university: 'Uva Wellassa University', isActive: true },
    { id: '10', name: 'Kamal', university: 'Uva Wellassa University', isActive: true },
  ]);

  const toggleManagerStatus = (managerId: string) => {
    setManagers(managers.map(manager => 
      manager.id === managerId 
        ? { ...manager, isActive: !manager.isActive }
        : manager
    ));
  };

  const addManager = () => {
    if (newManagerName && newManagerUniversity) {
      const newManager: Manager = {
        id: Date.now().toString(),
        name: newManagerName,
        university: newManagerUniversity,
        isActive: true
      };
      setManagers([...managers, newManager]);
      setNewManagerName('');
      setNewManagerUniversity('');
      setShowAddManagerModal(false);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'manager': return Users;
      case 'editor': return User;
      case 'subjects': return BookOpen;
      case 'institutes': return Building;
      case 'fields': return GraduationCap;
      case 'news': return Newspaper;
      case 'statistics': return BarChart3;
      default: return User;
    }
  };

  const renderMainContent = () => {
    if (activeSection === 'manager') {
      return (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Managers List</h1>
            <button
              onClick={() => setShowAddManagerModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Manager</span>
            </button>
          </div>

          {/* Managers List */}
          <div className="space-y-4">
            {managers.map((manager) => (
              <div key={manager.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {manager.name} - {manager.university}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleManagerStatus(manager.id)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      manager.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {manager.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Placeholder content for other sections
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">
          {React.createElement(getSectionIcon(activeSection), { size: 64 })}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
        </h2>
        <p className="text-gray-600">This section is under development.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-200 relative">
        <div className="p-6 border-b border-gray-200">
          <button onClick={onGoBack} className="hover:opacity-80 transition-opacity">
            <img src={Logo} alt="SL Inspire Logo" className="h-12 w-auto" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Boards Section */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              BOARDS
            </h2>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveSection('manager')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'manager'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'manager' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <Users className="w-4 h-4" />
                <span>Manager</span>
              </button>
              
              <button 
                onClick={() => setActiveSection('editor')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'editor'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'editor' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <User className="w-4 h-4" />
                <span>Editor</span>
              </button>
              
              <button 
                onClick={() => setActiveSection('subjects')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'subjects'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'subjects' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <BookOpen className="w-4 h-4" />
                <span>Subjects</span>
              </button>
              
              <button 
                onClick={() => setActiveSection('institutes')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'institutes'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'institutes' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <Building className="w-4 h-4" />
                <span>Institutes</span>
              </button>
              
              <button 
                onClick={() => setActiveSection('fields')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'fields'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'fields' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <GraduationCap className="w-4 h-4" />
                <span>Fields of Study</span>
              </button>
              
              <button 
                onClick={() => setActiveSection('news')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'news'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'news' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <Newspaper className="w-4 h-4" />
                <span>News</span>
              </button>
              
              <button 
                onClick={() => setActiveSection('statistics')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'statistics'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeSection === 'statistics' ? 'bg-white' : 'bg-gray-400'
                }`}></div>
                <BarChart3 className="w-4 h-4" />
                <span>Statistics</span>
              </button>
            </div>
          </div>

          {/* Other Section */}
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

        {/* Admin Profile */}
        <div className="absolute bottom-0 w-64 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Admin</p>
              <button 
                onClick={onGoBack}
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

      {/* Add Manager Modal */}
      {showAddManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add New Manager</h3>
              <button
                onClick={() => setShowAddManagerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Name
                </label>
                <input
                  type="text"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="Enter manager name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University
                </label>
                <input
                  type="text"
                  value={newManagerUniversity}
                  onChange={(e) => setNewManagerUniversity(e.target.value)}
                  placeholder="Enter university name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddManagerModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addManager}
                disabled={!newManagerName || !newManagerUniversity}
                className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
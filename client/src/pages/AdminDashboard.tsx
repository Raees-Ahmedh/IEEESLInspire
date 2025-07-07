import React, { useState } from 'react';
import { Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building, GraduationCap, Newspaper, Menu, X } from 'lucide-react';
import Logo from '../assets/images/logo.png';
import CourseManagement from '../components/admin/CourseManagement';

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
  const [activeSection, setActiveSection] = useState<'manager' | 'editor' | 'subjects' | 'institutes' | 'courses' | 'fields' | 'news' | 'statistics'>('manager');
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerUniversity, setNewManagerUniversity] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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

  const addNewManager = () => {
    if (newManagerName && newManagerUniversity) {
      const newManager: Manager = {
        id: (managers.length + 1).toString(),
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
      case 'manager':
        return Users;
      case 'editor':
        return User;
      case 'subjects':
        return BookOpen;
      case 'institutes':
        return Building;
      case 'courses':
        return GraduationCap;
      case 'fields':
        return BookOpen;
      case 'news':
        return Newspaper;
      case 'statistics':
        return BarChart3;
      default:
        return BookOpen;
    }
  };

  const renderContent = () => {
    if (activeSection === 'courses') {
      return <CourseManagement />;
    }

    if (activeSection === 'manager') {
      return (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8 mt-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5 mt-4 sm:mt-32">Manager Board</h1>
              <p className="text-gray-600">Manage university managers and their access</p>
            </div>
            <button
              onClick={() => setShowAddManagerModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-3  rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto  mt-30 sm:mt-30"
            >
              <Plus className="w-5 h-5 " />
              <span>Add Manager</span>
            </button>
          </div>

          {/* Add Manager Modal */}
          {showAddManagerModal && (
            <div className="fixed inset-0 bg-pink-100 bg-opacity-50 flex items-center justify-center z-50 p-4 ">
              <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 ">Add New Manager</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
                    <input
                      type="text"
                      value={newManagerName}
                      onChange={(e) => setNewManagerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter manager name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                    <input
                      type="text"
                      value={newManagerUniversity}
                      onChange={(e) => setNewManagerUniversity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter university name"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={() => setShowAddManagerModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewManager}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all"
                  >
                    Add Manager
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Managers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {managers.map((manager) => (
              <div key={manager.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{manager.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{manager.university}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${manager.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-center ${
                    manager.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {manager.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleManagerStatus(manager.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="text-gray-400 mb-4 flex justify-center">
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
          {/* Boards Section */}
          <div className="mb-8 mt-4">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                BOARDS
              </h2>
            )}
            <div className="space-y-2">
              <button 
                onClick={() => setActiveSection('manager')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'manager'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Manager' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'manager' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Users className="w-4 h-4" />
                {isSidebarExpanded && <span>Manager</span>}
              </button>
              
              <button 
                onClick={() => setActiveSection('editor')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'editor'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Editor' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'editor' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <User className="w-4 h-4" />
                {isSidebarExpanded && <span>Editor</span>}
              </button>
              
              <button 
                onClick={() => setActiveSection('statistics')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'statistics'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Statistics' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'statistics' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <BarChart3 className="w-4 h-4" />
                {isSidebarExpanded && <span>Statistics</span>}
              </button>
            </div>
          </div>

          {/* Institute Section */}
          <div className="mb-8">
            {isSidebarExpanded && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                INSTITUTE
              </h2>
            )}
            <div className="space-y-2">
              <button 
                onClick={() => setActiveSection('subjects')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'subjects'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Subjects' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'subjects' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <BookOpen className="w-4 h-4" />
                {isSidebarExpanded && <span>Subjects</span>}
              </button>
              
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

              {/* Courses Menu Item */}
              <button 
                onClick={() => setActiveSection('courses')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'courses'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Courses' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'courses' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <GraduationCap className="w-4 h-4" />
                {isSidebarExpanded && <span>Courses</span>}
              </button>
              
              <button 
                onClick={() => setActiveSection('fields')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'fields'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'Fields' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'fields' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <BookOpen className="w-4 h-4" />
                {isSidebarExpanded && <span>Fields</span>}
              </button>
              
              <button 
                onClick={() => setActiveSection('news')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium transition-all ${
                  activeSection === 'news'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={!isSidebarExpanded ? 'News' : ''}
              >
                {isSidebarExpanded && (
                  <div className={`w-2 h-2 rounded-full ${
                    activeSection === 'news' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                )}
                <Newspaper className="w-4 h-4" />
                {isSidebarExpanded && <span>News</span>}
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
            <div className="space-y-2">
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

        {/* Admin Profile */}
        <div className={`absolute bottom-0 bg-white border-t border-gray-200 p-6 ${
          isSidebarExpanded ? 'w-64' : 'w-16'
        } ${!isSidebarExpanded && 'px-3'}`}>
          <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'}`}>
            <div className={`${isSidebarExpanded ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0`}>
              <User className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">System Administrator</p>
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

export default AdminDashboard;
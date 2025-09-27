import React, { useState, useEffect } from 'react';
import { Plus, Settings, HelpCircle, User, BarChart3, Users, BookOpen, Building, GraduationCap, Newspaper, Menu, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../assets/images/logo.png';
import CourseManagement from '../components/admin/CourseManagement';
import FieldsManagement from '../components/admin/FieldsManagement';
import AdvancedStatisticsDashboard from '../components/AdvancedStatisticsDashboard';
import adminService, { Manager, CreateManagerRequest } from '../services/adminService';

interface AdminDashboardProps {
  onGoBack?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<'manager' | 'editor' | 'subjects' | 'institutes' | 'courses' | 'fields' | 'news' | 'statistics'>('manager');
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manager data
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load managers on component mount
  useEffect(() => {
    if (activeSection === 'manager') {
      loadManagers();
    }
  }, [activeSection]);

  const loadManagers = async () => {
    setIsLoadingManagers(true);
    try {
      const response = await adminService.getManagers();
      if (response.success && response.data) {
        setManagers(response.data);
      } else {
        setError(response.error || 'Failed to load managers');
      }
    } catch (error) {
      setError('Failed to load managers');
      console.error('Error loading managers:', error);
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      
    });
    setValidationErrors({});
    setError(null);
    setSuccess(null);
  };

  const addNewManager = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const managerData: CreateManagerRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        
      };

      const response = await adminService.createManager(managerData);
      
      if (response.success && response.data) {
        setSuccess('Manager created successfully!');
        resetForm();
        setShowAddManagerModal(false);
        // Reload managers list
        await loadManagers();
      } else {
        setError(response.error || 'Failed to create manager');
      }
    } catch (error) {
      setError('Failed to create manager. Please try again.');
      console.error('Error creating manager:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleManagerStatus = async (managerId: string) => {
    try {
      const response = await adminService.toggleManagerStatus(managerId);
      if (response.success && response.data) {
        // Update local state
        setManagers(prevManagers => 
          prevManagers.map(manager => 
            manager.id === managerId 
              ? { ...manager, isActive: response.data!.isActive }
              : manager
          )
        );
        setSuccess(`Manager ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError(response.error || 'Failed to update manager status');
      }
    } catch (error) {
      setError('Failed to update manager status');
      console.error('Error toggling manager status:', error);
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

    if (activeSection === 'fields') {
      return <FieldsManagement />;
    }

    if (activeSection === 'statistics') {
      return <AdvancedStatisticsDashboard />;
    }

    if (activeSection === 'manager') {
      return (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8 mt-0">
            <div>
              <h1 className=" text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-5 mt-4 sm:mt-32 ">Manager Board</h1>
              <p className="text-gray-600">Manage university managers and their access</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddManagerModal(true);
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto mt-30 sm:mt-50"
            >
              <Plus className="w-5 h-5" />
              <span>Add Manager</span>
            </button>
          </div>

          {/* Success/Error Messages */}
          {(success || error) && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{success || error}</span>
              <button 
                onClick={() => { setSuccess(null); setError(null); }}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add Manager Modal */}
          {showAddManagerModal && (
            <div className="fixed inset-0 bg-pink-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Add New Manager</h2>
                
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 ${
                          validationErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 ${
                          validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 text-red-800 p-3 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={() => setShowAddManagerModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewManager}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Add Manager'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Managers Grid */}
          {isLoadingManagers ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading managers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {managers.map((manager) => (
                <div key={manager.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{manager.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{manager.email}</p>
                      
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
              
              {managers.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No managers found</h3>
                  <p className="text-gray-600">Add your first manager to get started.</p>
                </div>
              )}
            </div>
          )}
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

          {/* Account Section */}
          <div className="mt-auto pt-8 border-t border-gray-200">
            {isSidebarExpanded && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                ACCOUNT
              </h3>
            )}
            <div className="space-y-2">
              <button 
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all`}
                title={!isSidebarExpanded ? 'Settings' : ''}
              >
                <Settings className="w-4 h-4" />
                {isSidebarExpanded && <span>Settings</span>}
              </button>
              
              <button 
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all`}
                title={!isSidebarExpanded ? 'Help' : ''}
              >
                <HelpCircle className="w-4 h-4" />
                {isSidebarExpanded && <span>Help</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
    </div>
  );
};

export default AdminDashboard;
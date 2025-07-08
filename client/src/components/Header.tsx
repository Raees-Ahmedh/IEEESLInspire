import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Menu, ChevronDown, LogOut, Settings, Shield, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setSearchQuery } from '../store/slices/searchSlice';
import { logout, logoutUserAsync } from '../store/slices/authSlice';
import logo from '../assets/images/logo.png';

interface HeaderProps {
  onLogoClick?: () => void;
  onFindDegreeClick?: () => void;
  onSignUpClick?: () => void;
  onDashboardClick?: () => void;
  onAdminClick?: () => void;
  onManagerClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogoClick, 
  onFindDegreeClick, 
  onSignUpClick, 
  onDashboardClick,
  onAdminClick,
  onManagerClick
}) => {
  const dispatch = useAppDispatch();
  const { query } = useAppSelector((state) => state.search.filters);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleFindDegreeClick = () => {
    if (onFindDegreeClick) {
      onFindDegreeClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    // Redirect based on user role - each role has only one dashboard
    if (user?.role === 'admin' && onAdminClick) {
      onAdminClick(); // Admin goes to admin dashboard only
    }else if (user?.role === 'manager' && onManagerClick) {
      onManagerClick(); // Manager goes to manager dashboard
    } else if (user?.role === 'user' && onDashboardClick) {
      onDashboardClick(); // User goes to user dashboard only
    }
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
  try {
    await dispatch(logoutUserAsync()).unwrap();
    // Redirect to home page after successful logout
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    // Force logout anyway
    dispatch(logout());
    window.location.href = '/';
  }
};

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or at the top
        setIsVisible(true);
      } else {
        // Scrolling down
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={`bg-white shadow-sm border-b border-gray-100 fixed w-full top-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-5">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button 
                onClick={handleLogoClick}
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img 
                  src={logo} 
                  alt="Company Logo" 
                  className="h-12 sm:h-16 lg:h-20 w-auto"
                />
              </button>
            </div>

          {/* Search Bar */}
         <div className="hidden md:flex flex-1 max-w-lg mx-8 ml-50">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search courses, universities..."
              />
            </div>
          </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
              <button 
                onClick={scrollToHowItWorks}
                className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                How it works
              </button>
              
              {!isAuthenticated ? (
                <button 
                  onClick={handleSignUpClick}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  Sign up
                </button>
              ) : (
                /* Desktop User Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user?.role === 'admin' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-purple-600 to-purple-700'
                    }`}>
                      {user?.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="hidden xl:block max-w-24 truncate">{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleDashboardClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        {user?.role === 'admin' ? (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>Dashboard</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Mobile Right Section */}
            <div className="flex items-center space-x-2 lg:hidden">
              {/* Mobile Search Button */}
              <button 
                onClick={toggleMobileSearch}
                className="p-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Mobile User Avatar or Sign Up */}
              {isAuthenticated ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user?.role === 'admin' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700'
                }`}>
                  {user?.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleSignUpClick}
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Sign up
                </button>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="lg:hidden px-3 pb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Search courses, universities..."
                  autoFocus
                />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 py-4">
            {/* User Info Section */}
            {isAuthenticated && (
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user?.role === 'admin' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-700'
                  }`}>
                    {user?.role === 'admin' ? (
                      <Shield className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-800 truncate">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="px-4 py-2">
              <div className="space-y-1">
                <button 
                  onClick={scrollToHowItWorks}
                  className="w-full text-left px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  How it works
                </button>
                
                {isAuthenticated && (
                  <>
                    <button
                      onClick={handleDashboardClick}
                      className="w-full text-left px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      {user?.role === 'admin' ? (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </>
                      ) : (
                        <>
                          <User className="w-5 h-5" />
                          <span>Dashboard</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      className="w-full text-left px-3 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          {isAuthenticated && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
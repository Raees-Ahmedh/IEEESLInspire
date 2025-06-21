import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Menu, ChevronDown, LogOut, Settings, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setSearchQuery } from '../store/slices/searchSlice';
import { logout } from '../store/slices/authSlice';
import logo from '../assets/images/logo.png';

interface HeaderProps {
  onLogoClick?: () => void;
  onFindDegreeClick?: () => void;
  onSignUpClick?: () => void;
  onDashboardClick?: () => void;
  onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogoClick, 
  onFindDegreeClick, 
  onSignUpClick, 
  onDashboardClick,
  onAdminClick 
}) => {
  const dispatch = useAppDispatch();
  const { query } = useAppSelector((state) => state.search.filters);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  const handleFindDegreeClick = () => {
    if (onFindDegreeClick) {
      onFindDegreeClick();
    }
  };

  const handleSignUpClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    }
  };

  const handleDashboardClick = () => {
    // Redirect based on user role - each role has only one dashboard
    if (user?.role === 'admin' && onAdminClick) {
      onAdminClick(); // Admin goes to admin dashboard only
    } else if (user?.role === 'user' && onDashboardClick) {
      onDashboardClick(); // User goes to user dashboard only
    }
    setIsDropdownOpen(false);
  };

  const handleAdminClick = () => {
    if (onAdminClick) {
      onAdminClick();
    }
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    if (onLogoClick) {
      onLogoClick(); // Go to home after logout
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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

  return (
    <header className={`bg-white shadow-sm border-b border-gray-100 fixed w-full top-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-5">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={handleLogoClick}
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img 
                src={logo} 
                alt="Company Logo" 
                className="h-20 w-auto"
              />
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={handleFindDegreeClick}
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
            >
              Find Your Degree
            </button>
            <button 
              onClick={scrollToHowItWorks}
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
            >
              How it works
            </button>
            
            {!isAuthenticated ? (
              <button 
                onClick={handleSignUpClick}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Sign up
              </button>
            ) : (
              /* User Dropdown */
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
                  <span>{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-purple-600 transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setSearchQuery } from '../store/slices/searchSlice';
import  logo  from '../assets/images/logo.png';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { query } = useAppSelector((state) => state.search.filters);
  const { isAuthenticated, profile } = useAppSelector((state) => state.user);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Company Logo" 
                className="h-20 w-auto"
              />
            </div>
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
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Find Your Degree
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              How it works
            </a>
            {!isAuthenticated ? (
              <a href="#" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Sign up
              </a>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Welcome, {profile?.name}</span>
              </div>
            )}
            <button className="text-gray-700 hover:text-purple-600 transition-colors">
              <User className="h-6 w-6" />
            </button>
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
// client/src/components/Search/NavbarSearch.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, MapPin, Clock, DollarSign } from 'lucide-react';

interface SearchResult {
  id: number;
  name: string;
  courseCode?: string;
  courseUrl?: string;
  university: {
    id: number;
    name: string;
    type: string;
  };
  faculty: {
    id: number;
    name: string;
  };
  department?: string;
  feeType: string;
  feeAmount?: number;
  studyMode: string;
  durationMonths?: number;
  description?: string;
}

interface NavbarSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onClose?: () => void;
}

const NavbarSearch: React.FC<NavbarSearchProps> = ({
  query,
  onQueryChange,
  className = '',
  placeholder = 'Search courses, universities...',
  isMobile = false,
  onResultClick,
  onClose
}) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  // Perform search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/simple-search?query=${encodeURIComponent(searchQuery)}&limit=${isMobile ? 5 : 6}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      if (data.success && data.courses) {
        setSearchResults(data.courses);
        setShowResults(true);
        setSelectedIndex(-1);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else if (result.courseUrl) {
      window.open(result.courseUrl, '_blank');
    }
    
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Clear search
  const clearSearch = () => {
    onQueryChange('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

  // Focus input when query changes from outside
  useEffect(() => {
    if (query.length >= 2 && searchResults.length > 0) {
      setShowResults(true);
    }
  }, [query, searchResults.length]);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && searchResults.length > 0 && setShowResults(true)}
          className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all ${
            isMobile ? 'text-sm' : ''
          }`}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {/* Clear button or loading indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          ) : query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto ${
          isMobile ? 'max-h-80' : ''
        }`}>
          {searchResults.length > 0 ? (
            <>
              {/* Results */}
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex
                      ? 'bg-purple-50 border-purple-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Course Name */}
                      <h4 className={`font-medium text-gray-900 truncate ${
                        isMobile ? 'text-sm' : 'text-sm'
                      }`}>
                        {result.name}
                      </h4>
                      
                      {/* University & Faculty */}
                      <p className={`text-gray-600 mt-1 ${
                        isMobile ? 'text-xs' : 'text-xs'
                      }`}>
                        {result.university.name} • {result.faculty.name}
                      </p>
                      
                      {/* Course Details */}
                      {!isMobile ? (
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {result.studyMode}
                          </div>
                          
                          {result.durationMonths && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.floor(result.durationMonths / 12)}y {result.durationMonths % 12}m
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {result.feeType === 'free' ? 'Free' : 
                             result.feeAmount ? `LKR ${result.feeAmount.toLocaleString()}` : 'Paid'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{result.studyMode}</span>
                          <span>•</span>
                          <span>{result.feeType === 'free' ? 'Free' : 'Paid'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* External Link Icon */}
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))}
              
              {/* View All Results Footer (only for desktop) */}
              {!isMobile && query && (
                <div 
                  onClick={() => {
                    // Navigate to full search results page
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                    setShowResults(false);
                  }}
                  className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors border-t"
                >
                  <div className="flex items-center justify-center text-sm text-purple-600 font-medium">
                    <Search className="w-4 h-4 mr-2" />
                    View all results for "{query}"
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No courses found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching for different keywords
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
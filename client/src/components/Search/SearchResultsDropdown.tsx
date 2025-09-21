import React from 'react';
import { SearchResult } from '../../types/search';
import { MapPin, BookOpen, Clock, DollarSign, ExternalLink } from 'lucide-react';

interface SearchResultsDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  isVisible: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
  onViewAllResults: () => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  results,
  isLoading,
  isVisible,
  query,
  onResultClick,
  onViewAllResults
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-gray-600 text-sm">Searching...</span>
          </div>
        </div>
      ) : results.length === 0 && query.trim().length >= 2 ? (
        <div className="p-4 text-center">
          <p className="text-gray-500 text-sm">No courses or universities found for "{query}"</p>
          <p className="text-gray-400 text-xs mt-1">Try different keywords or check spelling</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-gray-500 text-sm">Start typing to search courses and universities</p>
        </div>
      ) : (
        <>
          <div className="max-h-80 overflow-y-auto">
            {results.map((result) => (
              <div
                key={`${result.id}-${result.courseCode || 'unknown'}`}
                onClick={() => onResultClick(result)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {result.name}
                    </h4>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {result.courseCode || 'N/A'}
                      </span>
                      {result.university.type && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          result.university.type === 'government' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {result.university.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{result.university.name}</span>
                    </div>

                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      {result.faculty && (
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span className="truncate">{result.faculty.name}</span>
                        </div>
                      )}
                      
                      {result.durationMonths && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{Math.ceil(result.durationMonths / 12)} years</span>
                        </div>
                      )}

                      {result.feeType && (
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span className="capitalize">
                            {result.feeType}
                            {result.feeAmount && result.feeType !== 'free' && (
                              <span className="ml-1">
                                ${result.feeAmount.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {result.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-4">
                        {result.description.length > 100 
                          ? `${result.description.substring(0, 100)}...` 
                          : result.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="ml-2 flex-shrink-0">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {results.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={onViewAllResults}
                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2 hover:bg-purple-50 rounded-md transition-colors"
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsDropdown;
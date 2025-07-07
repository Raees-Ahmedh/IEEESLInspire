// client/src/pages/AllUniversitiesPage.tsx - Show all universities with filtering and pagination
import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Calendar, 
  ExternalLink, 
  BookOpen, 
  ChevronDown,
  X,
  Plus
} from 'lucide-react';

interface University {
  id: number;
  name: string;
  location: string;
  type: 'government' | 'private';
  website?: string;
  imageUrl?: string;
  logoUrl?: string;
  galleryImages?: string[];
  additionalDetails: {
    established?: string;
    students?: string;
    faculties?: number;
  };
}

interface AllUniversitiesPageProps {
  onBack: () => void;
  onViewUniversity?: (universityId: number) => void;
}

const AllUniversitiesPage: React.FC<AllUniversitiesPageProps> = ({ onBack, onViewUniversity }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'government' | 'private'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const universitiesPerPage = 12;
  
  // Mobile display control and screen size detection
  const [showAllOnMobile, setShowAllOnMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  // Screen size detection with resize listener
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      // Reset mobile view when screen size changes
      if (window.innerWidth >= 768) {
        setShowAllOnMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAllUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching all universities...');
        
        // Fetch all universities (no limit)
        const response = await fetch(`${API_BASE_URL}/universities?status=active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.universities)) {
          setUniversities(data.universities);
          setFilteredUniversities(data.universities);
          console.log('✅ Successfully loaded all universities:', data.universities.length);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        console.error('❌ Error fetching all universities:', error);
        setError(error.message || 'Failed to load universities');
        
        // Fallback to expanded mock data if API fails
        const mockUniversities = [
          {
            id: 1,
            name: "University of Colombo",
            location: "Colombo",
            type: "government" as const,
            website: "https://www.cmb.ac.lk",
            additionalDetails: {
              established: "1921",
              students: "11,000+",
              faculties: 7
            }
          },
          {
            id: 2,
            name: "University of Peradeniya",
            location: "Kandy",
            type: "government" as const,
            website: "https://www.pdn.ac.lk",
            additionalDetails: {
              established: "1942",
              students: "12,000+",
              faculties: 9
            }
          },
          {
            id: 3,
            name: "University of Moratuwa",
            location: "Moratuwa",
            type: "government" as const,
            website: "https://www.mrt.ac.lk",
            additionalDetails: {
              established: "1966",
              students: "10,000+",
              faculties: 5
            }
          },
          {
            id: 4,
            name: "University of Sri Jayewardenepura",
            location: "Nugegoda",
            type: "government" as const,
            website: "https://www.sjp.ac.lk",
            additionalDetails: {
              established: "1958",
              students: "15,000+",
              faculties: 8
            }
          },
          {
            id: 5,
            name: "University of Kelaniya",
            location: "Kelaniya",
            type: "government" as const,
            website: "https://www.kln.ac.lk",
            additionalDetails: {
              established: "1959",
              students: "13,000+",
              faculties: 6
            }
          },
          {
            id: 6,
            name: "NSBM Green University",
            location: "Pitipana",
            type: "private" as const,
            website: "https://www.nsbm.ac.lk",
            additionalDetails: {
              established: "2013",
              students: "8,000+",
              faculties: 4
            }
          },
          {
            id: 7,
            name: "University of Ruhuna",
            location: "Matara",
            type: "government" as const,
            website: "https://www.ruh.ac.lk",
            additionalDetails: {
              established: "1978",
              students: "9,000+",
              faculties: 6
            }
          },
          {
            id: 8,
            name: "SLIIT",
            location: "Malabe",
            type: "private" as const,
            website: "https://www.sliit.lk",
            additionalDetails: {
              established: "1999",
              students: "12,000+",
              faculties: 4
            }
          },
          {
            id: 9,
            name: "University of Jaffna",
            location: "Jaffna",
            type: "government" as const,
            website: "https://www.jfn.ac.lk",
            additionalDetails: {
              established: "1974",
              students: "8,000+",
              faculties: 7
            }
          },
          {
            id: 10,
            name: "IIT Campus (UOW)",
            location: "Malabe",
            type: "private" as const,
            website: "https://www.iit.ac.lk",
            additionalDetails: {
              established: "2000",
              students: "3,000+",
              faculties: 3
            }
          },
          {
            id: 11,
            name: "Sabaragamuwa University",
            location: "Belihuloya",
            type: "government" as const,
            website: "https://www.sab.ac.lk",
            additionalDetails: {
              established: "1995",
              students: "6,000+",
              faculties: 4
            }
          },
          {
            id: 12,
            name: "CINEC Campus",
            location: "Malabe",
            type: "private" as const,
            website: "https://www.cinec.edu",
            additionalDetails: {
              established: "1998",
              students: "4,000+",
              faculties: 3
            }
          }
        ];
        
        setUniversities(mockUniversities);
        setFilteredUniversities(mockUniversities);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUniversities();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = universities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(university =>
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(university => university.type === selectedType);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(university => university.location === selectedLocation);
    }

    setFilteredUniversities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setShowAllOnMobile(false); // Reset mobile display when filters change
  }, [searchTerm, selectedType, selectedLocation, universities]);

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(universities.map(u => u.location))).sort();

  // Mobile detection based on current screen width
  const isMobile = screenSize.width < 768; // md breakpoint
  const mobileLimit = 4;
  
  // Calculate display universities and pagination based on screen size
  const getDisplayData = () => {
    if (isMobile && !showAllOnMobile) {
      // Mobile: show only first 4 universities
      return {
        displayUniversities: filteredUniversities.slice(0, mobileLimit),
        totalPages: 1,
        showPagination: false,
        showMoreButton: filteredUniversities.length > mobileLimit
      };
    } else {
      // Desktop/Tablet or mobile with "show all" activated: normal pagination
      const totalPages = Math.ceil(filteredUniversities.length / universitiesPerPage);
      const startIndex = (currentPage - 1) * universitiesPerPage;
      const displayUniversities = filteredUniversities.slice(startIndex, startIndex + universitiesPerPage);
      
      return {
        displayUniversities,
        totalPages,
        showPagination: totalPages > 1,
        showMoreButton: false
      };
    }
  };

  const { displayUniversities, totalPages, showPagination, showMoreButton } = getDisplayData();

  const handleViewDetails = (universityId: number) => {
    console.log(`Viewing details for university ${universityId}`);
    if (onViewUniversity) {
      onViewUniversity(universityId);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedLocation('all');
  };

  const handleShowMore = () => {
    setShowAllOnMobile(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-purple-600 text-lg">Loading universities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200 hover:border-blue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              All Universities
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover all universities across Sri Lanka and find the perfect fit for your academic journey
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search universities by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-lg"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Active filters count */}
            {(selectedType !== 'all' || selectedLocation !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500">
                  {(selectedType !== 'all' ? 1 : 0) + (selectedLocation !== 'all' ? 1 : 0)} filters active
                </span>
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* University Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'all' | 'government' | 'private')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="all">All Types</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info - Remove in production */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4 text-sm">
            <strong>Debug Info:</strong> Screen: {screenSize.width}px, 
            Mobile: {isMobile ? 'Yes' : 'No'}, 
            Show All: {showAllOnMobile ? 'Yes' : 'No'}, 
            Total: {filteredUniversities.length}, 
            Showing: {displayUniversities.length}
          </div>
        )} */}

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {displayUniversities.length} of {filteredUniversities.length} universities
            {searchTerm && (
              <span className="ml-1">
                for "<span className="font-medium text-gray-900">{searchTerm}</span>"
              </span>
            )}
            {isMobile && !showAllOnMobile && filteredUniversities.length > mobileLimit && (
              <span className="block text-xs text-purple-600 mt-1">
                Mobile view - showing top {mobileLimit} results
              </span>
            )}
          </p>
          
          {/* Active Filter Tags */}
          {(selectedType !== 'all' || selectedLocation !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedType !== 'all' && (
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {selectedType}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLocation !== 'all' && (
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedLocation}
                  <button
                    onClick={() => setSelectedLocation('all')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Universities Grid */}
        {filteredUniversities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4 flex justify-center">
              <Search className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No universities found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {displayUniversities.map((university) => (
                <div 
                  key={university.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100"
                >
                  {/* University Image */}
                  <div className="relative h-32 sm:h-40 overflow-hidden">
                    {university.imageUrl ? (
                      <img
                        src={university.imageUrl}
                        alt={university.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback background */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br ${
                        university.type === 'government' 
                          ? 'from-green-500 to-green-700' 
                          : 'from-blue-500 to-blue-700'
                      } flex items-center justify-center ${
                        university.imageUrl ? 'hidden' : 'flex'
                      }`}
                      style={{ display: university.imageUrl ? 'none' : 'flex' }}
                    >
                      <div className="text-white text-center p-2">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 opacity-80" />
                        <h3 className="text-xs sm:text-sm font-bold opacity-90">{university.name.split(' ').slice(0, 2).join(' ')}</h3>
                      </div>
                    </div>
                    
                    {/* University Type Badge */}
                    <div className={`absolute top-2 left-2 ${
                      university.type === 'government' 
                        ? 'bg-green-600' 
                        : 'bg-blue-600'
                    } text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg`}>
                      {university.type === 'government' ? 'Gov' : 'Private'}
                    </div>

                    {/* Logo overlay (if available) */}
                    {university.logoUrl && (
                      <div className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full p-1 shadow-lg">
                        <img
                          src={university.logoUrl}
                          alt={`${university.name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    {/* University Header */}
                    <div className="mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {university.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{university.location}</span>
                      </div>
                    </div>

                    {/* University Details */}
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                      {university.additionalDetails.students && (
                        <div className="flex items-center text-gray-600">
                          <Users className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{university.additionalDetails.students}</span>
                        </div>
                      )}
                      
                      {university.additionalDetails.faculties && (
                        <div className="flex items-center text-gray-600">
                          <BookOpen className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{university.additionalDetails.faculties} faculties</span>
                        </div>
                      )}
                      
                      {university.additionalDetails.established && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">Est. {university.additionalDetails.established}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(university.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span className="hidden sm:inline">Courses</span>
                        <span className="sm:hidden">View</span>
                      </button>
                      
                      {university.website && (
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
                          title="Visit Website"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Show More Button */}
            {showMoreButton && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleShowMore}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Show More Universities ({filteredUniversities.length - mobileLimit} more)</span>
                </button>
              </div>
            )}

            {/* Pagination */}
            {showPagination && (
              <div className="flex justify-center items-center space-x-1 sm:space-x-2 px-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-flex items-center bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
            <span className="text-sm sm:text-base text-gray-700 font-medium">
              {filteredUniversities.length} Universities • 
              <span className="text-green-600 ml-1">
                {filteredUniversities.filter(u => u.type === 'government').length} Government
              </span>
              {filteredUniversities.filter(u => u.type === 'private').length > 0 && (
                <span className="text-blue-600 ml-1">
                  • {filteredUniversities.filter(u => u.type === 'private').length} Private
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUniversitiesPage;
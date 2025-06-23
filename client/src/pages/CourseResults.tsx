import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Clock, GraduationCap, Bookmark, ExternalLink, SlidersHorizontal, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import Header from '../components/Header';

interface CourseResultsProps {
  onGoBack?: () => void;
  onCourseClick?: (courseId: string) => void;
  userQualifications?: any; // New prop for user qualification data
}

interface Course {
  id: string;
  title: string;
  university: string;
  degree: string;
  duration: string;
  language: string;
  location: string;
  level: string;
  field: string;
  entryRequirement: string;
  websiteUrl: string;
  matchScore: number;
  isBookmarked?: boolean;
}

interface FilterOptions {
  universities: string[];
  locations: string[];
  durations: string[];
  fields: string[];
  levels: string[];
  languages: string[];
}

const CourseResults: React.FC<CourseResultsProps> = ({ onGoBack, onCourseClick, userQualifications }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'university' | 'duration'>('relevance');
  
  // Filter states
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Mock course data - in real app, this would come from API/Redux
  const [allCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Physical Education',
      university: 'Sabaragamuwa University of Sri Lanka',
      degree: 'BSc(Hons) (Physical Ed)',
      duration: '4 years',
      language: 'English',
      location: 'Rathnapura',
      level: 'SQLF Level 6',
      field: 'Sport Science',
      entryRequirement: 'Entry Exam Aptitude Exam',
      websiteUrl: 'https://sab.ac.lk',
      matchScore: 95,
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Computer Science',
      university: 'University of Colombo',
      degree: 'BSc(Hons) Computer Science',
      duration: '4 years',
      language: 'English',
      location: 'Colombo',
      level: 'SQLF Level 6',
      field: 'Information Technology',
      entryRequirement: 'Mathematics and Physics required',
      websiteUrl: 'https://cmb.ac.lk',
      matchScore: 88,
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Business Administration',
      university: 'University of Peradeniya',
      degree: 'BBA(Hons)',
      duration: '4 years',
      language: 'English',
      location: 'Kandy',
      level: 'SQLF Level 6',
      field: 'Business Studies',
      entryRequirement: 'Economics or Mathematics required',
      websiteUrl: 'https://pdn.ac.lk',
      matchScore: 82,
      isBookmarked: false
    },
    {
      id: '4',
      title: 'Medicine',
      university: 'University of Sri Jayewardenepura',
      degree: 'MBBS',
      duration: '5 years',
      language: 'English',
      location: 'Nugegoda',
      level: 'SQLF Level 7',
      field: 'Medical Sciences',
      entryRequirement: 'Biology, Chemistry, Physics required',
      websiteUrl: 'https://sjp.ac.lk',
      matchScore: 78,
      isBookmarked: false
    },
    {
      id: '5',
      title: 'Engineering',
      university: 'University of Moratuwa',
      degree: 'BSc(Hons) Engineering',
      duration: '4 years',
      language: 'English',
      location: 'Moratuwa',
      level: 'SQLF Level 6',
      field: 'Engineering',
      entryRequirement: 'Mathematics and Physics required',
      websiteUrl: 'https://mrt.ac.lk',
      matchScore: 75,
      isBookmarked: true
    },
    {
      id: '6',
      title: 'Law',
      university: 'University of Colombo',
      degree: 'LLB(Hons)',
      duration: '4 years',
      language: 'English',
      location: 'Colombo',
      level: 'SQLF Level 6',
      field: 'Legal Studies',
      entryRequirement: 'Any three subjects at A/L',
      websiteUrl: 'https://cmb.ac.lk',
      matchScore: 72,
      isBookmarked: false
    },
    {
      id: '7',
      title: 'Architecture',
      university: 'University of Moratuwa',
      degree: 'BSc(Hons) Architecture',
      duration: '5 years',
      language: 'English',
      location: 'Moratuwa',
      level: 'SQLF Level 6',
      field: 'Architecture & Design',
      entryRequirement: 'Mathematics required, Art recommended',
      websiteUrl: 'https://mrt.ac.lk',
      matchScore: 70,
      isBookmarked: false
    },
    {
      id: '8',
      title: 'Nursing',
      university: 'University of Sri Jayewardenepura',
      degree: 'BSc(Hons) Nursing',
      duration: '4 years',
      language: 'English',
      location: 'Nugegoda',
      level: 'SQLF Level 6',
      field: 'Health Sciences',
      entryRequirement: 'Biology and Chemistry required',
      websiteUrl: 'https://sjp.ac.lk',
      matchScore: 68,
      isBookmarked: true
    }
  ]);

  const [filteredCourses, setFilteredCourses] = useState<Course[]>(allCourses);

  // Filter options
  const filterOptions: FilterOptions = {
    universities: [...new Set(allCourses.map(course => course.university))],
    locations: [...new Set(allCourses.map(course => course.location))],
    durations: [...new Set(allCourses.map(course => course.duration))],
    fields: [...new Set(allCourses.map(course => course.field))],
    levels: [...new Set(allCourses.map(course => course.level))],
    languages: [...new Set(allCourses.map(course => course.language))],
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = allCourses.filter(course => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.field.toLowerCase().includes(searchQuery.toLowerCase());

      // University filter
      const matchesUniversity = selectedUniversities.length === 0 || 
        selectedUniversities.includes(course.university);

      // Location filter
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.includes(course.location);

      // Duration filter
      const matchesDuration = selectedDurations.length === 0 || 
        selectedDurations.includes(course.duration);

      // Field filter
      const matchesField = selectedFields.length === 0 || 
        selectedFields.includes(course.field);

      // Level filter
      const matchesLevel = selectedLevels.length === 0 || 
        selectedLevels.includes(course.level);

      // Language filter
      const matchesLanguage = selectedLanguages.length === 0 || 
        selectedLanguages.includes(course.language);

      return matchesSearch && matchesUniversity && matchesLocation && 
             matchesDuration && matchesField && matchesLevel && matchesLanguage;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'university':
          return a.university.localeCompare(b.university);
        case 'duration':
          return a.duration.localeCompare(b.duration);
        case 'relevance':
        default:
          return b.matchScore - a.matchScore;
      }
    });

    setFilteredCourses(filtered);
  }, [searchQuery, selectedUniversities, selectedLocations, selectedDurations, 
      selectedFields, selectedLevels, selectedLanguages, sortBy, allCourses]);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  const handleCourseClick = (courseId: string) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  const handleBookmark = (courseId: string) => {
    // In real app, dispatch action to toggle bookmark
    console.log('Toggle bookmark for course:', courseId);
  };

  const clearAllFilters = () => {
    setSelectedUniversities([]);
    setSelectedLocations([]);
    setSelectedDurations([]);
    setSelectedFields([]);
    setSelectedLevels([]);
    setSelectedLanguages([]);
    setSearchQuery('');
  };

  const removeFilter = (filterType: string, value: string) => {
    switch (filterType) {
      case 'university':
        setSelectedUniversities(selectedUniversities.filter(u => u !== value));
        break;
      case 'location':
        setSelectedLocations(selectedLocations.filter(l => l !== value));
        break;
      case 'duration':
        setSelectedDurations(selectedDurations.filter(d => d !== value));
        break;
      case 'field':
        setSelectedFields(selectedFields.filter(f => f !== value));
        break;
      case 'level':
        setSelectedLevels(selectedLevels.filter(l => l !== value));
        break;
      case 'language':
        setSelectedLanguages(selectedLanguages.filter(l => l !== value));
        break;
    }
  };

  const getFilterType = (value: string): string => {
    if (filterOptions.universities.includes(value)) return 'university';
    if (filterOptions.locations.includes(value)) return 'location';
    if (filterOptions.durations.includes(value)) return 'duration';
    if (filterOptions.fields.includes(value)) return 'field';
    if (filterOptions.levels.includes(value)) return 'level';
    if (filterOptions.languages.includes(value)) return 'language';
    return '';
  };

  const activeFiltersCount = selectedUniversities.length + selectedLocations.length + 
    selectedDurations.length + selectedFields.length + selectedLevels.length + selectedLanguages.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onGoBack} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Qualifications
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Course Recommendations
              </h1>
              <p className="text-gray-600">
                Found {filteredCourses.length} courses matching your qualifications
              </p>
              {/* Show qualification context */}
              {userQualifications && (
                <div className="mt-2 text-sm text-purple-600">
                  Based on your {userQualifications.maxQualification} qualifications
                  {userQualifications.zScore && (
                    <span className="ml-2">• Z-Score: {userQualifications.zScore}</span>
                  )}
                  {userQualifications.examDistrict && (
                    <span className="ml-2">• District: {userQualifications.examDistrict}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Sort Dropdown */}
            <div className="mt-4 lg:mt-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="name">Sort by Name</option>
                <option value="university">Sort by University</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search courses, universities, fields..."
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-purple-600 px-2 py-1 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-600">Active filters:</span>
              {[...selectedUniversities, ...selectedLocations, ...selectedDurations, 
                ...selectedFields, ...selectedLevels, ...selectedLanguages].map((filter, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  {filter}
                  <button
                    onClick={() => removeFilter(getFilterType(filter), filter)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* University Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">University</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.universities.map(university => (
                      <label key={university} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUniversities.includes(university)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUniversities([...selectedUniversities, university]);
                            } else {
                              setSelectedUniversities(selectedUniversities.filter(u => u !== university));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{university}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Location</h3>
                  <div className="space-y-2">
                    {filterOptions.locations.map(location => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLocations([...selectedLocations, location]);
                            } else {
                              setSelectedLocations(selectedLocations.filter(l => l !== location));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Duration</h3>
                  <div className="space-y-2">
                    {filterOptions.durations.map(duration => (
                      <label key={duration} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedDurations.includes(duration)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDurations([...selectedDurations, duration]);
                            } else {
                              setSelectedDurations(selectedDurations.filter(d => d !== duration));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{duration}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Field Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Field of Study</h3>
                  <div className="space-y-2">
                    {filterOptions.fields.map(field => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFields([...selectedFields, field]);
                            } else {
                              setSelectedFields(selectedFields.filter(f => f !== field));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Level</h3>
                  <div className="space-y-2">
                    {filterOptions.levels.map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLevels([...selectedLevels, level]);
                            } else {
                              setSelectedLevels(selectedLevels.filter(l => l !== level));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Language</h3>
                  <div className="space-y-2">
                    {filterOptions.languages.map(language => (
                      <label key={language} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLanguages([...selectedLanguages, language]);
                            } else {
                              setSelectedLanguages(selectedLanguages.filter(l => l !== language));
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="w-full text-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Course Results */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearAllFilters}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {course.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {course.degree} • Offered by {course.university}
                        </p>
                        
                        {/* Course Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{course.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <GraduationCap className="w-4 h-4" />
                            <span>{course.field}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="font-medium">{course.level}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => handleBookmark(course.id)}
                          className={`p-2 rounded-lg transition-all ${
                            course.isBookmarked 
                              ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                              : 'text-gray-400 bg-gray-50 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${course.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => window.open(course.websiteUrl, '_blank')}
                          className="p-2 text-gray-400 bg-gray-50 rounded-lg hover:text-purple-600 hover:bg-purple-50 transition-all"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Requirements */}
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Entry Requirements:</span> {course.entryRequirement}
                    </p>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleCourseClick(course.id)}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            2025 - All rights are reserved for PathFinder.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CourseResults;
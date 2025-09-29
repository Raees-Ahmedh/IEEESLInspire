// client/src/pages/SimpleSearchResults.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Search, ExternalLink, Clock, DollarSign, MapPin, BookOpen, SlidersHorizontal, X } from 'lucide-react';
import Header from '../components/Header';

interface SimpleSearchResultsProps {
  onGoBack?: () => void;
  userQualifications?: any;
}

interface Course {
  id: number;
  name: string;
  courseCode?: string;
  courseUrl?: string;
  specialisation: string[];
  description?: string;
  durationMonths?: number;
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  feeType: 'free' | 'paid';
  feeAmount?: number;
  medium: string[];
  zscore?: any;
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: string;
    dynamicFields: Array<{
      id: string;
      fieldName: string;
      fieldValue: string;
    }>;
    courseMaterials: Array<{
      id: number;
      materialType: string;
      fileName: string;
      filePath: string;
      fileType?: string;
      fileSize?: number;
    }>;
    careerPathways: Array<{
      id?: number;
      jobTitle: string;
      industry?: string;
      description?: string;
      salaryRange?: string;
    }>;
  };
  university: {
    id: number;
    name: string;
    type: 'government' | 'private' | 'semi-government';
    website?: string;
    address?: string;
  };
  faculty: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  framework?: {
    id: number;
    type: 'SLQF' | 'NVQ';
    level: number;
    qualificationCategory: string;
  };
  requirements?: {
    id: number;
    minRequirement: string;
    stream: number[];
    ruleSubjectBasket?: any;
    ruleSubjectGrades?: any;
    ruleOLGrades?: any;
  };
}

const SimpleSearchResults: React.FC<SimpleSearchResultsProps> = ({ onGoBack, userQualifications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'course' | 'job'>('course');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; type: 'course' | 'university' | 'job'; meta?: any }>>([]);
  const suggestAbortRef = useRef<AbortController | null>(null);

  // Filters
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedUniversityType, setSelectedUniversityType] = useState<string>('');
  const [selectedCourseType, setSelectedCourseType] = useState<string>('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');
  const [selectedStudyMode, setSelectedStudyMode] = useState<string>('');
  const universitiesOptions = useMemo(
    () => Array.from(new Set(courses.map(c => c.university?.name).filter(Boolean))),
    [courses]
  );
  const activeFiltersCount = selectedUniversities.length +
    (selectedUniversityType ? 1 : 0) + (selectedCourseType ? 1 : 0) + (selectedFeeType ? 1 : 0) + (selectedStudyMode ? 1 : 0);

  // Load initial courses when component mounts
  useEffect(() => {
    // Get qualifications from localStorage if not provided as prop
    const storedQualifications = localStorage.getItem('userQualifications');
    if (storedQualifications && !userQualifications) {
      const parsedQualifications = JSON.parse(storedQualifications);
      console.log('📋 Loaded qualifications from localStorage:', parsedQualifications);
    }
    handleSearch();
  }, [userQualifications]); // Re-run when userQualifications change

  const handleSearch = async () => {
    console.log('🔍 Simple search query:', searchQuery);
    
    // Get qualifications from localStorage as fallback
    const storedQualifications = localStorage.getItem('userQualifications');
    const qualificationsToUse = userQualifications || (storedQualifications ? JSON.parse(storedQualifications) : null);
    
    console.log('User Qualifications for search:', qualificationsToUse);
    console.log('User Qualifications type:', typeof qualificationsToUse);
    console.log('User Qualifications keys:', qualificationsToUse ? Object.keys(qualificationsToUse) : 'null');
    
    // Allow empty search to show all courses (paginate when truly unfiltered)
    setLoading(true);
    setError(null);
    
    try {
      // Make a single API call to get all courses
      const response = await fetch('/api/simple-search/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery || '',
          userQualifications: qualificationsToUse,
          filters: {
            universityType: selectedUniversityType || 'all',
            feeType: selectedFeeType || 'all',
            studyMode: selectedStudyMode || 'all'
          },
          pagination: { page: 1, limit: 1000 } // Request a large limit to get all courses
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Search response:', data);
      
      if (data.success) {
        const aggregated: Course[] = data.courses || [];
        console.log(`📊 Received ${aggregated.length} courses from API`);

        // Apply client-side university + courseType filters
        let filtered = selectedUniversities.length > 0
          ? aggregated.filter(c => selectedUniversities.includes(c.university?.name))
          : aggregated;
        if (selectedCourseType) {
          filtered = filtered.filter(c => (c.courseType || '').toLowerCase() === selectedCourseType.toLowerCase());
        }
        setCourses(filtered);
        console.log(`✅ Final filtered courses: ${filtered.length}`);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to search courses: ${errorMessage}`);
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  // Suggestions
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;
    const run = async () => {
      try {
        if (searchMode === 'course') {
          const resp = await fetch(`/api/simple-search/suggestions?query=${encodeURIComponent(q)}&limit=6`, { signal: controller.signal });
          const data = await resp.json();
          const list = (data.suggestions || []).map((s: any) => ({ label: s.value, type: s.type }));
          setSuggestions(list);
        } else {
          const resp = await fetch(`/api/admin/career-pathways/search?jobTitle=${encodeURIComponent(q)}`, { signal: controller.signal });
          const data = await resp.json();
          const list = (data.data || []).map((j: any) => ({ label: j.jobTitle, type: 'job' as const, meta: j }));
          setSuggestions(list);
        }
      } catch (_) {
        if (!controller.signal.aborted) setSuggestions([]);
      }
    };
    run();
  }, [searchQuery, searchMode]);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onGoBack} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Courses
          </h1>
          <p className="text-gray-600">
            Find courses that match your interests and qualifications
          </p>
        </div>

        {/* Search + Filters Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={searchMode === 'job' ? 'Search by job field (e.g., Software Engineer)' : 'Search by course or university'}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((s, idx) => (
                    <button key={idx} onClick={() => setSearchQuery(s.label)} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                      {s.label}
                      <span className="ml-2 text-xs text-gray-400">{s.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <select value={searchMode} onChange={(e) => setSearchMode(e.target.value as any)} className="px-4 py-3 border border-gray-300 rounded-lg">
                <option value="course">Search by Course name</option>
                <option value="job">Search by Job Field</option>
              </select>
            </div>
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
                <span className="bg-white text-purple-600 px-2 py-1 rounded-full text-xs font-bold">{activeFiltersCount}</span>
              )}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Top Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                <select
                  value={''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !selectedUniversities.includes(val)) {
                      setSelectedUniversities([...selectedUniversities, val]);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Universities</option>
                  {universitiesOptions.map(u => (
                    <option key={u as string} value={u as string}>{u as string}</option>
                  ))}
                </select>
                {selectedUniversities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUniversities.map(u => (
                      <span key={u} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {u}
                        <button onClick={() => setSelectedUniversities(selectedUniversities.filter(x => x !== u))} className="ml-1 text-purple-600 hover:text-purple-800">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">University Type</label>
                <select value={selectedUniversityType} onChange={(e) => setSelectedUniversityType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  <option value="government">government</option>
                  <option value="private">private</option>
                  <option value="vocational">vocational</option>
                  <option value="semi-government">semi-government</option>
                </select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal / External</label>
                <select value={selectedCourseType} onChange={(e) => setSelectedCourseType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  <option value="internal">internal</option>
                  <option value="external">external</option>
                </select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Free / Paid</label>
                <select value={selectedFeeType} onChange={(e) => setSelectedFeeType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  <option value="free">free</option>
                  <option value="paid">paid</option>
                </select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulltime / Part time</label>
                <select value={selectedStudyMode} onChange={(e) => setSelectedStudyMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  <option value="fulltime">fulltime</option>
                  <option value="parttime">parttime</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={handleSearch} className="text-sm text-purple-600 hover:text-purple-800 font-medium">Apply filters</button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

          {/* Results */}
          <div className="space-y-6">
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No courses found' : 'Enter a search term to get started'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Search for courses, universities, or fields of study'}
                </p>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>{courses.length}</strong> courses found
                    {userQualifications && (
                      <span className="ml-2">
                        • Results are ranked by eligibility match
                      </span>
                    )}
                  </p>
                </div>

                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {course.name}
                          </h3>
                          {course.eligibilityPercentage && (
                            <div className="flex items-center">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                course.eligibilityPercentage >= 80 
                                  ? 'bg-green-100 text-green-800' 
                                  : course.eligibilityPercentage >= 60 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {course.eligibilityPercentage}% Match
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {course.university.name} • {course.faculty.name}
                          {course.department && ` • ${course.department.name}`}
                        </p>
                        <p className="text-gray-700 mb-4">
                          {course.description || 'No description available'}
                        </p>
                        
                        {/* Course Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.durationMonths ? 
                              `${Math.floor(course.durationMonths / 12)} year${Math.floor(course.durationMonths / 12) !== 1 ? 's' : ''}` : 
                              'N/A'
                            }
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {course.feeType === 'free' ? 'Free' : 
                              course.feeAmount ? `LKR ${course.feeAmount.toLocaleString()}` : 'Contact for fees'
                            }
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {course.studyMode === 'fulltime' ? 'Full-time' : 'Part-time'}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {course.courseType === 'internal' ? 'Internal' : 'External'}
                          </div>
                        </div>

                        {/* Framework */}
                        {course.framework && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Framework: </span>
                            <span className="text-sm text-gray-600">
                              {course.framework.type} Level {course.framework.level} - {course.framework.qualificationCategory}
                            </span>
                          </div>
                        )}

                        {/* Specializations */}
                        {course.specialisation && course.specialisation.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Specializations: </span>
                            <span className="text-sm text-gray-600">
                              {course.specialisation.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Medium */}
                        {course.medium && course.medium.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Medium: </span>
                            <span className="text-sm text-gray-600">
                              {course.medium.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Materials Count */}
                        {course.additionalDetails?.courseMaterials && course.additionalDetails.courseMaterials.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Materials: </span>
                            <span className="text-sm text-gray-600">
                              {course.additionalDetails.courseMaterials.length} file{course.additionalDetails.courseMaterials.length !== 1 ? 's' : ''} available
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => window.location.href = `/course/${course.id}`}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium ml-4"
                      >
                        View Details
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
        </div>
      </main>
    </div>
  );
};

export default SimpleSearchResults;
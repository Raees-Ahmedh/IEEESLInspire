import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, Clock, GraduationCap, Bookmark, ExternalLink, SlidersHorizontal, X } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../hooks/redux';
import Header from '../components/Header';
import { universityService } from '../services/apiService';

interface CourseResultsProps {
  onGoBack?: () => void;
  onCourseClick?: (courseId: string) => void;
  userQualifications?: any; // New prop for user qualification data
}

interface Course {
  id: number;
  name: string;
  university: {
    id: number;
    name: string;
    type: 'government' | 'private' | 'vocational' | string;
  };
  faculty?: { id: number; name: string };
  durationMonths?: number;
  description?: string;
  studyMode?: 'fulltime' | 'parttime' | string;
  courseType?: 'internal' | 'external' | string;
  feeType?: 'free' | 'paid' | string;
  feeAmount?: number;
  medium?: string[];
  courseUrl?: string;
  eligibilityPercentage?: number;
  isBookmarked?: boolean;
}

interface FilterOptions {
  universities: string[];
  universityTypes: string[];
  courseTypes: string[];
  feeTypes: string[];
  studyModes: string[];
}

const CourseResults: React.FC<CourseResultsProps> = ({ onGoBack, onCourseClick, userQualifications }) => {
  // const dispatch = useAppDispatch();
  // const { user } = useAppSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'course' | 'job'>('course');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; type: 'course' | 'university' | 'job'; meta?: any }>>([]);
  // Suggestion loading state removed for now
  const suggestAbortRef = useRef<AbortController | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'university' | 'duration'>('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedUniversityType, setSelectedUniversityType] = useState<string>('');
  const [selectedCourseType, setSelectedCourseType] = useState<string>('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');
  const [selectedStudyMode, setSelectedStudyMode] = useState<string>('');
  const [universitiesOptions, setUniversitiesOptions] = useState<string[]>([]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const activeUserQualifications = useMemo(() => {
    if (userQualifications) return userQualifications;
    try {
      const stored = localStorage.getItem('userQualifications');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [userQualifications]);

  // Filter options
  const filterOptions: FilterOptions = {
    universities: universitiesOptions.length > 0 ? universitiesOptions : Array.from(new Set(allCourses.map(c => c.university?.name).filter(Boolean) as string[])),
    universityTypes: ['government', 'private', 'vocational'],
    courseTypes: ['internal', 'external'],
    feeTypes: ['free', 'paid'],
    studyModes: ['fulltime', 'parttime']
  };

  // Load all universities for filter options (top quick filter)
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const resp = await universityService.getAllUniversities();
        if (resp.success) {
          const list = (resp.data || []).map((u: any) => u.name).filter(Boolean);
          setUniversitiesOptions(Array.from(new Set(list)));
        }
      } catch (e) {
        // silent
      }
    };
    loadUniversities();
  }, []);

  // Fetch courses from backend simple search
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const aggregated: Course[] = [];
      let page = 1;
      // Decide whether to aggregate multiple pages: only when truly no filters/query selected
      const isUnfiltered = !searchQuery.trim() && !selectedUniversityType && !selectedFeeType && !selectedStudyMode;
      // Cap pages to avoid excessive loads
      const maxPages = isUnfiltered ? 20 : 1;
      while (page <= maxPages) {
        const body = {
          query: searchQuery,
          userQualifications: activeUserQualifications || null,
          filters: {
            universityType: selectedUniversityType || 'all',
            feeType: selectedFeeType || 'all',
            studyMode: selectedStudyMode || 'all',
          },
          pagination: { page, limit: 50 }
        };
        const resp = await fetch('/api/simple-search/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const pageCourses: Course[] = (data.courses || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          university: c.university,
          faculty: c.faculty,
          durationMonths: c.durationMonths,
          description: c.description,
          studyMode: c.studyMode,
          courseType: c.courseType,
          feeType: c.feeType,
          feeAmount: c.feeAmount,
          medium: c.medium,
          courseUrl: c.courseUrl,
          eligibilityPercentage: c.eligibilityPercentage,
        }));
        aggregated.push(...pageCourses);
        const hasNext = data?.pagination?.hasNextPage;
        if (!isUnfiltered || !hasNext) break;
        page += 1;
      }
      setAllCourses(aggregated);
      // apply client-side multi-selects
      let filtered = selectedUniversities.length > 0
        ? aggregated.filter(c => selectedUniversities.includes(c.university?.name))
        : aggregated;
      if (selectedCourseType) {
        filtered = filtered.filter(c => (c.courseType || '').toLowerCase() === selectedCourseType.toLowerCase());
      }
      setFilteredCourses(filtered);
      setUniversitiesOptions(Array.from(new Set(aggregated.map(c => c.university?.name).filter(Boolean) as string[])));
    } catch (e: any) {
      setError(e.message || 'Failed to load courses');
      setAllCourses([]);
      setFilteredCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial load: load all courses
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when backend-supported dropdown filters change
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUniversityType, selectedFeeType, selectedStudyMode]);

  // Re-apply client-side university filter when selection changes
  useEffect(() => {
    let filtered = selectedUniversities.length > 0
      ? allCourses.filter(c => selectedUniversities.includes(c.university?.name))
      : allCourses;
    if (selectedCourseType) {
      filtered = filtered.filter(c => (c.courseType || '').toLowerCase() === selectedCourseType.toLowerCase());
    }
    setFilteredCourses(filtered);
  }, [allCourses, selectedUniversities, selectedCourseType]);

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
    setSelectedUniversityType('');
    setSelectedCourseType('');
    setSelectedFeeType('');
    setSelectedStudyMode('');
    setSearchQuery('');
    fetchCourses();
  };

  const removeFilter = (filterType: string, value: string) => {
    switch (filterType) {
      case 'university':
        setSelectedUniversities(selectedUniversities.filter(u => u !== value));
        break;
    }
  };

  const getFilterType = (value: string): string => {
    if (filterOptions.universities.includes(value)) return 'university';
    return '';
  };

  const activeFiltersCount = selectedUniversities.length +
    (selectedUniversityType ? 1 : 0) + (selectedCourseType ? 1 : 0) + (selectedFeeType ? 1 : 0) + (selectedStudyMode ? 1 : 0);

  // Suggestions (courses/universities or job roles)
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
      } finally {}
    };
    run();
  }, [searchQuery, searchMode]);

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
          {/* Error Banner */}
          {error && (
            <div className="w-full mb-2">
              <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            </div>
          )}
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
                placeholder={searchMode === 'job' ? 'Search by job field (e.g., Software Engineer)' : 'Search by course or university'}
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

            {/* Search Button */}
            <button onClick={fetchCourses} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{isLoading ? 'Searching...' : 'Search'}</button>
          </div>

          {/* Top quick filters (University) */}
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
                  {filterOptions.universities.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {selectedUniversities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUniversities.map(u => (
                      <span key={u} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {u}
                        <button onClick={() => removeFilter('university', u)} className="ml-1 text-purple-600 hover:text-purple-800">
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
                  {filterOptions.universityTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal / External</label>
                <select value={selectedCourseType} onChange={(e) => setSelectedCourseType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  {filterOptions.courseTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Free / Paid</label>
                <select value={selectedFeeType} onChange={(e) => setSelectedFeeType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  {filterOptions.feeTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fulltime / Part time</label>
                <select value={selectedStudyMode} onChange={(e) => setSelectedStudyMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">All</option>
                  {filterOptions.studyModes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-600">Active filters:</span>
              {[...selectedUniversities,
                ...[selectedUniversityType ? `University Type: ${selectedUniversityType}` : ''].filter(Boolean),
                ...[selectedCourseType ? `Course Type: ${selectedCourseType}` : ''].filter(Boolean),
                ...[selectedFeeType ? `Fee: ${selectedFeeType}` : ''].filter(Boolean),
                ...[selectedStudyMode ? `Study Mode: ${selectedStudyMode}` : ''].filter(Boolean)
              ].map((filter, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  {filter}
                  <button
                    onClick={() => {
                      if (filter.startsWith('University Type:')) setSelectedUniversityType('');
                      else if (filter.startsWith('Course Type:')) setSelectedCourseType('');
                      else if (filter.startsWith('Fee:')) setSelectedFeeType('');
                      else if (filter.startsWith('Study Mode:')) setSelectedStudyMode('');
                      else removeFilter(getFilterType(filter), filter);
                    }}
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
                {/* University Type */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">University Type</h3>
                  <select value={selectedUniversityType} onChange={(e) => setSelectedUniversityType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All</option>
                    {filterOptions.universityTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* Course Type */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Internal / External</h3>
                  <select value={selectedCourseType} onChange={(e) => setSelectedCourseType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All</option>
                    {filterOptions.courseTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* Fee Type */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Free / Paid</h3>
                  <select value={selectedFeeType} onChange={(e) => setSelectedFeeType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All</option>
                    {filterOptions.feeTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* Study Mode */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Fulltime / Part time</h3>
                  <select value={selectedStudyMode} onChange={(e) => setSelectedStudyMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">All</option>
                    {filterOptions.studyModes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
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
                          <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                          {typeof course.eligibilityPercentage === 'number' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              {course.eligibilityPercentage}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">Offered by {course.university?.name}</p>
                        
                        {/* Course Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{course.durationMonths ? `${course.durationMonths} months` : 'Duration N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="font-medium capitalize">{course.courseType || 'type N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <GraduationCap className="w-4 h-4" />
                            <span className="capitalize">{course.studyMode || 'study mode N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="font-medium capitalize">{course.feeType || 'fee N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => handleBookmark(String(course.id))}
                          className={`p-2 rounded-lg transition-all ${
                            course.isBookmarked 
                              ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                              : 'text-gray-400 bg-gray-50 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${course.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => course.courseUrl && window.open(course.courseUrl, '_blank')}
                          className="p-2 text-gray-400 bg-gray-50 rounded-lg hover:text-purple-600 hover:bg-purple-50 transition-all"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Requirements */}
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => handleCourseClick(String(course.id))}
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
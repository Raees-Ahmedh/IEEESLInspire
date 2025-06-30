// client/src/pages/CourseFlowManager.tsx - Updated with Phase 2 API integration
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import FindYourDegree from './FindYourDegree';
import CourseResults from './CourseResults';
import CourseDetails from './CourseDetails';
import SimpleSearchResults from './SimpleSearchResults';

// Try to import Redux actions, fall back gracefully if not available
let searchCourses: any, fetchAllCourses: any, setSearchQuery: any, clearSearchResults: any;
let selectSearchResults: any, selectSearchLoading: any, selectSearchError: any, selectSearchQuery: any;
let selectAllCourses: any, selectAllCoursesLoading: any;

try {
  const courseSliceImports = require('../store/slices/courseSlice');
  searchCourses = courseSliceImports.searchCourses;
  fetchAllCourses = courseSliceImports.fetchAllCourses;
  setSearchQuery = courseSliceImports.setSearchQuery;
  clearSearchResults = courseSliceImports.clearSearchResults;
  selectSearchResults = courseSliceImports.selectSearchResults;
  selectSearchLoading = courseSliceImports.selectSearchLoading;
  selectSearchError = courseSliceImports.selectSearchError;
  selectSearchQuery = courseSliceImports.selectSearchQuery;
  selectAllCourses = courseSliceImports.selectAllCourses;
  selectAllCoursesLoading = courseSliceImports.selectAllCoursesLoading;
} catch (error) {
  console.log('Course slice not available yet, using fallback state');
}

interface QualificationData {
  maxQualification: 'AL' | 'OL';
  alResults?: Array<{ subject: string; grade: string }>;
  olResults?: Array<{ subject: string; grade: string }>;
  zScore?: number | null;
  examDistrict?: string | null;
}

type PageType = 'qualifications' | 'results' | 'details' | 'search-results';

interface CourseFlowManagerProps {
  onLogoClick?: () => void;
}

const CourseFlowManager: React.FC<CourseFlowManagerProps> = ({ onLogoClick }) => {
  const dispatch = useAppDispatch();
  
  // Your existing state
  const [currentPage, setCurrentPage] = useState<PageType>('qualifications');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [userQualifications, setUserQualifications] = useState<QualificationData | null>(null);

  // Phase 2: Redux state (with fallbacks)
  const [fallbackSearchResults, setFallbackSearchResults] = useState<any[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [fallbackAllCourses, setFallbackAllCourses] = useState<any[]>([]);

  // Try to use Redux selectors, fall back to local state if not available
  let searchResults: any[] = [];
  let searchLoading: boolean = false;
  let searchError: string | null = null;
  let allCourses: any[] = [];
  let allCoursesLoading: boolean = false;
  
  try {
    if (selectSearchResults) {
      searchResults = useAppSelector(selectSearchResults) || [];
      searchLoading = useAppSelector(selectSearchLoading) || false;
      searchError = useAppSelector(selectSearchError) || null;
      allCourses = useAppSelector(selectAllCourses) || [];
      allCoursesLoading = useAppSelector(selectAllCoursesLoading) || false;
    } else {
      throw new Error('Redux selectors not available');
    }
  } catch (error) {
    // Fallback to local state
    searchResults = fallbackSearchResults;
    searchLoading = fallbackLoading;
    searchError = fallbackError;
    allCourses = fallbackAllCourses;
    allCoursesLoading = false;
  }

  // Phase 2: Load all courses when component mounts
  useEffect(() => {
    if (fetchAllCourses && allCourses.length === 0) {
      try {
        dispatch(fetchAllCourses());
      } catch (error) {
        console.log('Could not fetch courses, Redux not ready');
      }
    }
  }, [dispatch, allCourses.length]);

  // Phase 2: API-powered search function
  const handleApiSearch = async (query: string) => {
    if (searchCourses) {
      try {
        dispatch(searchCourses(query));
      } catch (error) {
        console.log('Redux search not available, using fallback');
        handleFallbackSearch(query);
      }
    } else {
      handleFallbackSearch(query);
    }
  };

  // Fallback search function (mock data)
  const handleFallbackSearch = async (query: string) => {
    setFallbackLoading(true);
    setFallbackError(null);
    
    try {
      // Mock API call - replace with actual API call when ready
      const mockResults = [
        {
          id: 1,
          name: 'Computer Science',
          description: 'Bachelor of Computer Science program',
          university: { name: 'University of Colombo', type: 'government' },
          faculty: { name: 'Faculty of Science' },
          specialisation: ['Software Engineering', 'Data Science'],
          durationMonths: 48,
          studyMode: 'fulltime',
          courseType: 'internal',
          feeType: 'free',
          courseCode: 'CS-001'
        },
        {
          id: 2,
          name: 'Engineering - Computer',
          description: 'Bachelor of Engineering in Computer Engineering',
          university: { name: 'University of Moratuwa', type: 'government' },
          faculty: { name: 'Faculty of Engineering' },
          specialisation: ['Hardware Design', 'Embedded Systems'],
          durationMonths: 48,
          studyMode: 'fulltime',
          courseType: 'internal',
          feeType: 'free',
          courseCode: 'ENG-CS-001'
        },
        {
          id: 3,
          name: 'Information Technology',
          description: 'Bachelor of Information Technology',
          university: { name: 'University of Kelaniya', type: 'government' },
          faculty: { name: 'Faculty of Computing and Technology' },
          specialisation: ['Web Development', 'Database Management'],
          durationMonths: 48,
          studyMode: 'fulltime',
          courseType: 'internal',
          feeType: 'free',
          courseCode: 'IT-001'
        }
      ];
      
      // Simulate API delay and filtering
      setTimeout(() => {
        const filtered = mockResults.filter(course => 
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          course.university.name.toLowerCase().includes(query.toLowerCase())
        );
        setFallbackSearchResults(filtered);
        setFallbackLoading(false);
      }, 500);
      
    } catch (error) {
      setFallbackError('Search failed. Please try again.');
      setFallbackLoading(false);
    }
  };

  // Your existing handlers
  const handleShowOptions = (qualificationData: QualificationData) => {
    setUserQualifications(qualificationData);
    setCurrentPage('results');
  };

  const handleGoToSearch = () => {
    setCurrentPage('search-results');
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentPage('details');
  };

  const handleGoBack = () => {
    if (currentPage === 'details') {
      setCurrentPage('results');
      setSelectedCourseId(null);
    } else if (currentPage === 'results') {
      setCurrentPage('qualifications');
      setUserQualifications(null);
    } else if (currentPage === 'search-results') {
      setCurrentPage('qualifications');
      setUserQualifications(null);
    } else {
      // If we're at qualifications page and there's an onLogoClick handler
      if (onLogoClick) {
        onLogoClick();
      }
    }
  };

  const handleLogoClick = () => {
    setCurrentPage('qualifications');
    setSelectedCourseId(null);
    setUserQualifications(null);
    if (onLogoClick) {
      onLogoClick();
    }
  };

  // Phase 2: Enhanced props for child components
  const enhancedProps = {
    // API data
    searchResults,
    searchLoading,
    searchError,
    allCourses,
    allCoursesLoading,
    // API functions
    onApiSearch: handleApiSearch,
    // Redux dispatch for advanced components
    dispatch,
  };

  return (
    <div>
      {currentPage === 'qualifications' && (
        <FindYourDegree 
          onGoBack={handleGoBack}
          onShowOptions={handleShowOptions}
          onGoToSearch={handleGoToSearch}
          {...enhancedProps}
        />
      )}
      {currentPage === 'results' && (
        <CourseResults 
          onGoBack={handleGoBack}
          onCourseClick={handleCourseClick}
          userQualifications={userQualifications}
          {...enhancedProps}
        />
      )}
      {currentPage === 'details' && (
        <CourseDetails 
          onGoBack={handleGoBack}
          courseId={selectedCourseId || undefined}
          {...enhancedProps}
        />
      )}
      {currentPage === 'search-results' && (
        <SimpleSearchResults 
          onGoBack={handleGoBack}
          userQualifications={userQualifications}
          {...enhancedProps}
        />
      )}
    </div>
  );
};

export default CourseFlowManager;
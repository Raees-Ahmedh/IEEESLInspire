// client/src/pages/FindYourDegree.tsx - Updated with stream-first approach
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Info, Search, Loader, AlertCircle, ChevronDown, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  addALResult,
  setOLResults,
  setZScore,
  setExamDistrict
} from '../store/slices/userSlice';
import Header from '../components/Header';
import { useSubjects, type Stream } from '../hooks/useSubjects';
import { OLSubjectEntry, OL_CATEGORY_CONFIG } from '../types';
import type { Subject } from '../types';

interface QualificationEntry {
  id: string;
  subjectId: number;
  subject: string;
  grade: string;
}

interface PredefinedOLSubject {
  subject: string;
  grade: string;
}

interface FindYourDegreeProps {
  onGoBack?: () => void;
  onShowOptions?: (qualificationData: any) => void;
  onGoToSearch?: () => void;
}

type MaxQualification = 'AL' | 'OL' | '';

const FindYourDegree: React.FC<FindYourDegreeProps> = ({ onGoBack, onShowOptions, onGoToSearch }) => {
  const dispatch = useAppDispatch();
  const { qualifications } = useAppSelector((state) => state.user);

  // Subject management hook
  const {
    alSubjects,
    olSubjects,
    streams,
    loading: subjectsLoading,
    error: subjectsError,
    getAvailableSubjects,
    getSubjectById,
    getOLSubjectsByCategory,
    getPredefinedOLSubject,
    getSubjectsByStream,
    getStreamById,
    clearError
  } = useSubjects();

  // Maximum qualification selection
  const [maxQualification, setMaxQualification] = useState<MaxQualification>('');

  // NEW: Stream selection state
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
  const [streamSubjects, setStreamSubjects] = useState<Subject[]>([]);
  const [loadingStreamSubjects, setLoadingStreamSubjects] = useState(false);

  // AL Results (unchanged from original)
  const [alResults, setAlResults] = useState<QualificationEntry[]>([
    { id: '1', subjectId: 0, subject: '', grade: '' },
    { id: '2', subjectId: 0, subject: '', grade: '' },
    { id: '3', subjectId: 0, subject: '', grade: '' }
  ]);

  // OL Results - Structured by categories
  const [olResults, setOlResults] = useState<OLSubjectEntry[]>([
    // Religion (Required)
    { id: 'ol-religion', category: 'religion', subjectId: 0, subject: '', grade: '', isPredefined: false },
    // Language (Required)
    { id: 'ol-language', category: 'language', subjectId: 0, subject: '', grade: '', isPredefined: false },
    // Predefined subjects (Auto-populated)
    { id: 'ol-english', category: 'english', subjectId: 0, subject: 'English Language', grade: '', isPredefined: true },
    { id: 'ol-mathematics', category: 'mathematics', subjectId: 0, subject: 'Mathematics', grade: '', isPredefined: true },
    { id: 'ol-history', category: 'history', subjectId: 0, subject: 'History', grade: '', isPredefined: true },
    { id: 'ol-science', category: 'science', subjectId: 0, subject: 'Science', grade: '', isPredefined: true },
    // Selectable categories
    { id: 'ol-category1', category: 'category1', subjectId: 0, subject: '', grade: '', isPredefined: false },
    { id: 'ol-category2', category: 'category2', subjectId: 0, subject: '', grade: '', isPredefined: false },
    { id: 'ol-category3', category: 'category3', subjectId: 0, subject: '', grade: '', isPredefined: false }
  ]);

  // For predefined O/L subjects when A/L is selected
  const [predefinedOLResults, setPredefinedOLResults] = useState<PredefinedOLSubject[]>([
    { subject: 'English', grade: '' },
    { subject: 'Mathematics', grade: '' },
    { subject: 'Science', grade: '' },
    { subject: 'First Language', grade: '' }
  ]);

  const [zScore, setZScore] = useState<string>('');
  const [examDistrict, setExamDistrict] = useState<string>('');

  // Dropdown state for OL categories
  const [olDropdownStates, setOlDropdownStates] = useState<{[key: string]: boolean}>({});

  // Grade options
  const alGrades: string[] = ['A', 'B', 'C', 'S'];
  const olGrades: string[] = ['A', 'B', 'C', 'S'];

  // District options
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochhi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  // Get selected subject IDs for filtering
  const selectedALSubjectIds = useMemo(() => 
    alResults.filter(result => result.subjectId > 0).map(result => result.subjectId),
    [alResults]
  );

  const selectedOLSubjectIds = useMemo(() => 
    olResults.filter(result => result.subjectId > 0).map(result => result.subjectId),
    [olResults]
  );

  // NEW: Handle stream selection
  const handleStreamChange = async (streamId: string) => {
    const numericStreamId = parseInt(streamId);
    setSelectedStreamId(numericStreamId);
    
    // Reset AL results when stream changes
    setAlResults([
      { id: '1', subjectId: 0, subject: '', grade: '' },
      { id: '2', subjectId: 0, subject: '', grade: '' },
      { id: '3', subjectId: 0, subject: '', grade: '' }
    ]);

    if (numericStreamId > 0) {
      setLoadingStreamSubjects(true);
      try {
        const subjects = await getSubjectsByStream(numericStreamId);
        setStreamSubjects(subjects);
      } catch (error) {
        console.error('Error fetching subjects for stream:', error);
        setStreamSubjects([]);
      } finally {
        setLoadingStreamSubjects(false);
      }
    } else {
      setStreamSubjects([]);
    }
  };

  // Initialize predefined OL subjects on component mount
  useEffect(() => {
    if (olSubjects.length > 0) {
      setOlResults(prev => prev.map(entry => {
        if (entry.isPredefined) {
          // Map category to fixed code
          const codeMap: { [key: string]: string } = {
            'english': 'OL31',
            'mathematics': 'OL32',
            'history': 'OL33',
            'science': 'OL34'
          };
          
          const fixedCode = codeMap[entry.category];
          if (fixedCode) {
            const predefinedSubject = getPredefinedOLSubject(fixedCode);
            if (predefinedSubject) {
              return {
                ...entry,
                subjectId: predefinedSubject.id,
                subject: predefinedSubject.name
              };
            }
          }
        }
        return entry;
      }));
    }
  }, [olSubjects, getPredefinedOLSubject]);

  // Handle qualification type change
  const handleMaxQualificationChange = (qualification: MaxQualification) => {
    setMaxQualification(qualification);
    setSelectedStreamId(null);
    setStreamSubjects([]);
    
    // Reset results when changing qualification type
    if (qualification === 'AL') {
      setAlResults([
        { id: '1', subjectId: 0, subject: '', grade: '' },
        { id: '2', subjectId: 0, subject: '', grade: '' },
        { id: '3', subjectId: 0, subject: '', grade: '' }
      ]);
      setPredefinedOLResults([
        { subject: 'English', grade: '' },
        { subject: 'Mathematics', grade: '' },
        { subject: 'Science', grade: '' },
        { subject: 'First Language', grade: '' }
      ]);
    } else if (qualification === 'OL') {
      // Reset structured OL results
      setOlResults([
        { id: 'ol-religion', category: 'religion', subjectId: 0, subject: '', grade: '', isPredefined: false },
        { id: 'ol-language', category: 'language', subjectId: 0, subject: '', grade: '', isPredefined: false },
        { id: 'ol-english', category: 'english', subjectId: 0, subject: 'English Language', grade: '', isPredefined: true },
        { id: 'ol-mathematics', category: 'mathematics', subjectId: 0, subject: 'Mathematics', grade: '', isPredefined: true },
        { id: 'ol-history', category: 'history', subjectId: 0, subject: 'History', grade: '', isPredefined: true },
        { id: 'ol-science', category: 'science', subjectId: 0, subject: 'Science', grade: '', isPredefined: true },
        { id: 'ol-category1', category: 'category1', subjectId: 0, subject: '', grade: '', isPredefined: false },
        { id: 'ol-category2', category: 'category2', subjectId: 0, subject: '', grade: '', isPredefined: false },
        { id: 'ol-category3', category: 'category3', subjectId: 0, subject: '', grade: '', isPredefined: false }
      ]);
    }
    
    // Reset other fields
    setZScore('');
    setExamDistrict('');
  };

  // Handle AL subject change - now uses stream-filtered subjects
  const handleALSubjectChange = (index: number, subjectId: string) => {
    const selectedSubjectId = parseInt(subjectId);
    const selectedSubject = streamSubjects.find(s => s.id === selectedSubjectId);
    
    setAlResults(prev => prev.map((result, i) => 
      i === index 
        ? { 
            ...result, 
            subjectId: selectedSubjectId,
            subject: selectedSubject?.name || '',
            grade: '' // Reset grade when subject changes
          }
        : result
    ));
  };

  // Handle AL grade change
  const handleALGradeChange = (index: number, grade: string) => {
    setAlResults(prev => prev.map((result, i) => 
      i === index ? { ...result, grade } : result
    ));
  };

  // Handle OL subject change for structured categories
  const updateOlResult = (id: string, field: 'subjectId' | 'grade', value: string | number) => {
    setOlResults(prev => prev.map(result => {
      if (result.id === id) {
        if (field === 'subjectId') {
          const selectedSubject = olSubjects.find(s => s.id === Number(value));
          return {
            ...result,
            subjectId: Number(value),
            subject: selectedSubject?.name || ''
          };
        } else {
          return { ...result, [field]: String(value) };
        }
      }
      return result;
    }));
  };

  // Handle predefined OL subject grade change
  const handlePredefinedOLGradeChange = (index: number, grade: string) => {
    setPredefinedOLResults(prev => prev.map((result, i) => 
      i === index ? { ...result, grade } : result
    ));
  };

  // Utility functions for OL categories
  const getAvailableOlSubjectsForCategory = (category: keyof typeof OL_CATEGORY_CONFIG, currentId: string) => {
    const categorySubjects = getOLSubjectsByCategory(category);
    const selectedIds = olResults
      .filter(r => r.id !== currentId && r.subjectId > 0)
      .map(r => r.subjectId);
    return categorySubjects.filter(subject => !selectedIds.includes(subject.id));
  };

  const toggleOlDropdown = (id: string) => {
    setOlDropdownStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle navigation and form submission
  const handleGoToSearch = () => {
    if (!maxQualification) {
      alert('Please select your maximum qualification to continue.');
      return;
    }

    // Collect qualification data based on the selected qualification (FLEXIBLE)
    let qualificationData: any = {};

    if (maxQualification === 'AL') {
      // Collect whatever AL data is available (flexible validation)
      const availableAlResults = alResults.filter(result => result.subjectId > 0);
      
      console.log('🔍 Debug - alResults state:', alResults);
      console.log('🔍 Debug - availableAlResults:', availableAlResults);
      console.log('🔍 Debug - selectedStreamId:', selectedStreamId);
      console.log('🔍 Debug - streamSubjects:', streamSubjects);
      
      qualificationData = {
        maxQualification: 'AL',
        alResults: availableAlResults.map(result => ({
          subjectId: result.subjectId,
          subject: result.subject,
          grade: result.grade || 'C' // Default grade if not provided
        })),
        selectedStreamId: selectedStreamId, // Include selected stream ID
        zScore: zScore ? parseFloat(zScore) : null,
        examDistrict: examDistrict || null
      };

      // Show warning if very little data provided
      if (availableAlResults.length === 0) {
        if (!confirm('No A/L subjects selected. You will see all courses but with lower match accuracy. Continue?')) {
          return;
        }
      } else if (availableAlResults.length < 3) {
        if (!confirm(`Only ${availableAlResults.length} A/L subjects selected. You will see courses but with lower match accuracy. Continue?`)) {
          return;
        }
      }
    } else if (maxQualification === 'OL') {
      // Collect whatever OL data is available (flexible validation)
      const availableOlResults = olResults.filter(result => result.subjectId > 0);
      
      qualificationData = {
        maxQualification: 'OL',
        olResults: availableOlResults.map(result => ({
          subjectId: result.subjectId,
          subject: result.subject,
          grade: result.grade || 'C', // Default grade if not provided
          category: result.category,
          isPredefined: result.isPredefined
        }))
      };

      // Show warning if very little data provided
      if (availableOlResults.length === 0) {
        if (!confirm('No O/L subjects selected. You will see all courses but with lower match accuracy. Continue?')) {
          return;
        }
      } else if (availableOlResults.length < 3) {
        if (!confirm(`Only ${availableOlResults.length} O/L subjects selected. You will see courses but with lower match accuracy. Continue?`)) {
          return;
        }
      }
    }

    // Store in localStorage for persistence
    localStorage.setItem('userQualifications', JSON.stringify(qualificationData));

    if (onGoToSearch) {
      onGoToSearch();
    }
  };

  const handleShowOptions = () => {
    if (!maxQualification) {
      alert('Please select your maximum qualification to continue.');
      return;
    }

    if (maxQualification === 'AL') {
      if (!selectedStreamId) {
        alert('Please select your stream to continue.');
        return;
      }

      // Validate A/L subjects
      const validALResults = alResults.filter(result => result.subjectId > 0 && result.grade);

      if (validALResults.length === 0) {
        alert('Please add at least one A/L subject and grade to continue.');
        return;
      }

      // Get predefined O/L results
      const validOLResults = predefinedOLResults.filter(result => result.grade);

      const selectedStream = getStreamById(selectedStreamId);

      const qualificationData = {
        maxQualification: 'AL',
        selectedStream: selectedStream ? {
          streamId: selectedStream.id,
          streamName: selectedStream.name
        } : null,
        alResults: validALResults.map(result => ({
          subjectId: result.subjectId,
          subject: result.subject,
          grade: result.grade
        })),
        olResults: validOLResults,
        zScore: zScore ? parseFloat(zScore) : null,
        examDistrict: examDistrict || null
      };

      // Store in localStorage for persistence
      localStorage.setItem('userQualifications', JSON.stringify(qualificationData));

      if (onShowOptions) {
        onShowOptions(qualificationData);
      }

    } else if (maxQualification === 'OL') {
      // Validate structured O/L subjects
      const validOLResults = olResults.filter(result => result.subjectId > 0 && result.grade);

      if (validOLResults.length === 0) {
        alert('Please add at least one O/L subject and grade to continue.');
        return;
      }

      const qualificationData = {
        maxQualification: 'OL',
        olResults: validOLResults.map(result => ({
          id: result.id,
          category: result.category,
          subjectId: result.subjectId,
          subject: result.subject,
          grade: result.grade,
          isPredefined: result.isPredefined
        }))
      };

      // Store in localStorage for persistence
      localStorage.setItem('userQualifications', JSON.stringify(qualificationData));

      if (onShowOptions) {
        onShowOptions(qualificationData);
      }
    }

    // Try Redux dispatch with error handling
    try {
      if (typeof addALResult === 'function' && maxQualification === 'AL') {
        const validALResults = alResults.filter(result => result.subjectId > 0 && result.grade);
        validALResults.forEach(result => {
          dispatch(addALResult({ subject: result.subject, grade: result.grade }));
        });
      }
    } catch (error) {
      console.error('Redux dispatch error:', error);
    }
  };

  const handleClearAll = () => {
    setMaxQualification('');
    setSelectedStreamId(null);
    setStreamSubjects([]);
    setAlResults([
      { id: '1', subjectId: 0, subject: '', grade: '' },
      { id: '2', subjectId: 0, subject: '', grade: '' },
      { id: '3', subjectId: 0, subject: '', grade: '' }
    ]);
    setOlResults([
      { id: 'ol-religion', category: 'religion', subjectId: 0, subject: '', grade: '', isPredefined: false },
      { id: 'ol-language', category: 'language', subjectId: 0, subject: '', grade: '', isPredefined: false },
      { id: 'ol-english', category: 'english', subjectId: 0, subject: 'English Language', grade: '', isPredefined: true },
      { id: 'ol-mathematics', category: 'mathematics', subjectId: 0, subject: 'Mathematics', grade: '', isPredefined: true },
      { id: 'ol-history', category: 'history', subjectId: 0, subject: 'History', grade: '', isPredefined: true },
      { id: 'ol-science', category: 'science', subjectId: 0, subject: 'Science', grade: '', isPredefined: true },
      { id: 'ol-category1', category: 'category1', subjectId: 0, subject: '', grade: '', isPredefined: false },
      { id: 'ol-category2', category: 'category2', subjectId: 0, subject: '', grade: '', isPredefined: false },
      { id: 'ol-category3', category: 'category3', subjectId: 0, subject: '', grade: '', isPredefined: false }
    ]);
    setPredefinedOLResults([
      { subject: 'English', grade: '' },
      { subject: 'Mathematics', grade: '' },
      { subject: 'Science', grade: '' },
      { subject: 'First Language', grade: '' }
    ]);
    setZScore('');
    setExamDistrict('');
    clearError();
  };

  // NEW: Stream-based Subject dropdown component
  const StreamSubjectDropdown: React.FC<{
    value: number;
    onChange: (value: string) => void;
    excludeIds: number[];
    placeholder?: string;
    disabled?: boolean;
  }> = ({ value, onChange, excludeIds, placeholder = "Select subject", disabled = false }) => {
    const availableSubjects = streamSubjects.filter(subject => !excludeIds.includes(subject.id));
    
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loadingStreamSubjects || !selectedStreamId}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          disabled || loadingStreamSubjects || !selectedStreamId ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <option value="">{placeholder}</option>
        {availableSubjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name} ({subject.code})
          </option>
        ))}
      </select>
    );
  };

  // Subject dropdown component for OL subjects
  const SubjectDropdown: React.FC<{
    value: number;
    onChange: (value: string) => void;
    level: 'AL' | 'OL';
    excludeIds: number[];
    placeholder?: string;
    disabled?: boolean;
  }> = ({ value, onChange, level, excludeIds, placeholder = "Select subject", disabled = false }) => {
    const availableSubjects = getAvailableSubjects(level, excludeIds);
    
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || subjectsLoading}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          disabled || subjectsLoading ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <option value="">{placeholder}</option>
        {availableSubjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name} ({subject.code})
          </option>
        ))}
      </select>
    );
  };

  // OL Subject Row Component for structured categories
  const renderOlSubjectRow = (result: OLSubjectEntry, index: number) => {
    const categoryConfig = OL_CATEGORY_CONFIG[result.category];
    const availableSubjects = result.isPredefined 
      ? [] 
      : getAvailableOlSubjectsForCategory(result.category, result.id);

    return (
      <div key={result.id} className={`flex items-center space-x-4 mb-4 p-4 rounded-lg ${
        result.isPredefined ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
      }`}>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-sm font-medium text-gray-700">
              {categoryConfig.label}
            </label>
            {result.isPredefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Predefined
              </span>
            )}
            <span className="text-xs text-gray-500">({categoryConfig.codeRange})</span>
          </div>

          {result.isPredefined ? (
            <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-md text-gray-700">
              {result.subject}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => toggleOlDropdown(result.id)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-left flex items-center justify-between"
              >
                <span className={result.subject ? 'text-gray-900' : 'text-gray-500'}>
                  {result.subject || 'Select Subject'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  olDropdownStates[result.id] ? 'rotate-180' : ''
                }`} />
              </button>

              {olDropdownStates[result.id] && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          updateOlResult(result.id, 'subjectId', subject.id);
                          toggleOlDropdown(result.id);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        {subject.name} ({subject.code})
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No subjects available for this category
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select
            value={result.grade}
            onChange={(e) => updateOlResult(result.id, 'grade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Grade</option>
            {olGrades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Error display component
  const ErrorDisplay: React.FC = () => {
    if (!subjectsError) return null;

    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
            <p className="text-sm text-red-600 mt-1">{subjectsError}</p>
            <button
              onClick={clearError}
              className="text-sm text-red-600 underline hover:text-red-800 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading display component
  const LoadingDisplay: React.FC = () => {
    if (!subjectsLoading) return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <Loader className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
          <p className="text-sm text-blue-700">Loading data from database...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onGoBack} />
      {/* Go Back Button */}
      {onGoBack && (
        <button 
          onClick={onGoBack}
          className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors z-10 mt-32"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Degree
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tell us about your qualifications and we'll help you discover the best degree programs for your future.
          </p>
        </div>

        {/* Error and Loading States */}
        <ErrorDisplay />
        <LoadingDisplay />

        {/* Maximum Qualification Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's your maximum qualification?</h2>
          <p className="text-gray-600 mb-8">
            Select the highest level of education you have completed or are currently studying.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => handleMaxQualificationChange('AL')}
              disabled={subjectsLoading}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                maxQualification === 'AL'
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${subjectsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  maxQualification === 'AL'
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {maxQualification === 'AL' && (
                    <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">GCE Advanced Level (A/L)</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    I have completed or currently studying A/L
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleMaxQualificationChange('OL')}
              disabled={subjectsLoading}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                maxQualification === 'OL'
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${subjectsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  maxQualification === 'OL'
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {maxQualification === 'OL' && (
                    <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">GCE Ordinary Level (O/L)</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    I have only completed O/L qualifications
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* NEW: Stream Selection (Only for AL) */}
        {maxQualification === 'AL' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Stream</h2>
            <p className="text-gray-600 mb-8">
              Choose the stream that matches your A/L subject combination.
            </p>

            <div className="max-w-md">
              <select
                value={selectedStreamId || ''}
                onChange={(e) => handleStreamChange(e.target.value)}
                disabled={subjectsLoading || streams.length === 0}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  subjectsLoading || streams.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select your stream</option>
                {streams.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.name}
                  </option>
                ))}
              </select>

              {selectedStreamId && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-800 font-medium">
                      {getStreamById(selectedStreamId)?.name} selected
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Qualification-specific forms */}
        <div className="space-y-8">
          {/* AL Results Section */}
          {maxQualification === 'AL' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">GCE Advanced Level Results</h2>
              <p className="text-gray-600 mb-6">
                {selectedStreamId 
                  ? `Enter your A/L subjects and grades for ${getStreamById(selectedStreamId)?.name}` 
                  : 'Please select a stream first to see available subjects'
                }
              </p>

              {!selectedStreamId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                    <p className="text-yellow-800">
                      Please select your stream above to see the available subjects for your A/L combination.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {alResults.map((result, index) => (
                  <div key={result.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject {index + 1}
                      </label>
                      <StreamSubjectDropdown
                        value={result.subjectId}
                        onChange={(value) => handleALSubjectChange(index, value)}
                        excludeIds={selectedALSubjectIds.filter((_, i) => i !== index)}
                        placeholder="Select A/L subject"
                        disabled={!selectedStreamId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      <select
                        value={result.grade}
                        onChange={(e) => handleALGradeChange(index, e.target.value)}
                        disabled={!result.subjectId || loadingStreamSubjects}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          !result.subjectId || loadingStreamSubjects ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Select grade</option>
                        {alGrades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Predefined O/L Subjects for A/L Students */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  O/L Results (Main Subjects)
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter grades for key O/L subjects (optional but recommended)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {predefinedOLResults.map((result, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {result.subject}
                      </label>
                      <select
                        value={result.grade}
                        onChange={(e) => handlePredefinedOLGradeChange(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select grade</option>
                        {olGrades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* O/L Results Section with Structured Categories */}
          {maxQualification === 'OL' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">GCE Ordinary Level Results</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">O/L Subject Categories:</p>
                    <p>Four subjects (English, Mathematics, History, Science) are predefined and required. 
                    Five other subjects must be selected from specific categories according to O/L curriculum structure.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {olResults.map((result, index) => renderOlSubjectRow(result, index))}
              </div>
            </div>
          )}

          {/* Z-Score Section (Only for A/L) */}
          {maxQualification === 'AL' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Z-Score</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Optional
                </span>
              </div>

              <p className="text-gray-600 mb-6">Enter your Z-Score if available</p>

              <div className="max-w-xs">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="3"
                  value={zScore}
                  onChange={(e) => setZScore(e.target.value)}
                  placeholder="e.g., 1.5432"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  Z-Score typically ranges from 0 to 3
                </p>
              </div>
            </div>
          )}

          {/* Exam District Section (Only for A/L) */}
          {maxQualification === 'AL' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Exam District</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Optional
                </span>
              </div>

              <p className="text-gray-600 mb-6">Select the district where you sat for your A/L examination</p>

              <div className="max-w-sm">
                <select
                  value={examDistrict}
                  onChange={(e) => setExamDistrict(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select district</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Show only if qualification is selected */}
        {maxQualification && (
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>

            <div className="flex gap-4">
              <button
                onClick={handleGoToSearch}
                disabled={subjectsLoading}
                className={`flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl ${
                  subjectsLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {subjectsLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Search Courses
                    <Search className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
              
              
            </div>
          </div>
        )}

        {/* Data Loading Summary */}
        {!subjectsLoading && !subjectsError && alSubjects.length > 0 && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700">
              <Info className="w-5 h-5 mr-2" />
              <span className="text-sm">
                Successfully loaded {alSubjects.length} A/L subjects, {olSubjects.length} O/L subjects, and {streams.length} streams from database
              </span>
            </div>
          </div>
        )}
      </main>

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

export default FindYourDegree;
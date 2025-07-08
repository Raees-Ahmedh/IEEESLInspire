// client/src/hooks/useSubjects.ts - Updated with stream-based filtering
import { useState, useEffect, useCallback, useMemo } from 'react';
import { subjectService } from '../services/apiService';
import type { Subject, OLSubjectCategories } from '../types';

export interface Stream {
  id: number;
  name: string;
  description?: string;
}

interface UseSubjectsState {
  alSubjects: Subject[];
  olSubjects: Subject[];
  streams: Stream[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface UseSubjectsReturn extends UseSubjectsState {
  // Core functions
  fetchALSubjects: () => Promise<void>;
  fetchOLSubjects: () => Promise<void>;
  fetchAllSubjects: () => Promise<void>;
  fetchStreams: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Utility functions
  getSubjectById: (id: number, level?: 'AL' | 'OL') => Subject | undefined;
  getSubjectByName: (name: string, level?: 'AL' | 'OL') => Subject | undefined;
  getAvailableSubjects: (level: 'AL' | 'OL', excludeIds: number[]) => Subject[];
  
  // NEW: Stream-based functions
  getSubjectsByStream: (streamId: number) => Promise<Subject[]>;
  getStreamById: (streamId: number) => Stream | undefined;
  
  // OL Category Functions
  getOLSubjectsByCodeRange: (startCode: string, endCode: string) => Subject[];
  getOLSubjectsByCategory: (category: keyof OLSubjectCategories) => Subject[];
  getOLCategorizedSubjects: () => OLSubjectCategories;
  getPredefinedOLSubject: (code: string) => Subject | undefined;
  
  // Validation
  isSubjectSelected: (subjectId: number, selectedIds: number[]) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSubjects = (): UseSubjectsReturn => {
  const [state, setState] = useState<UseSubjectsState>({
    alSubjects: [],
    olSubjects: [],
    streams: [],
    loading: false,
    error: null,
    lastFetched: null
  });

  // Check if cache is still valid
  const isCacheValid = useMemo(() => {
    if (!state.lastFetched) return false;
    return Date.now() - state.lastFetched.getTime() < CACHE_DURATION;
  }, [state.lastFetched]);

  // Fetch AL subjects
  const fetchALSubjects = useCallback(async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await subjectService.getALSubjects();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          alSubjects: response.data,
          loading: false,
          lastFetched: new Date()
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch AL subjects');
      }
    } catch (error) {
      console.error('Error fetching AL subjects:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch AL subjects'
      }));
    }
  }, [state.loading]);

  // Fetch OL subjects
  const fetchOLSubjects = useCallback(async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await subjectService.getOLSubjects();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          olSubjects: response.data,
          loading: false,
          lastFetched: new Date()
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch OL subjects');
      }
    } catch (error) {
      console.error('Error fetching OL subjects:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch OL subjects'
      }));
    }
  }, [state.loading]);

  // NEW: Fetch streams
  const fetchStreams = useCallback(async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/streams');
      const data = await response.json();
      
      if (data.success && data.data) {
        setState(prev => ({
          ...prev,
          streams: data.data,
          loading: false,
          lastFetched: new Date()
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch streams');
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch streams'
      }));
    }
  }, [state.loading]);

  // Fetch all subjects and streams
  const fetchAllSubjects = useCallback(async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [alResponse, olResponse, streamsResponse] = await Promise.all([
        subjectService.getALSubjects(),
        subjectService.getOLSubjects(),
        fetch('/api/streams').then(res => res.json())
      ]);
      
      if (alResponse.success && olResponse.success && streamsResponse.success) {
        setState(prev => ({
          ...prev,
          alSubjects: alResponse.data || [],
          olSubjects: olResponse.data || [],
          streams: streamsResponse.data || [],
          loading: false,
          lastFetched: new Date()
        }));
      } else {
        const errorMessage = alResponse.error || olResponse.error || streamsResponse.error || 'Failed to fetch data';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching all data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  }, [state.loading]);

  // NEW: Get subjects by stream
  const getSubjectsByStream = useCallback(async (streamId: number): Promise<Subject[]> => {
    try {
      const response = await fetch(`/api/streams/${streamId}/subjects`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch subjects for stream');
      }
    } catch (error) {
      console.error('Error fetching subjects by stream:', error);
      throw error;
    }
  }, []);

  // NEW: Get stream by ID
  const getStreamById = useCallback((streamId: number): Stream | undefined => {
    return state.streams.find(stream => stream.id === streamId);
  }, [state.streams]);

  // Refetch (force refresh)
  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, lastFetched: null }));
    await fetchAllSubjects();
  }, [fetchAllSubjects]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get subject by ID
  const getSubjectById = useCallback((id: number, level?: 'AL' | 'OL'): Subject | undefined => {
    if (level === 'AL') {
      return state.alSubjects.find(subject => subject.id === id);
    } else if (level === 'OL') {
      return state.olSubjects.find(subject => subject.id === id);
    } else {
      // Search both levels
      return state.alSubjects.find(subject => subject.id === id) ||
             state.olSubjects.find(subject => subject.id === id);
    }
  }, [state.alSubjects, state.olSubjects]);

  // Get subject by name
  const getSubjectByName = useCallback((name: string, level?: 'AL' | 'OL'): Subject | undefined => {
    const normalizedName = name.toLowerCase().trim();
    
    if (level === 'AL') {
      return state.alSubjects.find(subject => 
        subject.name.toLowerCase().trim() === normalizedName
      );
    } else if (level === 'OL') {
      return state.olSubjects.find(subject => 
        subject.name.toLowerCase().trim() === normalizedName
      );
    } else {
      // Search both levels
      return state.alSubjects.find(subject => 
        subject.name.toLowerCase().trim() === normalizedName
      ) || state.olSubjects.find(subject => 
        subject.name.toLowerCase().trim() === normalizedName
      );
    }
  }, [state.alSubjects, state.olSubjects]);

  // Get available subjects (excluding already selected ones)
  const getAvailableSubjects = useCallback((level: 'AL' | 'OL', excludeIds: number[]): Subject[] => {
    const subjects = level === 'AL' ? state.alSubjects : state.olSubjects;
    return subjects.filter(subject => !excludeIds.includes(subject.id));
  }, [state.alSubjects, state.olSubjects]);

  // Get OL subjects by code range
  const getOLSubjectsByCodeRange = useCallback((startCode: string, endCode: string): Subject[] => {
    return state.olSubjects.filter(subject => {
      const code = subject.code;
      return code >= startCode && code <= endCode;
    });
  }, [state.olSubjects]);

  // Get OL subjects by category
  const getOLSubjectsByCategory = useCallback((category: keyof OLSubjectCategories): Subject[] => {
    const categoryRanges = {
      religion: { start: 'OL11', end: 'OL16' },
      language: { start: 'OL21', end: 'OL22' },
      english: { start: 'OL31', end: 'OL31' },
      mathematics: { start: 'OL32', end: 'OL32' },
      history: { start: 'OL33', end: 'OL33' },
      science: { start: 'OL34', end: 'OL34' },
      category1: { start: 'OL60', end: 'OL75' },
      category2: { start: 'OL40', end: 'OL52' },
      category3: { start: 'OL80', end: 'OL94' }
    };

    const range = categoryRanges[category];
    if (!range) return [];

    return getOLSubjectsByCodeRange(range.start, range.end);
  }, [getOLSubjectsByCodeRange]);

  // Get all OL subjects organized by categories
  const getOLCategorizedSubjects = useCallback((): OLSubjectCategories => {
    return {
      religion: {
        codeRange: 'OL11-OL16',
        subjects: getOLSubjectsByCategory('religion')
      },
      language: {
        codeRange: 'OL21-OL22',
        subjects: getOLSubjectsByCategory('language')
      },
      english: {
        codeRange: 'OL31',
        subjects: getOLSubjectsByCategory('english')
      },
      mathematics: {
        codeRange: 'OL32',
        subjects: getOLSubjectsByCategory('mathematics')
      },
      history: {
        codeRange: 'OL33',
        subjects: getOLSubjectsByCategory('history')
      },
      science: {
        codeRange: 'OL34',
        subjects: getOLSubjectsByCategory('science')
      },
      category1: {
        codeRange: 'OL60-OL75',
        subjects: getOLSubjectsByCategory('category1')
      },
      category2: {
        codeRange: 'OL40-OL52',
        subjects: getOLSubjectsByCategory('category2')
      },
      category3: {
        codeRange: 'OL80-OL94',
        subjects: getOLSubjectsByCategory('category3')
      }
    };
  }, [getOLSubjectsByCategory]);

  // Get predefined OL subject by code
  const getPredefinedOLSubject = useCallback((code: string): Subject | undefined => {
    return state.olSubjects.find(subject => subject.code === code);
  }, [state.olSubjects]);

  // Check if subject is selected
  const isSubjectSelected = useCallback((subjectId: number, selectedIds: number[]): boolean => {
    return selectedIds.includes(subjectId);
  }, []);

  // Auto-fetch on mount if cache is invalid
  useEffect(() => {
    if (!isCacheValid && state.alSubjects.length === 0 && state.olSubjects.length === 0) {
      fetchAllSubjects();
    }
  }, [isCacheValid, state.alSubjects.length, state.olSubjects.length, fetchAllSubjects]);

  return {
    ...state,
    fetchALSubjects,
    fetchOLSubjects,
    fetchAllSubjects,
    fetchStreams,
    refetch,
    clearError,
    getSubjectById,
    getSubjectByName,
    getAvailableSubjects,
    getSubjectsByStream,
    getStreamById,
    getOLSubjectsByCodeRange,
    getOLSubjectsByCategory,
    getOLCategorizedSubjects,
    getPredefinedOLSubject,
    isSubjectSelected
  };
};

// Export types
export type { UseSubjectsReturn };
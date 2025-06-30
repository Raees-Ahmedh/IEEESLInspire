// client/src/hooks/useSubjects.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { subjectService } from '../services/apiService';
import type { Subject } from '../types';

interface UseSubjectsState {
  alSubjects: Subject[];
  olSubjects: Subject[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface UseSubjectsReturn extends UseSubjectsState {
  // Core functions
  fetchALSubjects: () => Promise<void>;
  fetchOLSubjects: () => Promise<void>;
  fetchAllSubjects: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Utility functions
  getSubjectById: (id: number, level?: 'AL' | 'OL') => Subject | undefined;
  getSubjectByName: (name: string, level?: 'AL' | 'OL') => Subject | undefined;
  getAvailableSubjects: (level: 'AL' | 'OL', excludeIds: number[]) => Subject[];
  
  // Validation
  isSubjectSelected: (subjectId: number, selectedIds: number[]) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSubjects = (): UseSubjectsReturn => {
  const [state, setState] = useState<UseSubjectsState>({
    alSubjects: [],
    olSubjects: [],
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

  // Fetch all subjects
  const fetchAllSubjects = useCallback(async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [alResponse, olResponse] = await Promise.all([
        subjectService.getALSubjects(),
        subjectService.getOLSubjects()
      ]);
      
      if (alResponse.success && olResponse.success) {
        setState(prev => ({
          ...prev,
          alSubjects: alResponse.data || [],
          olSubjects: olResponse.data || [],
          loading: false,
          lastFetched: new Date()
        }));
      } else {
        const errorMessage = alResponse.error || olResponse.error || 'Failed to fetch subjects';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching all subjects:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subjects'
      }));
    }
  }, [state.loading]);

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
    refetch,
    clearError,
    getSubjectById,
    getSubjectByName,
    getAvailableSubjects,
    isSubjectSelected
  };
};
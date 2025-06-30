// client/src/store/slices/subjectSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subjectService } from '../../services/apiService';
import type { Subject, SubjectState } from '../../types';
import type { RootState } from '../index';

// Async thunks for API calls
export const fetchALSubjects = createAsyncThunk(
  'subjects/fetchALSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectService.getALSubjects();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch AL subjects');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch AL subjects');
    }
  }
);

export const fetchOLSubjects = createAsyncThunk(
  'subjects/fetchOLSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectService.getOLSubjects();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch OL subjects');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch OL subjects');
    }
  }
);

export const fetchAllSubjects = createAsyncThunk(
  'subjects/fetchAllSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const [alResponse, olResponse] = await Promise.all([
        subjectService.getALSubjects(),
        subjectService.getOLSubjects()
      ]);
      
      if (alResponse.success && olResponse.success) {
        return {
          alSubjects: alResponse.data || [],
          olSubjects: olResponse.data || []
        };
      } else {
        const errorMessage = alResponse.error || olResponse.error || 'Failed to fetch subjects';
        return rejectWithValue(errorMessage);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subjects');
    }
  }
);

// Initial state
const initialState: SubjectState = {
  alSubjects: [],
  olSubjects: [],
  loading: false,
  error: null,
  lastFetched: null
};

// Create slice
const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear all subjects (for logout or refresh)
    clearSubjects: (state) => {
      state.alSubjects = [];
      state.olSubjects = [];
      state.lastFetched = null;
      state.error = null;
    },
    
    // Set last fetched time
    setLastFetched: (state) => {
      state.lastFetched = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    // Fetch AL Subjects
    builder
      .addCase(fetchALSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchALSubjects.fulfilled, (state, action: PayloadAction<Subject[]>) => {
        state.loading = false;
        state.alSubjects = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchALSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch OL Subjects
    builder
      .addCase(fetchOLSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOLSubjects.fulfilled, (state, action: PayloadAction<Subject[]>) => {
        state.loading = false;
        state.olSubjects = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchOLSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch All Subjects
    builder
      .addCase(fetchAllSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubjects.fulfilled, (state, action: PayloadAction<{alSubjects: Subject[], olSubjects: Subject[]}>) => {
        state.loading = false;
        state.alSubjects = action.payload.alSubjects;
        state.olSubjects = action.payload.olSubjects;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchAllSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { clearError, clearSubjects, setLastFetched } = subjectSlice.actions;

// Selectors
export const selectALSubjects = (state: RootState) => state.subjects.alSubjects;
export const selectOLSubjects = (state: RootState) => state.subjects.olSubjects;
export const selectSubjectsLoading = (state: RootState) => state.subjects.loading;
export const selectSubjectsError = (state: RootState) => state.subjects.error;
export const selectSubjectsLastFetched = (state: RootState) => state.subjects.lastFetched;

// Utility selectors
export const selectSubjectById = (id: number) => (state: RootState): Subject | undefined => {
  return [...state.subjects.alSubjects, ...state.subjects.olSubjects]
    .find(subject => subject.id === id);
};

export const selectSubjectByName = (name: string, level?: 'AL' | 'OL') => (state: RootState): Subject | undefined => {
  const normalizedName = name.toLowerCase().trim();
  
  if (level === 'AL') {
    return state.subjects.alSubjects.find(subject => 
      subject.name.toLowerCase().trim() === normalizedName
    );
  } else if (level === 'OL') {
    return state.subjects.olSubjects.find(subject => 
      subject.name.toLowerCase().trim() === normalizedName
    );
  } else {
    return [...state.subjects.alSubjects, ...state.subjects.olSubjects]
      .find(subject => subject.name.toLowerCase().trim() === normalizedName);
  }
};

export const selectAvailableSubjects = (level: 'AL' | 'OL', excludeIds: number[]) => (state: RootState): Subject[] => {
  const subjects = level === 'AL' ? state.subjects.alSubjects : state.subjects.olSubjects;
  return subjects.filter(subject => !excludeIds.includes(subject.id));
};

// Check if cache is valid (5 minutes)
export const selectIsCacheValid = (state: RootState): boolean => {
  if (!state.subjects.lastFetched) return false;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  return Date.now() - new Date(state.subjects.lastFetched).getTime() < CACHE_DURATION;
};

// Export reducer
export default subjectSlice.reducer;
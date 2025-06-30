// client/src/store/slices/courseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { courseService, savedCoursesService, Course, SavedCourse, ApiResponse } from '../../services/apiService';

// Define the state interface
interface CourseState {
  // Search related
  searchResults: Course[];
  searchQuery: string;
  searchLoading: boolean;
  searchError: string | null;
  
  // All courses
  allCourses: Course[];
  allCoursesLoading: boolean;
  allCoursesError: string | null;
  
  // Selected course
  selectedCourse: Course | null;
  selectedCourseLoading: boolean;
  selectedCourseError: string | null;
  
  // Saved courses
  savedCourses: SavedCourse[];
  savedCoursesLoading: boolean;
  savedCoursesError: string | null;
  
  // Filters and pagination
  filters: {
    university: string[];
    faculty: string[];
    studyMode: string[];
    feeType: string[];
    duration: string[];
  };
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

// Initial state
const initialState: CourseState = {
  searchResults: [],
  searchQuery: '',
  searchLoading: false,
  searchError: null,
  
  allCourses: [],
  allCoursesLoading: false,
  allCoursesError: null,
  
  selectedCourse: null,
  selectedCourseLoading: false,
  selectedCourseError: null,
  
  savedCourses: [],
  savedCoursesLoading: false,
  savedCoursesError: null,
  
  filters: {
    university: [],
    faculty: [],
    studyMode: [],
    feeType: [],
    duration: []
  },
  currentPage: 1,
  totalPages: 1,
  totalResults: 0
};

// Async thunks for API calls
export const searchCourses = createAsyncThunk(
  'courses/search',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await courseService.searchCourses(query);
      
      if (response.success && response.courses) {
        return {
          courses: response.courses,
          total: response.total || response.courses.length
        };
      } else {
        return rejectWithValue(response.error || 'Search failed');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const fetchAllCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getAllCourses();
      
      if (response.success && (response.data || response.courses)) {
        const courses = response.data || response.courses || [];
        return {
          courses: courses,
          total: response.count || courses.length
        };
      } else {
        return rejectWithValue(response.error || 'Failed to fetch courses');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseById(courseId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Course not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Saved courses thunks
export const fetchSavedCourses = createAsyncThunk(
  'courses/fetchSavedCourses',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await savedCoursesService.getSavedCourses(userId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch saved courses');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const toggleCourseBookmark = createAsyncThunk(
  'courses/toggleBookmark',
  async ({ userId, courseId }: { userId: number; courseId: number }, { rejectWithValue }) => {
    try {
      const response = await savedCoursesService.toggleBookmark(userId, courseId);
      
      if (response.success) {
        return { userId, courseId, action: response.action, data: response.data };
      } else {
        return rejectWithValue(response.error || 'Failed to toggle bookmark');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const removeSavedCourse = createAsyncThunk(
  'courses/removeSavedCourse',
  async (bookmarkId: number, { rejectWithValue }) => {
    try {
      const response = await savedCoursesService.deleteBookmark(bookmarkId);
      
      if (response.success) {
        return bookmarkId;
      } else {
        return rejectWithValue(response.error || 'Failed to remove saved course');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Create the slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    // Search actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchError = null;
    },
    
    // Filter actions
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Selected course actions
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
      state.selectedCourseError = null;
    },
    
    // General actions
    clearErrors: (state) => {
      state.searchError = null;
      state.allCoursesError = null;
      state.selectedCourseError = null;
      state.savedCoursesError = null;
    }
  },
  extraReducers: (builder) => {
    // Search courses
    builder
      .addCase(searchCourses.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.courses;
        state.totalResults = action.payload.total;
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
        state.searchResults = [];
      });

    // Fetch all courses
    builder
      .addCase(fetchAllCourses.pending, (state) => {
        state.allCoursesLoading = true;
        state.allCoursesError = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.allCoursesLoading = false;
        state.allCourses = action.payload.courses;
        state.totalResults = action.payload.total;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.allCoursesLoading = false;
        state.allCoursesError = action.payload as string;
        state.allCourses = [];
      });

    // Fetch course by ID
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.selectedCourseLoading = true;
        state.selectedCourseError = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selectedCourseLoading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.selectedCourseLoading = false;
        state.selectedCourseError = action.payload as string;
        state.selectedCourse = null;
      });

    // Fetch saved courses
    builder
      .addCase(fetchSavedCourses.pending, (state) => {
        state.savedCoursesLoading = true;
        state.savedCoursesError = null;
      })
      .addCase(fetchSavedCourses.fulfilled, (state, action) => {
        state.savedCoursesLoading = false;
        state.savedCourses = action.payload;
      })
      .addCase(fetchSavedCourses.rejected, (state, action) => {
        state.savedCoursesLoading = false;
        state.savedCoursesError = action.payload as string;
        state.savedCourses = [];
      });

    // Toggle bookmark
    builder
      .addCase(toggleCourseBookmark.pending, (state) => {
        // Could add loading state for specific course if needed
      })
      .addCase(toggleCourseBookmark.fulfilled, (state, action) => {
        const { action: bookmarkAction, data } = action.payload;
        if (bookmarkAction === 'added' && data) {
          state.savedCourses.push(data);
        } else if (bookmarkAction === 'removed') {
          state.savedCourses = state.savedCourses.filter(
            course => course.courseId !== action.payload.courseId
          );
        }
      })
      .addCase(toggleCourseBookmark.rejected, (state, action) => {
        state.savedCoursesError = action.payload as string;
      });

    // Remove saved course
    builder
      .addCase(removeSavedCourse.pending, (state) => {
        // Could add loading state if needed
      })
      .addCase(removeSavedCourse.fulfilled, (state, action) => {
        state.savedCourses = state.savedCourses.filter(
          course => course.id !== action.payload
        );
      })
      .addCase(removeSavedCourse.rejected, (state, action) => {
        state.savedCoursesError = action.payload as string;
      });
  }
});

// Export actions
export const {
  setSearchQuery,
  clearSearchResults,
  updateFilters,
  clearFilters,
  setCurrentPage,
  clearSelectedCourse,
  clearErrors
} = courseSlice.actions;

// Selectors
export const selectSearchResults = (state: { courses: CourseState }) => state.courses.searchResults;
export const selectSearchLoading = (state: { courses: CourseState }) => state.courses.searchLoading;
export const selectSearchError = (state: { courses: CourseState }) => state.courses.searchError;
export const selectSearchQuery = (state: { courses: CourseState }) => state.courses.searchQuery;

export const selectAllCourses = (state: { courses: CourseState }) => state.courses.allCourses;
export const selectAllCoursesLoading = (state: { courses: CourseState }) => state.courses.allCoursesLoading;
export const selectAllCoursesError = (state: { courses: CourseState }) => state.courses.allCoursesError;

export const selectSelectedCourse = (state: { courses: CourseState }) => state.courses.selectedCourse;
export const selectSelectedCourseLoading = (state: { courses: CourseState }) => state.courses.selectedCourseLoading;
export const selectSelectedCourseError = (state: { courses: CourseState }) => state.courses.selectedCourseError;

export const selectSavedCourses = (state: { courses: CourseState }) => state.courses.savedCourses;
export const selectSavedCoursesLoading = (state: { courses: CourseState }) => state.courses.savedCoursesLoading;
export const selectSavedCoursesError = (state: { courses: CourseState }) => state.courses.savedCoursesError;

export const selectFilters = (state: { courses: CourseState }) => state.courses.filters;
export const selectCurrentPage = (state: { courses: CourseState }) => state.courses.currentPage;
export const selectTotalResults = (state: { courses: CourseState }) => state.courses.totalResults;

// Export the reducer
export default courseSlice.reducer;
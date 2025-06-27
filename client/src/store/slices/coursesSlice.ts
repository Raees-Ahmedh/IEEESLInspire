import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '../../types';

// Enhanced interfaces for saved courses
interface SavedCourse {
  id: number;
  courseId: number;
  notes?: string;
  course: {
    id: number;
    name: string;
    specialisation: string[];
    courseCode?: string;
    courseUrl: string;
    durationMonths?: number;
    description?: string;
    studyMode: string;
    courseType: string;
    feeType: string;
    feeAmount?: number;
    university: {
      id: number;
      name: string;
      type: string;
    };
    faculty: {
      id: number;
      name: string;
    };
  };
}

interface BookmarkToggleResponse {
  success: boolean;
  action: 'added' | 'removed';
  data: SavedCourse | null;
}

interface CoursesState {
  courses: Course[];
  savedCourses: SavedCourse[];
  loading: boolean;
  savedCoursesLoading: boolean;
  bookmarkLoading: { [courseId: number]: boolean };
  error: string | null;
  savedCoursesError: string | null;
  filteredCourses: Course[];
}

// API Base URL - Fixed to use import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Async Thunks for API calls

// Fetch saved courses for a user
export const fetchSavedCourses = createAsyncThunk(
  'courses/fetchSavedCourses',
  async (userId: string | number, { rejectWithValue }) => {
    try {
      // Convert to number if string
      const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
      
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/saved-courses/${numericUserId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved courses');
      }
      
      return data.data as SavedCourse[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch saved courses');
    }
  }
);

// Toggle bookmark status
export const toggleCourseBookmark = createAsyncThunk(
  'courses/toggleBookmark',
  async ({ courseId, userId, notes }: { courseId: number; userId: string | number; notes?: string }, { rejectWithValue }) => {
    try {
      // Convert to number if string
      const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
      
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/saved-courses/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId: numericUserId, notes }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle bookmark');
      }
      
      return data as BookmarkToggleResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle bookmark');
    }
  }
);

// Update bookmark notes
export const updateBookmarkNotes = createAsyncThunk(
  'courses/updateBookmarkNotes',
  async ({ bookmarkId, notes }: { bookmarkId: number; notes: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/saved-courses/${bookmarkId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notes');
      }
      
      return data.data as SavedCourse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update notes');
    }
  }
);

// Remove saved course
export const removeSavedCourse = createAsyncThunk(
  'courses/removeSavedCourse',
  async (bookmarkId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/saved-courses/${bookmarkId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove saved course');
      }
      
      return bookmarkId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove saved course');
    }
  }
);

// Check if course is bookmarked
export const checkBookmarkStatus = createAsyncThunk(
  'courses/checkBookmarkStatus',
  async ({ userId, courseId }: { userId: string | number; courseId: number }, { rejectWithValue }) => {
    try {
      // Convert to number if string
      const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
      
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/saved-courses/check/${numericUserId}/${courseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check bookmark status');
      }
      
      return {
        courseId,
        isBookmarked: data.isBookmarked,
        bookmarkId: data.bookmarkId
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check bookmark status');
    }
  }
);

const initialState: CoursesState = {
  courses: [
    {
      id: 1,
      name: "Computer Science",
      university: "University of Colombo",
      duration: "4 years",
      requirements: ["Mathematics A", "Physics B", "Chemistry C"],
      description: "Comprehensive computer science program covering software engineering, algorithms, and data structures.",
      category: "Technology"
    },
    {
      id: 2,
      name: "Medicine",
      university: "University of Peradeniya",
      duration: "5 years",
      requirements: ["Biology A", "Chemistry A", "Physics B"],
      description: "Medical degree program preparing students for careers in healthcare and medical research.",
      category: "Medicine"
    },
    {
      id: 3,
      name: "Engineering",
      university: "University of Moratuwa",
      duration: "4 years",
      requirements: ["Mathematics A", "Physics A", "Chemistry B"],
      description: "Engineering program with specializations in civil, mechanical, and electrical engineering.",
      category: "Engineering"
    }
  ],
  savedCourses: [],
  loading: false,
  savedCoursesLoading: false,
  bookmarkLoading: {},
  error: null,
  savedCoursesError: null,
  filteredCourses: [],
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSavedCoursesError: (state, action: PayloadAction<string | null>) => {
      state.savedCoursesError = action.payload;
    },
    setFilteredCourses: (state, action: PayloadAction<Course[]>) => {
      state.filteredCourses = action.payload;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
    },
    clearSavedCourses: (state) => {
      state.savedCourses = [];
      state.savedCoursesError = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.savedCoursesError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch saved courses
    builder
      .addCase(fetchSavedCourses.pending, (state) => {
        state.savedCoursesLoading = true;
        state.savedCoursesError = null;
      })
      .addCase(fetchSavedCourses.fulfilled, (state, action) => {
        state.savedCoursesLoading = false;
        state.savedCourses = action.payload;
        state.savedCoursesError = null;
      })
      .addCase(fetchSavedCourses.rejected, (state, action) => {
        state.savedCoursesLoading = false;
        state.savedCoursesError = action.payload as string;
      })

    // Toggle bookmark
    builder
      .addCase(toggleCourseBookmark.pending, (state, action) => {
        const courseId = action.meta.arg.courseId;
        state.bookmarkLoading[courseId] = true;
      })
      .addCase(toggleCourseBookmark.fulfilled, (state, action) => {
        const { courseId } = action.meta.arg;
        const response = action.payload;
        
        state.bookmarkLoading[courseId] = false;
        
        if (response.action === 'added' && response.data) {
          // Add to saved courses
          state.savedCourses.push(response.data);
        } else if (response.action === 'removed') {
          // Remove from saved courses
          state.savedCourses = state.savedCourses.filter(
            savedCourse => savedCourse.courseId !== courseId
          );
        }
      })
      .addCase(toggleCourseBookmark.rejected, (state, action) => {
        const courseId = action.meta.arg.courseId;
        state.bookmarkLoading[courseId] = false;
        state.savedCoursesError = action.payload as string;
      })

    // Update bookmark notes
    builder
      .addCase(updateBookmarkNotes.pending, (state) => {
        // Could add specific loading state if needed
      })
      .addCase(updateBookmarkNotes.fulfilled, (state, action) => {
        const updatedBookmark = action.payload;
        const index = state.savedCourses.findIndex(
          savedCourse => savedCourse.id === updatedBookmark.id
        );
        
        if (index !== -1) {
          state.savedCourses[index] = updatedBookmark;
        }
      })
      .addCase(updateBookmarkNotes.rejected, (state, action) => {
        state.savedCoursesError = action.payload as string;
      })

    // Remove saved course
    builder
      .addCase(removeSavedCourse.pending, (state) => {
        // Could add specific loading state if needed
      })
      .addCase(removeSavedCourse.fulfilled, (state, action) => {
        const removedBookmarkId = action.payload;
        state.savedCourses = state.savedCourses.filter(
          savedCourse => savedCourse.id !== removedBookmarkId
        );
      })
      .addCase(removeSavedCourse.rejected, (state, action) => {
        state.savedCoursesError = action.payload as string;
      })

    // Check bookmark status
    builder
      .addCase(checkBookmarkStatus.pending, (state) => {
        // Optional: add loading state
      })
      .addCase(checkBookmarkStatus.fulfilled, (state, action) => {
        // This could be used to update UI state for bookmark indicators
        // Implementation depends on your specific UI needs
      })
      .addCase(checkBookmarkStatus.rejected, (state, action) => {
        // Handle error if needed
      });
  },
});

export const {
  setLoading,
  setError,
  setSavedCoursesError,
  setFilteredCourses,
  addCourse,
  clearSavedCourses,
  clearErrors,
} = coursesSlice.actions;

export default coursesSlice.reducer;

// Export types for use in components
export type { SavedCourse, CoursesState };
// client/src/services/savedCoursesApi.ts
import {
  SavedCourse,
  SavedCoursesApiResponse,
  BookmarkToggleRequest,
  BookmarkToggleResponse,
  BookmarkCheckResponse,
  NotesUpdateRequest,
  NotesUpdateResponse,
  ApiErrorResponse
} from '../types/savedCourses';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SAVED_COURSES_ENDPOINT = `${API_BASE_URL}/api/saved-courses`;

// Generic error handler
const handleApiError = async (response: Response): Promise<never> => {
  const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
  throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
};

// Generic API request wrapper
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

// Saved Courses API Service
export const savedCoursesApi = {
  /**
   * Fetch all saved courses for a user
   */
  fetchSavedCourses: async (userId: string | number): Promise<SavedCourse[]> => {
    // Convert to number if string
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID');
    }
    
    const response = await apiRequest<SavedCoursesApiResponse>(
      `${SAVED_COURSES_ENDPOINT}/${numericUserId}`
    );
    return response.data;
  },

  /**
   * Toggle bookmark status for a course
   */
  toggleBookmark: async (request: BookmarkToggleRequest): Promise<BookmarkToggleResponse> => {
    // Convert userId to number if string
    const numericUserId = typeof request.userId === 'string' ? parseInt(request.userId) : request.userId;
    
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID');
    }
    
    return await apiRequest<BookmarkToggleResponse>(
      `${SAVED_COURSES_ENDPOINT}/toggle`,
      {
        method: 'POST',
        body: JSON.stringify({ ...request, userId: numericUserId }),
      }
    );
  },

  /**
   * Update notes for a saved course
   */
  updateNotes: async ({ bookmarkId, notes }: NotesUpdateRequest): Promise<SavedCourse> => {
    const response = await apiRequest<NotesUpdateResponse>(
      `${SAVED_COURSES_ENDPOINT}/${bookmarkId}/notes`,
      {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      }
    );
    return response.data;
  },

  /**
   * Remove a saved course
   */
  removeSavedCourse: async (bookmarkId: number): Promise<void> => {
    await apiRequest<{ success: boolean; message: string }>(
      `${SAVED_COURSES_ENDPOINT}/${bookmarkId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Check if a course is bookmarked by a user
   */
  checkBookmarkStatus: async (userId: string | number, courseId: number): Promise<BookmarkCheckResponse> => {
    // Convert to number if string
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID');
    }
    
    return await apiRequest<BookmarkCheckResponse>(
      `${SAVED_COURSES_ENDPOINT}/check/${numericUserId}/${courseId}`
    );
  },
};

// Additional utility functions
export const savedCoursesUtils = {
  /**
   * Format duration from months to human-readable string
   */
  formatDuration: (durationMonths?: number): string => {
    if (!durationMonths) return 'Duration not specified';
    
    const years = Math.floor(durationMonths / 12);
    const months = durationMonths % 12;
    
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  },

  /**
   * Format fee information
   */
  formatFee: (feeType: string, feeAmount?: number): string => {
    if (feeType === 'free') return 'Free';
    if (feeType === 'paid' && feeAmount) return `LKR ${feeAmount.toLocaleString()}`;
    return 'Fee not specified';
  },

  /**
   * Format study mode
   */
  formatStudyMode: (studyMode: string): string => {
    return studyMode === 'fulltime' ? 'Full-time' : 'Part-time';
  },

  /**
   * Generate course display name with code
   */
  getDisplayName: (courseName: string, courseCode?: string): string => {
    return courseCode ? `${courseName} (${courseCode})` : courseName;
  },

  /**
   * Sort saved courses by different criteria
   */
  sortSavedCourses: (
    courses: SavedCourse[], 
    sortBy: 'name' | 'university' | 'date' | 'duration'
  ): SavedCourse[] => {
    return [...courses].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.course.name.localeCompare(b.course.name);
        case 'university':
          return a.course.university.name.localeCompare(b.course.university.name);
        case 'duration':
          const durationA = a.course.durationMonths || 0;
          const durationB = b.course.durationMonths || 0;
          return durationA - durationB;
        case 'date':
        default:
          return b.id - a.id; // Most recent first (assuming higher ID = more recent)
      }
    });
  },

  /**
   * Filter saved courses by search query
   */
  filterSavedCourses: (courses: SavedCourse[], searchQuery: string): SavedCourse[] => {
    if (!searchQuery.trim()) return courses;
    
    const query = searchQuery.toLowerCase();
    return courses.filter(savedCourse => 
      savedCourse.course.name.toLowerCase().includes(query) ||
      savedCourse.course.university.name.toLowerCase().includes(query) ||
      savedCourse.course.faculty.name.toLowerCase().includes(query) ||
      savedCourse.course.specialisation.some(spec => 
        spec.toLowerCase().includes(query)
      ) ||
      (savedCourse.notes && savedCourse.notes.toLowerCase().includes(query))
    );
  },

  /**
   * Group saved courses by university
   */
  groupByUniversity: (courses: SavedCourse[]): Record<string, SavedCourse[]> => {
    return courses.reduce((groups, course) => {
      const universityName = course.course.university.name;
      if (!groups[universityName]) {
        groups[universityName] = [];
      }
      groups[universityName].push(course);
      return groups;
    }, {} as Record<string, SavedCourse[]>);
  },

  /**
   * Get statistics about saved courses
   */
  getStatistics: (courses: SavedCourse[]) => {
    const universities = new Set(courses.map(c => c.course.university.name));
    const faculties = new Set(courses.map(c => c.course.faculty.name));
    const freeCoursesCount = courses.filter(c => c.course.feeType === 'free').length;
    const withNotesCount = courses.filter(c => c.notes && c.notes.trim()).length;
    
    return {
      totalCourses: courses.length,
      uniqueUniversities: universities.size,
      uniqueFaculties: faculties.size,
      freeCourses: freeCoursesCount,
      coursesWithNotes: withNotesCount,
      averageDuration: courses.reduce((sum, c) => sum + (c.course.durationMonths || 0), 0) / courses.length
    };
  }
};

// Error types for better error handling
export class SavedCoursesApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'SavedCoursesApiError';
  }
}

// Hook for easier integration with React components
export const useSavedCoursesApi = () => {
  return {
    api: savedCoursesApi,
    utils: savedCoursesUtils,
  };
};
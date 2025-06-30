// client/src/services/apiService.ts - Updated with Subject service
const API_BASE_URL = 'http://localhost:5000/api';

// Import types
import type { Subject, SubjectsApiResponse } from '../types';

// Types for API responses
export interface Course {
  id: number;
  name: string;
  specialisation: string[];
  courseCode: string;
  courseUrl?: string;
  durationMonths: number;
  description: string;
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
}

export interface University {
  id: number;
  name: string;
  type: string;
  website?: string;
  address?: string;
}

export interface SavedCourse {
  id: number;
  courseId: number;
  notes?: string;
  course: Course;
}

export interface ApiResponse<T> {
  action: any;
  success: boolean;
  data?: T;
  courses?: T;
  message?: string;
  error?: string;
  total?: number;
  count?: number;
}

// Subject Service
export const subjectService = {
  // Get all subjects (with optional level filter)
  getAllSubjects: async (level?: 'AL' | 'OL'): Promise<SubjectsApiResponse> => {
    try {
      const url = level 
        ? `${API_BASE_URL}/subjects?level=${level}`
        : `${API_BASE_URL}/subjects`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new Error('Failed to fetch subjects');
    }
  },

  // Get AL subjects specifically
  getALSubjects: async (): Promise<SubjectsApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/al`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AL subjects:', error);
      throw new Error('Failed to fetch AL subjects');
    }
  },

  // Get OL subjects specifically
  getOLSubjects: async (): Promise<SubjectsApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/ol`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching OL subjects:', error);
      throw new Error('Failed to fetch OL subjects');
    }
  },

  // Get subject by ID
  getSubjectById: async (id: number): Promise<{ success: boolean; data?: Subject; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw new Error('Failed to fetch subject');
    }
  }
};

// Course Service
export const courseService = {
  // Search courses
  searchCourses: async (query: string): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/simple-search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw new Error('Failed to search courses');
    }
  },

  // Get all courses
  getAllCourses: async (): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  },

  // Get course by ID
  getCourseById: async (id: number): Promise<ApiResponse<Course>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }
  }
};

// University Service
export const universityService = {
  // Get all universities
  getAllUniversities: async (): Promise<ApiResponse<University[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/universities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw new Error('Failed to fetch universities');
    }
  },

  // Get university by ID
  getUniversityById: async (id: number): Promise<ApiResponse<University>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/universities/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching university:', error);
      throw new Error('Failed to fetch university');
    }
  }
};

// Saved Courses Service
export const savedCoursesService = {
  // Get saved courses for a user
  getSavedCourses: async (userId: number): Promise<ApiResponse<SavedCourse[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-courses/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching saved courses:', error);
      throw new Error('Failed to fetch saved courses');
    }
  },

  // Toggle bookmark (save/unsave course)
  toggleBookmark: async (userId: number, courseId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-courses/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, courseId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw new Error('Failed to toggle bookmark');
    }
  },

  // Check if course is bookmarked
  checkBookmarkStatus: async (userId: number, courseId: number): Promise<ApiResponse<{isBookmarked: boolean}>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-courses/check/${userId}/${courseId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      throw new Error('Failed to check bookmark status');
    }
  },

  // Update bookmark notes
  updateBookmarkNotes: async (bookmarkId: number, notes: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-courses/${bookmarkId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating bookmark notes:', error);
      throw new Error('Failed to update bookmark notes');
    }
  },

  // Delete bookmark
  deleteBookmark: async (bookmarkId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-courses/${bookmarkId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw new Error('Failed to delete bookmark');
    }
  }
};
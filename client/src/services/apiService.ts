// client/src/services/apiService.ts - Updated with Environment Variables and Enhanced Course API
// FIXED: Use import.meta.env instead of hardcoded URL
const API_BASE_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:4000/api";

// Import types
import type { Subject, SubjectsApiResponse } from "../types";
import type { CareerPathway } from "../types/course";
// Enhanced types for Course API
export interface Course {
  id: number;
  name: string;
  specialisation: string[];
  courseCode?: string;
  courseUrl?: string;
  durationMonths?: number;
  description?: string;
  studyMode: string;
  courseType: string;
  feeType: string;
  feeAmount?: number;
  frameworkLevel?: number;
  university: {
    id: number;
    name: string;
    type: string;
  };
  faculty: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  framework?: {
    id: number;
    type: "SLQF" | "NVQ";
    qualificationCategory: string;
    level: number;
  };
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: string;
    dynamicFields?: any[];
    courseMaterials?: any[];
    careerPathways?: any[];
  };
  isActive: boolean;
  auditInfo: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  };
}

export interface University {
  id: number;
  name: string;
  type: "government" | "private" | "semi-government";
  website?: string;
  address?: string;
}

export interface Faculty {
  id: number;
  name: string;
  universityId?: number;
}

export interface Department {
  id: number;
  name: string;
  facultyId?: number;
}

export interface Stream {
  id: number;
  name: string;
}

export interface Framework {
  id: number;
  type: "SLQF" | "NVQ";
  qualificationCategory: string;
  level: number;
  year?: number;
}

export interface SavedCourse {
  id: number;
  courseId: number;
  notes?: string;
  course: Course;
}

export interface ApiResponse<T> {
  action?: any;
  success: boolean;
  data?: T;
  courses?: T;
  message?: string;
  error?: string;
  total?: number;
  count?: number;
}

// Enhanced error handling wrapper
const handleApiCall = async <T>(
  apiCall: () => Promise<Response>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// FIXED: Special wrapper for subjects to match existing SubjectsApiResponse type
const handleSubjectsApiCall = async (
  apiCall: () => Promise<Response>
): Promise<SubjectsApiResponse> => {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Ensure the response matches SubjectsApiResponse format
    return {
      success: data.success || true,
      data: data.data || data.subjects || [],
      message: data.message || "Success",
      count: data.count || data.total || (data.data ? data.data.length : 0), // ✅ Always provide count
      error: data.error,
      details: data.details,
    } as SubjectsApiResponse;
  } catch (error) {
    console.error("Subjects API call failed:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch subjects",
      count: 0, // ✅ Always provide count, even on error
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    } as SubjectsApiResponse;
  }
};

// Subject Service - FIXED to return proper SubjectsApiResponse
export const subjectService = {

    createSubject: async (subjectData: {
    name: string;
    code: string;
    level: 'AL' | 'OL';
  }): Promise<SubjectsApiResponse> => {
    return handleSubjectsApiCall(() => 
      fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData)
      })
    );
  },

    updateSubjectStatus: async (
    id: number, 
    isActive: boolean
  ): Promise<SubjectsApiResponse> => {
    return handleSubjectsApiCall(() => 
      fetch(`${API_BASE_URL}/subjects/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      })
    );
  },


  // Get all subjects (with optional level filter)
  getAllSubjects: async (level?: "AL" | "OL"): Promise<SubjectsApiResponse> => {
    const url = level
      ? `${API_BASE_URL}/subjects?level=${level}`
      : `${API_BASE_URL}/subjects`;

    return handleSubjectsApiCall(() => fetch(url));
  },

  // Get AL subjects specifically
  getALSubjects: async (): Promise<SubjectsApiResponse> => {
    return handleSubjectsApiCall(() => fetch(`${API_BASE_URL}/subjects/al`));
  },

  // Get OL subjects specifically
  getOLSubjects: async (): Promise<SubjectsApiResponse> => {
    return handleSubjectsApiCall(() => fetch(`${API_BASE_URL}/subjects/ol`));
  },

  // Get subject by ID
  getSubjectById: async (
    id: number
  ): Promise<{ success: boolean; data?: Subject; error?: string }> => {
    try {
      const response = await handleApiCall<Subject>(() =>
        fetch(`${API_BASE_URL}/subjects/${id}`)
      );
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Enhanced Course Service with new functionality
export const courseService = {
  // Search courses
  searchCourses: async (query: string): Promise<ApiResponse<Course[]>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/simple-search?query=${encodeURIComponent(query)}`)
    );
  },

  // Get all courses with enhanced filters
  getAllCourses: async (filters?: {
    institute?: string;
    courseType?: string;
    frameworkType?: string;
    frameworkLevel?: string;
    feeType?: string;
    search?: string;
  }): Promise<ApiResponse<Course[]>> => {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const url = queryParams.toString()
      ? `${API_BASE_URL}/courses?${queryParams}`
      : `${API_BASE_URL}/courses`;

    return handleApiCall(() => fetch(url));
  },

  // Get course by ID
  getCourseById: async (id: number): Promise<ApiResponse<Course>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/courses/${id}`));
  },

  // Create new course
  createCourse: async (courseData: any): Promise<ApiResponse<Course>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })
    );
  },

  // Update course
  updateCourse: async (
    courseId: number,
    courseData: Partial<Course>
  ): Promise<ApiResponse<Course>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })
    );
  },

  // Delete course
  deleteCourse: async (courseId: number): Promise<ApiResponse<void>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "DELETE",
      })
    );
  },
};



// Enhanced University Service
export const universityService = {


  // Get all universities
  getAllUniversities: async (): Promise<ApiResponse<University[]>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/admin/universities`));
  },

  // Get university by ID
  getUniversityById: async (id: number): Promise<ApiResponse<University>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/universities/${id}`));
  },
};

// Enhanced Admin Service (NEW)
export const adminService = {
  // Get universities
  getUniversities: async (): Promise<ApiResponse<University[]>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/admin/universities`));
  },

  // Get faculties by university
  getFaculties: async (
    universityId?: number
  ): Promise<ApiResponse<Faculty[]>> => {
    const url = universityId
      ? `${API_BASE_URL}/admin/faculties?universityId=${universityId}`
      : `${API_BASE_URL}/admin/faculties`;

    return handleApiCall(() => fetch(url));
  },

  // Get departments by faculty
  getDepartments: async (
    facultyId?: number
  ): Promise<ApiResponse<Department[]>> => {
    const url = facultyId
      ? `${API_BASE_URL}/admin/departments?facultyId=${facultyId}`
      : `${API_BASE_URL}/admin/departments`;

    return handleApiCall(() => fetch(url));
  },

  // Get subjects for admin - FIXED to return proper ApiResponse
  getSubjects: async (level?: "OL" | "AL"): Promise<ApiResponse<Subject[]>> => {
    const url = level
      ? `${API_BASE_URL}/admin/subjects?level=${level}`
      : `${API_BASE_URL}/admin/subjects`;

    return handleApiCall(() => fetch(url));
  },

  // Get streams
  getStreams: async (): Promise<ApiResponse<Stream[]>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/admin/streams`));
  },

  getFrameworkTypes: async (): Promise<ApiResponse<string[]>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/admin/framework-types`));
  },

  getFrameworkLevelsByType: async (
    type: string
  ): Promise<ApiResponse<{ id: number; level: number }[]>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/admin/framework-levels/${type}`)
    );
  },

  getFrameworkByTypeAndLevel: async (
    type: string,
    level: number
  ): Promise<ApiResponse<Framework[]>> => {
    const url = `${API_BASE_URL}/admin/frameworks?type=${type}&level=${level}`;
    return handleApiCall(() => fetch(url));
  },

  // Get frameworks
  getFrameworks: async (
    type?: "SLQF" | "NVQ"
  ): Promise<ApiResponse<Framework[]>> => {
    const url = type
      ? `${API_BASE_URL}/admin/frameworks?type=${type}`
      : `${API_BASE_URL}/admin/frameworks`;

    return handleApiCall(() => fetch(url));
  },

  // Career pathway methods
  getCareerPathways: async (): Promise<ApiResponse<CareerPathway[]>> => {
    return handleApiCall(() => fetch(`${API_BASE_URL}/admin/career-pathways`));
  },

  searchCareersByJobTitle: async (
    query: string
  ): Promise<ApiResponse<CareerPathway[]>> => {
    return handleApiCall(() =>
      fetch(
        `${API_BASE_URL}/admin/career-pathways/search?jobTitle=${encodeURIComponent(
          query
        )}`
      )
    );
  },

  searchCareersByIndustry: async (
    query: string
  ): Promise<ApiResponse<CareerPathway[]>> => {
    return handleApiCall(() =>
      fetch(
        `${API_BASE_URL}/admin/career-pathways/search?industry=${encodeURIComponent(
          query
        )}`
      )
    );
  },

  // In your adminService
  async createCareerPathway(pathway: CareerPathway) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/career-pathways`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any required auth headers
        },
        body: JSON.stringify(pathway),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating career pathway:", error);
      return { success: false, error: "Network error" };
    }
  },
};

// Saved Courses Service
export const savedCoursesService = {
  // Get saved courses for a user
  getSavedCourses: async (
    userId: number
  ): Promise<ApiResponse<SavedCourse[]>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/saved-courses/${userId}`)
    );
  },

  // Toggle bookmark (save/unsave course)
  toggleBookmark: async (
    userId: number,
    courseId: number
  ): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/saved-courses/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, courseId }),
      })
    );
  },

  // Check if course is bookmarked
  checkBookmarkStatus: async (
    userId: number,
    courseId: number
  ): Promise<ApiResponse<{ isBookmarked: boolean }>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/saved-courses/check/${userId}/${courseId}`)
    );
  },

  // Update bookmark notes
  updateBookmarkNotes: async (
    bookmarkId: number,
    notes: string
  ): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/saved-courses/${bookmarkId}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })
    );
  },

  // Delete bookmark
  deleteBookmark: async (bookmarkId: number): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/saved-courses/${bookmarkId}`, {
        method: "DELETE",
      })
    );
  },
};

// Export a combined API object for convenience
export const api = {
  subjects: subjectService,
  courses: courseService,
  universities: universityService,
  admin: adminService,
  savedCourses: savedCoursesService,
};

// Export default as the combined API
export default api;

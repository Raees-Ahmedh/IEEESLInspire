// client/src/services/apiService.ts - Updated with Environment Variables and Enhanced Course API
// FIXED: Use import.meta.env instead of hardcoded URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

import authService from './authService';

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

  // Create new subject
  createSubject: async (subjectData: {
    name: string;
    code: string;
    level: 'AL' | 'OL';
  }): Promise<ApiResponse<Subject>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(subjectData),
      })
    );
  },

  // Update subject
  updateSubject: async (id: number, subjectData: {
    name: string;
    code: string;
    level: 'AL' | 'OL';
    isActive: boolean;
  }): Promise<ApiResponse<Subject>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/subjects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(subjectData),
      })
    );
  },

  // Update subject status
  updateSubjectStatus: async (id: number, isActive: boolean): Promise<ApiResponse<Subject>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/subjects/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ isActive }),
      })
    );
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
    universityId?: number;
    facultyId?: number;
    departmentId?: number;
  }): Promise<ApiResponse<Course[]>> => {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).length > 0) {
          queryParams.append(key, String(value));
        }
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

  // Update university (admin/manager)
  updateUniversity: async (
    id: number,
    updateData: Partial<{
      name: string;
      type: 'government' | 'private' | 'semi_government';
      address?: string;
      website?: string;
      uniCode: string;
      isActive?: boolean;
      recognitionCriteria?: string[];
      contactInfo?: any;
      imageUrl?: string | null;
      logoUrl?: string | null;
      galleryImages?: string[];
      additionalDetails?: any;
    }>
  ): Promise<ApiResponse<University>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/admin/universities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(updateData)
      })
    );
  },

  // Create new university
  createUniversity: async (universityData: {
    name: string;
    type: 'government' | 'private' | 'semi_government';
    address?: string;
    website?: string;
    uniCode: string;
    isActive?: boolean;
  }): Promise<ApiResponse<University>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          ...universityData,
          recognitionCriteria: [], // Default empty array
          contactInfo: null,
          imageUrl: null,
          logoUrl: null,
          galleryImages: [],
          additionalDetails: {}
        }),
      })
    );
  },
};

// Editor Service - NEW
export const editorService = {
  // Get all editors
  getAllEditors: async (): Promise<ApiResponse<any[]>> => {
    return handleApiCall(() => 
      fetch(`${API_BASE_URL}/editors`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Create new editor
  createEditor: async (editorData: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/editors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(editorData),
      })
    );
  },

  // Update editor status
  updateEditorStatus: async (id: string, isActive: boolean): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/editors/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ isActive }),
      })
    );
  },

  // Assign editor to university
  assignEditorToUniversity: async (editorId: number, universityId: number, permissions: any): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/editors/${editorId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ universityId, permissions }),
      })
    );
  },

  // Unassign editor from university
  unassignEditorFromUniversity: async (editorId: number, universityId: number): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/editors/${editorId}/unassign/${universityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Get editor assignments
  getEditorAssignments: async (editorId: number): Promise<ApiResponse<any[]>> => {
    return handleApiCall(() => 
      fetch(`${API_BASE_URL}/editors/${editorId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
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
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/career-pathways`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
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
      fetch(`${API_BASE_URL}/saved-courses/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
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
          'Authorization': `Bearer ${authService.getToken()}`
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
      fetch(`${API_BASE_URL}/saved-courses/check/${userId}/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
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

// Task Service - NEW
export const taskService = {
  // Get all tasks (for managers) or assigned tasks (for editors)
  getAllTasks: async (): Promise<ApiResponse<any[]>> => {
    return handleApiCall(() => 
      fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Create new task
  createTask: async (taskData: {
    title: string;
    description?: string;
    assignedTo: number;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(taskData),
      })
    );
  },

  // Update task
  updateTask: async (id: number, taskData: {
    title?: string;
    description?: string;
    assignedTo?: number;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'ongoing' | 'complete';
    dueDate?: string;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(taskData),
      })
    );
  },

  // Delete task
  deleteTask: async (id: number): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Get all editors for task assignment
  getEditorsForTasks: async (): Promise<ApiResponse<any[]>> => {
    return handleApiCall(() => 
      fetch(`${API_BASE_URL}/tasks/editors`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },
};

// News Service - NEW
export const newsService = {
  // Get all news articles
  getAllNews: async (): Promise<ApiResponse<any[]>> => {
    return handleApiCall(() => 
      fetch(`${API_BASE_URL}/news`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Create new news article
  createNews: async (newsData: {
    title: string;
    content: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    tags?: string[];
    publishDate?: string;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(newsData),
      })
    );
  },

  // Update news article
  updateNews: async (id: number, newsData: {
    title?: string;
    content?: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    tags?: string[];
    status?: string;
    publishDate?: string;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(newsData),
      })
    );
  },

  // Delete news article
  deleteNews: async (id: number): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Update news article status
  updateNewsStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/news/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ status }),
      })
    );
  },
};

// Events Service - NEW
export const eventsService = {
  // Get all events
  getAllEvents: async (): Promise<ApiResponse<any[]>> => {
    return handleApiCall(() => 
      fetch(`${API_BASE_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Create new event
  createEvent: async (eventData: {
    title: string;
    description?: string;
    eventType?: string;
    startDate: string;
    endDate?: string;
    location?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(eventData),
      })
    );
  },

  // Update event
  updateEvent: async (id: number, eventData: {
    title?: string;
    description?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(eventData),
      })
    );
  },

  // Delete event
  deleteEvent: async (id: number): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
    );
  },

  // Update event status
  updateEventStatus: async (id: number, isPublic: boolean): Promise<ApiResponse<any>> => {
    return handleApiCall(() =>
      fetch(`${API_BASE_URL}/events/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ isPublic }),
      })
    );
  },
};

// Export a combined API object for convenience
export const api = {
  subjects: subjectService,
  courses: courseService,
  universities: universityService,
  editors: editorService,
  tasks: taskService,
  news: newsService,
  events: eventsService,
  admin: adminService,
  savedCourses: savedCoursesService,
};

// Export default as the combined API
export default api;

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Enhanced interfaces matching backend
export interface AddCourseData {
  // Basic Details
  name: string;
  courseCode?: string;
  courseUrl: string;
  description?: string;
  specialisation: string[];

  // University Structure
  universityId: number;
  facultyId: number;
  departmentId: number;
  subfieldId: number[];

  // Course Configuration
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  frameworkId?: number;

  // Fees & Duration
  feeType: 'free' | 'paid';
  feeAmount?: number;
  durationMonths?: number;
  medium: string[];

  // Complex Data
  zscore?: any;
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: string;
    customFields?: Record<string, any>;
  };

  // Requirements
  requirements: {
    minRequirement: 'noNeed' | 'OLPass' | 'ALPass' | 'Graduate';
    streams: number[];
    ruleSubjectBasket?: any;
    ruleSubjectGrades?: any;
    ruleOLGrades?: any;
  };

  // Career Paths
  careerPathways: Array<{
    jobTitle: string;
    industry?: string;
    description?: string;
    salaryRange?: string;
  }>;
}

export interface CourseFormData {
  universities: any[];
  faculties: any[];
  departments: any[];
  majorFields: any[];
  subFields: any[];
  frameworks: any[];
  streams: any[];
  subjects: {
    al: any[];
    ol: any[];
  };
  careerPathways: any[];
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  universityId?: number;
  facultyId?: number;
  departmentId?: number;
  courseType?: string;
  feeType?: string;
  studyMode?: string;
}

class CourseService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // Get all form data needed for course creation
  async getFormData(): Promise<{ success: boolean; data?: CourseFormData; error?: string }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/courses/form-data`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching form data:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch form data'
      };
    }
  }

  // Create new course
  async addCourse(courseData: AddCourseData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/courses`,
        courseData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating course:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create course'
      };
    }
  }

  // Get courses with filters
  async getCourses(filters: CourseFilters = {}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/admin/courses?${params.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch courses'
      };
    }
  }

  // Get single course by ID
  async getCourseById(courseId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/courses/${courseId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching course:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch course'
      };
    }
  }

  // Update course
  async updateCourse(courseId: number, courseData: Partial<AddCourseData>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/courses/${courseId}`,
        courseData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating course:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update course'
      };
    }
  }

  // Delete course
  async deleteCourse(courseId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/courses/${courseId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete course'
      };
    }
  }

  // Upload course material
  async uploadMaterial(
    courseId: number, 
    materialData: {
      materialType: string;
      fileName: string;
      filePath: string;
      fileType?: string;
      fileSize?: number;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/courses/${courseId}/materials`,
        materialData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error uploading material:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload material'
      };
    }
  }
}

export default new CourseService();
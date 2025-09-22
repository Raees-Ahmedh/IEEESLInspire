import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

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
  requirements?: {
    minRequirement: string;
    streams: number[];
    ruleSubjectBasket?: any;
    ruleSubjectGrades?: any;
    ruleOLGrades?: any;
  };

  zscore?: any;
  additionalDetails?: any;
  careerPathways?: Array<{
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

class CourseService {
  // Get all form data needed for course creation
  async getFormData(): Promise<{ success: boolean; data?: CourseFormData; error?: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/courses/form-data`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch form data'
      };
    }
  }

  // Create new course
  async addCourse(courseData: AddCourseData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/courses`, courseData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create course'
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
      const response = await axios.post(`${API_BASE_URL}/admin/courses/${courseId}/materials`, materialData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload material'
      };
    }
  }

  // Get faculties by university
  async getFacultiesByUniversity(universityId: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/faculties?universityId=${universityId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch faculties'
      };
    }
  }

  // Get departments by faculty
  async getDepartmentsByFaculty(facultyId: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/departments?facultyId=${facultyId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch departments'
      };
    }
  }
}

export default new CourseService();
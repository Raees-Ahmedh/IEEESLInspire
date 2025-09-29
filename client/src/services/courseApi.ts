import { Course, CourseFilters, University, Faculty, Department, Subject, Stream, Framework } from '../types/course';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Course API Service with enhanced features
export const courseApi = {
  // Fetch all courses with enhanced filters
  fetchCourses: async (filters?: Partial<CourseFilters>): Promise<Course[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    
    const data = await response.json();
    return data.data || [];
  },

  // Fetch single course by ID
  fetchCourse: async (courseId: number): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    
    const data = await response.json();
    return data.data;
  },

  // Create new course with enhanced data
  createCourse: async (courseData: any): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) throw new Error('Failed to create course');
    
    const data = await response.json();
    return data.data;
  },

  // Update course
  updateCourse: async (courseId: number, courseData: Partial<Course>): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) throw new Error('Failed to update course');
    
    const data = await response.json();
    return data.data;
  },

  // Delete course
  deleteCourse: async (courseId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete course');
  },

  // Fetch universities
  fetchUniversities: async (): Promise<University[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/universities`);
    if (!response.ok) throw new Error('Failed to fetch universities');
    
    const data = await response.json();
    return data.data || [];
  },

  // Fetch faculties by university
  fetchFaculties: async (universityId?: number): Promise<Faculty[]> => {
    const url = universityId 
      ? `${API_BASE_URL}/admin/faculties?universityId=${universityId}`
      : `${API_BASE_URL}/admin/faculties`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch faculties');
    
    const data = await response.json();
    return data.data || [];
  },

  // Fetch departments by faculty
  fetchDepartments: async (facultyId?: number): Promise<Department[]> => {
    const url = facultyId 
      ? `${API_BASE_URL}/admin/departments?facultyId=${facultyId}`
      : `${API_BASE_URL}/admin/departments`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch departments');
    
    const data = await response.json();
    return data.data || [];
  },

  // Fetch subjects
  fetchSubjects: async (level?: 'OL' | 'AL'): Promise<Subject[]> => {
    const url = level 
      ? `${API_BASE_URL}/admin/subjects?level=${level}`
      : `${API_BASE_URL}/admin/subjects`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    
    const data = await response.json();
    return data.data || [];
  },

  // Fetch streams
  fetchStreams: async (): Promise<Stream[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/streams`);
    if (!response.ok) throw new Error('Failed to fetch streams');
    
    const data = await response.json();
    return data.data || [];
  },

  // Fetch frameworks
  fetchFrameworks: async (type?: 'SLQF' | 'NVQ'): Promise<Framework[]> => {
    const url = type 
      ? `${API_BASE_URL}/admin/frameworks?type=${type}`
      : `${API_BASE_URL}/admin/frameworks`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch frameworks');
    
    const data = await response.json();
    return data.data || [];
  },



  // Create career pathway
  createCareerPathway: async (careerData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/admin/career-pathways`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(careerData),
    });

    if (!response.ok) throw new Error('Failed to create career pathway');
    
    const data = await response.json();
    return data.data;
  },


};
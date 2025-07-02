// Enhanced Course Type Definitions for the new CourseModal
// File: client/src/types/course.ts

export interface University {
  id: number;
  name: string;
  type: 'government' | 'private' | 'semi-government';
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

export interface Subject {
  id: number;
  code: string;
  name: string;
  level: 'OL' | 'AL';
}

export interface Stream {
  id: number;
  name: string;
}

export interface Framework {
  id: number;
  type: 'SLQF' | 'NVQ';
  qualificationCategory: string;
  level: number;
  year?: number;
}

// FIXED: Added export to CourseFilters interface
export interface CourseFilters {
  institute: string;
  courseType: string;
  frameworkType: string;
  frameworkLevel: string;
  feeType: string;
}

// Dynamic Field interface for additional course details
export interface DynamicField {
  id: string;
  fieldName: string;
  fieldValue: string;
}

// Course Material interface
export interface CourseMaterial {
  id?: number;
  materialType: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
}

// Career Pathway interface
export interface CareerPathway {
  id?: number;
  jobTitle: string;
  industry?: string;
  description?: string;
  salaryRange?: string;
}

export interface Course {
  id: number;
  name: string;
  courseCode?: string;
  courseUrl: string;
  specialisation: string[];
  university: University;
  faculty: Faculty;
  department: Department;
  courseType: 'internal' | 'external';
  studyMode: 'fulltime' | 'parttime';
  feeType: 'free' | 'paid';
  feeAmount?: number;
  framework?: Framework;
  frameworkLevel?: number;
  durationMonths?: number;
  description?: string;
  zscore?: any; // JSON data
  medium: string[];
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: string;
    dynamicFields: DynamicField[];
    courseMaterials: CourseMaterial[];
    careerPathways: CareerPathway[];
  };
  isActive: boolean;
  auditInfo: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  };
}

// Course Requirements Types
export interface SubjectGrade {
  subjectId: number;
  subject: Subject;
  grade: 'A' | 'B' | 'C' | 'S' | 'F';
}

export interface BasketGradeRequirement {
  grade: 'A' | 'B' | 'C' | 'S' | 'F';
  count: number;
}

export interface SubjectBasket {
  id: string;
  name: string;
  subjects: Subject[];
  minSelection: number;
  maxSelection: number;
  requiredGrades: SubjectGrade[];
  basketGradeRequirements: BasketGradeRequirement[];
  internalLogic: 'AND' | 'OR';
}

export interface BasketRelationship {
  basketIds: string[];
  relation: 'AND' | 'OR';
}

export interface CourseRequirement {
  id: number;
  courseId: number;
  minRequirement: 'noNeed' | 'OLPass' | 'ALPass' | 'Graduate';
  streams: Stream[];
  subjectBaskets: SubjectBasket[];
  basketRelationships: BasketRelationship[];
  extraRules?: string;
  isActive: boolean;
}

export interface CourseFormData {
  // Step 1: Course Details
  name: string;
  courseCode: string;
  courseUrl: string;
  specialisation: string[];
  universityId: number;
  facultyId: number;
  departmentId: number;
  courseType: 'internal' | 'external';
  studyMode: 'fulltime' | 'parttime';
  feeType: 'free' | 'paid';
  feeAmount?: number;
  frameworkType: 'SLQF' | 'NVQ';
  frameworkLevel: number;
  durationMonths?: number;
  description?: string;
  
  // Step 2: Entry Requirements
  requirements: CourseRequirement;
  
  // Step 3: Custom Rules (optional)
  customRules?: string;
  
  // Step 4: Other Details
  zscore?: string; // JSON as string
  intakeCount?: number;
  medium: string[];
  syllabus?: string;
  dynamicFields: DynamicField[];
  courseMaterials: CourseMaterial[];
  careerPathways: CareerPathway[];
}

// Additional utility types for better type safety
export type CourseStatus = 'active' | 'inactive' | 'draft';
export type FrameworkType = 'SLQF' | 'NVQ';
export type StudyMode = 'fulltime' | 'parttime';
export type CourseType = 'internal' | 'external';
export type FeeType = 'free' | 'paid';
export type UniversityType = 'government' | 'private' | 'semi-government';
export type GradeType = 'A' | 'B' | 'C' | 'S' | 'F';
export type LogicType = 'AND' | 'OR';

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

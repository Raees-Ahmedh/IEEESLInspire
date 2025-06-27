// client/src/types/savedCourses.ts
// Add these interfaces to your existing types file or create a new one

export interface University {
  id: number;
  name: string;
  type: string;
}

export interface Faculty {
  id: number;
  name: string;
}

export interface SavedCourseDetails {
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
  university: University;
  faculty: Faculty;
}

export interface SavedCourse {
  id: number;
  courseId: number;
  notes?: string;
  course: SavedCourseDetails;
}

export interface BookmarkToggleRequest {
  courseId: number;
  userId: string | number;
  notes?: string;
}

export interface BookmarkToggleResponse {
  success: boolean;
  action: 'added' | 'removed';
  data: SavedCourse | null;
}

export interface SavedCoursesApiResponse {
  success: boolean;
  data: SavedCourse[];
  count: number;
}

export interface BookmarkCheckResponse {
  success: boolean;
  isBookmarked: boolean;
  bookmarkId: number | null;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export interface NotesUpdateRequest {
  bookmarkId: number;
  notes: string;
}

export interface NotesUpdateResponse {
  success: boolean;
  data: SavedCourse;
}

// Enum for study modes
export enum StudyMode {
  FULLTIME = 'fulltime',
  PARTTIME = 'parttime'
}

// Enum for course types
export enum CourseType {
  INTERNAL = 'internal',
  EXTERNAL = 'external'
}

// Enum for fee types
export enum FeeType {
  FREE = 'free',
  PAID = 'paid'
}

// Extended interface for course filtering
export interface CourseFilters {
  searchQuery?: string;
  universityIds?: number[];
  facultyIds?: number[];
  studyModes?: StudyMode[];
  courseTypes?: CourseType[];
  feeTypes?: FeeType[];
  durationRange?: {
    min: number;
    max: number;
  };
}

// Interface for course analytics (if needed later)
export interface CourseAnalytics {
  courseId: number;
  viewCount: number;
  bookmarkCount: number;
  applicationCount: number;
  lastUpdated: string;
}
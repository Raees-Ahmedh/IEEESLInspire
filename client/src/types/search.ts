// client/src/types/search.ts - Search related types
export interface SearchResult {
  id: number;
  name: string;
  courseCode?: string;
  courseUrl?: string;
  university: {
    id: number;
    name: string;
    type: string;
  };
  faculty: {
    id: number;
    name: string;
  };
  department?: string;
  feeType: string;
  feeAmount?: number;
  studyMode: string;
  durationMonths?: number;
  description?: string;
  specialisation?: string[];
  medium?: string[];
}

export interface SearchApiResponse {
  success: boolean;
  courses: SearchResult[];
  total: number;
  query: string;
  timestamp?: string;
  error?: string;
  details?: string;
}

export interface SearchSuggestion {
  type: 'course' | 'university';
  value: string;
  code?: string;
}

export interface SuggestionsApiResponse {
  success: boolean;
  suggestions: SearchSuggestion[];
  query: string;
  error?: string;
}

export interface SearchFilters {
  universityType?: 'government' | 'private' | 'all';
  feeType?: 'free' | 'paid' | 'all';
  studyMode?: 'fulltime' | 'parttime' | 'all';
  facultyId?: number;
  universityId?: number;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FullSearchApiResponse extends SearchApiResponse {
  pagination?: PaginationInfo;
  filters?: SearchFilters;
}
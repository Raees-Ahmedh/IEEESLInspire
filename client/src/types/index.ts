export interface University {
  id: number;
  name: string;
  programs: number;
  location: string;
  image: string;
  description?: string;
  established?: number;
  type: 'government' | 'private';
}

export interface Course {
  id: number;
  name: string;
  university: string;
  duration: string;
  requirements: string[];
  description: string;
  category: string;
}

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  author?: string;
  readTime?: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  universityType: 'all' | 'government' | 'private';
}

export interface UserQualifications {
  alResults: {
    subject: string;
    grade: string;
  }[];
  otherQualifications: string[];
}
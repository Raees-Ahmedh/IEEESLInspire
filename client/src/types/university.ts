// client/src/types/university.ts - Updated University types with image support

export interface University {
  id: number;
  name: string;
  type: 'government' | 'private' | 'semi_government';
  uniCode?: string;
  address?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    fax?: string;
  };
  website?: string;
  
  // NEW IMAGE FIELDS
  imageUrl?: string;           // Main university image URL
  logoUrl?: string;            // University logo URL
  galleryImages?: string[];    // Array of additional image URLs
  
  additionalDetails?: {
    established?: number;
    studentCount?: number;
    campusSize?: string;
    ranking?: number;
    accreditations?: string[];
    specializations?: string[];
  };
  isActive: boolean;
  auditInfo: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  };
}

// For API responses
export interface UniversityApiResponse {
  success: boolean;
  data: University[];
  error?: string;
}
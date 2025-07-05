// client/src/store/slices/universitiesSlice.ts - Updated with image support
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Updated University interface with image fields
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

interface UniversitiesState {
  universities: University[];
  loading: boolean;
  error: string | null;
  selectedUniversity: University | null;
  lastFetched: string | null;
}

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Async thunk to fetch universities from API
export const fetchUniversities = createAsyncThunk(
  'universities/fetchUniversities',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching universities from API...');
      
      const response = await fetch(`${API_BASE_URL}/admin/universities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Universities fetched successfully:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch universities');
      }

      // Transform the data to ensure image fields are properly handled
      const transformedUniversities: University[] = data.data.map((uni: any) => ({
        ...uni,
        // Ensure galleryImages is always an array
        galleryImages: Array.isArray(uni.galleryImages) 
          ? uni.galleryImages 
          : uni.galleryImages 
            ? [uni.galleryImages] 
            : [],
        // Ensure contactInfo is properly structured
        contactInfo: typeof uni.contactInfo === 'object' 
          ? uni.contactInfo 
          : {},
        // Ensure additionalDetails is properly structured
        additionalDetails: typeof uni.additionalDetails === 'object' 
          ? uni.additionalDetails 
          : {}
      }));

      return transformedUniversities;
    } catch (error: any) {
      console.error('❌ Error fetching universities:', error);
      return rejectWithValue(error.message || 'Failed to fetch universities');
    }
  }
);

// Async thunk to fetch university by ID (for detailed view)
export const fetchUniversityById = createAsyncThunk(
  'universities/fetchUniversityById',
  async (universityId: number, { rejectWithValue }) => {
    try {
      console.log(`🔄 Fetching university details for ID: ${universityId}`);
      
      const response = await fetch(`${API_BASE_URL}/universities/${universityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ University details fetched successfully:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch university details');
      }

      // Transform the single university data
      const transformedUniversity: University = {
        ...data.data,
        galleryImages: Array.isArray(data.data.galleryImages) 
          ? data.data.galleryImages 
          : data.data.galleryImages 
            ? [data.data.galleryImages] 
            : [],
        contactInfo: typeof data.data.contactInfo === 'object' 
          ? data.data.contactInfo 
          : {},
        additionalDetails: typeof data.data.additionalDetails === 'object' 
          ? data.data.additionalDetails 
          : {}
      };

      return transformedUniversity;
    } catch (error: any) {
      console.error('❌ Error fetching university details:', error);
      return rejectWithValue(error.message || 'Failed to fetch university details');
    }
  }
);

// Initial state with proper typing
const initialState: UniversitiesState = {
  universities: [],
  loading: false,
  error: null,
  selectedUniversity: null,
  lastFetched: null,
};

const universitiesSlice = createSlice({
  name: 'universities',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedUniversity: (state, action: PayloadAction<University | null>) => {
      state.selectedUniversity = action.payload;
    },
    clearSelectedUniversity: (state) => {
      state.selectedUniversity = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUniversities: (state) => {
      state.universities = [];
      state.lastFetched = null;
      state.error = null;
    },
    addUniversity: (state, action: PayloadAction<University>) => {
      state.universities.push(action.payload);
    },
    updateUniversity: (state, action: PayloadAction<University>) => {
      const index = state.universities.findIndex(uni => uni.id === action.payload.id);
      if (index !== -1) {
        state.universities[index] = action.payload;
      }
    },
    removeUniversity: (state, action: PayloadAction<number>) => {
      state.universities = state.universities.filter(uni => uni.id !== action.payload);
    },
    // New action to update university images
    updateUniversityImages: (state, action: PayloadAction<{
      universityId: number;
      imageUrl?: string;
      logoUrl?: string;
      galleryImages?: string[];
    }>) => {
      const { universityId, imageUrl, logoUrl, galleryImages } = action.payload;
      const university = state.universities.find(uni => uni.id === universityId);
      
      if (university) {
        if (imageUrl !== undefined) university.imageUrl = imageUrl;
        if (logoUrl !== undefined) university.logoUrl = logoUrl;
        if (galleryImages !== undefined) university.galleryImages = galleryImages;
        
        // Update audit info
        university.auditInfo.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Universities
    builder
      .addCase(fetchUniversities.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('🔄 Universities fetch pending...');
      })
      .addCase(fetchUniversities.fulfilled, (state, action: PayloadAction<University[]>) => {
        state.loading = false;
        state.universities = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
        console.log(`✅ ${action.payload.length} universities loaded successfully`);
      })
      .addCase(fetchUniversities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('❌ Universities fetch failed:', action.payload);
      });

    // Fetch University by ID
    builder
      .addCase(fetchUniversityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUniversityById.fulfilled, (state, action: PayloadAction<University>) => {
        state.loading = false;
        state.selectedUniversity = action.payload;
        state.error = null;
        
        // Update the university in the list if it exists
        const index = state.universities.findIndex(uni => uni.id === action.payload.id);
        if (index !== -1) {
          state.universities[index] = action.payload;
        }
      })
      .addCase(fetchUniversityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setSelectedUniversity,
  clearSelectedUniversity,
  clearError,
  clearUniversities,
  addUniversity,
  updateUniversity,
  removeUniversity,
  updateUniversityImages, // New action
} = universitiesSlice.actions;

// Selectors
export const selectUniversities = (state: { universities: UniversitiesState }) => 
  state.universities.universities;
export const selectUniversitiesLoading = (state: { universities: UniversitiesState }) => 
  state.universities.loading;
export const selectUniversitiesError = (state: { universities: UniversitiesState }) => 
  state.universities.error;
export const selectSelectedUniversity = (state: { universities: UniversitiesState }) => 
  state.universities.selectedUniversity;
export const selectLastFetched = (state: { universities: UniversitiesState }) => 
  state.universities.lastFetched;

// Government universities selector
export const selectGovernmentUniversities = (state: { universities: UniversitiesState }) =>
  state.universities.universities.filter(uni => uni.type === 'government');

// Private universities selector
export const selectPrivateUniversities = (state: { universities: UniversitiesState }) =>
  state.universities.universities.filter(uni => uni.type === 'private');

// Universities with images selector
export const selectUniversitiesWithImages = (state: { universities: UniversitiesState }) =>
  state.universities.universities.filter(uni => uni.imageUrl || uni.logoUrl);

// Export the reducer
export default universitiesSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces
interface QualificationResult {
  subject: string;
  grade: string;
}

interface UserQualifications {
  alResults: QualificationResult[];
  olResults: QualificationResult[];
  zScore: number | null;
  examDistrict: string | null;
  otherQualifications: string[];
}

interface UserState {
  qualifications: UserQualifications;
  preferences: {
    preferredUniversities: string[];
    preferredFields: string[];
    preferredLocations: string[];
  };
  searchHistory: string[];
  savedCourses: string[];
}

const initialState: UserState = {
  qualifications: {
    alResults: [],
    olResults: [],
    zScore: null,
    examDistrict: null,
    otherQualifications: [],
  },
  preferences: {
    preferredUniversities: [],
    preferredFields: [],
    preferredLocations: [],
  },
  searchHistory: [],
  savedCourses: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // A/L Results Management
    addALResult: (state, action: PayloadAction<{ subject: string; grade: string }>) => {
      // Check for duplicates and limit to 3
      const exists = state.qualifications.alResults.some(
        result => result.subject === action.payload.subject
      );
      if (!exists && state.qualifications.alResults.length < 3) {
        state.qualifications.alResults.push(action.payload);
      }
    },
    
    removeALResult: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.qualifications.alResults.length) {
        state.qualifications.alResults.splice(action.payload, 1);
      }
    },
    
    updateALResult: (state, action: PayloadAction<{ index: number; subject: string; grade: string }>) => {
      const { index, subject, grade } = action.payload;
      if (index >= 0 && index < state.qualifications.alResults.length) {
        state.qualifications.alResults[index] = { subject, grade };
      }
    },

    clearALResults: (state) => {
      state.qualifications.alResults = [];
    },

    // O/L Results Management  
    addOLResult: (state, action: PayloadAction<{ subject: string; grade: string }>) => {
      const exists = state.qualifications.olResults.some(
        result => result.subject === action.payload.subject
      );
      if (!exists) {
        state.qualifications.olResults.push(action.payload);
      }
    },

    setOLResults: (state, action: PayloadAction<QualificationResult[]>) => {
      state.qualifications.olResults = action.payload;
    },

    clearOLResults: (state) => {
      state.qualifications.olResults = [];
    },

    // Z-Score Management
    setZScore: (state, action: PayloadAction<number | null>) => {
      state.qualifications.zScore = action.payload;
    },

    // Exam District Management
    setExamDistrict: (state, action: PayloadAction<string | null>) => {
      state.qualifications.examDistrict = action.payload;
    },

    // Other qualifications (legacy support)
    addOtherQualification: (state, action: PayloadAction<string>) => {
      if (!state.qualifications.otherQualifications.includes(action.payload)) {
        state.qualifications.otherQualifications.push(action.payload);
      }
    },

    // Batch operations
    setAllQualifications: (state, action: PayloadAction<UserQualifications>) => {
      state.qualifications = action.payload;
    },

    clearAllQualifications: (state) => {
      state.qualifications = {
        alResults: [],
        olResults: [],
        zScore: null,
        examDistrict: null,
        otherQualifications: [],
      };
    },

    // User Preferences
    setPreferredUniversities: (state, action: PayloadAction<string[]>) => {
      state.preferences.preferredUniversities = action.payload;
    },

    addPreferredUniversity: (state, action: PayloadAction<string>) => {
      if (!state.preferences.preferredUniversities.includes(action.payload)) {
        state.preferences.preferredUniversities.push(action.payload);
      }
    },

    removePreferredUniversity: (state, action: PayloadAction<string>) => {
      state.preferences.preferredUniversities = state.preferences.preferredUniversities.filter(
        uni => uni !== action.payload
      );
    },

    setPreferredFields: (state, action: PayloadAction<string[]>) => {
      state.preferences.preferredFields = action.payload;
    },

    addPreferredField: (state, action: PayloadAction<string>) => {
      if (!state.preferences.preferredFields.includes(action.payload)) {
        state.preferences.preferredFields.push(action.payload);
      }
    },

    // Search & Saved Items
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      state.searchHistory = [
        action.payload,
        ...state.searchHistory.filter(item => item !== action.payload)
      ].slice(0, 10);
    },

    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },

    addSavedCourse: (state, action: PayloadAction<string>) => {
      if (!state.savedCourses.includes(action.payload)) {
        state.savedCourses.push(action.payload);
      }
    },

    removeSavedCourse: (state, action: PayloadAction<string>) => {
      state.savedCourses = state.savedCourses.filter(course => course !== action.payload);
    },

    // Reset user data
    resetUserData: () => initialState,
  },
});

// Export actions
export const {
  addALResult,
  removeALResult,
  updateALResult,
  clearALResults,
  addOLResult,
  setOLResults,
  clearOLResults,
  setZScore,
  setExamDistrict,
  addOtherQualification,
  setAllQualifications,
  clearAllQualifications,
  setPreferredUniversities,
  addPreferredUniversity,
  removePreferredUniversity,
  setPreferredFields,
  addPreferredField,
  addToSearchHistory,
  clearSearchHistory,
  addSavedCourse,
  removeSavedCourse,
  resetUserData,
} = userSlice.actions;

export default userSlice.reducer;

// Export types
export type { UserQualifications, QualificationResult, UserState };
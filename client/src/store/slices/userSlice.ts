import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserQualifications } from '../../types';

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
    // Qualification Management
    setQualifications: (state, action: PayloadAction<UserQualifications>) => {
      state.qualifications = action.payload;
    },
    addALResult: (state, action: PayloadAction<{ subject: string; grade: string }>) => {
      state.qualifications.alResults.push(action.payload);
    },
    removeALResult: (state, action: PayloadAction<number>) => {
      state.qualifications.alResults.splice(action.payload, 1);
    },
    updateALResult: (state, action: PayloadAction<{ index: number; subject: string; grade: string }>) => {
      const { index, subject, grade } = action.payload;
      if (state.qualifications.alResults[index]) {
        state.qualifications.alResults[index] = { subject, grade };
      }
    },
    addOtherQualification: (state, action: PayloadAction<string>) => {
      state.qualifications.otherQualifications.push(action.payload);
    },
    removeOtherQualification: (state, action: PayloadAction<number>) => {
      state.qualifications.otherQualifications.splice(action.payload, 1);
    },
    clearQualifications: (state) => {
      state.qualifications.alResults = [];
      state.qualifications.otherQualifications = [];
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
      // Add to beginning and limit to 10 recent searches
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
    
    // Reset user data (for logout)
    resetUserData: (state) => {
      return initialState;
    },
  },
});

export const {
  // Qualification actions
  setQualifications,
  addALResult,
  removeALResult,
  updateALResult,
  addOtherQualification,
  removeOtherQualification,
  clearQualifications,
  
  // Preference actions
  setPreferredUniversities,
  addPreferredUniversity,
  removePreferredUniversity,
  setPreferredFields,
  addPreferredField,
  
  // Search & saved actions
  addToSearchHistory,
  clearSearchHistory,
  addSavedCourse,
  removeSavedCourse,
  
  // Reset action
  resetUserData,
} = userSlice.actions;

export default userSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserQualifications } from '../../types';

interface UserState {
  qualifications: UserQualifications;
  isAuthenticated: boolean;
  profile: {
    name: string;
    email: string;
    phone?: string;
  } | null;
}

const initialState: UserState = {
  qualifications: {
    alResults: [],
    otherQualifications: [],
  },
  isAuthenticated: false,
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setQualifications: (state, action: PayloadAction<UserQualifications>) => {
      state.qualifications = action.payload;
    },
    addALResult: (state, action: PayloadAction<{ subject: string; grade: string }>) => {
      state.qualifications.alResults.push(action.payload);
    },
    removeALResult: (state, action: PayloadAction<number>) => {
      state.qualifications.alResults.splice(action.payload, 1);
    },
    addOtherQualification: (state, action: PayloadAction<string>) => {
      state.qualifications.otherQualifications.push(action.payload);
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
  },
});

export const {
  setQualifications,
  addALResult,
  removeALResult,
  addOtherQualification,
  setAuthenticated,
  setProfile,
} = userSlice.actions;

export default userSlice.reducer;
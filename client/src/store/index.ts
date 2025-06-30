// client/src/store/index.ts - Updated with subjects reducer
import { configureStore } from '@reduxjs/toolkit';
import universitiesReducer from './slices/universitiesSlice';
import coursesReducer from './slices/coursesSlice';
import blogReducer from './slices/blogSlice';
import searchReducer from './slices/searchSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import subjectsReducer from './slices/subjectSlice';
import eventsReducer from './slices/eventsSlice'; 

export const store = configureStore({
  reducer: {
    universities: universitiesReducer,
    courses: coursesReducer,
    blog: blogReducer,
    search: searchReducer,
    user: userReducer,
    auth: authReducer,
    subjects: subjectsReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
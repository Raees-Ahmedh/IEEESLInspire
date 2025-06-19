import { configureStore } from '@reduxjs/toolkit';
import universitiesReducer from './slices/universitiesSlice';
import coursesReducer from './slices/coursesSlice';
import blogReducer from './slices/blogSlice';
import searchReducer from './slices/searchSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    universities: universitiesReducer,
    courses: coursesReducer,
    blog: blogReducer,
    search: searchReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
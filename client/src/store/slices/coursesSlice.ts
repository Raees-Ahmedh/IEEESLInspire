import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '../../types';

interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  filteredCourses: Course[];
}

const initialState: CoursesState = {
  courses: [
    {
      id: 1,
      name: "Computer Science",
      university: "University of Colombo",
      duration: "4 years",
      requirements: ["Mathematics A", "Physics B", "Chemistry C"],
      description: "Comprehensive computer science program covering software engineering, algorithms, and data structures.",
      category: "Technology"
    },
    {
      id: 2,
      name: "Medicine",
      university: "University of Peradeniya",
      duration: "5 years",
      requirements: ["Biology A", "Chemistry A", "Physics B"],
      description: "Medical degree program preparing students for careers in healthcare and medical research.",
      category: "Medicine"
    },
    {
      id: 3,
      name: "Engineering",
      university: "University of Moratuwa",
      duration: "4 years",
      requirements: ["Mathematics A", "Physics A", "Chemistry B"],
      description: "Engineering program with specializations in civil, mechanical, and electrical engineering.",
      category: "Engineering"
    }
  ],
  loading: false,
  error: null,
  filteredCourses: [],
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilteredCourses: (state, action: PayloadAction<Course[]>) => {
      state.filteredCourses = action.payload;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setFilteredCourses,
  addCourse,
} = coursesSlice.actions;

export default coursesSlice.reducer;
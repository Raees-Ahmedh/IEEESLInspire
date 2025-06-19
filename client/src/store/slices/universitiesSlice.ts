import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { University } from '../../types';

interface UniversitiesState {
  universities: University[];
  loading: boolean;
  error: string | null;
  selectedUniversity: University | null;
}

const initialState: UniversitiesState = {
  universities: [
    {
      id: 1,
      name: "University of Colombo",
      programs: 45,
      location: "Colombo",
      image: "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1921
    },
    {
      id: 2,
      name: "University of Peradeniya",
      programs: 38,
      location: "Kandy",
      image: "https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1942
    },
    {
      id: 3,
      name: "Sri Rajarata University",
      programs: 35,
      location: "Mihintale",
      image: "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1996
    },
    {
      id: 4,
      name: "University of Jaffna",
      programs: 28,
      location: "Jaffna",
      image: "https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1974
    },
    {
      id: 5,
      name: "University of Kelaniya",
      programs: 42,
      location: "Kelaniya",
      image: "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1959
    },
    {
      id: 6,
      name: "University of Moratuwa",
      programs: 31,
      location: "Moratuwa",
      image: "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1966
    },
    {
      id: 7,
      name: "University of Ruhuna",
      programs: 25,
      location: "Matara",
      image: "https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1978
    },
    {
      id: 8,
      name: "Eastern University",
      programs: 38,
      location: "Batticaloa",
      image: "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1986
    },
    {
      id: 9,
      name: "Sabaragamuwa University",
      programs: 29,
      location: "Belihuloya",
      image: "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=400",
      type: "government",
      established: 1991
    }
  ],
  loading: false,
  error: null,
  selectedUniversity: null,
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
    addUniversity: (state, action: PayloadAction<University>) => {
      state.universities.push(action.payload);
    },
    updateUniversity: (state, action: PayloadAction<University>) => {
      const index = state.universities.findIndex(uni => uni.id === action.payload.id);
      if (index !== -1) {
        state.universities[index] = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setSelectedUniversity,
  addUniversity,
  updateUniversity,
} = universitiesSlice.actions;

export default universitiesSlice.reducer;
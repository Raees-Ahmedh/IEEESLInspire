import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchFilters } from '../../types';

interface SearchState {
  filters: SearchFilters;
  isSearching: boolean;
  searchResults: any[];
}

const initialState: SearchState = {
  filters: {
    query: '',
    location: '',
    category: '',
    universityType: 'all',
  },
  isSearching: false,
  searchResults: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.query = action.payload;
    },
    setLocationFilter: (state, action: PayloadAction<string>) => {
      state.filters.location = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
    },
    setUniversityTypeFilter: (state, action: PayloadAction<'all' | 'government' | 'private'>) => {
      state.filters.universityType = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setSearchQuery,
  setLocationFilter,
  setCategoryFilter,
  setUniversityTypeFilter,
  setFilters,
  setIsSearching,
  setSearchResults,
  clearFilters,
} = searchSlice.actions;

export default searchSlice.reducer;
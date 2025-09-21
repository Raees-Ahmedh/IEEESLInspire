import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchFilters } from '../../types';
import { SearchResult } from '../../types/search';

interface SearchState {
  filters: SearchFilters;
  isSearching: boolean;
  searchResults: any[];
  // Navbar search specific state
  navbarResults: SearchResult[];
  isNavbarSearching: boolean;
  showNavbarDropdown: boolean;
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
  // Navbar search initial state
  navbarResults: [],
  isNavbarSearching: false,
  showNavbarDropdown: false,
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
    // Navbar search actions
    setNavbarResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.navbarResults = action.payload;
    },
    setIsNavbarSearching: (state, action: PayloadAction<boolean>) => {
      state.isNavbarSearching = action.payload;
    },
    setShowNavbarDropdown: (state, action: PayloadAction<boolean>) => {
      state.showNavbarDropdown = action.payload;
    },
    clearNavbarSearch: (state) => {
      state.navbarResults = [];
      state.isNavbarSearching = false;
      state.showNavbarDropdown = false;
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
  setNavbarResults,
  setIsNavbarSearching,
  setShowNavbarDropdown,
  clearNavbarSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
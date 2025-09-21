// client/src/services/searchService.ts - Search API service
import { 
  SearchApiResponse, 
  SuggestionsApiResponse, 
  FullSearchApiResponse,
  SearchRequest,
  SearchFilters 
} from '../types/search';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class SearchService {
  /**
   * Search for navbar dropdown (limited results, fast response)
   */
  async searchForNavbar(query: string, limit: number = 6): Promise<SearchApiResponse> {
    try {
      if (!query.trim() || query.length < 2) {
        return {
          success: true,
          courses: [],
          total: 0,
          query: query
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/search/navbar?query=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Navbar search error:', error);
      return {
        success: false,
        courses: [],
        total: 0,
        query: query,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Full search with pagination and filters
   */
  async searchFull(searchRequest: SearchRequest): Promise<FullSearchApiResponse> {
    try {
      const { query, filters = {}, pagination = { page: 1, limit: 12 } } = searchRequest;

      if (!query.trim()) {
        return {
          success: true,
          courses: [],
          total: 0,
          query: query
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('query', query);
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE_URL}/simple-search?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Full search error:', error);
      return {
        success: false,
        courses: [],
        total: 0,
        query: searchRequest.query,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(query: string, limit: number = 5): Promise<SuggestionsApiResponse> {
    try {
      if (!query.trim() || query.length < 2) {
        return {
          success: true,
          suggestions: [],
          query: query
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/simple-search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Suggestions error:', error);
      return {
        success: false,
        suggestions: [],
        query: query,
        error: error instanceof Error ? error.message : 'Failed to get suggestions'
      };
    }
  }

  /**
   * Quick search for testing (lightweight)
   */
  async quickSearch(query: string, limit: number = 3): Promise<any> {
    try {
      if (!query.trim()) {
        return {
          success: true,
          results: [],
          message: 'Query is empty'
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/search/quick/${encodeURIComponent(query)}?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Quick search error:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Quick search failed'
      };
    }
  }

  /**
   * Get filter options for advanced search
   */
  async getFilterOptions(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/simple-search/filter-options`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Filter options error:', error);
      return {
        success: false,
        filterOptions: {},
        error: error instanceof Error ? error.message : 'Failed to get filter options'
      };
    }
  }

  /**
   * Utility method to build search URL for navigation
   */
  buildSearchUrl(query: string, filters?: SearchFilters): string {
    const params = new URLSearchParams();
    params.append('q', query);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });
    }

    return `/search?${params.toString()}`;
  }

  /**
   * Utility method to highlight search terms in text
   */
  highlightSearchTerms(text: string, searchQuery: string): string {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Utility method to format search results for display
   */
  formatSearchResult(result: any) {
    return {
      ...result,
      formattedFee: result.feeType === 'free' 
        ? 'Free' 
        : result.feeAmount 
          ? `LKR ${result.feeAmount.toLocaleString()}` 
          : 'Paid',
      formattedDuration: result.durationMonths 
        ? `${Math.floor(result.durationMonths / 12)}y ${result.durationMonths % 12}m`
        : null,
      universityInfo: `${result.university.name} • ${result.faculty.name}`
    };
  }
}

// Create and export a singleton instance
const searchService = new SearchService();
export default searchService;

// Also export the class for potential direct usage
export { SearchService };
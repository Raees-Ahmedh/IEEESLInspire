// client/src/services/authService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  role: string;
  isActive: boolean;
  hasProfile?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: any[];
}

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid request data');
        } else if (response.status === 401) {
          throw new Error(data.message || 'Authentication failed');
        } else if (response.status === 409) {
          throw new Error(data.message || 'User already exists');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Request failed');
        }
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      throw new Error(error.message || 'Network error occurred');
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data?.token) {
        this.saveToken(response.data.token);
        this.saveUser(response.data.user);
      }

      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data?.token) {
        this.saveToken(response.data.token);
        this.saveUser(response.data.user);
      }

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Save token to localStorage
   */
  saveToken(token: string): void {
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Save user data to localStorage
   */
  saveUser(user: User): void {
    try {
      localStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Get user data from localStorage
   */
  getUser(): User | null {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        this.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.removeToken();
      return false;
    }
  }

  /**
   * Get user info from JWT token
   */
  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeToken();
  }

  /**
   * Get current user (from localStorage or token)
   */
  getCurrentUser(): User | null {
    const storedUser = this.getUser();
    if (storedUser) return storedUser;

    const tokenUser = this.getUserFromToken();
    if (tokenUser) {
      return {
        id: tokenUser.userId,
        email: tokenUser.email,
        role: tokenUser.role,
        userType: 'student',
        isActive: true,
      };
    }

    return null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is student
   */
  isStudent(): boolean {
    return this.hasRole('student');
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
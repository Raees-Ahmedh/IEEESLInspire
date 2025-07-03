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

export interface ApiError {
  success: false;
  message: string;
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

      const data = await response.json() as AuthResponse;
      
      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 400) {
          throw new Error((data as any).message || 'Invalid request data');
        } else if (response.status === 401) {
          throw new Error((data as any).message || 'Authentication failed');
        } else if (response.status === 409) {
          throw new Error((data as any).message || 'User already exists');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error((data as any).message || 'Request failed');
        }
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Re-throw the error with the original message
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

      // If registration is successful, automatically save the token
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

      // If login is successful, save the token and user data
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
      // Basic JWT token validation (check if expired)
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
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const authHeaders = this.getAuthHeader();
    
    return this.makeRequest(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
      },
    });
  }

  /**
   * Refresh token (if you implement refresh token functionality)
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/refresh', {
        method: 'POST',
      });

      if (response.success && response.data?.token) {
        this.saveToken(response.data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
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
    // First try to get from localStorage
    const storedUser = this.getUser();
    if (storedUser) return storedUser;

    // If not in localStorage, try to get from token
    const tokenUser = this.getUserFromToken();
    if (tokenUser) {
      return {
        id: tokenUser.userId,
        email: tokenUser.email,
        role: tokenUser.role,
        userType: 'student', // default
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

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await this.makeAuthenticatedRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      // Update stored user data if successful
      if (response.success && response.data?.user) {
        this.saveUser(response.data.user);
      }

      return response;
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.makeAuthenticatedRequest('/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      return response;
    } catch (error: any) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      return response;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
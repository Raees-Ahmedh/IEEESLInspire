// client/src/services/adminService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface CreateManagerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  university: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

class AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Create new manager
  async createManager(managerData: CreateManagerRequest): Promise<ApiResponse<Manager>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/managers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(managerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return data;
    } catch (error) {
      console.error('Create manager error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Get all managers
  async getManagers(): Promise<ApiResponse<Manager[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/managers`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return data;
    } catch (error) {
      console.error('Get managers error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Toggle manager active status
  async toggleManagerStatus(managerId: string): Promise<ApiResponse<Manager>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/managers/${managerId}/toggle-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }

      return data;
    } catch (error) {
      console.error('Toggle manager status error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }
}

export default new AdminService();
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

export interface MajorField {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  auditInfo: any;
}

export interface SubField {
  id: number;
  name: string;
  description?: string;
  majorId: number;
  isActive: boolean;
  auditInfo: any;
  majorField: {
    id: number;
    name: string;
  };
}

export interface CreateMajorFieldRequest {
  name: string;
  description?: string;
}

export interface CreateSubFieldRequest {
  name: string;
  description?: string;
  majorId: number;
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

  // ======================== MAJOR FIELDS ========================

  // Get all major fields
  async getMajorFields(): Promise<ApiResponse<MajorField[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/major-fields`, {
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
      console.error('Get major fields error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Create new major field
  async createMajorField(majorFieldData: CreateMajorFieldRequest): Promise<ApiResponse<MajorField>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/major-fields`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(majorFieldData),
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
      console.error('Create major field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // ======================== SUB FIELDS ========================

  // Get all sub fields
  async getSubFields(): Promise<ApiResponse<SubField[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sub-fields`, {
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
      console.error('Get sub fields error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Create new sub field
  async createSubField(subFieldData: CreateSubFieldRequest): Promise<ApiResponse<SubField>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sub-fields`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(subFieldData),
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
      console.error('Create sub field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }
}

export default new AdminService();
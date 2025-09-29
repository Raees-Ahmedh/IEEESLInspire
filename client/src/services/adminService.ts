// client/src/services/adminService.ts

import authService from './authService';

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

export interface CareerPathway {
  id?: number;
  jobTitle: string;
  industry?: string;
  description?: string;
  salaryRange?: string;
}

export interface CreateCareerPathwayRequest {
  jobTitle: string;
  industry?: string;
  description?: string;
  salaryRange?: string;
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
    const token = authService.getToken();
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

  // ======================== MAJOR FIELDS MANAGEMENT ========================

  // Get all major fields
  async getMajorFields(): Promise<ApiResponse<MajorField[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/major-fields`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
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
        body: JSON.stringify(majorFieldData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create major field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Update major field
  async updateMajorField(id: number, majorFieldData: Partial<CreateMajorFieldRequest>): Promise<ApiResponse<MajorField>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/major-fields/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(majorFieldData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update major field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Delete major field
  async deleteMajorField(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/major-fields/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete major field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // ======================== SUB FIELDS MANAGEMENT ========================

  // Get all sub fields
  async getSubFields(): Promise<ApiResponse<SubField[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sub-fields`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get sub fields error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Get sub fields by major field
  async getSubFieldsByMajor(majorId: number): Promise<ApiResponse<SubField[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sub-fields/by-major/${majorId}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get sub fields by major error:', error);
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
        body: JSON.stringify(subFieldData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create sub field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Update sub field
  async updateSubField(id: number, subFieldData: Partial<CreateSubFieldRequest>): Promise<ApiResponse<SubField>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sub-fields/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(subFieldData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update sub field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Delete sub field
  async deleteSubField(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sub-fields/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete sub field error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // ======================== CAREER PATHWAYS MANAGEMENT ========================

  // Get all career pathways
  async getCareerPathways(): Promise<ApiResponse<CareerPathway[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/career-pathways`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get career pathways error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Search career pathways by job title
  async searchCareersByJobTitle(jobTitle: string): Promise<ApiResponse<CareerPathway[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/career-pathways/search?jobTitle=${encodeURIComponent(jobTitle)}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search career pathways error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Create new career pathway
  async createCareerPathway(careerData: CreateCareerPathwayRequest): Promise<ApiResponse<CareerPathway>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/career-pathways`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(careerData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create career pathway error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Update career pathway
  async updateCareerPathway(id: number, careerData: Partial<CreateCareerPathwayRequest>): Promise<ApiResponse<CareerPathway>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/career-pathways/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(careerData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update career pathway error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // Delete career pathway
  async deleteCareerPathway(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/career-pathways/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete career pathway error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  // ======================== FRAMEWORK MANAGEMENT ========================

  // Get framework levels by type
  async getFrameworkLevelsByType(frameworkType: string): Promise<ApiResponse<{ id: number, level: number }[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/framework-levels/${frameworkType}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get framework levels by type error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }
}

export default new AdminService();
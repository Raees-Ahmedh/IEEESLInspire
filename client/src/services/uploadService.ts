import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface UploadResponse {
  success: boolean;
  data: {
    id: number;
    materialType: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
  };
  error?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data: Array<{
    id: number;
    materialType: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  error?: string;
}

export interface CourseMaterial {
  id?: number;
  materialType: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  file?: File;
}

class UploadService {
  private baseUrl = `${API_BASE_URL}/upload`;

  /**
   * Upload a single course material file
   */
  async uploadCourseMaterial(
    file: File,
    materialType: string,
    uploadedBy: number
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('materialType', materialType);
      formData.append('uploadedBy', uploadedBy.toString());

      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/course-material`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        data: {
          id: 0,
          materialType: '',
          fileName: '',
          filePath: '',
          fileType: '',
          fileSize: 0,
          uploadedAt: ''
        },
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple course material files
   */
  async uploadMultipleCourseMaterials(
    files: File[],
    materials: Array<{ materialType: string }>,
    uploadedBy: number
  ): Promise<MultipleUploadResponse> {
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add materials data
      formData.append('materials', JSON.stringify(materials));
      formData.append('uploadedBy', uploadedBy.toString());

      const response = await fetch(`${this.baseUrl}/multiple-course-materials`, {
        method: 'POST',
        headers: {
          ...(authService.getToken() && { 'Authorization': `Bearer ${authService.getToken()}` })
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error: any) {
      console.error('Multiple upload error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Delete a course material
   */
  async deleteCourseMaterial(materialId: number): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/course-material/${materialId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      return result;
    } catch (error: any) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Delete failed'
      };
    }
  }

  /**
   * Upload course materials with progress tracking
   */
  async uploadCourseMaterialsWithProgress(
    materials: Array<{ file: File; materialType: string }>,
    uploadedBy: number,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; materials: any[]; error?: string }> {
    try {
      const uploadedMaterials = [];
      const total = materials.length;

      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        
        // Update progress
        if (onProgress) {
          onProgress((i / total) * 100);
        }

        const result = await this.uploadCourseMaterial(
          material.file,
          material.materialType,
          uploadedBy
        );

        if (result.success) {
          uploadedMaterials.push(result.data);
        } else {
          throw new Error(`Failed to upload ${material.file.name}: ${result.error}`);
        }
      }

      // Complete progress
      if (onProgress) {
        onProgress(100);
      }

      return {
        success: true,
        materials: uploadedMaterials
      };
    } catch (error: any) {
      console.error('Batch upload error:', error);
      return {
        success: false,
        materials: [],
        error: error.message || 'Batch upload failed'
      };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Allowed types: PDF, DOC, DOCX, JPG, PNG, TXT'
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const uploadService = new UploadService();
export default uploadService;

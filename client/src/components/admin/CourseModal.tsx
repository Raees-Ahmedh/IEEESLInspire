import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Plus, Trash2, Upload } from 'lucide-react';
import { 
  University, 
  Faculty, 
  Department,
  Subject,
  Course
} from '../../types/course';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Omit<Course, 'id'> | Course) => void | Promise<void>;
  course?: Course;
  universities: University[];
  subjects?: Subject[];
}

interface FormData {
  name: string;
  courseCode: string;
  courseUrl: string;
  specialisation: string[];
  universityId: number;
  facultyId: number;
  departmentId: number;
  courseType: 'internal' | 'external';
  studyMode: 'fulltime' | 'parttime';
  feeType: 'free' | 'paid';
  feeAmount?: number;
  frameworkType: 'SLQF' | 'NVQ';
  frameworkLevel: number;
  durationMonths: number;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  course,
  universities,
  subjects = []
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    courseCode: '',
    courseUrl: '',
    specialisation: [],
    universityId: 0,
    facultyId: 0,
    departmentId: 0,
    courseType: 'internal',
    studyMode: 'fulltime',
    feeType: 'free',
    frameworkType: 'SLQF',
    frameworkLevel: 4,
    durationMonths: 36,
    description: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  
  // API Data States
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  
  // Specialization input
  const [newSpecialization, setNewSpecialization] = useState('');

  // Fetch real data from APIs
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Fetch faculties when university changes
  useEffect(() => {
    if (formData.universityId && isOpen) {
      fetchFaculties(formData.universityId);
    }
  }, [formData.universityId, isOpen]);

  // Fetch departments when faculty changes
  useEffect(() => {
    if (formData.facultyId && isOpen) {
      fetchDepartments(formData.facultyId);
    }
  }, [formData.facultyId, isOpen]);

  const fetchInitialData = async () => {
    try {
      setApiLoading(true);
      
      // Fetch frameworks
      const frameworksResponse = await fetch(`${API_BASE_URL}/admin/frameworks`);
      if (frameworksResponse.ok) {
        const frameworksResult = await frameworksResponse.json();
        if (frameworksResult.success) {
          setFrameworks(frameworksResult.data);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setApiLoading(false);
    }
  };

  const fetchFaculties = async (universityId: number) => {
    try {
      setApiLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/admin/faculties?universityId=${universityId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFaculties(result.data);
          console.log(`📚 Loaded ${result.data.length} faculties for university ${universityId}`);
        }
      } else {
        // Fallback to mock data if API fails
        const mockFaculties: Faculty[] = [
          { id: 1, name: 'Faculty of Engineering', universityId },
          { id: 2, name: 'Faculty of Science', universityId },
          { id: 3, name: 'Faculty of Medicine', universityId },
          { id: 4, name: 'Faculty of Management', universityId },
          { id: 5, name: 'Faculty of Arts', universityId },
        ];
        setFaculties(mockFaculties.filter(f => f.universityId === universityId));
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFaculties([]);
    } finally {
      setApiLoading(false);
    }
  };

  const fetchDepartments = async (facultyId: number) => {
    try {
      setApiLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/admin/departments?facultyId=${facultyId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDepartments(result.data);
          console.log(`🏢 Loaded ${result.data.length} departments for faculty ${facultyId}`);
        }
      } else {
        // Fallback to mock data if API fails
        const mockDepartments: Department[] = [
          { id: 1, name: 'Computer Science & Engineering', facultyId: 1 },
          { id: 2, name: 'Electrical Engineering', facultyId: 1 },
          { id: 3, name: 'Mathematics', facultyId: 2 },
          { id: 4, name: 'Physics', facultyId: 2 },
          { id: 5, name: 'Internal Medicine', facultyId: 3 },
          { id: 6, name: 'Business Administration', facultyId: 4 },
        ];
        setDepartments(mockDepartments.filter(d => d.facultyId === facultyId));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Initialize form data when course prop changes
  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        name: course.name,
        courseCode: course.courseCode || '',
        courseUrl: course.courseUrl,
        specialisation: course.specialisation || [],
        universityId: course.university.id,
        facultyId: course.faculty.id,
        departmentId: course.department.id,
        courseType: course.courseType,
        studyMode: course.studyMode,
        feeType: course.feeType,
        feeAmount: course.feeAmount,
        frameworkType: course.framework?.type || 'SLQF',
        frameworkLevel: course.framework?.level || 4,
        durationMonths: course.durationMonths || 36,
        description: course.description || ''
      });
    } else if (isOpen) {
      // Reset form for new course
      setFormData({
        name: '',
        courseCode: '',
        courseUrl: '',
        specialisation: [],
        universityId: 0,
        facultyId: 0,
        departmentId: 0,
        courseType: 'internal',
        studyMode: 'fulltime',
        feeType: 'free',
        frameworkType: 'SLQF',
        frameworkLevel: 4,
        durationMonths: 36,
        description: ''
      });
      setErrors({});
      setCurrentStep(1);
    }
  }, [course, isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Course name is required';
        if (!formData.courseUrl.trim()) newErrors.courseUrl = 'Course URL is required';
        if (!formData.universityId) newErrors.universityId = 'University is required';
        if (!formData.facultyId) newErrors.facultyId = 'Faculty is required';
        if (!formData.departmentId) newErrors.departmentId = 'Department is required';
        break;
      case 2:
        if (!formData.frameworkType) newErrors.frameworkType = 'Framework type is required';
        if (!formData.frameworkLevel) newErrors.frameworkLevel = 'Framework level is required';
        if (!formData.durationMonths || formData.durationMonths < 1) {
          newErrors.durationMonths = 'Duration must be at least 1 month';
        }
        if (formData.feeType === 'paid' && (!formData.feeAmount || formData.feeAmount <= 0)) {
          newErrors.feeAmount = 'Fee amount is required for paid courses';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specialisation.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specialisation: [...prev.specialisation, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialisation: prev.specialisation.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Find university, faculty, department objects
      const university = universities.find(u => u.id === formData.universityId);
      const faculty = faculties.find(f => f.id === formData.facultyId);
      const department = departments.find(d => d.id === formData.departmentId);

      if (!university) {
        setErrors({ universityId: 'Selected university not found' });
        return;
      }

      const courseData: Omit<Course, 'id'> | Course = {
        ...(course ? { id: course.id } : {}),
        name: formData.name,
        courseCode: formData.courseCode,
        courseUrl: formData.courseUrl,
        specialisation: formData.specialisation,
        university,
        faculty: faculty || { id: 0, name: 'Not specified' },
        department: department || { id: 0, name: 'Not specified' },
        courseType: formData.courseType,
        studyMode: formData.studyMode,
        feeType: formData.feeType,
        feeAmount: formData.feeAmount,
        framework: {
          id: 0,
          type: formData.frameworkType,
          qualificationCategory: formData.frameworkType === 'SLQF' ? 'Degree' : 'Certificate',
          level: formData.frameworkLevel
        },
        frameworkLevel: formData.frameworkLevel,
        durationMonths: formData.durationMonths,
        description: formData.description,
        isActive: true,
        auditInfo: {
          createdAt: course?.auditInfo.createdAt || new Date().toISOString(),
          createdBy: course?.auditInfo.createdBy || 'admin',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin'
        }
      };

      await onSubmit(courseData);
      onClose();
    } catch (error) {
      console.error('Error submitting course:', error);
      setErrors({ submit: 'Failed to save course. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get available framework levels for selected type
  const availableLevels = frameworks
    .filter(f => f.type === formData.frameworkType)
    .map(f => f.level)
    .sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {course ? 'Edit Course' : 'Add New Course'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Step {currentStep} of 2
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className={`flex-1 h-1 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  <div className={`flex-1 h-1 rounded-full ml-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    Basic Details
                  </span>
                  <span className={`text-xs ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    Requirements & Details
                  </span>
                </div>
              </div>

              {/* API Loading Indicator */}
              {apiLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-blue-700">Loading data...</span>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Course Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter course name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Course Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={formData.courseCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., CSE001"
                    />
                  </div>

                  {/* Course URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course URL *
                    </label>
                    <input
                      type="url"
                      value={formData.courseUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseUrl: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/course"
                    />
                    {errors.courseUrl && <p className="mt-1 text-sm text-red-600">{errors.courseUrl}</p>}
                  </div>

                  {/* University */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      University *
                    </label>
                    <select
                      value={formData.universityId}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        universityId: parseInt(e.target.value),
                        facultyId: 0,
                        departmentId: 0
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select University</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </select>
                    {errors.universityId && <p className="mt-1 text-sm text-red-600">{errors.universityId}</p>}
                  </div>

                  {/* Faculty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Faculty *
                    </label>
                    <select
                      value={formData.facultyId}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        facultyId: parseInt(e.target.value),
                        departmentId: 0
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.universityId || apiLoading}
                    >
                      <option value={0}>Select Faculty</option>
                      {faculties.map(faculty => (
                        <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                      ))}
                    </select>
                    {errors.facultyId && <p className="mt-1 text-sm text-red-600">{errors.facultyId}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Department *
                    </label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentId: parseInt(e.target.value) }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.facultyId || apiLoading}
                    >
                      <option value={0}>Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add specialization"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                      />
                      <button
                        type="button"
                        onClick={addSpecialization}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialisation.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpecialization(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Requirements & Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* Course Type & Study Mode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Course Type
                      </label>
                      <select
                        value={formData.courseType}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.value as 'internal' | 'external' }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Study Mode
                      </label>
                      <select
                        value={formData.studyMode}
                        onChange={(e) => setFormData(prev => ({ ...prev, studyMode: e.target.value as 'fulltime' | 'parttime' }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fulltime">Full Time</option>
                        <option value="parttime">Part Time</option>
                      </select>
                    </div>
                  </div>

                  {/* Framework */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Framework Type *
                      </label>
                      <select
                        value={formData.frameworkType}
                        onChange={(e) => setFormData(prev => ({ ...prev, frameworkType: e.target.value as 'SLQF' | 'NVQ', frameworkLevel: 4 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SLQF">SLQF</option>
                        <option value="NVQ">NVQ</option>
                      </select>
                      {errors.frameworkType && <p className="mt-1 text-sm text-red-600">{errors.frameworkType}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Framework Level *
                      </label>
                      <select
                        value={formData.frameworkLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, frameworkLevel: parseInt(e.target.value) }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableLevels.length > 0 ? (
                          availableLevels.map(level => (
                            <option key={level} value={level}>Level {level}</option>
                          ))
                        ) : (
                          // Fallback levels if API data not available
                          (formData.frameworkType === 'SLQF' ? [4, 5, 6, 7, 8] : [1, 2, 3, 4, 5]).map(level => (
                            <option key={level} value={level}>Level {level}</option>
                          ))
                        )}
                      </select>
                      {errors.frameworkLevel && <p className="mt-1 text-sm text-red-600">{errors.frameworkLevel}</p>}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (months) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) || 1 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="36"
                    />
                    {errors.durationMonths && <p className="mt-1 text-sm text-red-600">{errors.durationMonths}</p>}
                  </div>

                  {/* Fee Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Information
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <select
                          value={formData.feeType}
                          onChange={(e) => setFormData(prev => ({ ...prev, feeType: e.target.value as 'free' | 'paid', feeAmount: e.target.value === 'free' ? undefined : prev.feeAmount }))}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="free">Free</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                      {formData.feeType === 'paid' && (
                        <div>
                          <input
                            type="number"
                            min="0"
                            value={formData.feeAmount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, feeAmount: parseFloat(e.target.value) || undefined }))}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter fee amount (LKR)"
                          />
                          {errors.feeAmount && <p className="mt-1 text-sm text-red-600">{errors.feeAmount}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter course description..."
                    />
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {currentStep === 2 ? (
                <button
                  type="submit"
                  disabled={loading || apiLoading}
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {course ? 'Update Course' : 'Create Course'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={apiLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Next Step
                </button>
              )}
              
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Previous
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
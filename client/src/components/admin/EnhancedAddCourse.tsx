import React, { useState, useEffect, useCallback } from 'react';
import courseService, { AddCourseData, CourseFormData } from '../../services/newCourseService';
import {
  X,
  Check,
  Plus,
  Trash2,
  Save,
  FileText,
  Users,
  Settings,
  Briefcase,
  AlertTriangle,
  Eye
} from 'lucide-react';

// Enhanced Types for Component State Management
interface Faculty {
  id: number;
  name: string;
  universityId: number;
}

interface Department {
  id: number;
  name: string;
  facultyId: number;
}

// Form Steps
type FormStep = 'basic' | 'structure' | 'configuration' | 'requirements' | 'careers' | 'review';

const EnhancedAddCourse: React.FC<{ onClose?: () => void; onSuccess?: () => void }> = ({ 
  onClose, 
  onSuccess 
}) => {
  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData | null>(null);

  // Course data
  const [courseData, setCourseData] = useState<Partial<AddCourseData>>({
    name: '',
    courseCode: '',
    courseUrl: '',
    description: '',
    specialisation: [],
    universityId: 0,
    facultyId: 0,
    departmentId: 0,
    subfieldId: [],
    studyMode: 'fulltime',
    courseType: 'internal',
    frameworkId: undefined,
    feeType: 'free',
    feeAmount: undefined,
    durationMonths: undefined,
    medium: [],
    zscore: {},
    additionalDetails: {
      intakeCount: undefined,
      syllabus: '',
      customFields: {}
    },
    requirements: {
      minRequirement: 'ALPass',
      streams: [],
      ruleSubjectBasket: {},
      ruleSubjectGrades: {},
      ruleOLGrades: {}
    },
    careerPathways: []
  });

  // Filtered data based on selections
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  // Load form data on mount
  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      try {
        const result = await courseService.getFormData();
        if (result.success && result.data) {
          setFormData(result.data);
        } else {
          setError(result.error || 'Failed to load form data');
        }
      } catch (err) {
        setError('Failed to load form data');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, []);

  // Filter faculties when university changes
  useEffect(() => {
    if (formData && courseData.universityId) {
      const faculties = formData.faculties.filter(f => f.universityId === courseData.universityId);
      setFilteredFaculties(faculties);
      
      // Reset dependent fields
      setCourseData(prev => ({ ...prev, facultyId: 0, departmentId: 0 }));
    }
  }, [courseData.universityId, formData]);

  // Filter departments when faculty changes
  useEffect(() => {
    if (formData && courseData.facultyId) {
      const departments = formData.departments.filter(d => d.facultyId === courseData.facultyId);
      setFilteredDepartments(departments);
      
      // Reset department
      setCourseData(prev => ({ ...prev, departmentId: 0 }));
    }
  }, [courseData.facultyId, formData]);

  // Filter sub-fields when major fields change
  useEffect(() => {
    if (formData) {
      // Sub-fields are filtered directly in the component based on selected major fields
      // No need to maintain a separate filtered state
    }
  }, [courseData.subfieldId, formData]);

  // Form steps configuration
  const steps = [
    { id: 'basic', label: 'Basic Details', icon: FileText },
    { id: 'structure', label: 'University Structure', icon: Users },
    { id: 'configuration', label: 'Course Configuration', icon: Settings },
    { id: 'requirements', label: 'Requirements', icon: Check },
    { id: 'careers', label: 'Career Paths', icon: Briefcase },
    { id: 'review', label: 'Review & Submit', icon: Eye }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Navigation functions
  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as FormStep);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as FormStep);
    }
  };

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  // Form handlers
  const handleInputChange = useCallback((field: string, value: any) => {
    setCourseData(prev => {
      if (field.includes('.')) {
        const keys = field.split('.');
        const newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      }
      
      return { ...prev, [field]: value };
    });
  }, []);

  // Array handlers
  const addToArray = useCallback((field: string, value: any) => {
    setCourseData(prev => {
      const currentArray = prev[field as keyof AddCourseData] as any[] || [];
      return { ...prev, [field]: [...currentArray, value] };
    });
  }, []);

  const removeFromArray = useCallback((field: string, index: number) => {
    setCourseData(prev => {
      const currentArray = prev[field as keyof AddCourseData] as any[] || [];
      return { ...prev, [field]: currentArray.filter((_, i) => i !== index) };
    });
  }, []);

  // Submit handler
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!courseData.name || !courseData.courseUrl || !courseData.universityId || 
          !courseData.facultyId || !courseData.departmentId || 
          !courseData.subfieldId?.length || !courseData.medium?.length) {
        throw new Error('Please fill in all required fields');
      }

      const result = await courseService.addCourse(courseData as AddCourseData);
      
      if (result.success) {
        onSuccess?.();
        onClose?.();
      } else {
        setError(result.error || 'Failed to create course');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const isStepValid = (step: FormStep): boolean => {
    switch (step) {
      case 'basic':
        return !!(courseData.name && courseData.courseUrl);
      case 'structure':
        return !!(courseData.universityId && courseData.facultyId && 
                 courseData.departmentId && courseData.subfieldId?.length);
      case 'configuration':
        return !!(courseData.studyMode && courseData.courseType && 
                 courseData.feeType && courseData.medium?.length);
      case 'requirements':
        return true; // Optional step
      case 'careers':
        return true; // Optional step
      case 'review':
        return isStepValid('basic') && isStepValid('structure') && isStepValid('configuration');
      default:
        return false;
    }
  };

  if (isLoading && !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Add New Course</h2>
              <p className="text-purple-100">Step {currentStepIndex + 1} of {steps.length}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = isStepValid(step.id as FormStep);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id as FormStep)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : isCompleted
                        ? 'text-green-200 hover:bg-white hover:bg-opacity-10'
                        : 'text-purple-200 hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-xs hidden sm:block">{step.label}</span>
                    {isCompleted && <Check size={12} className="text-green-300" />}
                  </button>
                );
              })}
            </div>
            <div className="w-full bg-purple-800 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertTriangle className="text-red-500 mr-3" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Render step content */}
          {currentStep === 'basic' && renderBasicStep()}
          {currentStep === 'structure' && renderStructureStep()}
          {currentStep === 'configuration' && renderConfigurationStep()}
          {currentStep === 'requirements' && renderRequirementsStep()}
          {currentStep === 'careers' && renderCareersStep()}
          {currentStep === 'review' && renderReviewStep()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentStepIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            {currentStepIndex + 1} of {steps.length}
          </div>

          {currentStep === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isStepValid('review')}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isLoading || !isStepValid('review')
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Create Course</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={currentStepIndex === steps.length - 1 || !isStepValid(currentStep)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentStepIndex === steps.length - 1 || !isStepValid(currentStep)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Step rendering functions
  function renderBasicStep() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Basic Course Information</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={courseData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter course name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code
            </label>
            <input
              type="text"
              value={courseData.courseCode || ''}
              onChange={(e) => handleInputChange('courseCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter course code"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={courseData.courseUrl || ''}
            onChange={(e) => handleInputChange('courseUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://university.edu/course-page"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={courseData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter course description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specializations
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {courseData.specialisation?.map((spec, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {spec}
                <button
                  onClick={() => removeFromArray('specialisation', index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add specialization"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    addToArray('specialisation', value);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    );
  }

  function renderStructureStep() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">University Structure</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University <span className="text-red-500">*</span>
            </label>
            <select
              value={courseData.universityId || 0}
              onChange={(e) => handleInputChange('universityId', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={0}>Select University</option>
              {formData?.universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faculty <span className="text-red-500">*</span>
            </label>
            <select
              value={courseData.facultyId || 0}
              onChange={(e) => handleInputChange('facultyId', parseInt(e.target.value))}
              disabled={!courseData.universityId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value={0}>Select Faculty</option>
              {filteredFaculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={courseData.departmentId || 0}
            onChange={(e) => handleInputChange('departmentId', parseInt(e.target.value))}
            disabled={!courseData.facultyId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value={0}>Select Department</option>
            {filteredDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major Fields <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {formData?.majorFields.map((major) => (
              <label key={major.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={courseData.subfieldId?.includes(major.id) || false}
                  onChange={(e) => {
                    const currentIds = courseData.subfieldId || [];
                    if (e.target.checked) {
                      handleInputChange('subfieldId', [...currentIds, major.id]);
                    } else {
                      handleInputChange('subfieldId', currentIds.filter(id => id !== major.id));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{major.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderConfigurationStep() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Course Configuration</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Mode <span className="text-red-500">*</span>
            </label>
            <select
              value={courseData.studyMode || 'fulltime'}
              onChange={(e) => handleInputChange('studyMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Type <span className="text-red-500">*</span>
            </label>
            <select
              value={courseData.courseType || 'internal'}
              onChange={(e) => handleInputChange('courseType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Type <span className="text-red-500">*</span>
            </label>
            <select
              value={courseData.feeType || 'free'}
              onChange={(e) => handleInputChange('feeType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {courseData.feeType === 'paid' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Amount (LKR)
              </label>
              <input
                type="number"
                value={courseData.feeAmount || ''}
                onChange={(e) => handleInputChange('feeAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter fee amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Months)
              </label>
              <input
                type="number"
                value={courseData.durationMonths || ''}
                onChange={(e) => handleInputChange('durationMonths', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter duration"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Framework
          </label>
          <select
            value={courseData.frameworkId || ''}
            onChange={(e) => handleInputChange('frameworkId', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Framework (Optional)</option>
            {formData?.frameworks.map((framework) => (
              <option key={framework.id} value={framework.id}>
                {framework.type} - {framework.qualificationCategory} (Level {framework.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medium of Instruction <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Sinhala', 'Tamil', 'English'].map((medium) => (
              <label key={medium} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={courseData.medium?.includes(medium) || false}
                  onChange={(e) => {
                    const currentMedium = courseData.medium || [];
                    if (e.target.checked) {
                      handleInputChange('medium', [...currentMedium, medium]);
                    } else {
                      handleInputChange('medium', currentMedium.filter(m => m !== medium));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{medium}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderRequirementsStep() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Entry Requirements</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Requirement
          </label>
          <select
            value={courseData.requirements?.minRequirement || 'ALPass'}
            onChange={(e) => handleInputChange('requirements.minRequirement', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="noNeed">No Requirement</option>
            <option value="OLPass">O/L Pass</option>
            <option value="ALPass">A/L Pass</option>
            <option value="Graduate">Graduate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Streams
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {formData?.streams.map((stream) => (
              <label key={stream.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={courseData.requirements?.streams?.includes(stream.id) || false}
                  onChange={(e) => {
                    const currentStreams = courseData.requirements?.streams || [];
                    if (e.target.checked) {
                      handleInputChange('requirements.streams', [...currentStreams, stream.id]);
                    } else {
                      handleInputChange('requirements.streams', currentStreams.filter(id => id !== stream.id));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{stream.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            If no streams are selected, the course will accept "Pass any three subjects in A/L"
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Additional Details</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intake Count
              </label>
              <input
                type="number"
                value={courseData.additionalDetails?.intakeCount || ''}
                onChange={(e) => handleInputChange('additionalDetails.intakeCount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter intake count"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Syllabus URL
              </label>
              <input
                type="url"
                value={courseData.additionalDetails?.syllabus || ''}
                onChange={(e) => handleInputChange('additionalDetails.syllabus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://university.edu/syllabus.pdf"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCareersStep() {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Career Pathways</h3>
        
        <div className="space-y-4">
          {courseData.careerPathways?.map((career, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-800">Career #{index + 1}</h4>
                <button
                  onClick={() => removeFromArray('careerPathways', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={career.jobTitle}
                    onChange={(e) => {
                      const updated = [...(courseData.careerPathways || [])];
                      updated[index] = { ...updated[index], jobTitle: e.target.value };
                      handleInputChange('careerPathways', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={career.industry || ''}
                    onChange={(e) => {
                      const updated = [...(courseData.careerPathways || [])];
                      updated[index] = { ...updated[index], industry: e.target.value };
                      handleInputChange('careerPathways', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Information Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={career.salaryRange || ''}
                    onChange={(e) => {
                      const updated = [...(courseData.careerPathways || [])];
                      updated[index] = { ...updated[index], salaryRange: e.target.value };
                      handleInputChange('careerPathways', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., LKR 50,000 - 150,000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={career.description || ''}
                    onChange={(e) => {
                      const updated = [...(courseData.careerPathways || [])];
                      updated[index] = { ...updated[index], description: e.target.value };
                      handleInputChange('careerPathways', updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief description of the career path"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addToArray('careerPathways', { jobTitle: '', industry: '', description: '', salaryRange: '' })}
          className="w-full px-4 py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:text-purple-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Career Pathway</span>
        </button>
      </div>
    );
  }

  function renderReviewStep() {
    const selectedUniversity = formData?.universities.find(u => u.id === courseData.universityId);
    const selectedFaculty = filteredFaculties.find(f => f.id === courseData.facultyId);
    const selectedDepartment = filteredDepartments.find(d => d.id === courseData.departmentId);
    const selectedFramework = formData?.frameworks.find(f => f.id === courseData.frameworkId);

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Review Course Details</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {courseData.name}</div>
              <div><strong>Code:</strong> {courseData.courseCode || 'Not specified'}</div>
              <div><strong>URL:</strong> <a href={courseData.courseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{courseData.courseUrl}</a></div>
              <div><strong>Specializations:</strong> {courseData.specialisation?.length ? courseData.specialisation.join(', ') : 'None'}</div>
            </div>
            {courseData.description && (
              <div className="mt-2 text-sm">
                <strong>Description:</strong> {courseData.description}
              </div>
            )}
          </div>

          {/* University Structure */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">University Structure</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><strong>University:</strong> {selectedUniversity?.name}</div>
              <div><strong>Faculty:</strong> {selectedFaculty?.name}</div>
              <div><strong>Department:</strong> {selectedDepartment?.name}</div>
              <div><strong>Major Fields:</strong> {courseData.subfieldId?.length} selected</div>
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Course Configuration</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div><strong>Study Mode:</strong> {courseData.studyMode === 'fulltime' ? 'Full Time' : 'Part Time'}</div>
              <div><strong>Course Type:</strong> {courseData.courseType === 'internal' ? 'Internal' : 'External'}</div>
              <div><strong>Fee Type:</strong> {courseData.feeType === 'free' ? 'Free' : `Paid (LKR ${courseData.feeAmount?.toLocaleString()})`}</div>
              <div><strong>Framework:</strong> {selectedFramework ? `${selectedFramework.type} - ${selectedFramework.qualificationCategory}` : 'Not specified'}</div>
              <div><strong>Duration:</strong> {courseData.durationMonths ? `${courseData.durationMonths} months` : 'Not specified'}</div>
              <div><strong>Medium:</strong> {courseData.medium?.join(', ')}</div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Requirements</h4>
            <div className="text-sm space-y-2">
              <div><strong>Minimum Requirement:</strong> {courseData.requirements?.minRequirement}</div>
              <div><strong>Applicable Streams:</strong> {courseData.requirements?.streams?.length || 0} selected</div>
              {courseData.additionalDetails?.intakeCount && (
                <div><strong>Intake Count:</strong> {courseData.additionalDetails.intakeCount}</div>
              )}
            </div>
          </div>

          {/* Career Pathways */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Career Pathways</h4>
            <div className="text-sm">
              {courseData.careerPathways?.length ? (
                <div className="space-y-2">
                  {courseData.careerPathways.map((career, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="font-medium">{career.jobTitle}</div>
                      {career.industry && <div className="text-gray-600">Industry: {career.industry}</div>}
                      {career.salaryRange && <div className="text-gray-600">Salary: {career.salaryRange}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                'No career pathways specified'
              )}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={16} />
            <div className="text-sm text-yellow-800">
              <strong>Please review all information carefully.</strong> Once the course is created, some details may require administrative approval to modify.
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default EnhancedAddCourse;
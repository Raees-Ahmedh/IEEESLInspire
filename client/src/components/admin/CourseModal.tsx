import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Plus, Minus, Edit2, Trash2 } from 'lucide-react';
import { University, Faculty, Department } from '../../types/university';
import { Subject } from '../../types/subject';
import { Course, RequirementRule, SubjectBasket, BasketRelationship } from '../../types/course';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => void;
  course?: Course;
  universities: University[];
  subjects: Subject[];
}

interface FormData {
  name: string;
  courseCode: string;
  courseUrl: string;
  universityId: number;
  facultyId: number;
  departmentId: number;
  frameworkType: string;
  frameworkLevel: number;
  durationMonths: number;
  description: string;
  zscore: string;
  intakeCount: number;
  syllabus: string;
  dynamicFields: Array<{ key: string; value: string }>;
  courseMaterials: Array<{ title: string; url: string; type: string }>;
  careerPathways: string[];
  requirements: {
    baskets: SubjectBasket[];
    rules: RequirementRule[];
    basketRelationships: BasketRelationship[];
  };
  customRules: string;
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
  subjects
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    courseCode: '',
    courseUrl: '',
    universityId: 0,
    facultyId: 0,
    departmentId: 0,
    frameworkType: 'SLQF',
    frameworkLevel: 4,
    durationMonths: 36,
    description: '',
    zscore: '',
    intakeCount: 0,
    syllabus: '',
    dynamicFields: [],
    courseMaterials: [],
    careerPathways: [],
    requirements: {
      baskets: [],
      rules: [],
      basketRelationships: []
    },
    customRules: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showCustomRules, setShowCustomRules] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derived data
  const selectedUniversity = universities.find(u => u.id === formData.universityId);
  const availableFaculties = selectedUniversity?.faculties || [];
  const selectedFaculty = availableFaculties.find(f => f.id === formData.facultyId);
  const availableDepartments = selectedFaculty?.departments || [];

  useEffect(() => {
    if (course && isOpen) {
      // Populate form with existing course data
      setFormData({
        name: course.name,
        courseCode: course.courseCode || '',
        courseUrl: course.courseUrl,
        universityId: course.universityId,
        facultyId: course.facultyId,
        departmentId: course.departmentId,
        frameworkType: course.framework.type,
        frameworkLevel: course.frameworkLevel,
        durationMonths: course.durationMonths,
        description: course.description || '',
        zscore: course.zscore ? JSON.stringify(course.zscore) : '',
        intakeCount: course.additionalDetails?.intakeCount || 0,
        syllabus: course.additionalDetails?.syllabus || '',
        dynamicFields: course.additionalDetails?.dynamicFields || [],
        courseMaterials: course.additionalDetails?.courseMaterials || [],
        careerPathways: course.additionalDetails?.careerPathways || [],
        requirements: course.requirements || {
          baskets: [],
          rules: [],
          basketRelationships: []
        },
        customRules: ''
      });
    }
  }, [course, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      courseCode: '',
      courseUrl: '',
      universityId: 0,
      facultyId: 0,
      departmentId: 0,
      frameworkType: 'SLQF',
      frameworkLevel: 4,
      durationMonths: 36,
      description: '',
      zscore: '',
      intakeCount: 0,
      syllabus: '',
      dynamicFields: [],
      courseMaterials: [],
      careerPathways: [],
      requirements: {
        baskets: [],
        rules: [],
        basketRelationships: []
      },
      customRules: ''
    });
    setCurrentStep(1);
    setErrors({});
    setShowCustomRules(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        // Course Details validation
        if (!formData.name.trim()) {
          newErrors.name = 'Course name is required';
        }
        if (!formData.courseUrl.trim()) {
          newErrors.courseUrl = 'Course URL is required';
        }
        if (!formData.universityId) {
          newErrors.universityId = 'University selection is required';
        }
        if (!formData.facultyId) {
          newErrors.facultyId = 'Faculty selection is required';
        }
        if (!formData.departmentId) {
          newErrors.departmentId = 'Department selection is required';
        }
        if (!formData.frameworkType) {
          newErrors.frameworkType = 'Framework type is required';
        }
        if (!formData.frameworkLevel) {
          newErrors.frameworkLevel = 'Framework level is required';
        }
        break;

      case 2:
        // Entry Requirements validation
        if (formData.requirements.baskets.length === 0) {
          newErrors.requirements = 'At least one subject basket is required';
        }

        // Validate each basket
        formData.requirements.baskets.forEach((basket, index) => {
          if (!basket.name.trim()) {
            newErrors[`basket_${index}_name`] = 'Basket name is required';
          }
          if (basket.subjects.length === 0) {
            newErrors[`basket_${index}_subjects`] = 'At least one subject is required';
          }

          // Validate grade requirements
          basket.gradeRequirements.forEach((gradeReq, gradeIndex) => {
            if (gradeReq.count > basket.subjects.length) {
              newErrors[`basket_${index}_gradeReq_${gradeIndex}_count`] = 'Count cannot exceed number of subjects in basket';
            }
          });
        });

        // Validate basket relationships
        formData.requirements.basketRelationships.forEach((relationship, index) => {
          if (relationship.basketIds.length < 2) {
            newErrors[`relationship_${index}`] = 'Relationship must include at least 2 baskets';
          }
        });
        break;

      case 3:
        // Custom rules validation (if enabled)
        if (showCustomRules && formData.customRules) {
          const rules = formData.customRules.trim();
          if (rules && !rules.match(/^[A-Za-z0-9\s\(\)\>\<=&|!_-]+$/)) {
            newErrors.customRules = 'Custom rules contain invalid characters';
          }
        }
        break;

      case 4:
        // Other Details validation
        if (formData.zscore && formData.zscore.trim()) {
          try {
            const parsed = JSON.parse(formData.zscore);
            if (typeof parsed !== 'object' || parsed === null) {
              newErrors.zscore = 'Z-score must be a valid JSON object';
            }
          } catch (e) {
            newErrors.zscore = 'Invalid JSON format for Z-score';
          }
        }

        if (formData.intakeCount && formData.intakeCount < 1) {
          newErrors.intakeCount = 'Intake count must be at least 1';
        }

        // Validate course materials
        formData.courseMaterials.forEach((material, index) => {
          if (!material.title.trim()) {
            newErrors[`material_${index}_title`] = 'Material title is required';
          }
          if (!material.url.trim()) {
            newErrors[`material_${index}_url`] = 'Material URL is required';
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, getTotalSteps()));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getTotalSteps = () => {
    return showCustomRules ? 4 : 3;
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 1: return 'Course Details';
      case 2: return 'Entry Requirements';
      case 3: return showCustomRules ? 'Advanced Rules' : 'Other Details';
      case 4: return 'Other Details';
      default: return '';
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    
    try {
      const course: Course = {
        id: Math.random(), // This would be generated by the backend
        name: formData.name,
        courseCode: formData.courseCode,
        courseUrl: formData.courseUrl,
        universityId: formData.universityId,
        facultyId: formData.facultyId,
        departmentId: formData.departmentId,
        requirements: formData.requirements,
        framework: {
          type: formData.frameworkType,
          category: formData.frameworkLevel >= 6 ? 'Degree' : 'Certificate',
          level: formData.frameworkLevel
        },
        frameworkLevel: formData.frameworkLevel,
        durationMonths: formData.durationMonths,
        description: formData.description,
        zscore: formData.zscore ? JSON.parse(formData.zscore) : undefined,
        additionalDetails: {
          intakeCount: formData.intakeCount,
          syllabus: formData.syllabus,
          dynamicFields: formData.dynamicFields,
          courseMaterials: formData.courseMaterials,
          careerPathways: formData.careerPathways
        },
        isActive: true,
        auditInfo: {
          createdAt: new Date().toISOString(),
          createdBy: 'admin@system.com',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin@system.com'
        }
      };

      // Reset form and close modal
      resetForm();
      onSubmit(course);
      
    } catch (error: any) {
      console.error('Error creating course:', error);
      setErrors({ 
        general: error.message || 'Failed to create course. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const addDynamicField = () => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: [...prev.dynamicFields, { key: '', value: '' }]
    }));
  };

  const removeDynamicField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter((_, i) => i !== index)
    }));
  };

  const addCourseMaterial = () => {
    setFormData(prev => ({
      ...prev,
      courseMaterials: [...prev.courseMaterials, { title: '', url: '', type: 'PDF' }]
    }));
  };

  const removeCourseMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courseMaterials: prev.courseMaterials.filter((_, i) => i !== index)
    }));
  };

  const addCareerPathway = () => {
    setFormData(prev => ({
      ...prev,
      careerPathways: [...prev.careerPathways, '']
    }));
  };

  const removeCareerPathway = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careerPathways: prev.careerPathways.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {course ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step < currentStep
                    ? 'bg-green-600 text-white'
                    : step === currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`ml-2 text-sm ${
                  step <= currentStep ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {getStepName(step)}
                </span>
                {step < getTotalSteps() && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Course Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Information</h3>
              
              {/* University Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.universityId}
                  onChange={(e) => {
                    handleInputChange('universityId', parseInt(e.target.value));
                    handleInputChange('facultyId', 0); // Reset faculty
                    handleInputChange('departmentId', 0); // Reset department
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.universityId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value={0}>Select University</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
                {errors.universityId && <p className="mt-1 text-sm text-red-600">{errors.universityId}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Science and Engineering"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Course Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => handleInputChange('courseCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., CSE001"
                  />
                </div>

                {/* Course URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.courseUrl}
                    onChange={(e) => handleInputChange('courseUrl', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.courseUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://university.edu/course"
                    required
                  />
                  {errors.courseUrl && <p className="mt-1 text-sm text-red-600">{errors.courseUrl}</p>}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => handleInputChange('durationMonths', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              {/* Faculty Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => {
                      handleInputChange('facultyId', parseInt(e.target.value));
                      handleInputChange('departmentId', 0); // Reset department
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.facultyId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!formData.universityId}
                    required
                  >
                    <option value={0}>Select Faculty</option>
                    {availableFaculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                    ))}
                  </select>
                  {errors.facultyId && <p className="mt-1 text-sm text-red-600">{errors.facultyId}</p>}
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleInputChange('departmentId', parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.departmentId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!formData.facultyId}
                    required
                  >
                    <option value={0}>Select Department</option>
                    {availableDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Framework Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.frameworkType}
                    onChange={(e) => handleInputChange('frameworkType', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.frameworkType ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="SLQF">SLQF (Sri Lanka Qualifications Framework)</option>
                    <option value="NVQ">NVQ (National Vocational Qualification)</option>
                  </select>
                  {errors.frameworkType && <p className="mt-1 text-sm text-red-600">{errors.frameworkType}</p>}
                </div>

                {/* Framework Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.frameworkLevel}
                    onChange={(e) => handleInputChange('frameworkLevel', parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.frameworkLevel ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    {formData.frameworkType === 'SLQF' ? (
                      <>
                        <option value={3}>Level 3 - Certificate</option>
                        <option value={4}>Level 4 - Certificate</option>
                        <option value={5}>Level 5 - Diploma</option>
                        <option value={6}>Level 6 - Bachelor's Degree</option>
                        <option value={7}>Level 7 - Bachelor's Honours/Postgraduate Certificate</option>
                        <option value={8}>Level 8 - Postgraduate Diploma/Master's Degree</option>
                        <option value={9}>Level 9 - Master's Degree</option>
                        <option value={10}>Level 10 - Doctoral Degree</option>
                      </>
                    ) : (
                      <>
                        <option value={3}>NVQ Level 3</option>
                        <option value={4}>NVQ Level 4</option>
                        <option value={5}>NVQ Level 5</option>
                        <option value={6}>NVQ Level 6</option>
                        <option value={7}>NVQ Level 7</option>
                      </>
                    )}
                  </select>
                  {errors.frameworkLevel && <p className="mt-1 text-sm text-red-600">{errors.frameworkLevel}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Brief description of the course..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Entry Requirements - This would need to be implemented based on your requirements structure */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Entry Requirements</h3>
              <p className="text-gray-600">Entry requirements management would be implemented here based on your specific requirements structure.</p>
            </div>
          )}

          {/* Step 3: Advanced Rules (if enabled) or Other Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {showCustomRules ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Rules</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Rules
                    </label>
                    <textarea
                      value={formData.customRules}
                      onChange={(e) => handleInputChange('customRules', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.customRules ? 'border-red-300' : 'border-gray-300'
                      }`}
                      rows={6}
                      placeholder="Enter custom admission rules..."
                    />
                    {errors.customRules && <p className="mt-1 text-sm text-red-600">{errors.customRules}</p>}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Details</h3>
                  
                  {/* Z-Score */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Z-Score (JSON Format)
                    </label>
                    <textarea
                      value={formData.zscore}
                      onChange={(e) => handleInputChange('zscore', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.zscore ? 'border-red-300' : 'border-gray-300'
                      }`}
                      rows={3}
                      placeholder='{"district": {"Colombo": 1.5, "Kandy": 1.4}}'
                    />
                    {errors.zscore && <p className="mt-1 text-sm text-red-600">{errors.zscore}</p>}
                  </div>

                  {/* Intake Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Intake Count
                    </label>
                    <input
                      type="number"
                      value={formData.intakeCount}
                      onChange={(e) => handleInputChange('intakeCount', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.intakeCount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="1"
                      placeholder="e.g., 100"
                    />
                    {errors.intakeCount && <p className="mt-1 text-sm text-red-600">{errors.intakeCount}</p>}
                  </div>

                  {/* Syllabus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Syllabus
                    </label>
                    <textarea
                      value={formData.syllabus}
                      onChange={(e) => handleInputChange('syllabus', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Course syllabus details..."
                    />
                  </div>

                  {/* Dynamic Fields */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Fields
                      </label>
                      <button
                        type="button"
                        onClick={addDynamicField}
                        className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Field
                      </button>
                    </div>
                    {formData.dynamicFields.map((field, index) => (
                      <div key={index} className="flex gap-4 mb-3">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => {
                            const newFields = [...formData.dynamicFields];
                            newFields[index].key = e.target.value;
                            handleInputChange('dynamicFields', newFields);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Field name"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const newFields = [...formData.dynamicFields];
                            newFields[index].value = e.target.value;
                            handleInputChange('dynamicFields', newFields);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Field value"
                        />
                        <button
                          type="button"
                          onClick={() => removeDynamicField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Course Materials */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Course Materials
                      </label>
                      <button
                        type="button"
                        onClick={addCourseMaterial}
                        className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Material
                      </button>
                    </div>
                    {formData.courseMaterials.map((material, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <input
                          type="text"
                          value={material.title}
                          onChange={(e) => {
                            const newMaterials = [...formData.courseMaterials];
                            newMaterials[index].title = e.target.value;
                            handleInputChange('courseMaterials', newMaterials);
                          }}
                          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors[`material_${index}_title`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Material title"
                        />
                        <input
                          type="url"
                          value={material.url}
                          onChange={(e) => {
                            const newMaterials = [...formData.courseMaterials];
                            newMaterials[index].url = e.target.value;
                            handleInputChange('courseMaterials', newMaterials);
                          }}
                          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors[`material_${index}_url`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="https://..."
                        />
                        <div className="flex gap-2">
                          <select
                            value={material.type}
                            onChange={(e) => {
                              const newMaterials = [...formData.courseMaterials];
                              newMaterials[index].type = e.target.value;
                              handleInputChange('courseMaterials', newMaterials);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="PDF">PDF</option>
                            <option value="Video">Video</option>
                            <option value="Website">Website</option>
                            <option value="Document">Document</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeCourseMaterial(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {errors[`material_${index}_title`] && (
                          <p className="text-sm text-red-600 col-span-full">{errors[`material_${index}_title`]}</p>
                        )}
                        {errors[`material_${index}_url`] && (
                          <p className="text-sm text-red-600 col-span-full">{errors[`material_${index}_url`]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Career Pathways */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Career Pathways
                      </label>
                      <button
                        type="button"
                        onClick={addCareerPathway}
                        className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Pathway
                      </button>
                    </div>
                    {formData.careerPathways.map((pathway, index) => (
                      <div key={index} className="flex gap-4 mb-3">
                        <input
                          type="text"
                          value={pathway}
                          onChange={(e) => {
                            const newPathways = [...formData.careerPathways];
                            newPathways[index] = e.target.value;
                            handleInputChange('careerPathways', newPathways);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., Software Engineer, Data Scientist"
                        />
                        <button
                          type="button"
                          onClick={() => removeCareerPathway(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Other Details (only if custom rules are enabled) */}
          {currentStep === 4 && showCustomRules && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Details</h3>
              
              {/* Same content as Step 3 when custom rules are disabled */}
              {/* Z-Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Z-Score (JSON Format)
                </label>
                <textarea
                  value={formData.zscore}
                  onChange={(e) => handleInputChange('zscore', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.zscore ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder='{"district": {"Colombo": 1.5, "Kandy": 1.4}}'
                />
                {errors.zscore && <p className="mt-1 text-sm text-red-600">{errors.zscore}</p>}
              </div>

              {/* Intake Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Intake Count
                </label>
                <input
                  type="number"
                  value={formData.intakeCount}
                  onChange={(e) => handleInputChange('intakeCount', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.intakeCount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1"
                  placeholder="e.g., 100"
                />
                {errors.intakeCount && <p className="mt-1 text-sm text-red-600">{errors.intakeCount}</p>}
              </div>

              {/* Syllabus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus
                </label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => handleInputChange('syllabus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Course syllabus details..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center">
            {currentStep > 2 && (
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showCustomRules}
                  onChange={(e) => setShowCustomRules(e.target.checked)}
                  className="mr-2"
                />
                Enable Custom Rules
              </label>
            )}
          </div>
          
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < getTotalSteps() ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : (course ? 'Update Course' : 'Create Course')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
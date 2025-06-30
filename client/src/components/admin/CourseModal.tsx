import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Terminal, Upload, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Course, CourseFormData, SubjectBasket, Subject, Stream, BasketRelationship, DynamicField, CourseMaterial, CareerPathway, BasketGradeRequirement, University, Faculty, Department } from '../../types/course';
import { courseApi } from '../../services/courseApi';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Omit<Course, 'id'>) => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCustomRules, setShowCustomRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CourseFormData>({
    // Step 1: Course Details
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
    frameworkLevel: 7,
    durationMonths: 48,
    description: '',
    
    // Step 2: Entry Requirements
    requirements: {
      id: 0,
      courseId: 0,
      minRequirement: 'ALPass',
      streams: [],
      subjectBaskets: [],
      basketRelationships: [],
      extraRules: '',
      isActive: true
    },
    
    // Step 4: Other Details
    dynamicFields: [],
    courseMaterials: [],
    careerPathways: []
  });

  // API data states
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);

  const materialTypes = [
    'Syllabus',
    'Course Handbook',
    'Study Guide',
    'Assignment Guidelines',
    'Exam Guidelines',
    'Project Guidelines',
    'Brochure',
    'Application Form',
    'Other'
  ];

  // Helper Functions for CourseModal Component

  // Basket relationship handlers - Complete Implementation
  const addBasketRelationship = () => {
    if (formData.requirements.subjectBaskets.length < 2) return;

    const newRelationship: BasketRelationship = {
      basketIds: [formData.requirements.subjectBaskets[0].id],
      relation: 'AND'
    };

    handleRequirementChange('basketRelationships', [
      ...formData.requirements.basketRelationships,
      newRelationship
    ]);
  };

  const updateBasketRelationship = (index: number, updates: Partial<BasketRelationship>) => {
    const updatedRelationships = formData.requirements.basketRelationships.map((rel, i) =>
      i === index ? { ...rel, ...updates } : rel
    );
    handleRequirementChange('basketRelationships', updatedRelationships);
  };

  const removeBasketRelationship = (index: number) => {
    handleRequirementChange('basketRelationships', 
      formData.requirements.basketRelationships.filter((_, i) => i !== index)
    );
  };

  // Enhanced validation function
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // Course Details validation
        if (!formData.name.trim()) newErrors.name = 'Course name is required';
        if (formData.name.length > 200) newErrors.name = 'Course name must be less than 200 characters';
        
        if (!formData.universityId) newErrors.universityId = 'University is required';
        
        if (!formData.courseUrl.trim()) newErrors.courseUrl = 'Course URL is required';
        if (formData.courseUrl && !formData.courseUrl.startsWith('/')) {
          newErrors.courseUrl = 'Course URL must start with /';
        }
        
        if (!formData.frameworkType) newErrors.frameworkType = 'Framework type is required';
        if (!formData.frameworkLevel) newErrors.frameworkLevel = 'Framework level is required';
        
        if (formData.feeType === 'paid' && (!formData.feeAmount || formData.feeAmount <= 0)) {
          newErrors.feeAmount = 'Fee amount is required for paid courses';
        }
        
        if (formData.durationMonths && formData.durationMonths < 1) {
          newErrors.durationMonths = 'Duration must be at least 1 month';
        }
        break;

      case 2:
        // Entry Requirements validation
        if (formData.requirements.streams.length === 0) {
          newErrors.streams = 'At least one stream must be selected';
        }
        
        // Validate subject baskets
        formData.requirements.subjectBaskets.forEach((basket, index) => {
          if (!basket.name.trim()) {
            newErrors[`basket_${index}_name`] = 'Basket name is required';
          }
          
          if (basket.subjects.length === 0) {
            newErrors[`basket_${index}_subjects`] = `Basket "${basket.name}" must have at least one subject`;
          }
          
          if (basket.minSelection > basket.subjects.length) {
            newErrors[`basket_${index}_minSelection`] = `Min selection cannot exceed number of subjects`;
          }
          
          if (basket.maxSelection < basket.minSelection) {
            newErrors[`basket_${index}_maxSelection`] = `Max selection cannot be less than min selection`;
          }
          
          if (basket.maxSelection > basket.subjects.length) {
            newErrors[`basket_${index}_maxSelection`] = `Max selection cannot exceed number of subjects`;
          }

          // Validate basket grade requirements
          basket.basketGradeRequirements.forEach((gradeReq, gradeIndex) => {
            if (gradeReq.count <= 0) {
              newErrors[`basket_${index}_gradeReq_${gradeIndex}_count`] = 'Count must be greater than 0';
            }
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
          // Basic syntax validation for custom rules
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
          if (!material.fileName.trim()) {
            newErrors[`material_${index}_fileName`] = 'File name is required';
          }
          if (!material.filePath.trim()) {
            newErrors[`material_${index}_filePath`] = 'File path is required';
          }
          if (material.fileSize && material.fileSize < 0) {
            newErrors[`material_${index}_fileSize`] = 'File size cannot be negative';
          }
        });

        // Validate career pathways
        formData.careerPathways.forEach((career, index) => {
          if (!career.jobTitle.trim()) {
            newErrors[`career_${index}_jobTitle`] = 'Job title is required';
          }
          if (career.jobTitle.length > 100) {
            newErrors[`career_${index}_jobTitle`] = 'Job title must be less than 100 characters';
          }
        });

        // Validate dynamic fields
        formData.dynamicFields.forEach((field, index) => {
          if (!field.fieldName.trim() && field.fieldValue.trim()) {
            newErrors[`dynamic_${index}_name`] = 'Field name is required when value is provided';
          }
          if (field.fieldName.trim() && !field.fieldValue.trim()) {
            newErrors[`dynamic_${index}_value`] = 'Field value is required when name is provided';
          }
        });
        break;

      case 5:
        // Final validation before submission
        const step1Valid = validateStep(1);
        const step2Valid = validateStep(2);
        const step3Valid = showCustomRules ? validateStep(3) : true;
        const step4Valid = validateStep(4);
        
        if (!step1Valid || !step2Valid || !step3Valid || !step4Valid) {
          newErrors.general = 'Please fix all validation errors before submitting';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced form reset function
  const resetForm = () => {
    setFormData({
      // Step 1: Course Details
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
      frameworkLevel: 7,
      durationMonths: 48,
      description: '',
      
      // Step 2: Entry Requirements
      requirements: {
        id: 0,
        courseId: 0,
        minRequirement: 'ALPass',
        streams: [],
        subjectBaskets: [],
        basketRelationships: [],
        extraRules: '',
        isActive: true
      },
      
      // Step 4: Other Details
      dynamicFields: [],
      courseMaterials: [],
      careerPathways: []
    });
    setCurrentStep(1);
    setShowCustomRules(false);
    setErrors({});
  };

  // Enhanced course submission with better error handling
  const handleSubmit = async () => {
    if (!validateStep(getTotalSteps())) return;

    setSubmitLoading(true);
    try {
      const university = universities.find(u => u.id === formData.universityId)!;
      const faculty = availableFaculties.find(f => f.id === formData.facultyId);
      const department = availableDepartments.find(d => d.id === formData.departmentId);

      // Prepare course data for API
      const courseData = {
        name: formData.name.trim(),
        courseCode: formData.courseCode.trim() || null,
        courseUrl: formData.courseUrl.trim(),
        specialisation: formData.specialisation.filter(s => s.trim()),
        universityId: formData.universityId,
        facultyId: formData.facultyId || null,
        departmentId: formData.departmentId || null,
        courseType: formData.courseType,
        studyMode: formData.studyMode,
        feeType: formData.feeType,
        feeAmount: formData.feeAmount,
        frameworkType: formData.frameworkType,
        frameworkLevel: formData.frameworkLevel,
        durationMonths: formData.durationMonths,
        description: formData.description?.trim() || null,
        zscore: formData.zscore?.trim() || null,
        intakeCount: formData.intakeCount,
        syllabus: formData.syllabus?.trim() || null,
        dynamicFields: formData.dynamicFields.filter(f => f.fieldName.trim() && f.fieldValue.trim()),
        courseMaterials: formData.courseMaterials.filter(m => m.fileName.trim() && m.filePath.trim()),
        careerPathways: formData.careerPathways.filter(c => c.jobTitle.trim()),
        requirements: {
          ...formData.requirements,
          customRules: formData.customRules?.trim() || null
        }
      };

      // Call API to create course
      const createdCourse = await courseApi.createCourse(courseData);
      
      // Create course object for parent component
      const course: Omit<Course, 'id'> = {
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
          id: formData.frameworkLevel,
          type: formData.frameworkType,
          qualificationCategory: formData.frameworkType === 'SLQF' ? 'Degree' : 'Certificate',
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
      setSubmitLoading(false);
    }
  };

  // Enhanced navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Auto-advance past custom rules if not enabled
      if (currentStep === 2 && !showCustomRules && getTotalSteps() === 5) {
        setCurrentStep(4); // Skip step 3 (custom rules)
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 4 && !showCustomRules && getTotalSteps() === 5) {
      setCurrentStep(2); // Skip step 3 (custom rules) when going back
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  // Enhanced step validation with better user feedback
  const canProceedFromStep = (step: number): boolean => {
    return validateStep(step);
  };

  // Auto-save functionality (optional)
  const autoSaveFormData = () => {
    try {
      const dataToSave = {
        ...formData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('courseModal_autoSave', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to auto-save form data:', error);
    }
  };

  // Load auto-saved data (optional)
  const loadAutoSavedData = () => {
    try {
      const saved = localStorage.getItem('courseModal_autoSave');
      if (saved) {
        const parsedData = JSON.parse(saved);
        const saveTime = new Date(parsedData.timestamp);
        const now = new Date();
        const hoursSinceLastSave = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
        
        // Only restore if saved within last 24 hours
        if (hoursSinceLastSave < 24) {
          delete parsedData.timestamp;
          setFormData(parsedData);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load auto-saved data:', error);
    }
    return false;
  };

  // Clear auto-saved data
  const clearAutoSavedData = () => {
    try {
      localStorage.removeItem('courseModal_autoSave');
    } catch (error) {
      console.warn('Failed to clear auto-saved data:', error);
    }
  };


  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [universitiesData, subjectsData, streamsData] = await Promise.all([
        courseApi.fetchUniversities(),
        courseApi.fetchSubjects('AL'),
        courseApi.fetchStreams()
      ]);
      
      setUniversities(universitiesData);
      setSubjects(subjectsData);
      setStreams(streamsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ general: 'Failed to load form data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Load faculties when university changes
  useEffect(() => {
    if (formData.universityId) {
      loadFaculties(formData.universityId);
    } else {
      setFaculties([]);
      setDepartments([]);
    }
  }, [formData.universityId]);

  // Load departments when faculty changes
  useEffect(() => {
    if (formData.facultyId) {
      loadDepartments(formData.facultyId);
    } else {
      setDepartments([]);
    }
  }, [formData.facultyId]);

  const loadFaculties = async (universityId: number) => {
    try {
      const facultiesData = await courseApi.fetchFaculties(universityId);
      setFaculties(facultiesData);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartments = async (facultyId: number) => {
    try {
      const departmentsData = await courseApi.fetchDepartments(facultyId);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Get filtered data based on selections
  const availableFaculties = faculties.filter(f => f.universityId === formData.universityId);
  const availableDepartments = departments.filter(d => d.facultyId === formData.facultyId);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRequirementChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value
      }
    }));
  };

  const handleSpecialisationChange = (value: string) => {
    const specialisations = value.split(',').map(s => s.trim()).filter(s => s);
    handleInputChange('specialisation', specialisations);
  };

  // Stream selection handlers
  const handleStreamToggle = (stream: Stream) => {
    const isSelected = formData.requirements.streams.some(s => s.id === stream.id);
    if (isSelected) {
      handleRequirementChange('streams', formData.requirements.streams.filter(s => s.id !== stream.id));
    } else {
      handleRequirementChange('streams', [...formData.requirements.streams, stream]);
    }
  };

  // Subject basket handlers
  const addSubjectBasket = () => {
    const newBasket: SubjectBasket = {
      id: Date.now().toString(),
      name: `Basket ${formData.requirements.subjectBaskets.length + 1}`,
      subjects: [],
      minSelection: 1,
      maxSelection: 3,
      requiredGrades: [],
      basketGradeRequirements: [],
      internalLogic: 'AND'
    };

    handleRequirementChange('subjectBaskets', [
      ...formData.requirements.subjectBaskets,
      newBasket
    ]);
  };

  const removeSubjectBasket = (basketId: string) => {
    handleRequirementChange(
      'subjectBaskets',
      formData.requirements.subjectBaskets.filter(basket => basket.id !== basketId)
    );
    // Also remove from relationships
    handleRequirementChange(
      'basketRelationships',
      formData.requirements.basketRelationships.filter(rel => 
        !rel.basketIds.includes(basketId)
      )
    );
  };

  const updateBasket = (basketId: string, updates: Partial<SubjectBasket>) => {
    handleRequirementChange(
      'subjectBaskets',
      formData.requirements.subjectBaskets.map(basket =>
        basket.id === basketId ? { ...basket, ...updates } : basket
      )
    );
  };

  const handleSubjectToggleInBasket = (basketId: string, subject: Subject) => {
    const basket = formData.requirements.subjectBaskets.find(b => b.id === basketId);
    if (!basket) return;

    const isSelected = basket.subjects.some(s => s.id === subject.id);
    if (isSelected) {
      updateBasket(basketId, {
        subjects: basket.subjects.filter(s => s.id !== subject.id),
        requiredGrades: basket.requiredGrades.filter(g => g.subjectId !== subject.id)
      });
    } else {
      updateBasket(basketId, {
        subjects: [...basket.subjects, subject]
      });
    }
  };

  // Basket grade requirement handlers
  const addBasketGradeRequirement = (basketId: string) => {
    const basket = formData.requirements.subjectBaskets.find(b => b.id === basketId);
    if (!basket) return;

    const newRequirement: BasketGradeRequirement = {
      grade: 'C',
      count: 1
    };

    updateBasket(basketId, {
      basketGradeRequirements: [...basket.basketGradeRequirements, newRequirement]
    });
  };

  const updateBasketGradeRequirement = (basketId: string, index: number, updates: Partial<BasketGradeRequirement>) => {
    const basket = formData.requirements.subjectBaskets.find(b => b.id === basketId);
    if (!basket) return;

    const updatedRequirements = basket.basketGradeRequirements.map((req, i) =>
      i === index ? { ...req, ...updates } : req
    );

    updateBasket(basketId, { basketGradeRequirements: updatedRequirements });
  };

  const removeBasketGradeRequirement = (basketId: string, index: number) => {
    const basket = formData.requirements.subjectBaskets.find(b => b.id === basketId);
    if (!basket) return;

    updateBasket(basketId, {
      basketGradeRequirements: basket.basketGradeRequirements.filter((_, i) => i !== index)
    });
  };

  // Basket relationship handlers
  const addBasketRelationship = () => {
    if (formData.requirements.subjectBaskets.length < 2) return;

    const newRelationship: BasketRelationship = {
      basketIds: [formData.requirements.subjectBaskets[0].id],
      relation: 'AND'
    };

    handleRequirementChange('basketRelationships', [
      ...formData.requirements.basketRelationships,
      newRelationship
    ]);
  };

  const updateBasketRelationship = (index: number, updates: Partial<BasketRelationship>) => {
    const updatedRelationships = formData.requirements.basketRelationships.map((rel, i) =>
      i === index ? { ...rel, ...updates } : rel
    );
    handleRequirementChange('basketRelationships', updatedRelationships);
  };

  const removeBasketRelationship = (index: number) => {
    handleRequirementChange('basketRelationships', 
      formData.requirements.basketRelationships.filter((_, i) => i !== index)
    );
  };

  // Dynamic fields handlers
  const addDynamicField = () => {
    const newField: DynamicField = {
      id: Date.now().toString(),
      fieldName: '',
      fieldValue: ''
    };
    handleInputChange('dynamicFields', [...formData.dynamicFields, newField]);
  };

  const updateDynamicField = (id: string, updates: Partial<DynamicField>) => {
    handleInputChange('dynamicFields', 
      formData.dynamicFields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeDynamicField = (id: string) => {
    handleInputChange('dynamicFields', 
      formData.dynamicFields.filter(field => field.id !== id)
    );
  };

  // Course materials handlers
  const addCourseMaterial = () => {
    const newMaterial: CourseMaterial = {
      materialType: 'Syllabus',
      fileName: '',
      filePath: '',
      fileType: '',
      fileSize: 0
    };
    handleInputChange('courseMaterials', [...formData.courseMaterials, newMaterial]);
  };

  const updateCourseMaterial = (index: number, updates: Partial<CourseMaterial>) => {
    const updatedMaterials = formData.courseMaterials.map((material, i) =>
      i === index ? { ...material, ...updates } : material
    );
    handleInputChange('courseMaterials', updatedMaterials);
  };

  const removeCourseMaterial = (index: number) => {
    handleInputChange('courseMaterials', 
      formData.courseMaterials.filter((_, i) => i !== index)
    );
  };

  // Career pathways handlers
  const addCareerPathway = () => {
    const newPathway: CareerPathway = {
      jobTitle: '',
      industry: '',
      description: '',
      salaryRange: ''
    };
    handleInputChange('careerPathways', [...formData.careerPathways, newPathway]);
  };

  const updateCareerPathway = (index: number, updates: Partial<CareerPathway>) => {
    const updatedPathways = formData.careerPathways.map((pathway, i) =>
      i === index ? { ...pathway, ...updates } : pathway
    );
    handleInputChange('careerPathways', updatedPathways);
  };

  const removeCareerPathway = (index: number) => {
    handleInputChange('careerPathways', 
      formData.careerPathways.filter((_, i) => i !== index)
    );
  };

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Course name is required';
        if (!formData.universityId) newErrors.universityId = 'University is required';
        if (!formData.courseUrl.trim()) newErrors.courseUrl = 'Course URL is required';
        if (!formData.frameworkType) newErrors.frameworkType = 'Framework type is required';
        if (!formData.frameworkLevel) newErrors.frameworkLevel = 'Framework level is required';
        break;
      case 2:
        if (formData.requirements.streams.length === 0) {
          newErrors.streams = 'At least one stream must be selected';
        }
        // Validate subject baskets
        formData.requirements.subjectBaskets.forEach((basket, index) => {
          if (basket.subjects.length === 0) {
            newErrors[`basket_${index}_subjects`] = `Basket "${basket.name}" must have at least one subject`;
          }
          if (basket.minSelection > basket.subjects.length) {
            newErrors[`basket_${index}_minSelection`] = `Min selection cannot exceed number of subjects in basket`;
          }
          if (basket.maxSelection < basket.minSelection) {
            newErrors[`basket_${index}_maxSelection`] = `Max selection cannot be less than min selection`;
          }
        });
        break;
      case 3:
        // Custom rules validation (optional step)
        break;
      case 4:
        // Validate Z-score JSON if provided
        if (formData.zscore && formData.zscore.trim()) {
          try {
            JSON.parse(formData.zscore);
          } catch (e) {
            newErrors.zscore = 'Invalid JSON format for Z-score';
          }
        }
        // Validate course materials
        formData.courseMaterials.forEach((material, index) => {
          if (!material.fileName.trim()) {
            newErrors[`material_${index}_fileName`] = 'File name is required';
          }
          if (!material.filePath.trim()) {
            newErrors[`material_${index}_filePath`] = 'File path is required';
          }
        });
        // Validate career pathways
        formData.careerPathways.forEach((career, index) => {
          if (!career.jobTitle.trim()) {
            newErrors[`career_${index}_jobTitle`] = 'Job title is required';
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalSteps = () => {
    return showCustomRules ? 5 : 4;
  };

  const getStepName = (step: number) => {
    const stepNames = showCustomRules 
      ? ['Course Details', 'Entry Requirements', 'Custom Rules', 'Other Details', 'Review']
      : ['Course Details', 'Entry Requirements', 'Other Details', 'Review'];
    return stepNames[step - 1] || '';
  };

  const canProceedFromStep = (step: number) => {
    return validateStep(step);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(getTotalSteps())) return;

    setSubmitLoading(true);
    try {
      const university = universities.find(u => u.id === formData.universityId)!;
      const faculty = availableFaculties.find(f => f.id === formData.facultyId);
      const department = availableDepartments.find(d => d.id === formData.departmentId);

      const courseData = {
        name: formData.name,
        courseCode: formData.courseCode || null,
        courseUrl: formData.courseUrl,
        specialisation: formData.specialisation,
        universityId: formData.universityId,
        facultyId: formData.facultyId || null,
        departmentId: formData.departmentId || null,
        courseType: formData.courseType,
        studyMode: formData.studyMode,
        feeType: formData.feeType,
        feeAmount: formData.feeAmount,
        frameworkType: formData.frameworkType,
        frameworkLevel: formData.frameworkLevel,
        durationMonths: formData.durationMonths,
        description: formData.description,
        zscore: formData.zscore,
        intakeCount: formData.intakeCount,
        syllabus: formData.syllabus,
        dynamicFields: formData.dynamicFields,
        courseMaterials: formData.courseMaterials,
        careerPathways: formData.careerPathways,
        requirements: formData.requirements
      };

      await courseApi.createCourse(courseData);
      
      // Create course object for parent component
      const course: Omit<Course, 'id'> = {
        name: formData.name,
        courseCode: formData.courseCode,
        courseUrl: formData.courseUrl,
        specialisation: formData.specialisation,
        university,
        faculty: faculty || { id: 0, name: '' },
        department: department || { id: 0, name: '' },
        courseType: formData.courseType,
        studyMode: formData.studyMode,
        feeType: formData.feeType,
        feeAmount: formData.feeAmount,
        framework: {
          id: formData.frameworkLevel,
          type: formData.frameworkType,
          qualificationCategory: formData.frameworkType === 'SLQF' ? 'Degree' : 'Certificate',
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

      onSubmit(course);
    } catch (error: any) {
      console.error('Error creating course:', error);
      setErrors({ general: 'Failed to create course. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Course</h2>
            <p className="text-gray-600 mt-1">Step {currentStep} of {getTotalSteps()}: {getStepName(currentStep)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2">
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
                    type="text"
                    value={formData.courseUrl}
                    onChange={(e) => handleInputChange('courseUrl', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.courseUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., /computer-science-engineering"
                    required
                  />
                  {errors.courseUrl && <p className="mt-1 text-sm text-red-600">{errors.courseUrl}</p>}
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.specialisation.join(', ')}
                    onChange={(e) => handleSpecialisationChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Software Engineering, Data Science"
                  />
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty (Optional)
                  </label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => {
                      handleInputChange('facultyId', parseInt(e.target.value));
                      handleInputChange('departmentId', 0); // Reset department
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!formData.universityId}
                  >
                    <option value={0}>Select Faculty</option>
                    {availableFaculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department (Optional)
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleInputChange('departmentId', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!formData.facultyId}
                  >
                    <option value={0}>Select Department</option>
                    {availableDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

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
                        <option value={4}>Level 4</option>
                        <option value={5}>Level 5</option>
                        <option value={6}>Level 6</option>
                        <option value={7}>Level 7</option>
                        <option value={8}>Level 8</option>
                        <option value={9}>Level 9</option>
                        <option value={10}>Level 10</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>Level 1</option>
                        <option value={2}>Level 2</option>
                        <option value={3}>Level 3</option>
                        <option value={4}>Level 4</option>
                        <option value={5}>Level 5</option>
                        <option value={6}>Level 6</option>
                        <option value={7}>Level 7</option>
                      </>
                    )}
                  </select>
                  {errors.frameworkLevel && <p className="mt-1 text-sm text-red-600">{errors.frameworkLevel}</p>}
                </div>

                {/* Course Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => handleInputChange('courseType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>

                {/* Study Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.studyMode}
                    onChange={(e) => handleInputChange('studyMode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="fulltime">Full Time</option>
                    <option value="parttime">Part Time</option>
                  </select>
                </div>

                {/* Fee Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.feeType}
                    onChange={(e) => handleInputChange('feeType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Fee Amount */}
                {formData.feeType === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Amount (LKR)
                    </label>
                    <input
                      type="number"
                      value={formData.feeAmount || ''}
                      onChange={(e) => handleInputChange('feeAmount', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 150000"
                    />
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMonths || ''}
                    onChange={(e) => handleInputChange('durationMonths', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 48"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter course description..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Entry Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Entry Qualifications</h3>
              
              {/* Minimum Requirement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Requirement <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.requirements.minRequirement}
                  onChange={(e) => handleRequirementChange('minRequirement', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="noNeed">No Specific Requirement</option>
                  <option value="OLPass">O/L Pass</option>
                  <option value="ALPass">A/L Pass</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              {/* Stream Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Streams <span className="text-red-500">*</span> (Select one or more)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {streams.map(stream => (
                    <label key={stream.id} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="text"
                        value={field.fieldValue}
                        onChange={(e) => updateDynamicField(field.id, { fieldValue: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Field value"
                      />
                      <button
                        type="button"
                        onClick={() => removeDynamicField(field.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add Material</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.courseMaterials.map((material, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Material Type
                          </label>
                          <select
                            value={material.materialType}
                            onChange={(e) => updateCourseMaterial(index, { materialType: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {materialTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={material.fileName}
                            onChange={(e) => updateCourseMaterial(index, { fileName: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`material_${index}_fileName`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., syllabus_2024.pdf"
                          />
                          {errors[`material_${index}_fileName`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`material_${index}_fileName`]}</p>
                          }
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Path/URL <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={material.filePath}
                            onChange={(e) => updateCourseMaterial(index, { filePath: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`material_${index}_filePath`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., /documents/syllabus_2024.pdf"
                          />
                          {errors[`material_${index}_filePath`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`material_${index}_filePath`]}</p>
                          }
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeCourseMaterial(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional file metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Type
                          </label>
                          <input
                            type="text"
                            value={material.fileType || ''}
                            onChange={(e) => updateCourseMaterial(index, { fileType: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., pdf, docx, jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Size (bytes)
                          </label>
                          <input
                            type="number"
                            value={material.fileSize || ''}
                            onChange={(e) => updateCourseMaterial(index, { fileSize: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., 1024000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Career</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.careerPathways.map((career, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={career.jobTitle}
                            onChange={(e) => updateCareerPathway(index, { jobTitle: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`career_${index}_jobTitle`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Software Engineer"
                          />
                          {errors[`career_${index}_jobTitle`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`career_${index}_jobTitle`]}</p>
                          }
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Industry
                          </label>
                          <input
                            type="text"
                            value={career.industry || ''}
                            onChange={(e) => updateCareerPathway(index, { industry: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Information Technology"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Salary Range
                          </label>
                          <input
                            type="text"
                            value={career.salaryRange || ''}
                            onChange={(e) => updateCareerPathway(index, { salaryRange: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., LKR 80,000 - 150,000"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeCareerPathway(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <textarea
                          value={career.description || ''}
                          onChange={(e) => updateCareerPathway(index, { description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Brief description of the career path and responsibilities..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === getTotalSteps() && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Review & Submit</h3>
              
              {/* Course Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Course Summary</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Course:</strong> {formData.name}</p>
                  <p><strong>University:</strong> {universities.find(u => u.id === formData.universityId)?.name}</p>
                  <p><strong>Framework:</strong> {formData.frameworkType} Level {formData.frameworkLevel}</p>
                  <p><strong>URL:</strong> {formData.courseUrl}</p>
                  {formData.specialisation.length > 0 && (
                    <p><strong>Specializations:</strong> {formData.specialisation.join(', ')}</p>
                  )}
                  <p><strong>Course Type:</strong> {formData.courseType} • {formData.studyMode}</p>
                  <p><strong>Fee:</strong> {formData.feeType === 'free' ? 'Free' : `LKR ${formData.feeAmount?.toLocaleString()}`}</p>
                  {formData.durationMonths && (
                    <p><strong>Duration:</strong> {Math.floor(formData.durationMonths / 12)} years {formData.durationMonths % 12} months</p>
                  )}
                </div>
              </div>

              {/* Requirements Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Entry Requirements Summary</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Min Requirement:</strong> {formData.requirements.minRequirement}</p>
                  <p><strong>Allowed Streams:</strong> {formData.requirements.streams.map(s => s.name).join(', ')}</p>
                  <p><strong>Subject Baskets:</strong> {formData.requirements.subjectBaskets.length} basket(s)</p>
                  {formData.requirements.basketRelationships.length > 0 && (
                    <p><strong>Basket Relationships:</strong> {formData.requirements.basketRelationships.length} relationship(s)</p>
                  )}
                  {formData.customRules && (
                    <p><strong>Custom Rules:</strong> Added</p>
                  )}
                </div>
              </div>

              {/* Additional Details Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Additional Details Summary</h4>
                <div className="text-sm text-green-700 space-y-1">
                  {formData.intakeCount && (
                    <p><strong>Intake Count:</strong> {formData.intakeCount}</p>
                  )}
                  {formData.zscore && (
                    <p><strong>Z-Score:</strong> Configured</p>
                  )}
                  {formData.dynamicFields.length > 0 && (
                    <p><strong>Dynamic Fields:</strong> {formData.dynamicFields.length} field(s)</p>
                  )}
                  {formData.courseMaterials.length > 0 && (
                    <p><strong>Course Materials:</strong> {formData.courseMaterials.length} file(s)</p>
                  )}
                  {formData.careerPathways.length > 0 && (
                    <p><strong>Career Pathways:</strong> {formData.careerPathways.length} pathway(s)</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Please review all the information above. Once you submit, the course will be created and added to the system.
                  Make sure all required fields are filled and the information is accurate.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={submitLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={submitLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {currentStep < getTotalSteps() ? (
              <button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep) || submitLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitLoading || !canProceedFromStep(currentStep)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{submitLoading ? 'Creating...' : 'Create Course'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;1">
                  <p><strong>Min Requirement:</strong> {formData.requirements.minRequirement}</p>
                  <p><strong>Allowed Streams:</strong> {formData.requirements.streams.map(s => s.name).join(', ')}</p>
                  <p><strong>Subject Baskets:</strong> {formData.requirements.subjectBaskets.length} basket(s)</p>
                  {formData.requirements.basketRelationships.length > 0 && (
                    <p><strong>Basket Relationships:</strong> {formData.requirements.basketRelationships.length} relationship(s)</p>
                  )}
                  {formData.customRules && (
                    <p><strong>Custom Rules:</strong> Added</p>
                  )}
                </div>
              </div>

              {/* Additional Details Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Additional Details Summary</h4>
                <div className="text-sm text-green-700 space-y-1">
                  {formData.intakeCount && (
                    <p><strong>Intake Count:</strong> {formData.intakeCount}</p>
                  )}
                  {formData.zscore && (
                    <p><strong>Z-Score:</strong> Configured</p>
                  )}
                  {formData.dynamicFields.length > 0 && (
                    <p><strong>Dynamic Fields:</strong> {formData.dynamicFields.length} field(s)</p>
                  )}
                  {formData.courseMaterials.length > 0 && (
                    <p><strong>Course Materials:</strong> {formData.courseMaterials.length} file(s)</p>
                  )}
                  {formData.careerPathways.length > 0 && (
                    <p><strong>Career Pathways:</strong> {formData.careerPathways.length} pathway(s)</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Please review all the information above. Once you submit, the course will be created and added to the system.
                  Make sure all required fields are filled and the information is accurate.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={submitLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={submitLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {currentStep < getTotalSteps() ? (
              <button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep) || submitLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitLoading || !canProceedFromStep(currentStep)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{submitLoading ? 'Creating...' : 'Create Course'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;1">
                  <p><strong>Min Requirement:</strong> {formData.requirements.minRequirement}</p>
                  <p><strong>Allowed Streams:</strong> {formData.requirements.streams.map(s => s.name).join(', ')}</p>
                  <p><strong>Subject Baskets:</strong> {formData.requirements.subjectBaskets.length} basket(s)</p>
                  {formData.requirements.basketRelationships.length > 0 && (
                    <p><strong>Basket Relationships:</strong> {formData.requirements.basketRelationships.length} relationship(s)</p>
                  )}
                  {formData.customRules && (
                    <p><strong>Custom Rules:</strong> Added</p>
                  )}
                </div>
              </div>

              {/* Additional Details Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Additional Details Summary</h4>
                <div className="text-sm text-green-700 space-y-1">
                  {formData.intakeCount && (
                    <p><strong>Intake Count:</strong> {formData.intakeCount}</p>
                  )}
                  {formData.zscore && (
                    <p><strong>Z-Score:</strong> Configured</p>
                  )}
                  {formData.dynamicFields.length > 0 && (
                    <p><strong>Dynamic Fields:</strong> {formData.dynamicFields.length} field(s)</p>
                  )}
                  {formData.courseMaterials.length > 0 && (
                    <p><strong>Course Materials:</strong> {formData.courseMaterials.length} file(s)</p>
                  )}
                  {formData.careerPathways.length > 0 && (
                    <p><strong>Career Pathways:</strong> {formData.careerPathways.length} pathway(s)</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Please review all the information above. Once you submit, the course will be created and added to the system.
                  Make sure all required fields are filled and the information is accurate.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={submitLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={submitLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {currentStep < getTotalSteps() ? (
              <button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep) || submitLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitLoading || !canProceedFromStep(currentStep)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{submitLoading ? 'Creating...' : 'Create Course'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;="checkbox"
                        checked={formData.requirements.streams.some(s => s.id === stream.id)}
                        onChange={() => handleStreamToggle(stream)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{stream.name}</span>
                    </label>
                  ))}
                </div>
                {errors.streams && <p className="mt-1 text-sm text-red-600">{errors.streams}</p>}
              </div>

              {/* Subject Baskets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject Baskets
                  </label>
                  <button
                    type="button"
                    onClick={addSubjectBasket}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Basket</span>
                  </button>
                </div>

                {formData.requirements.subjectBaskets.map((basket, basketIndex) => (
                  <div key={basket.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={basket.name}
                        onChange={(e) => updateBasket(basket.id, { name: e.target.value })}
                        className="font-medium text-gray-800 bg-transparent border-none outline-none"
                        placeholder="Basket name"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubjectBasket(basket.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Min Selection
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={basket.minSelection}
                          onChange={(e) => updateBasket(basket.id, { minSelection: parseInt(e.target.value) })}
                          className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors[`basket_${basketIndex}_minSelection`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`basket_${basketIndex}_minSelection`] && 
                          <p className="mt-1 text-xs text-red-600">{errors[`basket_${basketIndex}_minSelection`]}</p>
                        }
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Max Selection
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={basket.maxSelection}
                          onChange={(e) => updateBasket(basket.id, { maxSelection: parseInt(e.target.value) })}
                          className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors[`basket_${basketIndex}_maxSelection`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`basket_${basketIndex}_maxSelection`] && 
                          <p className="mt-1 text-xs text-red-600">{errors[`basket_${basketIndex}_maxSelection`]}</p>
                        }
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Internal Logic
                        </label>
                        <select
                          value={basket.internalLogic}
                          onChange={(e) => updateBasket(basket.id, { internalLogic: e.target.value as 'AND' | 'OR' })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Subjects in this basket <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                        {subjects.map(subject => (
                          <label key={subject.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={basket.subjects.some(s => s.id === subject.id)}
                              onChange={() => handleSubjectToggleInBasket(basket.id, subject)}
                              className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-gray-700">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                      {errors[`basket_${basketIndex}_subjects`] && 
                        <p className="mt-1 text-sm text-red-600">{errors[`basket_${basketIndex}_subjects`]}</p>
                      }
                    </div>

                    {/* Subject-wise Grade Requirements */}
                    {basket.subjects.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Subject-wise Grade Requirements (Optional)
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {basket.subjects.map(subject => (
                            <div key={subject.id} className="flex items-center space-x-3">
                              <span className="text-sm text-gray-700 w-32">{subject.name}</span>
                              <select
                                value={basket.requiredGrades.find(g => g.subjectId === subject.id)?.grade || ''}
                                onChange={(e) => {
                                  const grade = e.target.value as 'A' | 'B' | 'C' | 'S' | 'F' | '';
                                  const existingGrades = basket.requiredGrades.filter(g => g.subjectId !== subject.id);
                                  if (grade) {
                                    updateBasket(basket.id, {
                                      requiredGrades: [...existingGrades, { subjectId: subject.id, subject, grade }]
                                    });
                                  } else {
                                    updateBasket(basket.id, { requiredGrades: existingGrades });
                                  }
                                }}
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">No specific grade</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="S">S</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Basket-wide Grade Requirements */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-600">
                          Basket Grade Requirements (e.g., 2 'C' grades and 1 'S' grade)
                        </label>
                        <button
                          type="button"
                          onClick={() => addBasketGradeRequirement(basket.id)}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          Add Grade Rule
                        </button>
                      </div>
                      <div className="space-y-2">
                        {basket.basketGradeRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <input
                              type="number"
                              min="1"
                              value={req.count}
                              onChange={(e) => updateBasketGradeRequirement(basket.id, index, { count: parseInt(e.target.value) })}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Count"
                            />
                            <select
                              value={req.grade}
                              onChange={(e) => updateBasketGradeRequirement(basket.id, index, { grade: e.target.value as any })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="S">S</option>
                            </select>
                            <span className="text-sm text-gray-600">grade(s)</span>
                            <button
                              type="button"
                              onClick={() => removeBasketGradeRequirement(basket.id, index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Basket Relationships */}
              {formData.requirements.subjectBaskets.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Basket Relationships
                    </label>
                    <button
                      type="button"
                      onClick={addBasketRelationship}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Relationship</span>
                    </button>
                  </div>
                  
                  {formData.requirements.basketRelationships.map((relationship, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Relationship {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeBasketRelationship(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Baskets
                          </label>
                          <select
                            multiple
                            value={relationship.basketIds}
                            onChange={(e) => {
                              const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                              updateBasketRelationship(index, { basketIds: selectedIds });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            size={Math.min(formData.requirements.subjectBaskets.length, 4)}
                          >
                            {formData.requirements.subjectBaskets.map(basket => (
                              <option key={basket.id} value={basket.id}>
                                {basket.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Relationship
                          </label>
                          <select
                            value={relationship.relation}
                            onChange={(e) => updateBasketRelationship(index, { relation: e.target.value as 'AND' | 'OR' })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="AND">AND (All selected baskets required)</option>
                            <option value="OR">OR (Any of selected baskets required)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Basket Relationships - Complete Section */}
              {formData.requirements.subjectBaskets.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Basket Relationships
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Define how different subject baskets relate to each other
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addBasketRelationship}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Relationship</span>
                    </button>
                  </div>
                  
                  {formData.requirements.basketRelationships.map((relationship, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Relationship {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeBasketRelationship(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Baskets (Hold Ctrl/Cmd to select multiple)
                          </label>
                          <select
                            multiple
                            value={relationship.basketIds}
                            onChange={(e) => {
                              const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                              updateBasketRelationship(index, { basketIds: selectedIds });
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            size={Math.min(formData.requirements.subjectBaskets.length, 4)}
                          >
                            {formData.requirements.subjectBaskets.map(basket => (
                              <option key={basket.id} value={basket.id}>
                                {basket.name} ({basket.subjects.length} subjects)
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Selected: {relationship.basketIds.length} basket(s)
                          </p>
                          {errors[`relationship_${index}`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`relationship_${index}`]}</p>
                          }
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Relationship Type
                          </label>
                          <select
                            value={relationship.relation}
                            onChange={(e) => updateBasketRelationship(index, { relation: e.target.value as 'AND' | 'OR' })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="AND">AND (All selected baskets required)</option>
                            <option value="OR">OR (Any of selected baskets required)</option>
                          </select>
                          
                          <div className="mt-2 text-xs text-gray-600">
                            {relationship.relation === 'AND' ? (
                              <p>✓ Student must satisfy ALL selected baskets</p>
                            ) : (
                              <p>✓ Student must satisfy ANY ONE of the selected baskets</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Visual Preview of Relationship */}
                      {relationship.basketIds.length > 1 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border">
                          <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
                          <p className="text-xs text-gray-600">
                            {relationship.basketIds.map((basketId, idx) => {
                              const basket = formData.requirements.subjectBaskets.find(b => b.id === basketId);
                              return (
                                <span key={basketId}>
                                  <span className="font-medium">{basket?.name || 'Unknown Basket'}</span>
                                  {idx < relationship.basketIds.length - 1 && (
                                    <span className="mx-2 font-bold text-purple-600">
                                      {relationship.relation}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {formData.requirements.basketRelationships.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 text-lg">🔗</span>
                      </div>
                      <p className="text-gray-500 text-sm">No basket relationships defined</p>
                      <p className="text-gray-400 text-xs">Baskets will be evaluated independently</p>
                    </div>
                  )}

                  {/* Relationship Logic Explanation */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-xs font-medium text-blue-800 mb-1">How Basket Relationships Work:</h5>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• <strong>AND:</strong> Student must satisfy all connected baskets</li>
                      <li>• <strong>OR:</strong> Student must satisfy at least one of the connected baskets</li>
                      <li>• Multiple relationships are evaluated according to their priority</li>
                      <li>• Baskets without relationships are evaluated independently</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Custom Rules Option */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showCustomRules}
                    onChange={(e) => setShowCustomRules(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Add custom rule logic (optional)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Check this if you need to add complex logical expressions for entry requirements
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Custom Rules (Optional) */}
          {currentStep === 3 && showCustomRules && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Rules</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Terminal className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Terminal-like Input</h4>
                    <p className="text-sm text-blue-700">
                      Enter complex logical expressions using subject codes, operators (AND, OR, NOT), 
                      and parentheses. Example: (PHYSICS >= C AND CHEMISTRY >= B) OR (BIOLOGY >= A)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  value={formData.customRules || ''}
                  onChange={(e) => handleInputChange('customRules', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter logical expressions... 

Examples:
- (PHYSICS >= C AND MATHS >= B) OR (CHEMISTRY >= A)
- BIOLOGY >= B AND (PHYSICS >= C OR CHEMISTRY >= C)
- NOT (ARTS_SUBJECTS > 1)
- (BASKET_1 AND BASKET_2) OR BASKET_3"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Available Subject Codes:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm max-h-40 overflow-y-auto">
                  {subjects.map(subject => (
                    <div key={subject.id} className="text-gray-700">
                      <code className="bg-white px-2 py-1 rounded text-xs">{subject.code}</code>
                      <span className="ml-2">{subject.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Other Details */}
          {currentStep === (showCustomRules ? 4 : 3) && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Z-Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Z-Score (JSON format)
                  </label>
                  <textarea
                    value={formData.zscore || ''}
                    onChange={(e) => handleInputChange('zscore', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm ${
                      errors.zscore ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='{"district": {"Colombo": 1.2345, "Gampaha": 1.1234}}'
                  />
                  {errors.zscore && <p className="mt-1 text-sm text-red-600">{errors.zscore}</p>}
                </div>

                {/* Intake Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intake Count
                  </label>
                  <input
                    type="number"
                    value={formData.intakeCount || ''}
                    onChange={(e) => handleInputChange('intakeCount', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 120"
                  />
                </div>
              </div>

              {/* Syllabus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus
                </label>
                <textarea
                  value={formData.syllabus || ''}
                  onChange={(e) => handleInputChange('syllabus', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter syllabus details..."
                />
              </div>

             {/* Dynamic Fields - Complete Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Dynamic Fields
                  </label>
                  <button
                    type="button"
                    onClick={addDynamicField}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Field</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.dynamicFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={field.fieldName}
                        onChange={(e) => updateDynamicField(field.id, { fieldName: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Field name"
                      />
                      <input
                        type="text"
                        value={field.fieldValue}
                        onChange={(e) => updateDynamicField(field.id, { fieldValue: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Field value"
                      />
                      <button
                        type="button"
                        onClick={() => removeDynamicField(field.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.dynamicFields.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 text-sm">No dynamic fields added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Materials - Complete Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Materials
                  </label>
                  <button
                    type="button"
                    onClick={addCourseMaterial}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add Material</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.courseMaterials.map((material, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Material Type
                          </label>
                          <select
                            value={material.materialType}
                            onChange={(e) => updateCourseMaterial(index, { materialType: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {materialTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={material.fileName}
                            onChange={(e) => updateCourseMaterial(index, { fileName: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`material_${index}_fileName`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., syllabus_2024.pdf"
                          />
                          {errors[`material_${index}_fileName`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`material_${index}_fileName`]}</p>
                          }
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Path/URL <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={material.filePath}
                            onChange={(e) => updateCourseMaterial(index, { filePath: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`material_${index}_filePath`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., /documents/syllabus_2024.pdf"
                          />
                          {errors[`material_${index}_filePath`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`material_${index}_filePath`]}</p>
                          }
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeCourseMaterial(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional file metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Type
                          </label>
                          <input
                            type="text"
                            value={material.fileType || ''}
                            onChange={(e) => updateCourseMaterial(index, { fileType: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., pdf, docx, jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            File Size (bytes)
                          </label>
                          <input
                            type="number"
                            value={material.fileSize || ''}
                            onChange={(e) => updateCourseMaterial(index, { fileSize: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., 1024000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.courseMaterials.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No course materials added yet</p>
                      <p className="text-gray-400 text-xs">Click "Add Material" to upload course documents</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Pathways - Complete Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Career Pathways
                  </label>
                  <button
                    type="button"
                    onClick={addCareerPathway}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Career</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.careerPathways.map((career, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={career.jobTitle}
                            onChange={(e) => updateCareerPathway(index, { jobTitle: e.target.value })}
                            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`career_${index}_jobTitle`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Software Engineer"
                          />
                          {errors[`career_${index}_jobTitle`] && 
                            <p className="mt-1 text-xs text-red-600">{errors[`career_${index}_jobTitle`]}</p>
                          }
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Industry
                          </label>
                          <input
                            type="text"
                            value={career.industry || ''}
                            onChange={(e) => updateCareerPathway(index, { industry: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Information Technology"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Salary Range
                          </label>
                          <input
                            type="text"
                            value={career.salaryRange || ''}
                            onChange={(e) => updateCareerPathway(index, { salaryRange: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., LKR 80,000 - 150,000"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeCareerPathway(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <textarea
                          value={career.description || ''}
                          onChange={(e) => updateCareerPathway(index, { description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Brief description of the career path and responsibilities..."
                        />
                      </div>
                    </div>
                  ))}
                  {formData.careerPathways.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-orange-600 text-lg">💼</span>
                      </div>
                      <p className="text-gray-500 text-sm">No career pathways added yet</p>
                      <p className="text-gray-400 text-xs">Click "Add Career" to define potential career paths</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit - Complete Section */}
          {currentStep === getTotalSteps() && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Review & Submit</h3>
              
              {/* Course Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Course Summary</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Course:</strong> {formData.name}</p>
                  <p><strong>University:</strong> {universities.find(u => u.id === formData.universityId)?.name}</p>
                  <p><strong>Framework:</strong> {formData.frameworkType} Level {formData.frameworkLevel}</p>
                  <p><strong>URL:</strong> {formData.courseUrl}</p>
                  {formData.specialisation.length > 0 && (
                    <p><strong>Specializations:</strong> {formData.specialisation.join(', ')}</p>
                  )}
                  <p><strong>Course Type:</strong> {formData.courseType} • {formData.studyMode}</p>
                  <p><strong>Fee:</strong> {formData.feeType === 'free' ? 'Free' : `LKR ${formData.feeAmount?.toLocaleString()}`}</p>
                  {formData.durationMonths && (
                    <p><strong>Duration:</strong> {Math.floor(formData.durationMonths / 12)} years {formData.durationMonths % 12} months</p>
                  )}
                </div>
              </div>

              {/* Requirements Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Entry Requirements Summary</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Min Requirement:</strong> {formData.requirements.minRequirement}</p>
                  <p><strong>Allowed Streams:</strong> {formData.requirements.streams.map(s => s.name).join(', ')}</p>
                  <p><strong>Subject Baskets:</strong> {formData.requirements.subjectBaskets.length} basket(s)</p>
                  {formData.requirements.basketRelationships.length > 0 && (
                    <p><strong>Basket Relationships:</strong> {formData.requirements.basketRelationships.length} relationship(s)</p>
                  )}
                  {formData.customRules && (
                    <p><strong>Custom Rules:</strong> Added</p>
                  )}
                </div>
              </div>

              {/* Additional Details Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Additional Details Summary</h4>
                <div className="text-sm text-green-700 space-y-1">
                  {formData.intakeCount && (
                    <p><strong>Intake Count:</strong> {formData.intakeCount}</p>
                  )}
                  {formData.zscore && (
                    <p><strong>Z-Score:</strong> Configured</p>
                  )}
                  {formData.dynamicFields.length > 0 && (
                    <p><strong>Dynamic Fields:</strong> {formData.dynamicFields.length} field(s)</p>
                  )}
                  {formData.courseMaterials.length > 0 && (
                    <p><strong>Course Materials:</strong> {formData.courseMaterials.length} file(s)</p>
                  )}
                  {formData.careerPathways.length > 0 && (
                    <p><strong>Career Pathways:</strong> {formData.careerPathways.length} pathway(s)</p>
                  )}
                </div>
              </div>

              {/* Detailed Review Sections */}
              {formData.requirements.subjectBaskets.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Subject Baskets Details</h4>
                  <div className="text-sm text-purple-700 space-y-2">
                    {formData.requirements.subjectBaskets.map((basket, index) => (
                      <div key={basket.id} className="pl-2 border-l-2 border-purple-300">
                        <p><strong>{basket.name}:</strong> {basket.subjects.length} subjects, Min: {basket.minSelection}, Max: {basket.maxSelection}, Logic: {basket.internalLogic}</p>
                        {basket.basketGradeRequirements.length > 0 && (
                          <p className="text-xs">Grade Requirements: {basket.basketGradeRequirements.map(req => `${req.count} '${req.grade}' grade(s)`).join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Final Review</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Please review all the information above carefully. Once you submit, the course will be created and added to the system.
                      Make sure all required fields are filled and the information is accurate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Complete Section */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={submitLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>Step {currentStep} of {getTotalSteps()}</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={submitLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {currentStep < getTotalSteps() ? (
              <button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep) || submitLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitLoading || !canProceedFromStep(currentStep)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{submitLoading ? 'Creating Course...' : 'Create Course'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
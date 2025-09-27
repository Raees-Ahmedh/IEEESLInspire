import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/apiService';
import courseService, { AddCourseData } from '../../services/courseService';
import {
  X,
  Check,
  Plus,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Save,
  FileText,
  Users,
  Settings,
  Briefcase
} from 'lucide-react';

// Types
interface University {
  id: number;
  name: string;
  type: 'government' | 'private' | 'semi-government';
}

interface Faculty {
  id: number;
  name: string;
  universityId?: number;
}

interface Department {
  id: number;
  name: string;
  facultyId?: number;
}

interface Subject {
  id: number;
  code: string;
  name: string;
  level: 'OL' | 'AL';
}

interface Stream {
  id: number;
  name: string;
}

interface Framework {
  id: number;
  type: 'SLQF' | 'NVQ';
  qualificationCategory: string;
  level: number;
  year?: number;
}
// Enhanced Types for Requirements Section
interface GradeRequirement {
  grade: 'A' | 'B' | 'C' | 'S';
  count: number;
}

interface SubjectSpecificGrade {
  subjectId: number;
  grade: 'A' | 'B' | 'C' | 'S';
}
interface InternalLogicRule {
  id: string;
  logic: 'AND' | 'OR';
  targetBaskets: string[]; // 'all' or specific basket IDs
  applyToAll: boolean;
  primaryBasket?: string;
}

interface SubjectBasket {
  id: string;
  name: string;
  subjects: number[];
  gradeRequirement: string;
  minRequired: number;
  maxAllowed: number;
  gradeRequirements: GradeRequirement[];
  subjectSpecificGrades: SubjectSpecificGrade[];
  logic: 'AND' | 'OR';
}

interface BasketLogicRule {
  id: string;
  name: string;
  primaryBasket: string;
  selectedBaskets: string[];
  logic: 'AND' | 'OR';
}

interface OLRequirement {
  subjectId: number;
  required: boolean;
  minimumGrade: 'A' | 'B' | 'C' | 'S';
}

interface OLGradeRequirement {
  grade: 'A' | 'B' | 'C' | 'S';
  count: number;
  subjectIds?: number[];
}

interface OLOrLogicRule {
  id: string;
  name: string;
  subjectIds: number[];
  minimumGrade: 'A' | 'B' | 'C' | 'S';
  requiredCount: number;
}

interface OLSubjectRequirement {
  subjectId: number;
  subjectName: string;
  minimumGrade: 'A' | 'B' | 'C' | 'S';
  isGroup?: boolean;
  groupName?: string;
}

interface OLSubjectOrLogic {
  id: string;
  subjectIds: number[];
  logic: 'OR';
}
interface BasketRelationship {
  basket1: string;
  basket2: string;
  relationship: 'AND' | 'OR';
}

interface CourseMaterial {
  id?: number;
  materialType: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  file?: File;
}

interface CareerPathway {
  id?: number;
  jobTitle: string;
  industry?: string;
  description?: string;
  salaryRange?: string;
}

interface DynamicField {
  id: number;
  fieldName: string;
  fieldValue: string;
}

interface MajorField {
  id: number;
  name: string;
  description?: string;
}

interface SubField {
  id: number;
  name: string;
  majorId: number;
  description?: string;
}

interface CourseFormData {
  // Step 1: Basic Course Details
  name: string;
  courseCode: string;
  courseUrl: string;
  description?: string;
  specialisation: string;
  universityId: number;
  facultyId: number;
  departmentId: number;
  majorFieldIds: number[];      // Multiple major fields
  subFieldIds: number[];        // Multiple subfields
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  frameworkId: number | null;
  frameworkType: 'SLQF' | 'NVQ';
  frameworkLevel: number;
  feeType: 'free' | 'paid';
  feeAmount: number | null;
  durationMonths: number | null;

  // Step 2: Stream & Requirements
  minRequirement: 'noNeed' | 'OLPass' | 'ALPass' | 'Foundation' | 'Diploma' | 'HND' | 'Graduate';
  olRequirements: OLRequirement[];
  olGradeRequirements: OLGradeRequirement[];
  olOrLogicRules: OLOrLogicRule[];
  olSubjectRequirements: OLSubjectRequirement[];
  olSubjectOrLogic: OLSubjectOrLogic[];
  allowedStreams: number[];
  subjectBaskets: SubjectBasket[];
  basketRelationships: BasketRelationship[];
  basketLogicRules: BasketLogicRule[];
  globalLogicRules: InternalLogicRule[];
  customRules: string;

  // Step 3: Other Details
  zscore: string;
  intakeCount: string;
  syllabus: string;
  medium: string[];
  dynamicFields: DynamicField[];
  courseMaterials: CourseMaterial[];
  careerPathways: CareerPathway[];
}

interface AddCourseProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: any) => Promise<void>;
}
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';


const AddCourse: React.FC<AddCourseProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [olCoreSubjects, setOlCoreSubjects] = useState<Subject[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<any[]>([]);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<any>(null);
  const [streamSubjects, setStreamSubjects] = useState<Subject[]>([]);
  const [loadingStreamSubjects, setLoadingStreamSubjects] = useState(false);
  const [alSubjects, setALSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  // Form data
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    courseCode: '',
    courseUrl: '',
    description: '',
    specialisation: '',
    universityId: 0,
    facultyId: 0,
    departmentId: 0,
    majorFieldIds: [],
    subFieldIds: [],
    studyMode: 'fulltime',
    courseType: 'internal',
    frameworkId: null,
    frameworkType: 'SLQF',
    frameworkLevel: 4,
    feeType: 'free',
    feeAmount: null,
    durationMonths: null,
    minRequirement: 'OLPass',
    olGradeRequirements: [],
    olOrLogicRules: [],
    olSubjectRequirements: [],
    olSubjectOrLogic: [],
    allowedStreams: [],
    subjectBaskets: [],
    basketLogicRules: [],
    globalLogicRules: [],
    olRequirements: [],
    basketRelationships: [],
    customRules: '',
    zscore: '',
    medium: [],
    intakeCount: '',
    syllabus: '',
    dynamicFields: [],
    courseMaterials: [],
    careerPathways: []
  });

  // API Data States
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [majorFields, setMajorFields] = useState<MajorField[]>([]);
  const [subFields, setSubFields] = useState<SubField[]>([]);
  const [filteredSubFields, setFilteredSubFields] = useState<SubField[]>([]);
  const [frameworkTypes, setFrameworkTypes] = useState<string[]>([]);
  const [frameworkLevels, setFrameworkLevels] = useState<{ id: number, level: number }[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<number | null>(null);
  const [careerSuggestions, setCareerSuggestions] = useState<CareerPathway[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<CareerPathway[]>([]);
  const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
  const [selectedCareerIds, setSelectedCareerIds] = useState<number[]>([]);

  // UI States
  const [newDynamicField, setNewDynamicField] = useState({ fieldName: '', fieldValue: '' });
  const [newBasket, setNewBasket] = useState<SubjectBasket>({
    id: '',
    name: '',
    subjects: [],
    gradeRequirement: 'S',
    minRequired: 1,
    logic: 'AND',
    maxAllowed: 3,
    gradeRequirements: [],
    subjectSpecificGrades: []
  });

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Fetch course suggestions
  const searchCourses = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setCourseSuggestions([]);
      setShowCourseSuggestions(false);
      return;
    }

    try {
      setIsLoadingCourses(true);
      const response = await fetch(`${API_BASE_URL}/admin/courses/search?name=${encodeURIComponent(searchTerm)}&limit=10`);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCourseSuggestions(result.data);
          setShowCourseSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      setCourseSuggestions([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // populate form with selected course data
  const populateFormWithCourse = async (course: any) => {
    try {
      setApiLoading(true);

      // Fetch full course details if needed
      const response = await fetch(`${API_BASE_URL}/admin/courses/${course.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const courseData = result.data;

        // Set selected course for reference
        setSelectedCourseForEdit(courseData);

        // Populate all form fields
        setFormData({
          // Step 1: Basic Details
          name: courseData.name || '',
          courseCode: courseData.courseCode || '',
          courseUrl: courseData.courseUrl || '',
          description: courseData.description || '',
          specialisation: Array.isArray(courseData.specialisation) ? courseData.specialisation[0] || '' : courseData.specialisation || '',
          universityId: courseData.universityId || 0,
          facultyId: courseData.facultyId || 0,
          departmentId: courseData.departmentId || 0,
          majorFieldIds: courseData.majorFieldIds || [],
          subFieldIds: courseData.subFieldIds || [],
          studyMode: courseData.studyMode || 'fulltime',
          courseType: courseData.courseType || 'internal',
          frameworkId: courseData.frameworkId || null,
          frameworkType: courseData.framework?.type || 'SLQF',
          frameworkLevel: courseData.framework?.level || 4,
          feeType: courseData.feeType || 'free',
          feeAmount: courseData.feeAmount || null,
          durationMonths: courseData.durationMonths || null,
          medium: courseData.medium || [],

          // Step 2: Requirements
          minRequirement: courseData.requirements?.minRequirement || 'OLPass',
          olRequirements: courseData.requirements?.olRequirements || [],
          olGradeRequirements: courseData.requirements?.olGradeRequirements || [],
          olOrLogicRules: courseData.requirements?.olOrLogicRules || [],
          olSubjectRequirements: courseData.requirements?.olSubjectRequirements || [],
          olSubjectOrLogic: courseData.requirements?.olSubjectOrLogic || [],
          allowedStreams: courseData.requirements?.streams?.map((s: any) => s.id) || [],
          subjectBaskets: courseData.requirements?.subjectBaskets?.map((basket: any) => ({
            id: basket.id || `basket_${Date.now()}_${Math.random()}`,
            name: basket.name || '',
            subjects: basket.subjects?.map((s: any) => s.id) || [],
            gradeRequirement: basket.gradeRequirement || 'S',
            minRequired: basket.minRequired || 1,
            maxAllowed: basket.maxAllowed || 3,
            gradeRequirements: basket.gradeRequirements || [],
            subjectSpecificGrades: basket.subjectSpecificGrades || [],
            logic: basket.logic || 'AND'
          })) || [],
          basketRelationships: courseData.requirements?.basketRelationships || [],
          basketLogicRules: courseData.requirements?.basketLogicRules || [],
          globalLogicRules: courseData.requirements?.globalLogicRules || [],
          customRules: courseData.requirements?.customRules || '',

          // Step 3: Other Details
          zscore: courseData.zscore ? JSON.stringify(courseData.zscore, null, 2) : '',
          intakeCount: courseData.additionalDetails?.intakeCount || '',
          syllabus: courseData.additionalDetails?.syllabus ? JSON.stringify(courseData.additionalDetails.syllabus, null, 2) : '',
          dynamicFields: courseData.additionalDetails?.dynamicFields || [],
          courseMaterials: courseData.courseMaterials || [],
          careerPathways: courseData.careerPathways || []
        });

        // Trigger data fetching for dependent fields
        if (courseData.universityId) {
          await fetchFaculties(courseData.universityId);
        }
        if (courseData.facultyId) {
          await fetchDepartments(courseData.facultyId);
        }

        // Set framework ID if framework data exists
        if (courseData.framework) {
          setSelectedFrameworkId(courseData.frameworkId);
        }

        // Set selected career IDs
        if (courseData.careerPathways && courseData.careerPathways.length > 0) {
          const careerIds = courseData.careerPathways
            .map((cp: any) => cp.id)
            .filter((id: any) => id !== undefined && id !== null);
          setSelectedCareerIds(careerIds);
        }

        // Hide suggestions
        setShowCourseSuggestions(false);
        setCourseSuggestions([]);

        // Show success message
        console.log('Course data loaded successfully for editing');

      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      alert('Error loading course details. Please try again.');
    } finally {
      setApiLoading(false);
    }
  };

  // fetch subjects based on selected streams
  const fetchSubjectsForStreams = useCallback(async (streamIds: number[]) => {
    if (streamIds.length === 0) {
      setStreamSubjects([]);
      return;
    }

    setLoadingStreamSubjects(true);
    try {
      let allSubjects: Subject[] = [];

      // Check if "Common" stream is selected
      const commonStreamId = streams.find(s => s.name.toLowerCase().includes('common'))?.id;
      const hasCommonStream = commonStreamId && streamIds.includes(commonStreamId);

      if (hasCommonStream) {
        // If Common stream is selected, show all AL subjects
        allSubjects = alSubjects;
      } else {
        // Fetch subjects for each selected stream
        const streamSubjectPromises = streamIds.map(async (streamId) => {
          try {
            const response = await fetch(`${API_BASE_URL}/streams/${streamId}/subjects`);
            const data = await response.json();
            return data.success ? data.data : [];
          } catch (error) {
            console.error(`Error fetching subjects for stream ${streamId}:`, error);
            return [];
          }
        });

        const streamSubjectArrays = await Promise.all(streamSubjectPromises);

        // Combine and deduplicate subjects from all selected streams
        const subjectMap = new Map();
        streamSubjectArrays.flat().forEach((subject: Subject) => {
          subjectMap.set(subject.id, subject);
        });
        allSubjects = Array.from(subjectMap.values());
      }

      setStreamSubjects(allSubjects);
    } catch (error) {
      console.error('Error fetching stream subjects:', error);
      setStreamSubjects([]);
    } finally {
      setLoadingStreamSubjects(false);
    }
  }, [streams, alSubjects, subjects]);

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

  // Call the OL subjects useEffect:
  useEffect(() => {
    let isMounted = true;

    const fetchOLCoreSubjects = async () => {
      try {
        setApiLoading(true);
        const response = await fetch(`${API_BASE_URL}/admin/subjects?level=OL`);
        const result = await response.json();

        if (isMounted && result.success && result.data) {
          const coreSubjects = result.data.filter((subject: Subject) =>
            [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75].includes(subject.id)
          );

          setOlCoreSubjects(coreSubjects);

          const initialOLRequirements: OLRequirement[] = coreSubjects.map((subject: Subject) => ({
            subjectId: subject.id,
            required: false,
            minimumGrade: 'S' as const
          }));

          setFormData(prev => ({
            ...prev,
            olRequirements: initialOLRequirements
          }));
        }
      } catch (error) {
        console.error('Error fetching O/L core subjects:', error);
        if (isMounted) {
          setOlCoreSubjects([]);
        }
      } finally {
        if (isMounted) {
          setApiLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchOLCoreSubjects();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Fetch subjects when allowed streams change
  useEffect(() => {
    if (formData.allowedStreams.length > 0) {
      fetchSubjectsForStreams(formData.allowedStreams);
    } else {
      setStreamSubjects([]);
    }
  }, [formData.allowedStreams, fetchSubjectsForStreams]);

  // Filter subfields when major fields change
  useEffect(() => {
    if (formData.majorFieldIds.length > 0) {
      const filtered = subFields.filter(subField =>
        formData.majorFieldIds.includes(subField.majorId)
      );
      setFilteredSubFields(filtered);

      setFormData(prev => ({
        ...prev,
        subFieldIds: prev.subFieldIds.filter(subFieldId =>
          filtered.some(subField => subField.id === subFieldId)
        )
      }));
    } else {
      setFilteredSubFields([]);
      setFormData(prev => ({ ...prev, subFieldIds: [] }));
    }
  }, [formData.majorFieldIds, subFields]);

  // useEffect to fetch framework types on component mount:
  useEffect(() => {
    const fetchFrameworkTypes = async () => {
      try {
        const response = await adminService.getFrameworkTypes();
        if (response.success && response.data) {
          setFrameworkTypes(response.data);
        }
      } catch (error) {
        console.error('Error fetching framework types:', error);
      }
    };

    fetchFrameworkTypes();
  }, []);

  // useEffect to fetch framework levels when type changes:
  useEffect(() => {
    const fetchFrameworkLevels = async () => {
      if (!formData.frameworkType) {
        setFrameworkLevels([]);
        setSelectedFrameworkId(null);
        return;
      }

      try {
        const response = await adminService.getFrameworkLevelsByType(formData.frameworkType);
        if (response.success && response.data) {
          setFrameworkLevels(response.data);
        }
      } catch (error) {
        console.error('Error fetching framework levels:', error);
      }
    };

    fetchFrameworkLevels();
  }, [formData.frameworkType]);
  // useEffect that gets framework ID:
  useEffect(() => {
    const getFrameworkId = async () => {
      if (!formData.frameworkType || !formData.frameworkLevel) {
        setSelectedFrameworkId(null);
        return;
      }

      // Find the framework ID from the frameworkLevels array
      const selectedFramework = frameworkLevels.find(
        fw => fw.level === formData.frameworkLevel
      );

      if (selectedFramework) {
        setSelectedFrameworkId(selectedFramework.id);
        setFormData(prev => ({ ...prev, frameworkId: selectedFramework.id }));
      }
    };

    getFrameworkId();
  }, [formData.frameworkType, formData.frameworkLevel, frameworkLevels]);

  // useEffect to load career pathways:
  useEffect(() => {
    const fetchCareerPathways = async () => {
      try {
        const response = await adminService.getCareerPathways();
        if (response.success && response.data) {
          setCareerSuggestions(response.data);
        }
      } catch (error) {
        console.error('Error fetching career pathways:', error);
      }
    };

    if (isOpen) {
      fetchCareerPathways();
    }
  }, [isOpen]);
  const fetchInitialData = async () => {
    try {
      setApiLoading(true);

      // Fetch universities
      const universitiesResponse = await fetch(`${API_BASE_URL}/admin/universities`);
      if (universitiesResponse.ok) {
        const universitiesResult = await universitiesResponse.json();
        if (universitiesResult.success) {
          setUniversities(universitiesResult.data);
        }
      }

      // Fetch major fields
      const majorFieldsResponse = await fetch(`${API_BASE_URL}/admin/major-fields`);
      if (majorFieldsResponse.ok) {
        const majorFieldsResult = await majorFieldsResponse.json();
        if (majorFieldsResult.success) {
          setMajorFields(majorFieldsResult.data);
        }
      }

      // Fetch subfields
      const subFieldsResponse = await fetch(`${API_BASE_URL}/admin/sub-fields`);
      if (subFieldsResponse.ok) {
        const subFieldsResult = await subFieldsResponse.json();
        if (subFieldsResult.success) {
          setSubFields(subFieldsResult.data);
        }
      }

      // Fetch frameworks
      const frameworksResponse = await fetch(`${API_BASE_URL}/admin/frameworks`);
      if (frameworksResponse.ok) {
        const frameworksResult = await frameworksResponse.json();
        if (frameworksResult.success) {
          // Store frameworks data if needed
          console.log('Frameworks loaded:', frameworksResult.data);
        }
      }
      // Fetch streams
      const streamsResponse = await fetch(`${API_BASE_URL}/admin/streams`);
      if (streamsResponse.ok) {
        const streamsResult = await streamsResponse.json();
        if (streamsResult.success) {
          setStreams(streamsResult.data);
        }
      }

      // Fetch AL subjects and store in alSubjects state
      const alSubjectsResponse = await fetch(`${API_BASE_URL}/admin/subjects?level=AL`);
      if (alSubjectsResponse.ok) {
        const alSubjectsResult = await alSubjectsResponse.json();
        if (alSubjectsResult.success) {
          setALSubjects(alSubjectsResult.data); // Store in separate state
          setSubjects(alSubjectsResult.data);   // Keep existing functionality
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
        }
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
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
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setApiLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Course name is required';
        if (!formData.courseUrl.trim()) newErrors.courseUrl = 'Course URL is required';
        if (!formData.universityId) newErrors.universityId = 'University is required';
        if (!formData.frameworkType) newErrors.frameworkType = 'Framework type is required';
        if (!formData.frameworkLevel) newErrors.frameworkLevel = 'Framework level is required';
        if (formData.majorFieldIds.length === 0) newErrors.majorFieldIds = 'At least one major field is required';
        if (!formData.studyMode) newErrors.studyMode = 'Study mode is required';
        if (!formData.courseType) newErrors.courseType = 'Course type is required';
        if (!formData.feeType) newErrors.feeType = 'Fee type is required';

        // Validate fee amount if paid
        if (formData.feeType === 'paid') {
          if (!formData.feeAmount || formData.feeAmount <= 0) {
            newErrors.feeAmount = 'Fee amount is required for paid courses';
          }
        }

        // Optional validation for duration
        if (formData.durationMonths && formData.durationMonths <= 0) {
          newErrors.durationMonths = 'Duration must be greater than 0';
        }
        break;

      case 2:
        // Only validate O/L requirements if they're applicable
        if (['OLPass', 'ALPass', 'Foundation', 'HND', 'Diploma'].includes(formData.minRequirement)) {
          // Validate O/L subject requirements if any are added
          if (formData.olSubjectRequirements && formData.olSubjectRequirements.length > 0) {
            // Check for duplicate subjects
            const subjectIds = formData.olSubjectRequirements.map(req => req.subjectId);
            const duplicates = subjectIds.filter((id, index) => subjectIds.indexOf(id) !== index);
            if (duplicates.length > 0) {
              newErrors.olSubjectRequirements = 'Duplicate subjects found in O/L requirements';
            }
          }

          // Validate OR logic rules
          if (formData.olSubjectOrLogic && formData.olSubjectOrLogic.length > 0) {
            formData.olSubjectOrLogic.forEach((logic, index) => {
              if (logic.subjectIds.length < 2) {
                newErrors[`olOrLogic_${index}`] = `OR Logic rule ${index + 1} must have at least 2 subjects`;
              }
            });
          }
        }

        // Only validate streams if A/L Pass is selected (mandatory only for ALPass)
        if (formData.minRequirement === 'ALPass') {
          // Streams are mandatory for ALPass only
          if (formData.allowedStreams.length === 0) {
            newErrors.allowedStreams = 'At least one stream must be selected for A/L Pass requirement';
          }
        }

        // Validate baskets if they exist for ALPass, HND, or Diploma
        if (['ALPass', 'HND', 'Diploma'].includes(formData.minRequirement) && formData.subjectBaskets.length > 0) {
          // Validate each basket
          formData.subjectBaskets.forEach((basket, index) => {
            if (!basket.name.trim()) {
              newErrors[`basket_${index}_name`] = `Basket ${index + 1} name is required`;
            }

            if (basket.subjects.length === 0) {
              newErrors[`basket_${index}_subjects`] = `Basket ${index + 1} must have at least one subject`;
            }

            if (basket.minRequired > basket.subjects.length) {
              newErrors[`basket_${index}_minRequired`] = `Basket ${index + 1} minimum required cannot exceed number of subjects`;
            }

            if ((basket.maxAllowed || 3) < basket.minRequired) {
              newErrors[`basket_${index}_maxAllowed`] = `Basket ${index + 1} maximum allowed cannot be less than minimum required`;
            }

            // Validate grade requirements
            if (basket.gradeRequirements && basket.gradeRequirements.length > 0) {
              const totalGradeCount = basket.gradeRequirements.reduce((sum, req) => sum + req.count, 0);
              if (totalGradeCount > basket.subjects.length) {
                newErrors[`basket_${index}_gradeRequirements`] = `Basket ${index + 1} grade requirements exceed number of subjects`;
              }
            }
          });

          // Validate basket logic rules only if baskets exist
          if (formData.basketLogicRules) {
            formData.basketLogicRules.forEach((rule: BasketLogicRule, index: number) => {
              if (rule.selectedBaskets.length < 2) {
                newErrors[`rule_${index}`] = `Logic rule ${index + 1} must have at least 2 baskets`;
              }

              // Check if all referenced baskets exist
              const invalidBaskets = rule.selectedBaskets.filter(basketId =>
                !formData.subjectBaskets.some(basket => basket.id === basketId)
              );

              if (invalidBaskets.length > 0) {
                newErrors[`rule_${index}_invalid`] = `Logic rule ${index + 1} references non-existent baskets`;
              }
            });
          }
        }
        break;


      case 3:
        // Optional validations for other details
        try {
          if (formData.zscore && formData.zscore.trim()) {
            JSON.parse(formData.zscore);
          }
        } catch {
          newErrors.zscore = 'Z-score must be valid JSON';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMajorFieldToggle = (majorFieldId: number) => {
    setFormData(prev => ({
      ...prev,
      majorFieldIds: prev.majorFieldIds.includes(majorFieldId)
        ? prev.majorFieldIds.filter(id => id !== majorFieldId)
        : [...prev.majorFieldIds, majorFieldId]
    }));
  };

  const handleSubFieldToggle = (subFieldId: number) => {
    setFormData(prev => ({
      ...prev,
      subFieldIds: prev.subFieldIds.includes(subFieldId)
        ? prev.subFieldIds.filter(id => id !== subFieldId)
        : [...prev.subFieldIds, subFieldId]
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStreamToggle = (streamId: number) => {
    setFormData(prev => ({
      ...prev,
      allowedStreams: prev.allowedStreams.includes(streamId)
        ? prev.allowedStreams.filter(id => id !== streamId)
        : [...prev.allowedStreams, streamId]
    }));
  };


  const addSubjectBasket = () => {
    if (newBasket.name && newBasket.subjects.length > 0) {
      const basketWithId = {
        ...newBasket,
        id: `basket_${Date.now()}`
      };

      setFormData(prev => ({
        ...prev,
        subjectBaskets: [...prev.subjectBaskets, basketWithId]
      }));

      setNewBasket({
        id: '',
        name: '',
        subjects: [],
        gradeRequirement: 'S',
        minRequired: 1,
        logic: 'AND',
        maxAllowed: 3,
        gradeRequirements: [],
        subjectSpecificGrades: []
      });
    }
  };

  const removeSubjectBasket = (basketId: string) => {
    setFormData(prev => ({
      ...prev,
      subjectBaskets: prev.subjectBaskets.filter(basket => basket.id !== basketId),
      basketRelationships: prev.basketRelationships.filter(
        rel => rel.basket1 !== basketId && rel.basket2 !== basketId
      ),
      basketLogicRules: (prev.basketLogicRules || []).filter(rule =>
        !rule.selectedBaskets.includes(basketId)
      )
    }));
  };

  const addBasketRelationship = (basket1: string, basket2: string, relationship: 'AND' | 'OR') => {
    const newRelationship: BasketRelationship = { basket1, basket2, relationship };
    setFormData(prev => ({
      ...prev,
      basketRelationships: [...prev.basketRelationships, newRelationship]
    }));
  };

  const addDynamicField = () => {
    if (newDynamicField.fieldName && newDynamicField.fieldValue) {
      const field: DynamicField = {
        id: Date.now(), // Use number instead of string
        fieldName: newDynamicField.fieldName,
        fieldValue: newDynamicField.fieldValue
      };

      setFormData(prev => ({
        ...prev,
        dynamicFields: [...prev.dynamicFields, field]
      }));

      setNewDynamicField({ fieldName: '', fieldValue: '' });
    }
  };

  const removeDynamicField = (fieldId: number) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter(field => field.id !== fieldId)
    }));
  };
  const addCourseMaterial = (material: CourseMaterial) => {
    const materialWithId = {
      ...material,
      id: Date.now() // Use number instead of string
    };

    setFormData(prev => ({
      ...prev,
      courseMaterials: [...prev.courseMaterials, materialWithId]
    }));
  };

  const removeCourseMaterial = (materialId: number) => {
    setFormData(prev => ({
      ...prev,
      courseMaterials: prev.courseMaterials.filter(material => material.id !== materialId)
    }));
  };
  const addCareerPathway = (pathway: CareerPathway) => {
    setFormData(prev => ({
      ...prev,
      careerPathways: [...prev.careerPathways, pathway]
    }));
  };



  const removeCareerPathway = (pathwayId: number) => {
    setFormData(prev => ({
      ...prev,
      careerPathways: prev.careerPathways.filter(pathway => pathway.id !== pathwayId)
    }));
  };

  // merging existing functionality with new API integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Transform data for API submission (keeping your existing structure)
      const courseData = {
        // Basic details
        name: formData.name,
        courseCode: formData.courseCode,
        courseUrl: formData.courseUrl,
        specialisation: formData.specialisation ? [formData.specialisation] : [],
        universityId: formData.universityId,
        facultyId: formData.facultyId || null,
        departmentId: formData.departmentId || null,
        majorFieldIds: formData.majorFieldIds,
        subFieldIds: formData.subFieldIds,
        studyMode: formData.studyMode,
        courseType: formData.courseType,
        frameworkId: selectedFrameworkId,
        feeType: formData.feeType,
        feeAmount: formData.feeAmount,
        durationMonths: formData.durationMonths,
        medium: formData.medium,

        // Enhanced Requirements (keeping your existing structure)
        requirements: {
          minRequirement: formData.minRequirement,
          olGradeRequirements: formData.olGradeRequirements || [],
          olOrLogicRules: formData.olOrLogicRules || [],
          olSubjectRequirements: formData.olSubjectRequirements || [],
          olSubjectOrLogic: formData.olSubjectOrLogic || [],
          streams: formData.allowedStreams.map(id => ({ id })),
          subjectBaskets: formData.subjectBaskets.map(basket => ({
            id: basket.id,
            name: basket.name,
            subjects: basket.subjects.map(id => ({ id })),
            gradeRequirement: basket.gradeRequirement,
            minRequired: basket.minRequired,
            maxAllowed: basket.maxAllowed || 3,
            gradeRequirements: basket.gradeRequirements || [],
            subjectSpecificGrades: (basket.subjectSpecificGrades || []).map(sg => ({
              subjectId: sg.subjectId,
              grade: sg.grade,
              subject: subjects.find(s => s.id === sg.subjectId)
            })),
            logic: basket.logic
          })),
          basketRelationships: formData.basketRelationships,
          basketLogicRules: formData.basketLogicRules || [],
          olRequirements: (formData.olRequirements || []).filter(req => req.required).map(req => ({
            subjectId: req.subjectId,
            subject: olCoreSubjects.find(s => s.id === req.subjectId),
            required: req.required,
            minimumGrade: req.minimumGrade
          })),
          customRules: formData.customRules
        },

        // Other details (keeping your existing structure)
        zscore: formData.zscore ? JSON.parse(formData.zscore) : null,
        additionalDetails: {
          intakeCount: formData.intakeCount,
          syllabus: formData.syllabus,
          dynamicFields: formData.dynamicFields
        },

        // Materials and pathways (keeping your existing structure)
        courseMaterials: formData.courseMaterials,
        careerIds: selectedCareerIds,
        careerPathways: formData.careerPathways
      };

      // Transform data for the new API format while preserving existing structure
      const apiCourseData: AddCourseData = {
        // Basic Details
        name: formData.name,
        courseCode: formData.courseCode || undefined,
        courseUrl: formData.courseUrl,
        description: formData.description || undefined,
        specialisation: formData.specialisation ? [formData.specialisation] : [],

        // University Structure
        universityId: formData.universityId,
        facultyId: formData.facultyId && formData.facultyId > 0 ? formData.facultyId : undefined,
        departmentId: formData.departmentId && formData.departmentId > 0 ? formData.departmentId : undefined,
        subfieldId: formData.subFieldIds || [],

        // Course Configuration
        studyMode: formData.studyMode,
        courseType: formData.courseType,
        frameworkId: selectedFrameworkId || undefined,

        // Fees & Duration
        feeType: formData.feeType,
        feeAmount: formData.feeType === 'paid' && formData.feeAmount !== null ? formData.feeAmount : undefined,
        durationMonths: formData.durationMonths !== null ? formData.durationMonths : undefined,
        medium: formData.medium || [],


        // Complex Requirements - Transform your existing requirements to API format
        requirements: formData.minRequirement && formData.minRequirement !== 'noNeed' ? {
          minRequirement: formData.minRequirement,
          streams: formData.allowedStreams && formData.allowedStreams.length > 0 ? formData.allowedStreams : [],
          ruleSubjectBasket: transformSubjectBaskets(formData.subjectBaskets),
          ruleSubjectGrades: transformSubjectGrades(formData.subjectBaskets),
          ruleOLGrades: transformOLRequirements(formData.olRequirements)
        } : undefined,

        // JSON Data
        zscore: (() => {
          try {
            return formData.zscore && formData.zscore.trim() ? JSON.parse(formData.zscore) : undefined;
          } catch (error) {
            console.error('Invalid Z-score JSON:', error);
            return undefined;
          }
        })(),

        additionalDetails: (() => {
          const details: any = {};

          if (formData.intakeCount && formData.intakeCount.trim()) {
            const intakeNum = parseInt(formData.intakeCount);
            if (!isNaN(intakeNum) && intakeNum > 0) {
              details.intakeCount = intakeNum;
            }
          }

          if (formData.syllabus && formData.syllabus.trim()) {
            try {
              const parsed = JSON.parse(formData.syllabus);
              details.syllabus = parsed;
            } catch (error) {
              console.error('Invalid syllabus JSON, storing as string:', error);
              details.syllabus = formData.syllabus.trim();
            }
          }

          if (formData.dynamicFields && formData.dynamicFields.length > 0) {
            details.customFields = formData.dynamicFields;
          }

          return Object.keys(details).length > 0 ? details : undefined;
        })(),

        // Career Pathways - FIX: Better validation
        careerPathways: formData.careerPathways && formData.careerPathways.length > 0 ?
          formData.careerPathways
            .filter(cp => cp.jobTitle && cp.jobTitle.trim()) // Only include pathways with job titles
            .map(cp => ({
              jobTitle: cp.jobTitle.trim(),
              industry: cp.industry && cp.industry.trim() ? cp.industry.trim() : undefined,
              description: cp.description && cp.description.trim() ? cp.description.trim() : undefined,
              salaryRange: cp.salaryRange && cp.salaryRange.trim() ? cp.salaryRange.trim() : undefined
            })) : undefined
      };

      const validationErrors = validateApiData(apiCourseData);
      if (validationErrors.length > 0) {
        setError(`Validation failed: ${validationErrors.join(', ')}`);
        return;
      }

      //Submit to the new API endpoint
      const result = await courseService.addCourse(apiCourseData);

      if (result.success) {
        // Handle success
        setSuccess?.('Course created successfully!'); // Use optional chaining in case setSuccess doesn't exist

        // Upload course materials if any
        if (formData.courseMaterials.length > 0 && result.data?.courseId) {
          for (const material of formData.courseMaterials) {
            await courseService.uploadMaterial(result.data.courseId, {
              materialType: material.materialType,
              fileName: material.fileName,
              filePath: material.filePath,
              fileType: material.fileType,
              fileSize: material.fileSize
            });
          }
        }

        // onSubmit call for backward compatibility
        if (onSubmit) {
          await onSubmit(courseData);
        }

        // Reset form to initial state
        setFormData({
          name: '',
          courseCode: '',
          courseUrl: '',
          description: '',
          specialisation: '',
          universityId: 0,
          facultyId: 0,
          departmentId: 0,
          majorFieldIds: [],
          subFieldIds: [],
          studyMode: 'fulltime',
          courseType: 'internal',
          frameworkType: 'SLQF',
          frameworkId: null,
          frameworkLevel: 4,
          feeType: 'free',
          feeAmount: null,
          durationMonths: null,
          minRequirement: 'OLPass',
          olGradeRequirements: [],
          olOrLogicRules: [],
          olSubjectRequirements: [],
          olSubjectOrLogic: [],
          allowedStreams: [],
          subjectBaskets: [],
          basketRelationships: [],
          basketLogicRules: [],
          globalLogicRules: [],
          olRequirements: olCoreSubjects && olCoreSubjects.length > 0 ?
            olCoreSubjects.map(subject => ({
              subjectId: subject.id,
              required: false,
              minimumGrade: 'S' as const
            })) : [],
          customRules: '',
          zscore: '',
          medium: [],
          intakeCount: '',
          syllabus: '',
          dynamicFields: [],
          courseMaterials: [],
          careerPathways: []
        });

        // Reset form to initial state
        setSelectedCareerIds([]);
        setShowJobTitleSuggestions(false);
        setShowIndustrySuggestions(false);
        setJobTitleSuggestions([]);
        setIndustrySuggestions([]);

        setCurrentStep(1);

        // Close modal after short delay to show success message
        setTimeout(() => {
          onClose();
        }, 2000);

      } else {
        // Handle API errors
        setError?.(result.error || 'Failed to create course');
        console.error('Course creation failed:', result.error);
      }

    } catch (error: any) {
      console.error('Error submitting course:', error);
      setError?.('An unexpected error occurred while creating the course');
    } finally {
      setLoading(false);
    }
  };

  //Helper functions to transform form data for the API
  const transformSubjectBaskets = (baskets: SubjectBasket[]) => {
    if (!baskets || baskets.length === 0) return undefined;

    return baskets
      .filter(basket => basket.name && basket.name.trim() && basket.subjects.length > 0) // Filter valid baskets
      .map(basket => ({
        id: basket.id,
        name: basket.name.trim(),
        subjects: basket.subjects,
        minRequired: basket.minRequired || 1,
        maxAllowed: basket.maxAllowed || 3,
        logic: basket.logic || 'AND',
        gradeRequirements: basket.gradeRequirements || [],
        subjectSpecificGrades: basket.subjectSpecificGrades || []
      }));
  };

  const transformSubjectGrades = (baskets: SubjectBasket[]) => {
    if (!baskets || baskets.length === 0) return undefined;

    const gradeRules: any = {};
    baskets
      .filter(basket => basket.subjectSpecificGrades && basket.subjectSpecificGrades.length > 0)
      .forEach(basket => {
        basket.subjectSpecificGrades.forEach((sg: SubjectSpecificGrade) => {
          if (sg.subjectId && sg.grade) {
            gradeRules[sg.subjectId] = sg.grade;
          }
        });
      });

    return Object.keys(gradeRules).length > 0 ? gradeRules : undefined;
  };

  const transformOLRequirements = (olRequirements: OLRequirement[]) => {
    if (!olRequirements || olRequirements.length === 0) return undefined;

    const requirements = olRequirements
      .filter(req => req.required && req.subjectId && req.minimumGrade)
      .reduce((acc: any, req: OLRequirement) => {
        acc[req.subjectId] = req.minimumGrade;
        return acc;
      }, {});

    return Object.keys(requirements).length > 0 ? requirements : undefined;
  };

  const validateApiData = (apiData: AddCourseData): string[] => {
    const errors: string[] = [];

    if (!apiData.name || !apiData.name.trim()) {
      errors.push('Course name is required');
    }

    if (!apiData.courseUrl || !apiData.courseUrl.trim()) {
      errors.push('Course URL is required');
    }

    if (!apiData.universityId || apiData.universityId <= 0) {
      errors.push('Valid university is required');
    }

    if (apiData.feeType === 'paid' && (!apiData.feeAmount || apiData.feeAmount <= 0)) {
      errors.push('Fee amount is required for paid courses');
    }

    return errors;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Course</h2>
              <p className="text-sm text-gray-500">
                Step {currentStep} of 3: {
                  currentStep === 1 ? 'Basic Details' :
                    currentStep === 2 ? 'Requirements & Streams' :
                      'Additional Information'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar - Fixed */}
        <div className="px-6 py-4 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep
                  ? 'bg-blue-600 text-white'
                  : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }`}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {currentStep === 1 && (
            <Step1BasicDetails
              formData={formData}
              setFormData={setFormData}
              universities={universities}
              faculties={faculties}
              departments={departments}
              frameworkTypes={frameworkTypes}
              frameworkLevels={frameworkLevels}
              majorFields={majorFields}
              filteredSubFields={filteredSubFields}
              onMajorFieldToggle={handleMajorFieldToggle}
              onSubFieldToggle={handleSubFieldToggle}
              errors={errors}
              apiLoading={apiLoading}
              courseSuggestions={courseSuggestions}
              showCourseSuggestions={showCourseSuggestions}
              isLoadingCourses={isLoadingCourses}
              selectedCourseForEdit={selectedCourseForEdit}
              setSelectedCourseForEdit={setSelectedCourseForEdit}
              searchCourses={searchCourses}
              populateFormWithCourse={populateFormWithCourse}
              setShowCourseSuggestions={setShowCourseSuggestions}
            />
          )}

          {currentStep === 2 && (
            <Step2Requirements
              formData={formData}
              setFormData={setFormData}
              streams={streams}
              subjects={subjects}
              olCoreSubjects={olCoreSubjects}
              newBasket={newBasket}
              setNewBasket={setNewBasket}
              onStreamToggle={handleStreamToggle}
              onAddBasket={addSubjectBasket}
              onRemoveBasket={removeSubjectBasket}
              onAddRelationship={addBasketRelationship}
              streamSubjects={streamSubjects}
              loadingStreamSubjects={loadingStreamSubjects}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Step3OtherDetails
              formData={formData}
              setFormData={setFormData}
              newDynamicField={newDynamicField}
              setNewDynamicField={setNewDynamicField}
              onAddDynamicField={addDynamicField}
              onRemoveDynamicField={removeDynamicField}
              onAddCourseMaterial={addCourseMaterial}
              onRemoveCourseMaterial={removeCourseMaterial}
              onAddCareerPathway={addCareerPathway}
              onRemoveCareerPathway={removeCareerPathway}
              careerSuggestions={careerSuggestions}
              showJobTitleSuggestions={showJobTitleSuggestions}
              setShowJobTitleSuggestions={setShowJobTitleSuggestions}
              showIndustrySuggestions={showIndustrySuggestions}
              setShowIndustrySuggestions={setShowIndustrySuggestions}
              jobTitleSuggestions={jobTitleSuggestions}
              setJobTitleSuggestions={setJobTitleSuggestions}
              industrySuggestions={industrySuggestions}
              setIndustrySuggestions={setIndustrySuggestions}
              selectedCareerIds={selectedCareerIds}
              setSelectedCareerIds={setSelectedCareerIds}
              errors={errors}
            />
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Course</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1: Basic Details Component
const Step1BasicDetails: React.FC<{
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  universities: University[];
  faculties: Faculty[];
  departments: Department[];
  majorFields: MajorField[];
  filteredSubFields: SubField[];
  onMajorFieldToggle: (majorFieldId: number) => void;
  onSubFieldToggle: (subFieldId: number) => void;
  frameworkTypes: string[];
  frameworkLevels: { id: number, level: number }[];
  errors: { [key: string]: string };
  apiLoading: boolean;
  courseSuggestions: any[];
  showCourseSuggestions: boolean;
  isLoadingCourses: boolean;
  selectedCourseForEdit: any;
  setSelectedCourseForEdit: React.Dispatch<React.SetStateAction<any>>;
  searchCourses: (searchTerm: string) => Promise<void>;
  populateFormWithCourse: (course: any) => Promise<void>;
  setShowCourseSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  formData,
  setFormData,
  universities,
  faculties,
  departments,
  frameworkTypes,
  frameworkLevels,
  majorFields,
  filteredSubFields,
  onMajorFieldToggle,
  onSubFieldToggle,
  errors,
  apiLoading,
  courseSuggestions,
  showCourseSuggestions,
  isLoadingCourses,
  selectedCourseForEdit,
  setSelectedCourseForEdit,
  searchCourses,
  populateFormWithCourse,
  setShowCourseSuggestions
}) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Basic Course Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* University */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Select University</option>
              {universities.map(uni => (
                <option key={uni.id} value={uni.id}>{uni.name}</option>
              ))}
            </select>
            {errors.universityId && <p className="mt-1 text-sm text-red-600">{errors.universityId}</p>}
          </div>

          {/* Course Name with Autocomplete */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={async (e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, name: value }));

                // Clear selected course if user is typing
                if (selectedCourseForEdit && value !== selectedCourseForEdit.name) {
                  setSelectedCourseForEdit(null);
                }

                // Search for courses
                await searchCourses(value);
              }}
              onBlur={() => {
                // Hide suggestions after a delay to allow for clicks
                setTimeout(() => setShowCourseSuggestions(false), 200);
              }}
              onFocus={() => {
                if (courseSuggestions.length > 0) {
                  setShowCourseSuggestions(true);
                }
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course name or search existing courses..."
            />

            {/* Loading indicator */}
            {isLoadingCourses && (
              <div className="absolute right-3 top-8">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Course suggestions dropdown */}
            {showCourseSuggestions && courseSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {courseSuggestions.map((course, index) => (
                  <div
                    key={course.id || index}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => populateFormWithCourse(course)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{course.name}</div>
                        {course.courseCode && (
                          <div className="text-xs text-gray-500 mt-1">Code: {course.courseCode}</div>
                        )}
                        {course.university && (
                          <div className="text-xs text-blue-600 mt-1">{course.university.name}</div>
                        )}
                        {course.faculty && (
                          <div className="text-xs text-gray-500">{course.faculty.name}</div>
                        )}
                      </div>
                      <div className="ml-2 text-xs text-gray-400">
                        Click to edit
                      </div>
                    </div>
                  </div>
                ))}

                {/* Option to create new course */}
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
                  <div className="text-sm text-blue-800 font-medium">
                    Create new course: "{formData.name}"
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Continue filling the form to create a new course
                  </div>
                </div>
              </div>
            )}

            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}

            {/* Show edit indicator */}
            {selectedCourseForEdit && (
              <div className="mt-2 flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editing existing course</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourseForEdit(null);
                    // Reset form to initial state
                    setFormData({
                      name: '',
                      courseCode: '',
                      courseUrl: '',
                      description: '',
                      specialisation: '',
                      universityId: 0,
                      facultyId: 0,
                      departmentId: 0,
                      majorFieldIds: [],
                      subFieldIds: [],
                      studyMode: 'fulltime',
                      courseType: 'internal',
                      frameworkId: null,
                      frameworkType: 'SLQF',
                      frameworkLevel: 4,
                      feeType: 'free',
                      feeAmount: null,
                      durationMonths: null,
                      minRequirement: 'OLPass',
                      olGradeRequirements: [],
                      olOrLogicRules: [],
                      olSubjectRequirements: [],
                      olSubjectOrLogic: [],
                      allowedStreams: [],
                      subjectBaskets: [],
                      basketRelationships: [],
                      basketLogicRules: [],
                      globalLogicRules: [],
                      olRequirements: [],
                      customRules: '',
                      zscore: '',
                      medium: [],
                      intakeCount: '',
                      syllabus: '',
                      dynamicFields: [],
                      courseMaterials: [],
                      careerPathways: []
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xs underline"
                >
                  Start fresh
                </button>
              </div>
            )}
          </div>

          {/* Course Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code
            </label>
            <input
              type="text"
              value={formData.courseCode}
              onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CS101"
            />
          </div>

          {/* Course URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course URL *
            </label>
            <input
              type="url"
              value={formData.courseUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, courseUrl: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://university.edu/course"
            />
            {errors.courseUrl && <p className="mt-1 text-sm text-red-600">{errors.courseUrl}</p>}
          </div>



          {/* Faculty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty
            </label>
            <select
              value={formData.facultyId}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                facultyId: parseInt(e.target.value),
                departmentId: 0
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, departmentId: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.facultyId || apiLoading}
            >
              <option value={0}>Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
          </div>

          {/* Major Fields */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Major Fields *
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {majorFields.map(majorField => (
                  <label key={majorField.id} className="flex items-center space-x-2 p-2 hover:bg-white cursor-pointer text-sm rounded">
                    <input
                      type="checkbox"
                      checked={formData.majorFieldIds.includes(majorField.id)}
                      onChange={() => onMajorFieldToggle(majorField.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{majorField.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.majorFieldIds.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Selected: {formData.majorFieldIds.length} major field(s)
              </p>
            )}
            {errors.majorFieldIds && <p className="mt-1 text-sm text-red-600">{errors.majorFieldIds}</p>}
          </div>

          {/* Sub Fields*/}
          {formData.majorFieldIds.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Fields
              </label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-gray-50">
                {filteredSubFields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredSubFields.map(subField => (
                      <label key={subField.id} className="flex items-center space-x-2 p-2 hover:bg-white cursor-pointer text-sm rounded">
                        <input
                          type="checkbox"
                          checked={formData.subFieldIds.includes(subField.id)}
                          onChange={() => onSubFieldToggle(subField.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{subField.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No sub fields available for selected major fields
                  </p>
                )}
              </div>
              {formData.subFieldIds.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Selected: {formData.subFieldIds.length} sub field(s)
                </p>
              )}
            </div>
          )}

          {/* Study Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Mode *
            </label>
            <select
              value={formData.studyMode}
              onChange={(e) => setFormData(prev => ({ ...prev, studyMode: e.target.value as 'fulltime' | 'parttime' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
            </select>
            {errors.studyMode && <p className="mt-1 text-sm text-red-600">{errors.studyMode}</p>}
          </div>

          {/* Course Type*/}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Type *
            </label>
            <select
              value={formData.courseType}
              onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.value as 'internal' | 'external' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
            {errors.courseType && <p className="mt-1 text-sm text-red-600">{errors.courseType}</p>}
          </div>

          {/* Framework Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Framework Type *
            </label>
            <select
              value={formData.frameworkType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                frameworkType: e.target.value as 'SLQF' | 'NVQ',
                frameworkLevel: 0, // Reset level when type changes
                frameworkId: null
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Framework Type</option>
              {frameworkTypes.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.frameworkType && <p className="mt-1 text-sm text-red-600">{errors.frameworkType}</p>}
          </div>

          {/* Framework Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Framework Level *
            </label>
            <select
              value={formData.frameworkLevel || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                frameworkLevel: parseInt(e.target.value),
                frameworkId: null // Will be set by useEffect
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.frameworkType}
            >
              <option value="">Select Framework Level</option>
              {frameworkLevels.map(framework => (
                <option key={framework.id} value={framework.level}>
                  Level {framework.level}
                </option>
              ))}
            </select>
            {!formData.frameworkType && (
              <p className="mt-1 text-sm text-gray-500">Select framework type first</p>
            )}
            {errors.frameworkLevel && <p className="mt-1 text-sm text-red-600">{errors.frameworkLevel}</p>}
          </div>

          {/* Fee Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Type *
            </label>
            <select
              value={formData.feeType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                feeType: e.target.value as 'free' | 'paid',
                feeAmount: e.target.value === 'free' ? null : prev.feeAmount // Reset fee amount if free
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            {errors.feeType && <p className="mt-1 text-sm text-red-600">{errors.feeType}</p>}
          </div>

          {/* Fee Amount - Only show if paid */}
          {formData.feeType === 'paid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Fee (LKR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.feeAmount || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  feeAmount: e.target.value ? parseFloat(e.target.value) : null
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course fee amount"
              />
              {errors.feeAmount && <p className="mt-1 text-sm text-red-600">{errors.feeAmount}</p>}
            </div>
          )}

          {/* Duration in Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Months)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.durationMonths || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                durationMonths: e.target.value ? parseInt(e.target.value) : null
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 48 for 4 years"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter duration in months (e.g., 48 for 4 years, 12 for 1 year)
            </p>
            {errors.durationMonths && <p className="mt-1 text-sm text-red-600">{errors.durationMonths}</p>}
          </div>

          {/* Medium */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium of Instruction *
            </label>
            <div className="space-y-2">
              {['English', 'Tamil', 'Sinhala'].map(lang => (
                <label key={lang} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.medium.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          medium: [...prev.medium, lang]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          medium: prev.medium.filter(m => m !== lang)
                        }));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{lang}</span>
                </label>
              ))}
            </div>
            {errors.medium && <p className="mt-1 text-sm text-red-600">{errors.medium}</p>}
          </div>

          {/* Specialisation */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialisation
            </label>
            <input
              type="text"
              value={formData.specialisation}
              onChange={(e) => setFormData(prev => ({ ...prev, specialisation: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course specialisation"
            />
          </div>
        </div>
      </div>
    );
  };
// Updated Step2Requirements component with conditional rendering
const Step2Requirements: React.FC<{
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  streams: Stream[];
  subjects: Subject[];
  olCoreSubjects: Subject[];
  newBasket: SubjectBasket;
  setNewBasket: React.Dispatch<React.SetStateAction<SubjectBasket>>;
  onStreamToggle: (streamId: number) => void;
  onAddBasket: () => void;
  onRemoveBasket: (basketId: string) => void;
  onAddRelationship: (basket1: string, basket2: string, relationship: 'AND' | 'OR') => void;
  errors: { [key: string]: string };
  streamSubjects: Subject[];
  loadingStreamSubjects: boolean;
}> = ({
  formData,
  setFormData,
  streams,
  subjects,
  olCoreSubjects,
  newBasket,
  setNewBasket,
  onStreamToggle,
  onAddBasket,
  onRemoveBasket,
  onAddRelationship,
  streamSubjects,
  loadingStreamSubjects,
  errors
}) => {
    const [showCustomRules, setShowCustomRules] = useState(false);
    const [selectedOLSubject, setSelectedOLSubject] = useState<number>(0);
    const [selectedOLGrade, setSelectedOLGrade] = useState<'A' | 'B' | 'C' | 'S'>('S');
    const [selectedOrSubjects, setSelectedOrSubjects] = useState<number[]>([]);
    const [olGradeReq, setOLGradeReq] = useState({
      grade: 'S' as 'A' | 'B' | 'C' | 'S',
      count: 6
    });

    // Determine what sections to show based on minimum requirement
    const showOLRequirements = ['OLPass', 'ALPass', 'Foundation', 'HND', 'Diploma'].includes(formData.minRequirement);
    const showALStreamsAndBaskets = ['ALPass', 'HND', 'Diploma'].includes(formData.minRequirement);
    const showStreamsOnly = false; // No case where we show only streams without baskets

    // Clear data when sections are hidden
    React.useEffect(() => {
      if (!showOLRequirements) {
        setFormData(prev => ({
          ...prev,
          olGradeRequirements: [],
          olOrLogicRules: [],
          olSubjectRequirements: [],
          olSubjectOrLogic: [],
          olRequirements: []
        }));
      }

      if (!showALStreamsAndBaskets) {
        setFormData(prev => ({
          ...prev,
          allowedStreams: [],
          subjectBaskets: [],
          basketRelationships: [],
          basketLogicRules: [],
          globalLogicRules: []
        }));
      }
    }, [formData.minRequirement, setFormData, showOLRequirements, showALStreamsAndBaskets]);

    // Handler functions for O/L Subject Requirements
    const addOLSubjectRequirement = () => {
      if (!selectedOLSubject) return;

      let subjectName = '';
      let isGroup = false;
      let groupName = '';
      let actualSubjectId = selectedOLSubject;

      // Handle special groups
      if (selectedOLSubject === 999) {
        subjectName = 'Religion (All Subjects)';
        isGroup = true;
        groupName = 'religion';
      } else if (selectedOLSubject === 998) {
        subjectName = 'First Language & Literature';
        isGroup = true;
        groupName = 'firstlang';
      } else {
        // Individual subjects - find the actual subject name from olCoreSubjects
        const subject = olCoreSubjects.find(s => s.id === selectedOLSubject);
        subjectName = subject?.name || `Subject ${selectedOLSubject}`;
      }

      // Check if this subject/group is already added
      const exists = formData.olSubjectRequirements?.some(req =>
        req.subjectId === actualSubjectId
      );

      if (exists) {
        alert('This subject/group is already added');
        return;
      }

      const newRequirement: OLSubjectRequirement = {
        subjectId: actualSubjectId,
        subjectName,
        minimumGrade: selectedOLGrade,
        isGroup,
        groupName
      };

      setFormData(prev => ({
        ...prev,
        olSubjectRequirements: [...(prev.olSubjectRequirements || []), newRequirement]
      }));

      // Reset form
      setSelectedOLSubject(0);
      setSelectedOLGrade('S');
    };

    const removeOLSubjectRequirement = (index: number) => {
      setFormData(prev => {
        const newRequirements = (prev.olSubjectRequirements || []).filter((_, i) => i !== index);

        // Update OR logic rules to adjust indices
        const updatedOrLogic = (prev.olSubjectOrLogic || []).map(logic => ({
          ...logic,
          subjectIds: logic.subjectIds
            .filter(id => id !== index) // Remove the deleted index
            .map(id => id > index ? id - 1 : id) // Adjust higher indices
        })).filter(logic => logic.subjectIds.length >= 2); // Remove rules with less than 2 subjects

        return {
          ...prev,
          olSubjectRequirements: newRequirements,
          olSubjectOrLogic: updatedOrLogic
        };
      });
    };

    const addOLOrLogic = () => {
      if (selectedOrSubjects.length < 2) return;

      const newOrLogic: OLSubjectOrLogic = {
        id: `ol_subject_or_${Date.now()}`,
        subjectIds: [...selectedOrSubjects],
        logic: 'OR'
      };

      setFormData(prev => ({
        ...prev,
        olSubjectOrLogic: [...(prev.olSubjectOrLogic || []), newOrLogic]
      }));

      setSelectedOrSubjects([]);
    };

    const removeOLOrLogic = (logicId: string) => {
      setFormData(prev => ({
        ...prev,
        olSubjectOrLogic: (prev.olSubjectOrLogic || []).filter(logic => logic.id !== logicId)
      }));
    };

    // handler functions
    const addOLGradeRequirement = () => {
      if (olGradeReq.count > 0) {
        setFormData(prev => ({
          ...prev,
          olGradeRequirements: [
            ...(prev.olGradeRequirements || []),
            { ...olGradeReq }
          ]
        }));
        setOLGradeReq({ grade: 'S', count: 6 });
      }
    };

    const removeOLGradeRequirement = (index: number) => {
      setFormData(prev => ({
        ...prev,
        olGradeRequirements: (prev.olGradeRequirements || []).filter((_, i) => i !== index)
      }));
    };

    const [basketLogicBuilder, setBasketLogicBuilder] = useState({
      name: '' as string,
      primaryBasket: '' as string,
      selectedBaskets: [] as string[],
      logic: 'AND' as 'AND' | 'OR'
    });
    const [newGradeReq, setNewGradeReq] = useState({
      grade: 'S' as 'A' | 'B' | 'C' | 'S',
      count: 1
    });
    const [globalLogicBuilder, setGlobalLogicBuilder] = useState({
      primaryBasket: '' as string,
      logic: 'AND' as 'AND' | 'OR',
      targetBaskets: [] as string[],
      applyToAll: false
    });

    // Enhanced Subject Toggle Handler
    const handleSubjectToggle = (subjectId: number) => {
      setNewBasket(prev => ({
        ...prev,
        subjects: prev.subjects.includes(subjectId)
          ? prev.subjects.filter(id => id !== subjectId)
          : [...prev.subjects, subjectId]
      }));
    };

    // Grade Requirements Handlers
    const addGradeRequirement = () => {
      if (newGradeReq.count > 0) {
        const updatedBasket = {
          ...newBasket,
          gradeRequirements: [
            ...(newBasket.gradeRequirements || []),
            { ...newGradeReq }
          ]
        };
        setNewBasket(updatedBasket);
        setNewGradeReq({ grade: 'S', count: 1 });
      }
    };

    const removeGradeRequirement = (index: number) => {
      const updatedBasket = {
        ...newBasket,
        gradeRequirements: (newBasket.gradeRequirements || []).filter((_, i) => i !== index)
      };
      setNewBasket(updatedBasket);
    };

    // Subject-Specific Grade Handler
    const addSubjectSpecificGrade = (subjectId: number, grade: 'A' | 'B' | 'C' | 'S') => {
      const updatedBasket = {
        ...newBasket,
        subjectSpecificGrades: [
          ...(newBasket.subjectSpecificGrades || []).filter(sg => sg.subjectId !== subjectId),
          { subjectId, grade }
        ]
      };
      setNewBasket(updatedBasket);
    };

    const removeSubjectSpecificGrade = (subjectId: number) => {
      const updatedBasket = {
        ...newBasket,
        subjectSpecificGrades: (newBasket.subjectSpecificGrades || []).filter(sg => sg.subjectId !== subjectId)
      };
      setNewBasket(updatedBasket);
    };

    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Entry Requirements & Streams</h3>
        </div>

        {/* Minimum Qualification Required */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Qualification Required *
          </label>
          <select
            value={formData.minRequirement}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              minRequirement: e.target.value as 'noNeed' | 'OLPass' | 'ALPass' | 'Foundation' | 'Diploma' | 'HND' | 'Graduate'
            }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="noNeed">No Specific Requirement</option>
            <option value="OLPass">O/L Pass</option>
            <option value="ALPass">A/L Pass</option>
            <option value="Foundation">Foundation Completed</option>
            <option value="Diploma">Diploma Completed</option>
            <option value="HND">HND Completed</option>
            <option value="Graduate">Graduate</option>
          </select>
          {errors.minRequirement && <p className="mt-1 text-sm text-red-600">{errors.minRequirement}</p>}
        </div>

        {/* O/L Requirements Section - Show for OLPass, ALPass, Foundation, HND, Diploma */}
        {showOLRequirements && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              O/L Requirements {
                formData.minRequirement === 'OLPass' ? '(Required)' : '(Optional)'
              }
            </h4>
            {/* Overall O/L Grade Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall O/L Grade Requirements
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <select
                  value={olGradeReq.grade}
                  onChange={(e) => setOLGradeReq(prev => ({ ...prev, grade: e.target.value as any }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="S">S</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={olGradeReq.count}
                  onChange={(e) => setOLGradeReq(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                  className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">passes required</span>
                <button
                  onClick={addOLGradeRequirement}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
              </div>

              {/* Display O/L Grade Requirements */}
              {formData.olGradeRequirements && formData.olGradeRequirements.length > 0 && (
                <div className="space-y-1 mb-4">
                  {formData.olGradeRequirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                      <span className="text-sm">{req.count} passes with at least grade "{req.grade}"</span>
                      <button
                        onClick={() => removeOLGradeRequirement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subject-Specific O/L Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subject-Specific Requirements
              </label>

              {/* Add Subject Requirement */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h6 className="font-medium text-gray-900 mb-3">Add Subject Requirement</h6>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Subject/Group
                    </label>
                    <select
                      value={selectedOLSubject}
                      onChange={(e) => setSelectedOLSubject(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select Subject</option>
                      <option value={999} data-group="religion">Religion (All Subjects)</option>
                      <option value={998} data-group="firstlang">First Language & Literature</option>
                      <option value={72}>English</option>
                      <option value={73}>Mathematics</option>
                      <option value={74}>History</option>
                      <option value={75}>Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Grade
                    </label>
                    <select
                      value={selectedOLGrade}
                      onChange={(e) => setSelectedOLGrade(e.target.value as 'A' | 'B' | 'C' | 'S')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addOLSubjectRequirement}
                  disabled={!selectedOLSubject}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Subject Requirement
                </button>
              </div>

              {/* Display Added Subject Requirements */}
              {formData.olSubjectRequirements && formData.olSubjectRequirements.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h6 className="font-medium text-gray-900">Added Subject Requirements:</h6>
                  {formData.olSubjectRequirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="text-sm">
                        <span className="font-medium">{req.subjectName}</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          Grade {req.minimumGrade} or above
                        </span>
                      </div>
                      <button
                        onClick={() => removeOLSubjectRequirement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* OR Logic Between Subjects */}
              {formData.olSubjectRequirements && formData.olSubjectRequirements.length >= 2 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h6 className="font-medium text-gray-900 mb-3">Add OR Logic Between Subjects</h6>
                  <p className="text-sm text-gray-600 mb-3">
                    Select two or more subjects to apply OR logic between them (default is AND logic)
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Subjects for OR Logic
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border rounded-lg bg-white max-h-32 overflow-y-auto">
                        {formData.olSubjectRequirements.map((req, index) => (
                          <label key={index} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedOrSubjects.includes(index)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrSubjects(prev => [...prev, index]);
                                } else {
                                  setSelectedOrSubjects(prev => prev.filter(i => i !== index));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 truncate">{req.subjectName}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {selectedOrSubjects.length >= 2 && (
                      <div className="p-3 bg-blue-50 rounded border">
                        <span className="text-sm text-blue-800">
                          <strong>Preview:</strong> OR logic will be applied between: {
                            selectedOrSubjects.map(i => formData.olSubjectRequirements[i].subjectName).join(' OR ')
                          }
                        </span>
                      </div>
                    )}

                    <button
                      onClick={addOLOrLogic}
                      disabled={selectedOrSubjects.length < 2}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add OR Logic
                    </button>
                  </div>

                  {/* Display Added OR Logic Rules */}
                  {formData.olSubjectOrLogic && formData.olSubjectOrLogic.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h6 className="font-medium text-gray-900">Applied OR Logic:</h6>
                      {formData.olSubjectOrLogic.map((logic, index) => (
                        <div key={logic.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">OR Logic:</span> {
                                logic.subjectIds.map(subjectIndex =>
                                  formData.olSubjectRequirements[subjectIndex]?.subjectName
                                ).join(' OR ')
                              }
                            </div>
                            <button
                              onClick={() => removeOLOrLogic(logic.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* A/L Streams and Subject Baskets - Only show if ALPass */}
        {showALStreamsAndBaskets && (
          <>
            {/* Allowed Streams - Only mandatory for ALPass */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allowed A/L Streams {formData.minRequirement === 'ALPass' ? '*' : '(Optional)'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {streams.map(stream => (
                  <label key={stream.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedStreams.includes(stream.id)}
                      onChange={() => onStreamToggle(stream.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{stream.name}</span>
                  </label>
                ))}
              </div>
              {errors.allowedStreams && <p className="mt-1 text-sm text-red-600">{errors.allowedStreams}</p>}
            </div>


            {loadingStreamSubjects && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-800 text-sm">Loading subjects for selected streams...</span>
                </div>
              </div>
            )}

            {/* Subject Baskets */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                A/L Subject Baskets (Optional)
              </h4>

              {/* Add New Basket - Enhanced */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Create New Basket</h5>

                {/* Basket Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basket Name *
                    </label>
                    <input
                      type="text"
                      value={newBasket.name}
                      onChange={(e) => setNewBasket(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Core Science Subjects"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Required
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newBasket.minRequired}
                        onChange={(e) => setNewBasket(prev => ({ ...prev, minRequired: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Allowed
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newBasket.maxAllowed || 3}
                        onChange={(e) => setNewBasket(prev => ({ ...prev, maxAllowed: parseInt(e.target.value) || 3 }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Multiple Grade Requirements */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Requirements (Multiple Allowed)
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <select
                      value={newGradeReq.grade}
                      onChange={(e) => setNewGradeReq(prev => ({ ...prev, grade: e.target.value as any }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="S">S</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newGradeReq.count}
                      onChange={(e) => setNewGradeReq(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                      className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">subject(s)</span>
                    <button
                      onClick={addGradeRequirement}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Display Grade Requirements */}
                  {(newBasket.gradeRequirements || []).length > 0 && (
                    <div className="space-y-1">
                      {(newBasket.gradeRequirements || []).map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm">{req.count} subject(s) with at least grade "{req.grade}"</span>
                          <button
                            onClick={() => removeGradeRequirement(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subject Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select A/L Subjects *
                  </label>

                  {/* Loading indicator */}
                  {loadingStreamSubjects && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-blue-800 text-sm">Loading subjects for selected streams...</span>
                      </div>
                    </div>
                  )}

                  {/* Stream selection info */}
                  {formData.allowedStreams.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Showing subjects for:</strong> {
                          formData.allowedStreams.map(streamId =>
                            streams.find(s => s.id === streamId)?.name
                          ).filter(Boolean).join(', ')
                        }
                      </p>
                      {streamSubjects.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {streamSubjects.length} subjects available
                        </p>
                      )}
                    </div>
                  )}

                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {/* Use stream-filtered subjects or fall back to all subjects */}
                      {(streamSubjects.length > 0 ? streamSubjects : subjects).map(subject => (
                        <label key={subject.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer text-sm rounded">
                          <input
                            type="checkbox"
                            checked={newBasket.subjects.includes(subject.id)}
                            onChange={() => handleSubjectToggle(subject.id)}
                            disabled={loadingStreamSubjects}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className={`text-gray-700 text-xs ${loadingStreamSubjects ? 'opacity-50' : ''}`}>
                            {subject.code} - {subject.name}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Show message if no subjects available */}
                    {!loadingStreamSubjects && (streamSubjects.length > 0 ? streamSubjects : subjects).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          {formData.allowedStreams.length > 0
                            ? 'No subjects available for selected streams'
                            : 'No subjects available'
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {newBasket.subjects.length} subjects
                    {streamSubjects.length > 0 && ` (from ${streamSubjects.length} available)`}
                  </p>
                </div>

                {/* Subject-Specific Grade Requirements */}
                {newBasket.subjects.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject-Specific Grade Requirements (Optional)
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {newBasket.subjects.map(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        const specificGrade = (newBasket.subjectSpecificGrades || []).find(sg => sg.subjectId === subjectId);

                        return (
                          <div key={subjectId} className="flex items-center space-x-2 bg-white p-2 rounded border">
                            <span className="text-sm text-gray-700 w-48 truncate">{subject?.name}</span>
                            <select
                              value={specificGrade?.grade || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  addSubjectSpecificGrade(subjectId, e.target.value as any);
                                } else {
                                  removeSubjectSpecificGrade(subjectId);
                                }
                              }}
                              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">No specific grade</option>
                              <option value="A">At least A</option>
                              <option value="B">At least B</option>
                              <option value="C">At least C</option>
                              <option value="S">At least S</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={onAddBasket}
                  disabled={!newBasket.name || newBasket.subjects.length === 0}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Basket</span>
                </button>
              </div>

              {/* Existing Baskets - Enhanced Display */}
              {formData.subjectBaskets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Created Baskets</h4>
                  {formData.subjectBaskets.map(basket => (
                    <div key={basket.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{basket.name}</h5>
                        <button
                          onClick={() => onRemoveBasket(basket.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Min: {basket.minRequired}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Max: {basket.maxAllowed || 3}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Logic: {basket.logic}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          Subjects: {basket.subjects.length}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Subjects:</strong> {basket.subjects.map(subjectId => {
                            // Try to find subject in stream subjects first, then fall back to all subjects
                            const subject = (streamSubjects.length > 0 ? streamSubjects : subjects)
                              .find(s => s.id === subjectId) || subjects.find(s => s.id === subjectId);
                            return subject ? subject.name : `Subject ${subjectId}`;
                          }).join(', ')}
                        </div>

                        {(basket.gradeRequirements || []).length > 0 && (
                          <div>
                            <strong>Grade Requirements:</strong> {(basket.gradeRequirements || []).map(req =>
                              `${req.count} ${req.grade}`
                            ).join(', ')}
                          </div>
                        )}

                        {(basket.subjectSpecificGrades || []).length > 0 && (
                          <div>
                            <strong>Specific Grades:</strong> {(basket.subjectSpecificGrades || []).map(sg => {
                              const subject = subjects.find(s => s.id === sg.subjectId);
                              return `${subject?.name}: ${sg.grade}`;
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {/* Global Logic Rules Section */}
              {formData.subjectBaskets.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Global Logic Rules</h4>

                  {/* Add New Global Logic Rule */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h5 className="font-medium text-gray-900 mb-3">Add Logic Rule</h5>

                    <div className="space-y-4">
                      {/* Primary Basket Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Basket *
                        </label>
                        <select
                          value={globalLogicBuilder.primaryBasket}
                          onChange={(e) => setGlobalLogicBuilder(prev => ({
                            ...prev,
                            primaryBasket: e.target.value,
                            targetBaskets: prev.targetBaskets.filter(id => id !== e.target.value)
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Primary Basket</option>
                          {formData.subjectBaskets.map(basket => (
                            <option key={basket.id} value={basket.id}>{basket.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Logic Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logic Type *
                          </label>
                          <select
                            value={globalLogicBuilder.logic}
                            onChange={(e) => setGlobalLogicBuilder(prev => ({ ...prev, logic: e.target.value as 'AND' | 'OR' }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="AND">AND Logic</option>
                            <option value="OR">OR Logic</option>
                          </select>
                        </div>

                        {/* Apply to All Option */}
                        <div className="flex items-center justify-center">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={globalLogicBuilder.applyToAll}
                              onChange={(e) => setGlobalLogicBuilder(prev => ({
                                ...prev,
                                applyToAll: e.target.checked,
                                targetBaskets: e.target.checked ? [] : prev.targetBaskets
                              }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Apply to all existing baskets</span>
                          </label>
                        </div>
                      </div>

                      {/* Target Baskets Selection */}
                      {!globalLogicBuilder.applyToAll && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Target Baskets
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-white max-h-32 overflow-y-auto">
                            {formData.subjectBaskets
                              .filter(basket => basket.id !== globalLogicBuilder.primaryBasket)
                              .map(basket => (
                                <label key={basket.id} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={globalLogicBuilder.targetBaskets.includes(basket.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setGlobalLogicBuilder(prev => ({
                                          ...prev,
                                          targetBaskets: [...prev.targetBaskets, basket.id]
                                        }));
                                      } else {
                                        setGlobalLogicBuilder(prev => ({
                                          ...prev,
                                          targetBaskets: prev.targetBaskets.filter(id => id !== basket.id)
                                        }));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700 truncate">{basket.name}</span>
                                </label>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Preview */}
                      {globalLogicBuilder.primaryBasket && (globalLogicBuilder.applyToAll || globalLogicBuilder.targetBaskets.length > 0) && (
                        <div className="p-3 bg-blue-50 rounded border">
                          <span className="text-sm text-blue-800">
                            <strong>Preview:</strong> {formData.subjectBaskets.find(b => b.id === globalLogicBuilder.primaryBasket)?.name}
                            <span className="mx-2 font-medium">{globalLogicBuilder.logic}</span>
                            {globalLogicBuilder.applyToAll ? 'all other baskets' :
                              `(${globalLogicBuilder.targetBaskets.map(basketId => {
                                const basket = formData.subjectBaskets.find(b => b.id === basketId);
                                return basket?.name;
                              }).join(` ${globalLogicBuilder.logic} `)})`}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (globalLogicBuilder.primaryBasket && (globalLogicBuilder.applyToAll || globalLogicBuilder.targetBaskets.length > 0)) {
                            const newRule: InternalLogicRule = {
                              id: `global_rule_${Date.now()}`,
                              logic: globalLogicBuilder.logic,
                              targetBaskets: globalLogicBuilder.applyToAll ?
                                formData.subjectBaskets.filter(b => b.id !== globalLogicBuilder.primaryBasket).map(b => b.id) :
                                globalLogicBuilder.targetBaskets,
                              applyToAll: globalLogicBuilder.applyToAll,
                              primaryBasket: globalLogicBuilder.primaryBasket
                            };

                            setFormData(prev => ({
                              ...prev,
                              globalLogicRules: [...(prev.globalLogicRules || []), newRule]
                            }));

                            setGlobalLogicBuilder({ primaryBasket: '', logic: 'AND', targetBaskets: [], applyToAll: false });
                          }
                        }}
                        disabled={!globalLogicBuilder.primaryBasket || (!globalLogicBuilder.applyToAll && globalLogicBuilder.targetBaskets.length === 0)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Logic Rule
                      </button>
                    </div>
                  </div>

                  {/* Display Added Global Logic Rules */}
                  {(formData.globalLogicRules || []).length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Added Logic Rules</h5>
                      {(formData.globalLogicRules || []).map((rule: any) => (
                        <div key={rule.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <strong>{formData.subjectBaskets.find(b => b.id === rule.primaryBasket)?.name}</strong>
                              <span className="mx-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                {rule.logic}
                              </span>
                              <span className="text-gray-600">
                                {rule.applyToAll ? 'all other baskets' :
                                  rule.targetBaskets.map((id: string) => formData.subjectBaskets.find(b => b.id === id)?.name).join(`, ${rule.logic} `)}
                              </span>
                            </div>
                            <button
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                globalLogicRules: (prev.globalLogicRules || []).filter((r: any) => r.id !== rule.id)
                              }))}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    );
  };

// Step 3: Other Details Component
const Step3OtherDetails: React.FC<{
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  newDynamicField: { fieldName: string; fieldValue: string };
  setNewDynamicField: React.Dispatch<React.SetStateAction<{ fieldName: string; fieldValue: string }>>;
  onAddDynamicField: () => void;
  onRemoveDynamicField: (fieldId: number) => void;
  onAddCourseMaterial: (material: CourseMaterial) => void;
  onRemoveCourseMaterial: (materialId: number) => void;
  onAddCareerPathway: (pathway: CareerPathway) => void;
  onRemoveCareerPathway: (pathwayId: number) => void;
  careerSuggestions: CareerPathway[];
  showJobTitleSuggestions: boolean;
  setShowJobTitleSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  showIndustrySuggestions: boolean;
  setShowIndustrySuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  jobTitleSuggestions: CareerPathway[];
  setJobTitleSuggestions: React.Dispatch<React.SetStateAction<CareerPathway[]>>;
  industrySuggestions: string[];
  setIndustrySuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCareerIds: number[];
  setSelectedCareerIds: React.Dispatch<React.SetStateAction<number[]>>;
  errors: { [key: string]: string };
}> = ({
  formData,
  setFormData,
  newDynamicField,
  setNewDynamicField,
  onAddDynamicField,
  onRemoveDynamicField,
  onAddCourseMaterial,
  onRemoveCourseMaterial,
  onAddCareerPathway,
  onRemoveCareerPathway,
  careerSuggestions,
  showJobTitleSuggestions,
  setShowJobTitleSuggestions,
  showIndustrySuggestions,
  setShowIndustrySuggestions,
  jobTitleSuggestions,
  setJobTitleSuggestions,
  industrySuggestions,
  setIndustrySuggestions,
  selectedCareerIds,
  setSelectedCareerIds,
  errors
}) => {
    const [newMaterial, setNewMaterial] = useState<CourseMaterial>({
      materialType: 'syllabus',
      fileName: '',
      filePath: '',
      fileType: '',
      fileSize: 0,
      file: undefined
    });

    const [newPathway, setNewPathway] = useState<CareerPathway>({
      jobTitle: '',
      industry: '',
      description: '',
      salaryRange: ''
    });

    const handleAddMaterial = () => {
      if (newMaterial.fileName && newMaterial.filePath) {
        onAddCourseMaterial(newMaterial);
        setNewMaterial({
          materialType: 'syllabus',
          fileName: '',
          filePath: '',
          fileType: '',
          fileSize: 0,
          file: undefined
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter detailed course description..."
          />
        </div>

        {/* Z-Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Z-Score (JSON Format)
          </label>
          <textarea
            value={formData.zscore}
            onChange={(e) => setFormData(prev => ({ ...prev, zscore: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder='{"district1": 1.8, "district2": 1.9}'
          />
          {errors.zscore && <p className="mt-1 text-sm text-red-600">{errors.zscore}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Intake Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intake Count
            </label>
            <input
              type="text"
              value={formData.intakeCount}
              onChange={(e) => setFormData(prev => ({ ...prev, intakeCount: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100 students per year"
            />
          </div>
        </div>

        {/* Dynamic Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Fields
          </label>

          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Custom Field</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newDynamicField.fieldName}
                onChange={(e) => setNewDynamicField(prev => ({ ...prev, fieldName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Field name"
              />
              <input
                type="text"
                value={newDynamicField.fieldValue}
                onChange={(e) => setNewDynamicField(prev => ({ ...prev, fieldValue: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Field value"
              />
            </div>
            <button
              onClick={onAddDynamicField}
              disabled={!newDynamicField.fieldName || !newDynamicField.fieldValue}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </button>
          </div>

          {formData.dynamicFields.length > 0 && (
            <div className="space-y-2">
              {formData.dynamicFields.map(field => (
                <div key={field.id} className="flex items-center justify-between p-2 bg-white border rounded">
                  <span className="text-sm">
                    <strong>{field.fieldName}:</strong> {field.fieldValue}
                  </span>
                  <button
                    onClick={() => onRemoveDynamicField(field.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Syllabus Information (JSON Format) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Syllabus Information (JSON Format)
          </label>
          <textarea
            value={formData.syllabus}
            onChange={(e) => setFormData(prev => ({ ...prev, syllabus: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder='{"modules": ["Module 1", "Module 2"], "duration": "4 years", "credits": 120}'
          />
          {errors.syllabus && <p className="mt-1 text-sm text-red-600">{errors.syllabus}</p>}
        </div>

        {/* Course Materials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Materials
          </label>

          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Course Material</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={newMaterial.materialType}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, materialType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="syllabus">Syllabus</option>
                <option value="brochure">Brochure</option>
                <option value="handbook">Handbook</option>
                <option value="application_form">Application Form</option>
              </select>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewMaterial(prev => ({
                      ...prev,
                      fileName: file.name,
                      filePath: file.name, // Will be set by backend
                      fileType: file.type,
                      fileSize: file.size,
                      file: file // Add the actual file object
                    }));
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <button
              onClick={handleAddMaterial}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              <span>Add Material</span>
            </button>
          </div>

          {formData.courseMaterials.length > 0 && (
            <div className="space-y-2">
              {formData.courseMaterials.map(material => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-white border rounded">
                  <div className="text-sm">
                    <div className="font-medium">{material.fileName}</div>
                    <div className="text-gray-600">
                      Type: {material.materialType} | Path: {material.filePath}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveCourseMaterial(material.id!)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Career Pathways with Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Pathways
          </label>

          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Career Pathway</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Job Title with Autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  value={newPathway.jobTitle}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setNewPathway(prev => ({ ...prev, jobTitle: value }));

                    if (value.length >= 2) {
                      try {
                        const response = await adminService.searchCareersByJobTitle(value);
                        if (response.success && response.data) {
                          // Store full career objects instead of just job titles
                          setJobTitleSuggestions(response.data);
                          setShowJobTitleSuggestions(true);
                        }
                      } catch (error) {
                        console.error('Error fetching job title suggestions:', error);
                      }
                    } else {
                      setShowJobTitleSuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowJobTitleSuggestions(false), 200)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Job title"
                />

                {/* Job Title Suggestions Dropdown */}
                {showJobTitleSuggestions && jobTitleSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {jobTitleSuggestions.map((career, index) => (
                      <div
                        key={career.id || index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          // Populate ALL fields from the selected career
                          setNewPathway({
                            jobTitle: career.jobTitle,
                            industry: career.industry || '',
                            description: career.description || '',
                            salaryRange: career.salaryRange || ''
                          });
                          setShowJobTitleSuggestions(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{career.jobTitle}</div>
                        {career.industry && (
                          <div className="text-xs text-gray-500">{career.industry}</div>
                        )}
                        {career.salaryRange && (
                          <div className="text-xs text-green-600">{career.salaryRange}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Industry with Autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  value={newPathway.industry}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setNewPathway(prev => ({ ...prev, industry: value }));

                    if (value.length >= 2) {
                      try {
                        const response = await adminService.searchCareersByIndustry(value);
                        if (response.success && response.data) {
                          setIndustrySuggestions(
                            response.data
                              .map(career => career.industry)
                              .filter((industry): industry is string => industry !== null && industry !== undefined)
                              .filter((industry, index, arr) => arr.indexOf(industry) === index)
                          );
                          setShowIndustrySuggestions(true);
                        }
                      } catch (error) {
                        console.error('Error fetching industry suggestions:', error);
                      }
                    } else {
                      setShowIndustrySuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 200)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Industry"
                />

                {/* Industry Suggestions Dropdown */}
                {showIndustrySuggestions && industrySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {industrySuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setNewPathway(prev => ({ ...prev, industry: suggestion }));
                          setShowIndustrySuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                value={newPathway.description}
                onChange={(e) => setNewPathway(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Job description"
                rows={2}
              />
              <input
                type="text"
                value={newPathway.salaryRange}
                onChange={(e) => setNewPathway(prev => ({ ...prev, salaryRange: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Salary range (e.g., LKR 50,000 - 80,000)"
              />
            </div>
            <button
              onClick={async () => {
                if (!newPathway.jobTitle) return;

                try {
                  // Check if career pathway already exists
                  const existingCareer = careerSuggestions.find(career =>
                    career.jobTitle.toLowerCase() === newPathway.jobTitle.toLowerCase() &&
                    career.industry?.toLowerCase() === newPathway.industry?.toLowerCase()
                  );

                  if (existingCareer && existingCareer.id) {
                    // Use existing career
                    setSelectedCareerIds(prev => [...prev, existingCareer.id!]);
                    onAddCareerPathway(existingCareer);
                  } else {
                    // Create new career pathway
                    console.log('Creating new career pathway:', newPathway);

                    try {
                      const response = await adminService.createCareerPathway(newPathway);
                      console.log('API Response:', response);

                      if (response.success && response.data) {
                        const newCareer = response.data;
                        if (newCareer.id) {
                          setSelectedCareerIds(prev => [...prev, newCareer.id!]);
                        }
                        onAddCareerPathway(newCareer);
                      } else {
                        // Fallback: Add manually without API call
                        console.warn('API failed, adding manually:', response.error);
                        const manualCareer: CareerPathway = {
                          ...newPathway,
                          id: Date.now() // Temporary ID
                        };
                        onAddCareerPathway(manualCareer);
                      }
                    } catch (error) {
                      // Fallback: Add manually on network error
                      console.warn('Network error, adding manually:', error);
                      const manualCareer: CareerPathway = {
                        ...newPathway,
                        id: Date.now() // Temporary ID
                      };
                      onAddCareerPathway(manualCareer);
                    }
                  }

                  // Reset form only on success
                  setNewPathway({
                    jobTitle: '',
                    industry: '',
                    description: '',
                    salaryRange: ''
                  });
                } catch (error) {
                  console.error('Error adding career pathway:', error);
                  alert('Error adding career pathway. Please try again.');
                }
              }}
              disabled={!newPathway.jobTitle}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Briefcase className="h-4 w-4" />
              <span>Add Career Pathway</span>
            </button>
          </div>

          {/* Display Added Career Pathways with IDs */}
          {formData.careerPathways.length > 0 && (
            <div className="space-y-3">
              {formData.careerPathways.map((pathway, index) => (
                <div key={pathway.id || index} className="flex items-start justify-between p-3 bg-white border rounded">
                  <div className="text-sm flex-1">
                    <div className="font-medium text-gray-900">{pathway.jobTitle}</div>
                    {pathway.industry && (
                      <div className="text-gray-600">Industry: {pathway.industry}</div>
                    )}
                    {pathway.id && (
                      <div className="text-blue-600 text-xs">Career ID: {pathway.id}</div>
                    )}
                    {pathway.description && (
                      <div className="text-gray-600 mt-1">{pathway.description}</div>
                    )}
                    {pathway.salaryRange && (
                      <div className="text-green-600 font-medium mt-1">Salary: {pathway.salaryRange}</div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Remove from selected career IDs
                      if (pathway.id && typeof pathway.id === 'number') {
                        setSelectedCareerIds(prev => prev.filter(id => id !== pathway.id));
                      }
                      // Remove from form data - pass number not string
                      if (pathway.id) {
                        onRemoveCareerPathway(pathway.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 p-1 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

export default AddCourse;
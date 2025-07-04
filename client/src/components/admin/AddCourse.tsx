import React, { useState, useEffect } from 'react';
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
  grade: 'A' | 'B' | 'C' | 'S' | 'F';
  count: number;
}

interface SubjectSpecificGrade {
  subjectId: number;
  grade: 'A' | 'B' | 'C' | 'S' | 'F';
}
interface SubjectBasket {
  id: string;
  name: string;
  subjects: number[];
  minRequired: number;
  maxAllowed: number;
  gradeRequirement: string; // Keep for backward compatibility
  gradeRequirements: GradeRequirement[];
  subjectSpecificGrades: SubjectSpecificGrade[];
  logic: 'AND' | 'OR';
}

interface BasketLogicRule {
  id: string;
  selectedBaskets: string[];
  logic: 'AND' | 'OR';
}

interface OLRequirement {
  subjectId: number;
  required: boolean;
  minimumGrade: 'A' | 'B' | 'C' | 'S' | 'F';
}

interface BasketRelationship {
  basket1: string;
  basket2: string;
  relationship: 'AND' | 'OR';
}

interface CourseMaterial {
  id?: string;
  materialType: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
}

interface CareerPathway {
  id?: string;
  jobTitle: string;
  industry?: string;
  description?: string;
  salaryRange?: string;
}

interface DynamicField {
  id: string;
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
  specialisation: string;
  universityId: number;
  facultyId: number;
  departmentId: number;
  majorFieldIds: number[];      // Multiple major fields
  subFieldIds: number[];        // Multiple subfields
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  frameworkType: 'SLQF' | 'NVQ';
  frameworkLevel: number;

  // Step 2: Stream & Requirements
  allowedStreams: number[];
  subjectBaskets: SubjectBasket[];
  basketRelationships: BasketRelationship[];
  basketLogicRules: BasketLogicRule[];
  olRequirements: OLRequirement[];  
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

// Basket Relationship Builder Component (moved to top to avoid hoisting issues)
const BasketRelationshipBuilder: React.FC<{
  baskets: SubjectBasket[];
  relationships: BasketRelationship[];
  onAddRelationship: (basket1: string, basket2: string, relationship: 'AND' | 'OR') => void;
}> = ({ baskets, relationships, onAddRelationship }) => {
  const [selectedBasket1, setSelectedBasket1] = useState('');
  const [selectedBasket2, setSelectedBasket2] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState<'AND' | 'OR'>('AND');

  const handleAddRelationship = () => {
    if (selectedBasket1 && selectedBasket2 && selectedBasket1 !== selectedBasket2) {
      onAddRelationship(selectedBasket1, selectedBasket2, selectedRelationship);
      setSelectedBasket1('');
      setSelectedBasket2('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <select
          value={selectedBasket1}
          onChange={(e) => setSelectedBasket1(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Basket 1</option>
          {baskets.map(basket => (
            <option key={basket.id} value={basket.id}>{basket.name}</option>
          ))}
        </select>

        <select
          value={selectedRelationship}
          onChange={(e) => setSelectedRelationship(e.target.value as 'AND' | 'OR')}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>

        <select
          value={selectedBasket2}
          onChange={(e) => setSelectedBasket2(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Basket 2</option>
          {baskets.map(basket => (
            <option key={basket.id} value={basket.id}>{basket.name}</option>
          ))}
        </select>

        <button
          onClick={handleAddRelationship}
          disabled={!selectedBasket1 || !selectedBasket2 || selectedBasket1 === selectedBasket2}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {relationships.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Defined Relationships:</h5>
          {relationships.map((rel, index) => {
            const basket1 = baskets.find(b => b.id === rel.basket1);
            const basket2 = baskets.find(b => b.id === rel.basket2);
            return (
              <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                <strong>{basket1?.name}</strong> {rel.relationship} <strong>{basket2?.name}</strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AddCourse: React.FC<AddCourseProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [olCoreSubjects, setOlCoreSubjects] = useState<Subject[]>([]);

  // Form data
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    courseCode: '',
    courseUrl: '',
    specialisation: '',
    universityId: 0,
    facultyId: 0,
    departmentId: 0,
    majorFieldIds: [],
    subFieldIds: [],
    studyMode: 'fulltime',
    courseType: 'internal',
    frameworkType: 'SLQF',
    frameworkLevel: 4,
    allowedStreams: [],
    subjectBaskets: [],
    basketLogicRules: [],
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
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [majorFields, setMajorFields] = useState<MajorField[]>([]);
  const [subFields, setSubFields] = useState<SubField[]>([]);
  const [filteredSubFields, setFilteredSubFields] = useState<SubField[]>([]);

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

  // Fetch OL core subjects
  useEffect(() => {
  const fetchOLCoreSubjects = async () => {
    try {
      setApiLoading(true);
      
      // API endpoint
      const response = await fetch(`${API_BASE_URL}/subjects/ol-core`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setOlCoreSubjects(result.data);
        
        // Initialize O/L requirements for core subjects
        const initialOLRequirements: OLRequirement[] = result.data.map((subject: Subject) => ({
          subjectId: subject.id,
          required: false,
          minimumGrade: 'S' as const
        }));
        
        setFormData(prev => ({
          ...prev,
          olRequirements: initialOLRequirements
        }));
      } else {
        console.error('Failed to fetch O/L core subjects:', result.error);
        // Fallback to empty array if API fails
        setOlCoreSubjects([]);
      }
      
    } catch (error) {
      console.error('Error fetching O/L core subjects:', error);
      // Fallback to empty array on error
      setOlCoreSubjects([]);
    } finally {
      setApiLoading(false);
    }
  };

  if (isOpen) {
    fetchOLCoreSubjects();
  }
}, [isOpen]);

  // Filter subfields when major fields change
  useEffect(() => {
    if (formData.majorFieldIds.length > 0) {
      const filtered = subFields.filter(subField =>
        formData.majorFieldIds.includes(subField.majorId)
      );
      setFilteredSubFields(filtered);

      // Remove selected subfields that are no longer valid
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
          setFrameworks(frameworksResult.data);
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

      // Fetch AL subjects
      const subjectsResponse = await fetch(`${API_BASE_URL}/admin/subjects?level=AL`);
      if (subjectsResponse.ok) {
        const subjectsResult = await subjectsResponse.json();
        if (subjectsResult.success) {
          setSubjects(subjectsResult.data);
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
        if (!formData.facultyId) newErrors.facultyId = 'Faculty is required';
        if (!formData.departmentId) newErrors.departmentId = 'Department is required';
        if (!formData.frameworkType) newErrors.frameworkType = 'Framework type is required';
        if (!formData.frameworkLevel) newErrors.frameworkLevel = 'Framework level is required';
        if (formData.majorFieldIds.length === 0) newErrors.majorFieldIds = 'At least one major field is required';
        if (!formData.studyMode) newErrors.studyMode = 'Study mode is required';
        if (!formData.courseType) newErrors.courseType = 'Course type is required';
        break;

      case 2:
        if (formData.allowedStreams.length === 0) {
          newErrors.allowedStreams = 'At least one stream must be selected';
        }
        if (formData.subjectBaskets.length === 0) {
          newErrors.subjectBaskets = 'At least one subject basket must be created';
        }
        
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

        // Validate basket logic rules
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
        id: `field_${Date.now()}`,
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

  const removeDynamicField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter(field => field.id !== fieldId)
    }));
  };

  const addCourseMaterial = (material: CourseMaterial) => {
    const materialWithId = {
      ...material,
      id: `material_${Date.now()}`
    };

    setFormData(prev => ({
      ...prev,
      courseMaterials: [...prev.courseMaterials, materialWithId]
    }));
  };

  const removeCourseMaterial = (materialId: string) => {
    setFormData(prev => ({
      ...prev,
      courseMaterials: prev.courseMaterials.filter(material => material.id !== materialId)
    }));
  };

  const addCareerPathway = (pathway: CareerPathway) => {
    const pathwayWithId = {
      ...pathway,
      id: `pathway_${Date.now()}`
    };

    setFormData(prev => ({
      ...prev,
      careerPathways: [...prev.careerPathways, pathwayWithId]
    }));
  };

  const removeCareerPathway = (pathwayId: string) => {
    setFormData(prev => ({
      ...prev,
      careerPathways: prev.careerPathways.filter(pathway => pathway.id !== pathwayId)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setLoading(true);

      // Transform data for API submission
      const courseData = {
        // Basic details
        name: formData.name,
        courseCode: formData.courseCode,
        courseUrl: formData.courseUrl,
        specialisation: formData.specialisation ? [formData.specialisation] : [],
        universityId: formData.universityId,
        facultyId: formData.facultyId,
        departmentId: formData.departmentId,
        majorFieldIds: formData.majorFieldIds,
        subFieldIds: formData.subFieldIds,
        studyMode: formData.studyMode,
        courseType: formData.courseType,
        frameworkType: formData.frameworkType,
        frameworkLevel: formData.frameworkLevel,
        medium: formData.medium,

        // Enhanced Requirements
        requirements: {
          minRequirement: 'ALPass',
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

        // Other details
        zscore: formData.zscore ? JSON.parse(formData.zscore) : null,
        additionalDetails: {
          intakeCount: formData.intakeCount,
          syllabus: formData.syllabus,
          dynamicFields: formData.dynamicFields
        },

        // Materials and pathways
        courseMaterials: formData.courseMaterials,
        careerPathways: formData.careerPathways
      };

      await onSubmit(courseData);

      // Reset form to initial state
      setFormData({
        name: '',
        courseCode: '',
        courseUrl: '',
        specialisation: '',
        universityId: 0,
        facultyId: 0,
        departmentId: 0,
        majorFieldIds: [],
        subFieldIds: [],
        studyMode: 'fulltime',
        courseType: 'internal',
        frameworkType: 'SLQF',
        frameworkLevel: 4,
        allowedStreams: [],
        subjectBaskets: [],
        basketRelationships: [],
        basketLogicRules: [],
        olRequirements: olCoreSubjects.map(subject => ({
          subjectId: subject.id,
          required: false,
          minimumGrade: 'S' as const
        })),
        customRules: '',
        zscore: '',
        medium: [],
        intakeCount: '',
        syllabus: '',
        dynamicFields: [],
        courseMaterials: [],
        careerPathways: []
      });

      setCurrentStep(1);
      onClose();

    } catch (error) {
      console.error('Error submitting course:', error);
    } finally {
      setLoading(false);
    }
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {currentStep === 1 && (
            <Step1BasicDetails
              formData={formData}
              setFormData={setFormData}
              universities={universities}
              faculties={faculties}
              departments={departments}
              frameworks={frameworks}
              majorFields={majorFields}
              filteredSubFields={filteredSubFields}
              onMajorFieldToggle={handleMajorFieldToggle}
              onSubFieldToggle={handleSubFieldToggle}
              errors={errors}
              apiLoading={apiLoading}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{loading ? 'Creating...' : 'Create Course'}</span>
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
  frameworks: Framework[];
  errors: { [key: string]: string };
  apiLoading: boolean;
}> = ({ formData, setFormData, universities, faculties, departments, frameworks,
  majorFields, filteredSubFields, onMajorFieldToggle, onSubFieldToggle, errors, apiLoading }) => {

    const frameworkLevels = frameworks
      .filter(f => f.type === formData.frameworkType)
      .map(f => f.level)
      .filter((level, index, arr) => arr.indexOf(level) === index)
      .sort((a, b) => a - b);

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

          {/* Course Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
              Faculty *
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
              Department *
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
                frameworkLevel: 4
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SLQF">SLQF</option>
              <option value="NVQ">NVQ</option>
            </select>
            {errors.frameworkType && <p className="mt-1 text-sm text-red-600">{errors.frameworkType}</p>}
          </div>

          {/* Framework Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Framework Level *
            </label>
            <select
              value={formData.frameworkLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, frameworkLevel: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frameworkLevels.length > 0 ? (
                frameworkLevels.map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))
              ) : (
                <option value={4}>Level 4</option>
              )}
            </select>
            {errors.frameworkLevel && <p className="mt-1 text-sm text-red-600">{errors.frameworkLevel}</p>}
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

// Step 2: Requirements Component

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
  errors
}) => {
    const [showCustomRules, setShowCustomRules] = useState(false);
    const [basketLogicBuilder, setBasketLogicBuilder] = useState({
      selectedBaskets: [] as string[],
      logic: 'AND' as 'AND' | 'OR'
    });
    const [newGradeReq, setNewGradeReq] = useState({
      grade: 'S' as 'A' | 'B' | 'C' | 'S' | 'F',
      count: 1
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
    const addSubjectSpecificGrade = (subjectId: number, grade: 'A' | 'B' | 'C' | 'S' | 'F') => {
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

    // Basket Logic Handlers
    const handleBasketSelectionToggle = (basketId: string) => {
      setBasketLogicBuilder(prev => ({
        ...prev,
        selectedBaskets: prev.selectedBaskets.includes(basketId)
          ? prev.selectedBaskets.filter(id => id !== basketId)
          : [...prev.selectedBaskets, basketId]
      }));
    };

    const addBasketLogicRule = () => {
      if (basketLogicBuilder.selectedBaskets.length >= 2) {
        const newRule = {
          id: `rule_${Date.now()}`,
          selectedBaskets: [...basketLogicBuilder.selectedBaskets],
          logic: basketLogicBuilder.logic
        };

        setFormData(prev => ({
          ...prev,
          basketLogicRules: [...(prev.basketLogicRules || []), newRule]
        }));

        setBasketLogicBuilder({ selectedBaskets: [], logic: 'AND' });
      }
    };

    const removeBasketLogicRule = (ruleId: string) => {
      setFormData(prev => ({
        ...prev,
        basketLogicRules: (prev.basketLogicRules || []).filter(rule => rule.id !== ruleId)
      }));
    };

    // O/L Requirements Handler
    const handleOLRequirementChange = (subjectId: number, field: 'required' | 'minimumGrade', value: any) => {
      setFormData(prev => ({
        ...prev,
        olRequirements: (prev.olRequirements || []).map((req: OLRequirement)=>
          req.subjectId === subjectId
            ? { ...req, [field]: value }
            : req
        )
      }));
    };

    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Entry Requirements & Streams</h3>
        </div>

        {/* Allowed Streams */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Allowed Streams *
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

        {/* Subject Baskets */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Subject Baskets</h4>

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
                  <option value="F">F</option>
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
                Select Subjects *
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subjects.map(subject => (
                    <label key={subject.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer text-sm rounded">
                      <input
                        type="checkbox"
                        checked={newBasket.subjects.includes(subject.id)}
                        onChange={() => handleSubjectToggle(subject.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-xs">{subject.code} - {subject.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {newBasket.subjects.length} subjects
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
                          <option value="F">At least F</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Internal Logic */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Logic
              </label>
              <select
                value={newBasket.logic}
                onChange={(e) => setNewBasket(prev => ({ ...prev, logic: e.target.value as 'AND' | 'OR' }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AND">AND (All conditions must be met)</option>
                <option value="OR">OR (Any condition can be met)</option>
              </select>
            </div>

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
                        const subject = subjects.find(s => s.id === subjectId);
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

          {errors.subjectBaskets && <p className="mt-1 text-sm text-red-600">{errors.subjectBaskets}</p>}
        </div>

        {/* Enhanced Basket Logic Rules */}
        {formData.subjectBaskets.length > 1 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basket Logic Rules</h4>

            {/* Add New Logic Rule */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h5 className="font-medium text-gray-900 mb-3">Create Logic Rule</h5>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Baskets for Rule (Choose 2 or more)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.subjectBaskets.map(basket => (
                      <label key={basket.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={basketLogicBuilder.selectedBaskets.includes(basket.id)}
                          onChange={() => handleBasketSelectionToggle(basket.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{basket.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logic Type
                  </label>
                  <select
                    value={basketLogicBuilder.logic}
                    onChange={(e) => setBasketLogicBuilder(prev => ({ ...prev, logic: e.target.value as 'AND' | 'OR' }))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AND">AND (All selected baskets must be satisfied)</option>
                    <option value="OR">OR (Any of the selected baskets can be satisfied)</option>
                  </select>
                </div>

                <button
                  onClick={addBasketLogicRule}
                  disabled={basketLogicBuilder.selectedBaskets.length < 2}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Logic Rule
                </button>
              </div>
            </div>

            {/* Existing Logic Rules */}
            {(formData.basketLogicRules || []).length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Defined Logic Rules</h5>
                {(formData.basketLogicRules || []).map(rule => (
                  <div key={rule.id} className="bg-yellow-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <strong>{rule.logic}</strong>: {rule.selectedBaskets.map(basketId => {
                        const basket = formData.subjectBaskets.find(b => b.id === basketId);
                        return basket?.name;
                      }).join(` ${rule.logic} `)}
                    </div>
                    <button
                      onClick={() => removeBasketLogicRule(rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* O/L Requirements Section */}
        {olCoreSubjects && olCoreSubjects.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">O/L Result Requirements</h4>

            <div className="space-y-4">
              {olCoreSubjects.map(subject => {
                const requirement = (formData.olRequirements || []).find(req => req.subjectId === subject.id);

                return (
                  <div key={subject.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={requirement?.required || false}
                        onChange={(e) => handleOLRequirementChange(subject.id, 'required', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                    </label>

                    {requirement?.required && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Minimum Grade:</span>
                        <select
                          value={requirement.minimumGrade}
                          onChange={(e) => handleOLRequirementChange(subject.id, 'minimumGrade', e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="S">S</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Existing Basket Relationships (Keep for backward compatibility) */}
        {formData.subjectBaskets.length > 1 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Legacy Basket Relationships</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <BasketRelationshipBuilder
                baskets={formData.subjectBaskets}
                relationships={formData.basketRelationships}
                onAddRelationship={onAddRelationship}
              />
            </div>
          </div>
        )}

        {/* Custom Rules */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Custom Rules</h4>
            <button
              onClick={() => setShowCustomRules(!showCustomRules)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {showCustomRules ? 'Hide' : 'Add Custom Rules'}
            </button>
          </div>

          {showCustomRules && (
            <textarea
              value={formData.customRules}
              onChange={(e) => setFormData(prev => ({ ...prev, customRules: e.target.value }))}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter any additional custom logic for entry requirements..."
            />
          )}
        </div>
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
  onRemoveDynamicField: (fieldId: string) => void;
  onAddCourseMaterial: (material: CourseMaterial) => void;
  onRemoveCourseMaterial: (materialId: string) => void;
  onAddCareerPathway: (pathway: CareerPathway) => void;
  onRemoveCareerPathway: (pathwayId: string) => void;
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
  errors
}) => {
    const [newMaterial, setNewMaterial] = useState<CourseMaterial>({
      materialType: 'syllabus',
      fileName: '',
      filePath: '',
      fileType: '',
      fileSize: 0
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
          fileSize: 0
        });
      }
    };

    const handleAddPathway = () => {
      if (newPathway.jobTitle) {
        onAddCareerPathway(newPathway);
        setNewPathway({
          jobTitle: '',
          industry: '',
          description: '',
          salaryRange: ''
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

          {/* Syllabus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Syllabus Information
            </label>
            <input
              type="text"
              value={formData.syllabus}
              onChange={(e) => setFormData(prev => ({ ...prev, syllabus: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Syllabus details or reference"
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
                type="text"
                value={newMaterial.fileName}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, fileName: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="File name"
              />
              <input
                type="text"
                value={newMaterial.filePath}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, filePath: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="File path or URL"
              />
              <input
                type="text"
                value={newMaterial.fileType}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, fileType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="File type (e.g., PDF)"
              />
            </div>
            <button
              onClick={handleAddMaterial}
              disabled={!newMaterial.fileName || !newMaterial.filePath}
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

        {/* Career Pathways */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Pathways
          </label>

          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Add Career Pathway</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newPathway.jobTitle}
                onChange={(e) => setNewPathway(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Job title"
              />
              <input
                type="text"
                value={newPathway.industry}
                onChange={(e) => setNewPathway(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Industry"
              />
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
              onClick={handleAddPathway}
              disabled={!newPathway.jobTitle}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Briefcase className="h-4 w-4" />
              <span>Add Career Pathway</span>
            </button>
          </div>

          {formData.careerPathways.length > 0 && (
            <div className="space-y-3">
              {formData.careerPathways.map(pathway => (
                <div key={pathway.id} className="flex items-start justify-between p-3 bg-white border rounded">
                  <div className="text-sm flex-1">
                    <div className="font-medium text-gray-900">{pathway.jobTitle}</div>
                    {pathway.industry && (
                      <div className="text-gray-600">Industry: {pathway.industry}</div>
                    )}
                    {pathway.description && (
                      <div className="text-gray-600 mt-1">{pathway.description}</div>
                    )}
                    {pathway.salaryRange && (
                      <div className="text-green-600 font-medium mt-1">Salary: {pathway.salaryRange}</div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveCareerPathway(pathway.id!)}
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Globe, 
  GraduationCap, 
  FileText, 
  CheckCircle, 
  Bookmark, 
  ExternalLink,
  Download,
  Users,
  Award,
  Calendar,
  DollarSign,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import authService from '../services/authService';

interface CourseDetailPageProps {
  onGoBack?: () => void;
}

interface Course {
  id: number;
  name: string;
  courseCode?: string;
  courseUrl?: string;
  description?: string;
  durationMonths?: number;
  studyMode: 'fulltime' | 'parttime';
  courseType: 'internal' | 'external';
  feeType: 'free' | 'paid';
  feeAmount?: number;
  medium: string[];
  specialisation: string[];
  zscore?: any;
  additionalDetails?: {
    intakeCount?: number;
    syllabus?: string;
    dynamicFields: Array<{
      id: string;
      fieldName: string;
      fieldValue: string;
    }>;
    courseMaterials: Array<{
      id: number;
      materialType: string;
      fileName: string;
      filePath: string;
      fileType?: string;
      fileSize?: number;
    }>;
    careerPathways: Array<{
      id?: number;
      jobTitle: string;
      industry?: string;
      description?: string;
      salaryRange?: string;
    }>;
  };
  
  // Relations
  university: {
    id: number;
    name: string;
    type: 'government' | 'private' | 'semi-government';
    website?: string;
    address?: string;
    recognitionCriteria?: string[];
    imageUrl?: string;
    logoUrl?: string;
  };
  faculty: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  framework?: {
    id: number;
    type: 'SLQF' | 'NVQ';
    level: number;
    qualificationCategory: string;
  };
  materials?: CourseMaterial[];
  requirements?: CourseRequirement;
}

interface CourseMaterial {
  id: number;
  materialType: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
}

interface CourseRequirement {
  id: number;
  minRequirement: string;
  stream: number[];
  ruleSubjectBasket?: any;
  ruleSubjectGrades?: any;
  ruleOLGrades?: any;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ onGoBack }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'requirements']));

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    if (id) {
      fetchCourseDetails(parseInt(id));
    }
  }, [id]);

  // Check bookmark status when course loads
  useEffect(() => {
    if (course?.id) {
      checkBookmarkStatus();
    }
  }, [course?.id]);

  const checkBookmarkStatus = async () => {
    try {
      const userId = authService.getUserId();
      if (!userId) return;

      const response = await fetch(`/api/saved-courses/check/${userId}/${course?.id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsBookmarked(data.isBookmarked);
        }
      }
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    }
  };

  const fetchCourseDetails = async (courseId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCourse(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch course details');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleDownload = async (material: CourseMaterial) => {
    try {
      console.log('Downloading material:', material);
      
      // Use our backend download route which handles authentication
      const downloadUrl = `/api/upload/download/${material.id}`;
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = material.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback: Try to open the original URL in a new tab
      try {
        console.log('Trying fallback download...');
        window.open(material.filePath, '_blank');
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        alert('Download failed. Please try again or contact support.');
      }
    }
  };

  const handleBookmark = async () => {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        alert('Please log in to bookmark courses');
        return;
      }

      const response = await fetch('/api/saved-courses/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          courseId: course?.id,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsBookmarked(data.action === 'added');
          if (data.action === 'added') {
            alert('Course bookmarked successfully!');
          } else {
            alert('Course removed from bookmarks');
          }
        }
      } else {
        throw new Error('Failed to toggle bookmark');
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
      alert('Failed to bookmark course. Please try again.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="w-4 h-4" />;
    
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (fileType.includes('image')) return <FileText className="w-4 h-4 text-green-500" />;
    
    return <FileText className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested course could not be found.'}</p>
          <button
            onClick={() => navigate('/course-flow')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/course-flow')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Search
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBookmark}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              
              {course.courseUrl && (
                <a
                  href={course.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Course Page
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
                  <p className="text-xl text-gray-600">{course.university.name}</p>
                  <p className="text-gray-500">
                    {course.faculty.name}
                    {course.department && ` • ${course.department.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Course Code</p>
                  <p className="font-semibold">{course.courseCode || 'N/A'}</p>
                </div>
              </div>

              {/* Course Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {course.studyMode === 'fulltime' ? 'Full Time' : 'Part Time'}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {course.courseType === 'internal' ? 'Internal' : 'External'}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {course.feeType === 'free' ? 'Free' : 'Paid'}
                </span>
                {course.framework && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {course.framework.type} Level {course.framework.level}
                  </span>
                )}
              </div>

              {/* Key Information - Admin Style Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">University</div>
                  <div className="text-sm text-gray-900">{course.university.name}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Faculty / Department</div>
                  <div className="text-sm text-gray-900">
                    {course.faculty.name}
                    {course.department && ` / ${course.department.name}`}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Framework</div>
                  <div className="text-sm text-gray-900">
                    {course.framework ? `${course.framework.type} Level ${course.framework.level}` : '—'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Type / Mode</div>
                  <div className="text-sm text-gray-900">{course.courseType} / {course.studyMode}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Fee</div>
                  <div className="text-sm text-gray-900">
                    {course.feeType === 'paid' ? (course.feeAmount ? `LKR ${course.feeAmount.toLocaleString()}` : 'Contact for fees') : 'Free'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Duration</div>
                  <div className="text-sm text-gray-900">
                    {course.durationMonths ? `${Math.floor(course.durationMonths / 12)} year${Math.floor(course.durationMonths / 12) !== 1 ? 's' : ''}` : '—'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3 md:col-span-2">
                  <div className="text-xs uppercase text-gray-500">Medium</div>
                  <div className="text-sm text-gray-900">
                    {course.medium && course.medium.length ? course.medium.join(', ') : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {course.description || 'No description available for this course.'}
              </p>
            </div>

            {/* Specializations */}
            {course.specialisation && course.specialisation.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {course.specialisation.map((spec, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Requirements */}
            {course.requirements && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => toggleSection('requirements')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Entry Requirements</h2>
                  {expandedSections.has('requirements') ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.has('requirements') && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Minimum Requirement</h3>
                      <p className="text-gray-700">{course.requirements.minRequirement}</p>
                    </div>
                    
                    {course.requirements.stream && course.requirements.stream.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Required Streams</h3>
                        <div className="flex flex-wrap gap-2">
                          {course.requirements.stream.map((streamId, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              Stream {streamId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Additional Details */}
            {course.additionalDetails && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => toggleSection('additional')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>
                  {expandedSections.has('additional') ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.has('additional') && (
                  <div className="mt-4 space-y-4">
                    {/* Intake Count */}
                    {course.additionalDetails.intakeCount && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Intake Count</h3>
                        <p className="text-gray-700">{course.additionalDetails.intakeCount} students</p>
                      </div>
                    )}
                    
                    {/* Syllabus */}
                    {course.additionalDetails.syllabus && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Syllabus</h3>
                        <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {course.additionalDetails.syllabus}
                        </div>
                      </div>
                    )}
                    
                    {/* Dynamic Fields */}
                    {course.additionalDetails.dynamicFields && course.additionalDetails.dynamicFields.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
                        <div className="space-y-2">
                          {course.additionalDetails.dynamicFields.map((field) => (
                            <div key={field.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <span className="text-sm text-gray-700">{field.fieldName}</span>
                              <span className="text-sm font-medium text-gray-900">{field.fieldValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Career Pathways */}
            {course.additionalDetails?.careerPathways && course.additionalDetails.careerPathways.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => toggleSection('careers')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Career Pathways</h2>
                  {expandedSections.has('careers') ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.has('careers') && (
                  <div className="mt-4 space-y-4">
                    {course.additionalDetails.careerPathways.map((career, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">{career.jobTitle}</h3>
                        {career.industry && (
                          <p className="text-sm text-gray-600 mb-2">Industry: {career.industry}</p>
                        )}
                        {career.description && (
                          <p className="text-sm text-gray-700 mb-2">{career.description}</p>
                        )}
                        {career.salaryRange && (
                          <p className="text-sm font-medium text-green-600">Salary: {career.salaryRange}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Course Materials */}
            {course.materials && course.materials.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => toggleSection('materials')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Course Materials</h2>
                  {expandedSections.has('materials') ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.has('materials') && (
                  <div className="mt-4 space-y-3">
                    {course.materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          {getFileIcon(material.fileType)}
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{material.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {material.materialType} • {formatFileSize(material.fileSize)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* University Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">University Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="font-medium">{course.university.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{course.university.type}</p>
                </div>
                {course.university.website && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a 
                      href={course.university.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleBookmark}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'}
                </button>
                
                {course.courseUrl && (
                  <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </a>
                )}
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{course.durationMonths ? `${course.durationMonths} months` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Study Mode</span>
                  <span className="font-medium capitalize">{course.studyMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Course Type</span>
                  <span className="font-medium capitalize">{course.courseType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee Type</span>
                  <span className="font-medium capitalize">{course.feeType}</span>
                </div>
                {course.feeAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fee Amount</span>
                    <span className="font-medium">LKR {course.feeAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;

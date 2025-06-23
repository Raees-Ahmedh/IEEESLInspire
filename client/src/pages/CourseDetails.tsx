import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Globe, GraduationCap, FileText, CheckCircle, Bookmark, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import Header from '../components/Header';

interface CourseDetailsProps {
  onGoBack?: () => void;
  courseId?: string;
}

interface Course {
  id: string;
  title: string;
  university: string;
  degree: string;
  duration: string;
  language: string;
  location: string;
  level: string;
  field: string;
  entryRequirement: string;
  websiteUrl: string;
  summary: string;
  eligibilityCriteria: string[];
  additionalInfo: string;
  isBookmarked?: boolean;
}

interface SimilarCourse {
  id: string;
  title: string;
  university: string;
  duration: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ onGoBack, courseId }) => {
  const dispatch = useAppDispatch();
  //const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  // Mock course data - in real app, this would be fetched based on courseId
  // You can add logic here to fetch different courses based on courseId
  const getCourseById = (id?: string) => {
    // Mock data - replace with actual API call
    const courses = {
      '1': {
        id: '1',
        title: 'Physical Education',
        university: 'Sabaragamuwa University of Sri Lanka',
        degree: 'BSc(Hons) (Physical Ed)',
        duration: '4 years',
        language: 'English',
        location: 'Rathnapura',
        level: 'SQLF Level 6',
        field: 'Sport Science',
        entryRequirement: 'Entry Exam Aptitude Exam',
        websiteUrl: 'https://sab.ac.lk',
        summary: `The Practical Test will be conducted by the Sabaragamuwa University of Sri Lanka, the University of Jaffna, the University of Sri Jayewardenepura and the University of Kelaniya collaboratively.

These universities will publish press notices in their official university websites calling for applications to face this practical test and candidates may contact the Registrars of the relevant universities for further particulars.

Please note that if a candidate wishes to apply for the courses of study in 'Physical Education' and 'Sports Science & Management', it is sufficient to apply and appear in the practical test conducted in one of the above universities.`,
        eligibilityCriteria: [
          "At least 'S' grades in any three subjects at the G.C.E (Advanced Level) Examination.",
          "In addition, candidates should have passed the Practical Test conducted in common to the courses of study in 'Physical Education' and 'Sports Science & Management'."
        ],
        additionalInfo: "Candidates must demonstrate physical fitness and sports aptitude during the practical examination.",
        isBookmarked: false
      },
      '2': {
        id: '2',
        title: 'Computer Science',
        university: 'University of Colombo',
        degree: 'BSc(Hons) Computer Science',
        duration: '4 years',
        language: 'English',
        location: 'Colombo',
        level: 'SQLF Level 6',
        field: 'Information Technology',
        entryRequirement: 'Mathematics and Physics required',
        websiteUrl: 'https://cmb.ac.lk',
        summary: `The Computer Science degree program at the University of Colombo is designed to provide students with a comprehensive understanding of computer science fundamentals and cutting-edge technologies.

Students will learn programming, algorithms, data structures, software engineering, database systems, computer networks, and artificial intelligence. The program emphasizes both theoretical knowledge and practical skills.

The curriculum is regularly updated to reflect the latest developments in the field and includes opportunities for internships and industry collaboration.`,
        eligibilityCriteria: [
          "At least three 'S' passes at the G.C.E (Advanced Level) Examination including Mathematics.",
          "Physics is highly recommended but not mandatory.",
          "Satisfactory performance in the university entrance examination."
        ],
        additionalInfo: "Students will have access to state-of-the-art computer labs and research facilities.",
        isBookmarked: false
      },
      // Add more courses as needed
    };
    
    return courses[id as keyof typeof courses] || courses['1']; // Default to course 1 if not found
  };

  const [course] = useState<Course>(getCourseById(courseId));
  const [isBookmarked, setIsBookmarked] = useState(course.isBookmarked || false);
  
  const [similarCourses] = useState<SimilarCourse[]>([
    {
      id: '2',
      title: 'Sports Science & Management',
      university: 'University of Sri Jayewardenepura',
      duration: '4 years'
    },
    {
      id: '3', 
      title: 'Exercise Science',
      university: 'University of Kelaniya',
      duration: '3 years'
    },
    {
      id: '4',
      title: 'Health Sciences',
      university: 'University of Peradeniya',
      duration: '4 years'
    }
  ]);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would dispatch an action to save/remove bookmark
    console.log(`Bookmark ${isBookmarked ? 'removed' : 'added'} for course: ${course.id}`);
  };

  const handleVisitWebsite = () => {
    window.open(course.websiteUrl, '_blank');
  };

  const handleSimilarCourseClick = (similarCourseId: string) => {
    // This would navigate to the details of the similar course
    console.log(`Navigate to course details: ${similarCourseId}`);
    // In a real app, you might call onCourseClick or update the current courseId
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onGoBack} />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Go Back Button */}
        <button 
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Results
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}, {course.degree}
              </h1>
              <p className="text-lg text-gray-600">
                Offered by {course.university}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBookmark}
                className={`p-3 rounded-lg transition-all ${
                  isBookmarked 
                    ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                    : 'text-gray-400 bg-gray-50 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleVisitWebsite}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                title="Visit university website"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Visit Website</span>
              </button>
            </div>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{course.duration}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-medium text-gray-900">{course.language}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{course.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="font-medium text-gray-900">{course.level}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Field</p>
                <p className="font-medium text-gray-900">{course.field}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Entry Requirement</p>
                <p className="font-medium text-gray-900">{course.entryRequirement}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary</h2>
          <div className="prose max-w-none">
            {course.summary.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Eligibility Criteria Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Eligibility Criteria</h2>
          <div className="space-y-4">
            <ul className="space-y-3">
              {course.eligibilityCriteria.map((criteria, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">{criteria}</p>
                </li>
              ))}
            </ul>
            {course.additionalInfo && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Additional Information:</strong> {course.additionalInfo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Courses Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Courses</h2>
          <div className="space-y-4">
            {similarCourses.map((similarCourse) => (
              <div 
                key={similarCourse.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSimilarCourseClick(similarCourse.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {similarCourse.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Offered by {similarCourse.university}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{similarCourse.duration}</span>
                    </div>
                  </div>
                  <button 
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimilarCourseClick(similarCourse.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            2025 - All rights are reserved for PathFinder.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CourseDetails;
import React, { useState } from 'react';
import FindYourDegree from './FindYourDegree';
import CourseResults from './CourseResults';
import CourseDetails from './CourseDetails';

interface QualificationData {
  maxQualification: 'AL' | 'OL';
  alResults?: Array<{ subject: string; grade: string }>;
  olResults?: Array<{ subject: string; grade: string }>;
  zScore?: number | null;
  examDistrict?: string | null;
}

type PageType = 'qualifications' | 'results' | 'details';

interface CourseFlowManagerProps {
  onLogoClick?: () => void;
}

const CourseFlowManager: React.FC<CourseFlowManagerProps> = ({ onLogoClick }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('qualifications');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [userQualifications, setUserQualifications] = useState<QualificationData | null>(null);

  const handleShowOptions = (qualificationData: QualificationData) => {
    setUserQualifications(qualificationData);
    setCurrentPage('results');
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentPage('details');
  };

  const handleGoBack = () => {
    if (currentPage === 'details') {
      setCurrentPage('results');
      setSelectedCourseId(null);
    } else if (currentPage === 'results') {
      setCurrentPage('qualifications');
      setUserQualifications(null);
    } else {
      // If we're at qualifications page and there's an onLogoClick handler
      if (onLogoClick) {
        onLogoClick();
      }
    }
  };

  const handleLogoClick = () => {
    setCurrentPage('qualifications');
    setSelectedCourseId(null);
    setUserQualifications(null);
    if (onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <div>
      {currentPage === 'qualifications' && (
        <FindYourDegree 
          onGoBack={handleGoBack}
          onShowOptions={handleShowOptions}
        />
      )}
      {currentPage === 'results' && (
        <CourseResults 
          onGoBack={handleGoBack}
          onCourseClick={handleCourseClick}
          userQualifications={userQualifications}
        />
      )}
      {currentPage === 'details' && (
        <CourseDetails 
          onGoBack={handleGoBack}
          courseId={selectedCourseId || undefined}
        />
      )}
    </div>
  );
};

export default CourseFlowManager;
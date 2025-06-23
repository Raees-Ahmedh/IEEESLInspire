import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  addALResult, 
  setOLResults,
  setZScore,
  setExamDistrict
} from '../store/slices/userSlice';
import Header from '../components/Header';

interface QualificationEntry {
  id: string;
  subject: string;
  grade: string;
}

interface PredefinedOLSubject {
  subject: string;
  grade: string;
}

interface FindYourDegreeProps {
  onGoBack?: () => void;
  onShowOptions?: (qualificationData: any) => void; // New prop for navigation
}

type MaxQualification = 'AL' | 'OL' | '';

const FindYourDegree: React.FC<FindYourDegreeProps> = ({ onGoBack, onShowOptions }) => {
  const dispatch = useAppDispatch();
  const { qualifications } = useAppSelector((state) => state.user);
  
  // Maximum qualification selection
  const [maxQualification, setMaxQualification] = useState<MaxQualification>('');
  
  const [alResults, setAlResults] = useState<QualificationEntry[]>([
    { id: '1', subject: '', grade: '' },
    { id: '2', subject: '', grade: '' },
    { id: '3', subject: '', grade: '' }
  ]);
  const [olResults, setOlResults] = useState<QualificationEntry[]>([
    { id: '1', subject: '', grade: '' },
    { id: '2', subject: '', grade: '' },
    { id: '3', subject: '', grade: '' },
    { id: '4', subject: '', grade: '' },
    { id: '5', subject: '', grade: '' },
    { id: '6', subject: '', grade: '' },
    { id: '7', subject: '', grade: '' },
    { id: '8', subject: '', grade: '' },
    { id: '9', subject: '', grade: '' }
  ]);
  // For predefined O/L subjects when A/L is selected
  const [predefinedOLResults, setPredefinedOLResults] = useState<PredefinedOLSubject[]>([
    { subject: 'English', grade: '' },
    { subject: 'Mathematics', grade: '' },
    { subject: 'Science', grade: '' },
    { subject: 'First Language', grade: '' }
  ]);
  const [zScore, setZScore] = useState<string>('');
  const [examDistrict, setExamDistrict] = useState<string>('');

  const alSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Combined Mathematics',
    'Economics', 'Business Studies', 'Accounting', 'Geography', 'History',
    'Political Science', 'Logic & Scientific Method', 'Buddhist Civilization',
    'Hindu Civilization', 'Islamic Civilization', 'Christian Civilization',
    'Greek & Roman Civilization', 'Art', 'Dancing (Indigenous)', 'Dancing (Bharata)',
    'Music (Oriental)', 'Music (Western)', 'Drama & Theatre (Sinhala)',
    'Drama & Theatre (Tamil)', 'Drama & Theatre (English)', 'English',
    'Sinhala', 'Tamil', 'Pali', 'Sanskrit', 'Arabic', 'French', 'German',
    'Hindi', 'Japanese', 'Malay', 'Russian', 'Chinese'
  ];

  const olAllSubjects = [
    'Mathematics', 'Science', 'English', 'Sinhala', 'Tamil', 'History',
    'Geography', 'Civic Education', 'Health & Physical Education',
    'Art', 'Dancing', 'Music', 'Drama', 'Business & Accounting Studies',
    'Design & Mechanical Technology', 'Food & Nutrition', 'Agriculture & Food Technology',
    'Information & Communication Technology', 'Buddhism', 'Hinduism', 'Islam', 'Christianity'
  ];

  const sriLankanDistricts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
    'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
    'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
    'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ];

  const grades = ['A', 'B', 'C', 'S', 'F'];

  const updateQualification = (type: 'al' | 'ol', id: string, field: 'subject' | 'grade', value: string) => {
    if (type === 'al') {
      setAlResults(alResults.map(result => 
        result.id === id ? { ...result, [field]: value } : result
      ));
    } else {
      setOlResults(olResults.map(result => 
        result.id === id ? { ...result, [field]: value } : result
      ));
    }
  };

  const updatePredefinedOLGrade = (subject: string, grade: string) => {
    setPredefinedOLResults(predefinedOLResults.map(result => 
      result.subject === subject ? { ...result, grade } : result
    ));
  };

  const handleMaxQualificationChange = (qualification: MaxQualification) => {
    setMaxQualification(qualification);
    
    // Reset all data when changing qualification type
    setAlResults([
      { id: '1', subject: '', grade: '' },
      { id: '2', subject: '', grade: '' },
      { id: '3', subject: '', grade: '' }
    ]);
    setOlResults([
      { id: '1', subject: '', grade: '' },
      { id: '2', subject: '', grade: '' },
      { id: '3', subject: '', grade: '' },
      { id: '4', subject: '', grade: '' },
      { id: '5', subject: '', grade: '' },
      { id: '6', subject: '', grade: '' },
      { id: '7', subject: '', grade: '' },
      { id: '8', subject: '', grade: '' },
      { id: '9', subject: '', grade: '' }
    ]);
    setPredefinedOLResults([
      { subject: 'English', grade: '' },
      { subject: 'Mathematics', grade: '' },
      { subject: 'Science', grade: '' },
      { subject: 'First Language', grade: '' }
    ]);
    setZScore('');
    setExamDistrict('');
  };

  const handleShowOptions = () => {
    if (!maxQualification) {
      alert('Please select your maximum qualification level first.');
      return;
    }

    if (maxQualification === 'AL') {
      // Validate A/L subjects
      const validALResults = alResults.filter(result => result.subject && result.grade);
      
      if (validALResults.length === 0) {
        alert('Please add at least one A/L subject and grade to continue.');
        return;
      }

      // Get predefined O/L results
      const validOLResults = predefinedOLResults.filter(result => result.grade);

      const qualificationData = {
        maxQualification: 'AL',
        alResults: validALResults,
        olResults: validOLResults,
        zScore: zScore ? parseFloat(zScore) : null,
        examDistrict: examDistrict || null
      };

      // Store in localStorage for persistence
      localStorage.setItem('userQualifications', JSON.stringify(qualificationData));
      
      // Navigate to results page with qualification data
      if (onShowOptions) {
        onShowOptions(qualificationData);
      }

    } else if (maxQualification === 'OL') {
      // Validate O/L subjects
      const validOLResults = olResults.filter(result => result.subject && result.grade);
      
      if (validOLResults.length === 0) {
        alert('Please add at least one O/L subject and grade to continue.');
        return;
      }

      const qualificationData = {
        maxQualification: 'OL',
        olResults: validOLResults
      };

      // Store in localStorage for persistence
      localStorage.setItem('userQualifications', JSON.stringify(qualificationData));
      
      // Navigate to results page with qualification data
      if (onShowOptions) {
        onShowOptions(qualificationData);
      }
    }

    // Try Redux dispatch with error handling
    try {
      if (typeof addALResult === 'function' && maxQualification === 'AL') {
        const validALResults = alResults.filter(result => result.subject && result.grade);
        validALResults.forEach(result => {
          dispatch(addALResult({ subject: result.subject, grade: result.grade }));
        });
      }
    } catch (error) {
      console.error('Redux dispatch error:', error);
    }
  };

  const handleClearAll = () => {
    setMaxQualification('');
    setAlResults([
      { id: '1', subject: '', grade: '' },
      { id: '2', subject: '', grade: '' },
      { id: '3', subject: '', grade: '' }
    ]);
    setOlResults([
      { id: '1', subject: '', grade: '' },
      { id: '2', subject: '', grade: '' },
      { id: '3', subject: '', grade: '' },
      { id: '4', subject: '', grade: '' },
      { id: '5', subject: '', grade: '' },
      { id: '6', subject: '', grade: '' },
      { id: '7', subject: '', grade: '' },
      { id: '8', subject: '', grade: '' },
      { id: '9', subject: '', grade: '' }
    ]);
    setPredefinedOLResults([
      { subject: 'English', grade: '' },
      { subject: 'Mathematics', grade: '' },
      { subject: 'Science', grade: '' },
      { subject: 'First Language', grade: '' }
    ]);
    setZScore('');
    setExamDistrict('');
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onGoBack} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>

        <div className="space-y-8">
          {/* Maximum Qualification Selection - MANDATORY FIRST STEP */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">What is your maximum qualification?</h2>
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                Required
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">
              Please select your highest level of education to show relevant sections
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleMaxQualificationChange('AL')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  maxQualification === 'AL'
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    maxQualification === 'AL'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {maxQualification === 'AL' && (
                      <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">GCE Advanced Level (A/L)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      I have completed or currently studying A/L
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMaxQualificationChange('OL')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  maxQualification === 'OL'
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    maxQualification === 'OL'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {maxQualification === 'OL' && (
                      <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">GCE Ordinary Level (O/L)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      My highest qualification is O/L
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* A/L Sections - Show only if A/L is selected */}
          {maxQualification === 'AL' && (
            <>
              {/* A/L Results Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Add my GCE A/L results</h2>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    Required
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Enter your A/L exam results (up to 3 subjects)
                </p>
                
                <div className="space-y-4">
                  {alResults.map((result, index) => (
                    <div key={result.id} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-gray-700">
                        Subject {index + 1}:
                      </div>
                      <div className="flex-1">
                        <select
                          value={result.subject}
                          onChange={(e) => updateQualification('al', result.id, 'subject', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select Subject</option>
                          {alSubjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-24">
                        <select
                          value={result.grade}
                          onChange={(e) => updateQualification('al', result.id, 'grade', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Grade</option>
                          {grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Z-Score Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Z-Score</h2>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    Optional
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">Enter your Z-Score if available</p>
                
                <div className="max-w-xs">
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="3"
                    value={zScore}
                    onChange={(e) => setZScore(e.target.value)}
                    placeholder="e.g., 1.5432"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    <Info className="w-4 h-4 inline mr-1" />
                    Z-Score typically ranges from 0 to 3
                  </p>
                </div>
              </div>

              {/* Exam District Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Exam District</h2>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    Optional
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">Select the district where you sat for your A/L examination</p>
                
                <div className="max-w-xs">
                  <select
                    value={examDistrict}
                    onChange={(e) => setExamDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select District</option>
                    {sriLankanDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Predefined O/L Results Section for A/L students */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Add my GCE O/L results</h2>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                    Optional
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Enter your O/L exam results for main subjects</p>
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Please add grades for the main O/L subjects below. You can leave grades empty if not applicable.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {predefinedOLResults.map((result, index) => (
                    <div key={result.subject} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                          {result.subject}
                        </div>
                      </div>
                      
                      <div className="w-24">
                        <select
                          value={result.grade}
                          onChange={(e) => updatePredefinedOLGrade(result.subject, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Grade</option>
                          {grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-10"></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* O/L Results Section - Show only if O/L is selected */}
          {maxQualification === 'OL' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add my GCE O/L results</h2>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  Required
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">Enter your O/L exam results (9 subjects)</p>
              
              <div className="space-y-4">
                {olResults.map((result, index) => (
                  <div key={result.id} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      Subject {index + 1}:
                    </div>
                    <div className="flex-1">
                      <select
                        value={result.subject}
                        onChange={(e) => updateQualification('ol', result.id, 'subject', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Subject</option>
                        {olAllSubjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-24">
                      <select
                        value={result.grade}
                        onChange={(e) => updateQualification('ol', result.id, 'grade', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Grade</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Show only if qualification is selected */}
        {maxQualification && (
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
            
            <button
              onClick={handleShowOptions}
              className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Show me my options
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </main>

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

export default FindYourDegree;
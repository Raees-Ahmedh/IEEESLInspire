import React, { useState } from 'react';
import { ArrowLeft, Plus, X, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addALResult, removeALResult, addOtherQualification } from '../store/slices/userSlice';
import Header from './Header';

interface QualificationEntry {
  id: string;
  subject: string;
  grade: string;
}

interface FindYourDegreeProps {
  onGoBack?: () => void;
}

const FindYourDegree: React.FC<FindYourDegreeProps> = ({ onGoBack }) => {
  const dispatch = useAppDispatch();
  const { qualifications } = useAppSelector((state) => state.user);
  
  const [alResults, setAlResults] = useState<QualificationEntry[]>([
    { id: '1', subject: '', grade: '' }
  ]);
  const [olResults, setOlResults] = useState<QualificationEntry[]>([
    { id: '1', subject: '', grade: '' }
  ]);

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

  const olSubjects = [
    'Mathematics', 'Science', 'English', 'Sinhala', 'Tamil', 'History',
    'Geography', 'Civic Education', 'Health & Physical Education',
    'Art', 'Dancing', 'Music', 'Drama', 'Business & Accounting Studies',
    'Design & Mechanical Technology', 'Food & Nutrition', 'Agriculture & Food Technology',
    'Information & Communication Technology', 'Buddhism', 'Hinduism', 'Islam', 'Christianity'
  ];

  const grades = ['A', 'B', 'C', 'S', 'F'];

  const addQualificationField = (type: 'al' | 'ol') => {
    const newId = Date.now().toString();
    const newEntry = { id: newId, subject: '', grade: '' };
    
    if (type === 'al') {
      setAlResults([...alResults, newEntry]);
    } else {
      setOlResults([...olResults, newEntry]);
    }
  };

  const removeQualificationField = (type: 'al' | 'ol', id: string) => {
    if (type === 'al') {
      setAlResults(alResults.filter(result => result.id !== id));
    } else {
      setOlResults(olResults.filter(result => result.id !== id));
    }
  };

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

  const handleShowOptions = () => {
    // Save qualifications to Redux store
    alResults.forEach(result => {
      if (result.subject && result.grade) {
        dispatch(addALResult({ subject: result.subject, grade: result.grade }));
      }
    });
    
    // Navigate to results page or show matching courses
    console.log('Showing degree options based on qualifications');
  };

  const handleClearAll = () => {
    setAlResults([{ id: '1', subject: '', grade: '' }]);
    setOlResults([{ id: '1', subject: '', grade: '' }]);
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use existing Header component */}
      <Header onLogoClick={onGoBack} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {/* Go Back Button */}
        <button 
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>

        {/* Qualification Forms */}
        <div className="space-y-8">
          {/* A/L Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add my GCE A/L results</h2>
              <button
                onClick={() => addQualificationField('al')}
                className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Enter your exam results and Z-score details</p>
            
            <div className="space-y-4">
              {alResults.map((result, index) => (
                <div key={result.id} className="flex items-center space-x-4">
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
                  
                  {alResults.length > 1 && (
                    <button
                      onClick={() => removeQualificationField('al', result.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* O/L Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add my GCE O/L results</h2>
              <button
                onClick={() => addQualificationField('ol')}
                className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Enter your exam results</p>
            
            <div className="space-y-4">
              {olResults.map((result, index) => (
                <div key={result.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <select
                      value={result.subject}
                      onChange={(e) => updateQualification('ol', result.id, 'subject', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      {olSubjects.map(subject => (
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
                  
                  {olResults.length > 1 && (
                    <button
                      onClick={() => removeQualificationField('ol', result.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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

export default FindYourDegree;
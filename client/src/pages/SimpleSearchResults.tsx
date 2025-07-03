// client/src/pages/SimpleSearchResults.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ExternalLink, Clock, DollarSign, MapPin } from 'lucide-react';
import Header from '../components/Header';

interface SimpleSearchResultsProps {
  onGoBack?: () => void;
  userQualifications?: any;
}

interface Course {
  id: number;
  name: string;
  specialisation: string[];
  courseCode: string;
  courseUrl: string;
  durationMonths: number;
  description: string;
  studyMode: string;
  courseType: string;
  feeType: string;
  feeAmount: number;
  university: {
    id: number;
    name: string;
    type: string;
  };
  faculty: {
    id: number;
    name: string;
  };
}

const SimpleSearchResults: React.FC<SimpleSearchResultsProps> = ({ onGoBack, userQualifications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for now - replace with real API call
  useEffect(() => {
    // Load initial courses when component mounts
    handleSearch();
  }, []);

  const handleSearch = async () => {
    console.log('🔍 Simple search query:', searchQuery);
    
    // Allow empty search to show all courses
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:4000/api/simple-search/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery || '',
          userQualifications: userQualifications
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Search response:', data);
      
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to search courses: ${errorMessage}`);
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onGoBack} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Courses
          </h1>
          <p className="text-gray-600">
            Find courses that match your interests and qualifications
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search for courses, universities, fields..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No courses found' : 'Enter a search term to get started'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Search for courses, universities, or fields of study'}
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {course.university.name} • {course.faculty.name}
                    </p>
                    <p className="text-gray-700 mb-4">
                      {course.description}
                    </p>
                    
                    {/* Course Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.floor(course.durationMonths / 12)} year{Math.floor(course.durationMonths / 12) !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {course.feeType === 'free' ? 'Free' : `LKR ${course.feeAmount.toLocaleString()}`}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {course.studyMode === 'fulltime' ? 'Full-time' : 'Part-time'}
                      </div>
                    </div>

                    {/* Specializations */}
                    {course.specialisation.length > 0 && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Specializations: </span>
                        <span className="text-sm text-gray-600">
                          {course.specialisation.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => window.open(course.courseUrl, '_blank')}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium ml-4"
                  >
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SimpleSearchResults;
// client/src/components/Institutes.tsx - Updated to show only 6 universities on landing page
import React, { useEffect, useState } from 'react';
import { MapPin, Users, Calendar, ExternalLink, BookOpen, ArrowRight } from 'lucide-react';

interface University {
  id: number;
  name: string;
  location: string;
  type: 'government' | 'private';
  website?: string;
  imageUrl?: string;
  logoUrl?: string;
  galleryImages?: string[];
  additionalDetails: {
    established?: string;
    students?: string;
    faculties?: number;
  };
}

interface InstitutesProps {
  onViewAllUniversities?: () => void; // Add callback for "View All Universities"
}

const Institutes: React.FC<InstitutesProps> = ({ onViewAllUniversities }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching universities for landing page...');
        
        // Fetch only 6 universities for landing page (similar to news articles)
        const response = await fetch(`${API_BASE_URL}/universities?limit=6&status=active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.universities)) {
          setUniversities(data.universities);
          console.log('✅ Successfully loaded universities:', data.universities.length);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        console.error('❌ Error fetching universities:', error);
        setError(error.message || 'Failed to load universities');
        
        // Fallback to mock data if API fails
        setUniversities([
          {
            id: 1,
            name: "University of Colombo",
            location: "Colombo",
            type: "government",
            website: "https://www.cmb.ac.lk",
            additionalDetails: {
              established: "1921",
              students: "11,000+",
              faculties: 7
            }
          },
          {
            id: 2,
            name: "University of Peradeniya",
            location: "Kandy",
            type: "government",
            website: "https://www.pdn.ac.lk",
            additionalDetails: {
              established: "1942",
              students: "12,000+",
              faculties: 9
            }
          },
          {
            id: 3,
            name: "University of Moratuwa",
            location: "Moratuwa",
            type: "government",
            website: "https://www.mrt.ac.lk",
            additionalDetails: {
              established: "1966",
              students: "10,000+",
              faculties: 5
            }
          },
          {
            id: 4,
            name: "University of Sri Jayewardenepura",
            location: "Nugegoda",
            type: "government",
            website: "https://www.sjp.ac.lk",
            additionalDetails: {
              established: "1958",
              students: "15,000+",
              faculties: 8
            }
          },
          {
            id: 5,
            name: "University of Kelaniya",
            location: "Kelaniya",
            type: "government",
            website: "https://www.kln.ac.lk",
            additionalDetails: {
              established: "1959",
              students: "13,000+",
              faculties: 6
            }
          },
          {
            id: 6,
            name: "NSBM Green University",
            location: "Pitipana",
            type: "private",
            website: "https://www.nsbm.ac.lk",
            additionalDetails: {
              established: "2013",
              students: "8,000+",
              faculties: 4
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleViewDetails = (universityId: number) => {
    console.log(`Viewing details for university ${universityId}`);
    // This would typically navigate to a university details page or show courses
  };

  const handleViewAllClick = () => {
    console.log('View All Universities clicked');
    if (onViewAllUniversities) {
      onViewAllUniversities();
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Universities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore leading universities across Sri Lanka
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-purple-600 text-lg">Loading universities...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Universities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore leading universities across Sri Lanka
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg mb-4">Failed to load universities</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No universities state
  if (universities.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Universities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore leading universities across Sri Lanka
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-600 text-lg">No universities available at the moment</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for updates!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Top Universities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore leading universities across Sri Lanka offering diverse academic programs
          </p>
        </div>

        {/* Universities Grid - Show only 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {universities.map((university) => (
            <div 
              key={university.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100"
            >
              {/* University Image */}
              <div className="relative h-48 overflow-hidden">
                {university.imageUrl ? (
                  <img
                    src={university.imageUrl}
                    alt={university.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${
                    university.type === 'government' 
                      ? 'from-green-500 to-green-700' 
                      : 'from-blue-500 to-blue-700'
                  } flex items-center justify-center ${
                    university.imageUrl ? 'hidden' : 'flex'
                  }`}
                  style={{ display: university.imageUrl ? 'none' : 'flex' }}
                >
                  <div className="text-white text-center p-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-80" />
                    <h3 className="text-lg font-bold opacity-90">{university.name.split(' ').slice(0, 2).join(' ')}</h3>
                  </div>
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* University Type Badge */}
                <div className={`absolute top-4 left-4 ${
                  university.type === 'government' 
                    ? 'bg-green-600' 
                    : 'bg-blue-600'
                } text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
                  {university.type === 'government' ? 'Government' : 'Private'}
                </div>

                {/* Logo overlay (if available) */}
                {/* {university.logoUrl && (
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full p-2 shadow-lg">
                    <img
                      src={university.logoUrl}
                      alt={`${university.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )} */}
              </div>

              <div className="p-6">
                {/* University Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {university.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{university.location}</span>
                  </div>
                </div>

                {/* University Details */}
                <div className="space-y-3 mb-6">
                  {university.additionalDetails.students && (
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{university.additionalDetails.students} students</span>
                    </div>
                  )}
                  
                  {university.additionalDetails.faculties && (
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span className="text-sm">{university.additionalDetails.faculties} faculties</span>
                    </div>
                  )}
                  
                  {university.additionalDetails.established && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">Est. {university.additionalDetails.established}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(university.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Courses
                  </button>
                  
                  {university.website && (
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      title="Visit Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Universities Button - Similar to BlogSection */}
        <div className="text-center">
          <button 
            onClick={handleViewAllClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            View All Universities
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* University Stats - Similar to BlogSection */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
            <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-gray-700 font-medium">
              {universities.length} Featured Universities • 
              <span className="text-purple-600 ml-1">
                {universities.filter(u => u.type === 'government').length} Government
              </span>
              {universities.filter(u => u.type === 'private').length > 0 && (
                <span className="text-blue-600 ml-1">
                  • {universities.filter(u => u.type === 'private').length} Private
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Institutes;
// client/src/components/Institutes.tsx - Updated with image support
import React, { useEffect } from 'react';
import { MapPin, BookOpen, ExternalLink, Calendar, Users } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { 
  fetchUniversities, 
  setSelectedUniversity,
  selectUniversities,
  selectUniversitiesLoading,
  selectUniversitiesError
} from '../store/slices/universitiesSlice';

const Institutes: React.FC = () => {
  const dispatch = useAppDispatch();
  const universities = useAppSelector(selectUniversities);
  const loading = useAppSelector(selectUniversitiesLoading);
  const error = useAppSelector(selectUniversitiesError);

  // Fetch universities when component mounts
  useEffect(() => {
    if (universities.length === 0 && !loading) {
      console.log('🔄 Fetching universities for Institutes component...');
      dispatch(fetchUniversities());
    }
  }, [dispatch, universities.length, loading]);

  const handleViewDetails = (universityId: number) => {
    const university = universities.find(uni => uni.id === universityId);
    if (university) {
      dispatch(setSelectedUniversity(university));
      console.log('Selected university:', university.name);
    }
  };

  const getUniversityTypeColor = (type: string) => {
    switch (type) {
      case 'government':
        return 'bg-green-600';
      case 'private':
        return 'bg-blue-600';
      case 'semi_government':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getUniversityTypeText = (type: string) => {
    switch (type) {
      case 'government':
        return 'Government';
      case 'private':
        return 'Private';
      case 'semi_government':
        return 'Semi-Government';
      default:
        return 'Unknown';
    }
  };

  const getPlaceholderImage = (universityName: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
    ];
    
    const colorIndex = universityName.length % colors.length;
    return colors[colorIndex];
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    // Show placeholder instead
    const placeholder = target.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // Loading state
  if (loading && universities.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Institutes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've included courses from top institutes across Sri Lanka to help you find the perfect match
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading universities...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && universities.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Institutes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've included courses from top institutes across Sri Lanka to help you find the perfect match
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg mb-4">Failed to load universities</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => dispatch(fetchUniversities())}
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

  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Institutes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've included courses from top institutes across Sri Lanka to help you find the perfect match
          </p>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {universities.map((university) => (
            <div 
              key={university.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              {/* University Image */}
              <div className="relative overflow-hidden h-48">
                {/* Real Image */}
                {university.imageUrl && (
                  <img
                    src={university.imageUrl}
                    alt={university.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />
                )}
                
                {/* Placeholder (shown when no image or image fails) */}
                <div 
                  className={`w-full h-full ${getPlaceholderImage(university.name)} flex items-center justify-center ${
                    university.imageUrl ? 'hidden' : 'flex'
                  }`}
                  style={{ display: university.imageUrl ? 'none' : 'flex' }}
                >
                  <div className="text-white text-center p-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-80" />
                    <h3 className="text-lg font-bold opacity-90">{university.uniCode || 'UNI'}</h3>
                  </div>
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* University Type Badge */}
                <div className={`absolute top-4 left-4 ${getUniversityTypeColor(university.type)} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
                  {getUniversityTypeText(university.type)}
                </div>

                {/* Logo overlay (if available) */}
                {university.logoUrl && (
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full p-2 shadow-lg">
                    <img
                      src={university.logoUrl}
                      alt={`${university.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              
              {/* University Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {university.name}
                </h3>
                
                {/* Location */}
                {university.address && (
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{university.address}</span>
                  </div>
                )}
                
                {/* University Code */}
                {university.uniCode && (
                  <div className="flex items-center text-gray-600 mb-3">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">Code: {university.uniCode}</span>
                  </div>
                )}
                
                {/* Established Date */}
                {university.additionalDetails?.established && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Est. {university.additionalDetails.established}</span>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
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

        {/* Summary Stats */}
        <div className="text-center">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
            <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-gray-700 font-medium">
              {universities.length} Universities • 
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

        {/* Loading indicator for refresh */}
        {loading && universities.length > 0 && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center text-purple-600">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm">Updating universities...</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Institutes;
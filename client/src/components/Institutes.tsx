import React from 'react';
import { MapPin, BookOpen } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setSelectedUniversity } from '../store/slices/universitiesSlice';

const Institutes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { universities, loading } = useAppSelector((state) => state.universities);

  const handleViewDetails = (universityId: number) => {
    const university = universities.find(uni => uni.id === universityId);
    if (university) {
      dispatch(setSelectedUniversity(university));
      // Navigate to university detail page
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading universities...</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {universities.map((university) => (
            <div key={university.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="relative overflow-hidden">
                <img
                  src={university.image}
                  alt={university.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {university.type === 'government' && (
                  <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Government
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {university.name}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{university.location}</span>
                </div>
                
                {university.established && (
                  <div className="text-sm text-gray-500 mb-3">
                    Established: {university.established}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-purple-600 font-medium">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{university.programs} Programs</span>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(university.id)}
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
            View All Institutes →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Institutes;
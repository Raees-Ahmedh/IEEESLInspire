import React from 'react';
import { useAppDispatch } from '../hooks/redux';
import { setSearchQuery } from '../store/slices/searchSlice';

const Hero: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleFindDegree = () => {
    // Navigate to search/filter page or scroll to search section
    dispatch(setSearchQuery(''));
  };

  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Student Silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20">
        <div className="absolute bottom-0 left-1/4 w-16 h-32 bg-white rounded-t-full transform -rotate-12"></div>
        <div className="absolute bottom-0 left-1/3 w-20 h-40 bg-white rounded-t-full transform rotate-6"></div>
        <div className="absolute bottom-0 right-1/3 w-18 h-36 bg-white rounded-t-full transform -rotate-3"></div>
        <div className="absolute bottom-0 right-1/4 w-16 h-32 bg-white rounded-t-full transform rotate-12"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect<br />
            University Course in<br />
            <span className="text-yellow-300">Sri Lanka</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover and compare the best degree programs at government universities across Sri Lanka
          </p>

          <button 
            onClick={handleFindDegree}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Find Your Degree →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
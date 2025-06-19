import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';

const Footer: React.FC = () => {
  const { universities } = useAppSelector((state) => state.universities);
  const popularUniversities = universities.slice(0, 4);

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Find Faster */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Find Faster</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Our Services</a></li>
            </ul>
          </div>

          {/* Popular Universities */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Popular Universities</h3>
            <ul className="space-y-3">
              {popularUniversities.map((university) => (
                <li key={university.id}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {university.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact us */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Contact us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-purple-400" />
                <span className="text-gray-300">info@slp.lk</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-purple-400" />
                <span className="text-gray-300">+94 11 234 5678</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 mt-1 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">123 Education Lane, Colombo 07, Sri Lanka</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-purple-300">Stay Updated</h3>
            <p className="text-gray-300 mb-4">Get the latest updates on university admissions and courses.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 - All rights are reserved for PathFinder
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
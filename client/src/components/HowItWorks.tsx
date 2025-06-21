import React from 'react';
import { FileText, Search, Filter, CheckCircle } from 'lucide-react';

interface Step {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const HowItWorks: React.FC = () => {
  const steps: Step[] = [
    {
      number: 1,
      icon: FileText,
      title: "Enter Your Qualifications",
      description: "Input your A/L results, qualifications, including A/L results, diplomas or other credentials"
    },
    {
      number: 2,
      icon: Search,
      title: "Browse Available Courses",
      description: "View matching degree programs at universities across Sri Lanka based on your qualifications"
    },
    {
      number: 3,
      icon: Filter,
      title: "Apply Additional Filters",
      description: "Refine your search by university, location, course duration, fees and other preferences"
    },
    {
      number: 4,
      icon: CheckCircle,
      title: "Apply with Confidence",
      description: "Get informed program details, find universities and apply with confidence"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Finding your perfect university course is easy with our simple process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
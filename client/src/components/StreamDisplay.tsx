import React from 'react';
import { CheckCircle, AlertCircle, Loader, BookOpen, TrendingUp } from 'lucide-react';

interface StreamDisplayProps {
  streamName: string | null;
  isLoading: boolean;
  error: string | null;
  matchedRule?: string | null;
  showDetails?: boolean;
}

const StreamDisplay: React.FC<StreamDisplayProps> = ({ 
  streamName, 
  isLoading, 
  error, 
  matchedRule,
  showDetails = true 
}) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Loader className="h-5 w-5 text-gray-400 animate-spin mr-3" />
          <span className="text-gray-600">Detecting your stream...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">Error detecting stream: {error}</span>
        </div>
      </div>
    );
  }

  if (!streamName) {
    return null;
  }

  const getStreamColor = (stream: string) => {
    const streamColors = {
      'Physical Science Stream': 'bg-blue-50 border-blue-200 text-blue-800',
      'Biological Science Stream': 'bg-green-50 border-green-200 text-green-800',
      'Commerce Stream': 'bg-purple-50 border-purple-200 text-purple-800',
      'Arts Stream': 'bg-orange-50 border-orange-200 text-orange-800',
      'Engineering Technology Stream': 'bg-indigo-50 border-indigo-200 text-indigo-800',
      'Biosystems Technology Stream': 'bg-teal-50 border-teal-200 text-teal-800',
      'Common': 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return streamColors[stream as keyof typeof streamColors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getStreamIcon = (stream: string) => {
    if (stream.includes('Science') || stream.includes('Technology')) {
      return <BookOpen className="h-5 w-5" />;
    } else if (stream.includes('Commerce')) {
      return <TrendingUp className="h-5 w-5" />;
    }
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${getStreamColor(streamName)}`}>
      <div className="flex items-center">
        {getStreamIcon(streamName)}
        <div className="ml-3">
          <h4 className="font-semibold">Detected Stream: {streamName}</h4>
          {showDetails && matchedRule && (
            <p className="text-sm opacity-90 mt-1">
              Classification rule: {matchedRule.replace(/_/g, ' ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamDisplay;
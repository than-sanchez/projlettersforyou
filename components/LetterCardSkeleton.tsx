
import React from 'react';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

const LetterCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 h-full flex flex-col animate-pulse">
      <div className="flex items-center text-gray-400 mb-4">
        <EnvelopeIcon className="h-5 w-5 mr-2" />
        <div className="h-4 bg-gray-200 rounded w-2/4"></div>
      </div>
      <div className="space-y-2 flex-grow">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-end">
         <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default LetterCardSkeleton;

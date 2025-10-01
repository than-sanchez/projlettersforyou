
import React from 'react';
import type { Letter } from '../types';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, onClick }) => {
  const isClickable = !!onClick;
  return (
    <div 
      onClick={onClick}
      className={`bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 h-full flex flex-col ${isClickable ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]' : ''}`}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      <div className="flex items-center text-gray-500 mb-4">
        <EnvelopeIcon className="h-5 w-5 mr-2" />
        <span className="font-medium">To: {letter.to}</span>
      </div>
      <p className="text-gray-700 leading-relaxed flex-grow line-clamp-6">{letter.content}</p>
      <p className="text-right text-xs text-gray-400 mt-4 pt-2 border-t border-gray-200/50">
        {new Date(letter.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
      </p>
    </div>
  );
};

export default LetterCard;

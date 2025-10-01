
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LetterCard from '../components/LetterCard';
import LetterModal from '../components/LetterModal';
import type { Letter } from '../types';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';

const HistoryPage: React.FC = () => {
  const [myLetters, setMyLetters] = useState<Letter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    try {
      const storedLetters = JSON.parse(localStorage.getItem('myLetters') || '[]');
      // Sort by most recent first
      storedLetters.sort((a: Letter, b: Letter) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMyLetters(storedLetters);
    } catch (error) {
      console.error("Failed to parse letters from local storage", error);
      setMyLetters([]);
    }
  }, []);

  return (
    <>
      <div className="py-12 md:py-20 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Your History</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            These are the letters you've written. They are stored locally on your device.
          </p>
        </div>

        {myLetters.length > 0 ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {myLetters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} onClick={() => setSelectedLetter(letter)} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <h2 className="text-xl font-semibold text-gray-700">No letters written yet.</h2>
            <p className="mt-2 text-gray-500">Your sent letters will appear here.</p>
            <Link to="/write" className="mt-6 inline-flex items-center gap-2 bg-black text-white font-medium py-3 px-6 rounded-full hover:bg-gray-800 transition-transform duration-200 hover:scale-105">
                Write your first letter
                <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <LetterModal letter={selectedLetter} onClose={() => setSelectedLetter(null)} />
    </>
  );
};

export default HistoryPage;

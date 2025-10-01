
import React, { useState, useMemo, useEffect } from 'react';
import LetterCard from '../components/LetterCard';
import LetterModal from '../components/LetterModal';
import LetterCardSkeleton from '../components/LetterCardSkeleton';
import { SearchIcon } from '../components/icons/SearchIcon';
import { api } from '../api-client';
import type { Letter } from '../types';

const BrowsePage: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    const fetchLetters = async () => {
      setLoading(true);
      try {
        const fetchedLetters = await api.getLetters();
        setLetters(fetchedLetters);
      } catch (error) {
        console.error("Failed to fetch letters", error);
        setLetters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  const filteredLetters = useMemo(() => {
    if (!searchQuery) {
      return letters;
    }
    return letters.filter(letter =>
      letter.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, letters]);

  return (
    <>
      <div className="py-12 md:py-20 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Browse Letters</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Read untold stories and heartfelt messages from people around the world.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-10 max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              placeholder="Search letters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading 
            ? Array.from({ length: 6 }).map((_, index) => <LetterCardSkeleton key={index} />)
            : filteredLetters.map((letter) => (
                <LetterCard key={letter.id} letter={letter} onClick={() => setSelectedLetter(letter)} />
              ))
          }
        </div>
        {!loading && filteredLetters.length === 0 && (
          <div className="text-center mt-12 text-gray-500">
            <p>No letters found matching your search.</p>
          </div>
        )}
      </div>

      <LetterModal letter={selectedLetter} onClose={() => setSelectedLetter(null)} />
    </>
  );
};

export default BrowsePage;

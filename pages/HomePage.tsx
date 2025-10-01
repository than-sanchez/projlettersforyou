import React from 'react';
import { Link } from 'react-router-dom';
import LetterCard from '../components/LetterCard';
import { MOCK_LETTERS } from '../constants';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';

const HomePage: React.FC = () => {
  const exampleLetter = MOCK_LETTERS[0];

  return (
    <div className="py-12 md:py-20 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900">
          lettersforyou
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          A platform to share the words you've never said, write and send heartfelt, untold letters to someone who matters.
        </p>
        <div className="mt-8 flex justify-center items-center gap-2">
          <Link to="/browse" className="px-5 py-3 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
            Browse
          </Link>
          <Link to="/write" className="px-5 py-3 border border-transparent bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1">
            Write <ChevronRightIcon className="w-4 h-4"/>
          </Link>
          <Link to="/donate" className="px-5 py-3 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
            Donate
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="mt-20 md:mt-32">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Write your <span className="font-serif italic">Unsaid Feelings</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              LettersForYou is a platform where you can write letters to express your thoughts and feelings that you may not be able to say out loud. It's a safe space to share untold stories, send heartfelt messages, or just put your emotions into words. Whether it's for yourself, someone special, or anyone who might listen, LettersForYou lets you write, share, and connect through meaningful messages.
            </p>
          </div>
          <div>
            <LetterCard letter={exampleLetter} />
          </div>
        </div>
        <div className="mt-12 text-center">
            <Link to="/write" className="inline-flex items-center gap-2 bg-black text-white font-medium py-3 px-6 rounded-full hover:bg-gray-800 transition-transform duration-200 hover:scale-105">
                write a letter now
                <ChevronRightIcon className="w-4 h-4" />
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
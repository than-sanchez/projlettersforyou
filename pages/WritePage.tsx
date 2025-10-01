
import React, { useState } from 'react';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { api } from '../api-client';

const WritePage: React.FC = () => {
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !content.trim()) {
      setError('Both "To" and "Content" fields are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await api.submitLetter({
        to: to.trim(),
        content: content.trim(),
        date: new Date().toISOString(),
        author: 'Anonymous',
      });
      
      const myLetter = {
        id: result.id,
        to: to.trim(),
        content: content.trim(),
        date: new Date().toISOString(),
        author: 'You',
      };
      
      try {
        const existingMyLetters = JSON.parse(localStorage.getItem('myLetters') || '[]');
        const updatedMyLetters = [...existingMyLetters, myLetter];
        localStorage.setItem('myLetters', JSON.stringify(updatedMyLetters));
      } catch (storageErr) {
        console.warn('Could not save to local history', storageErr);
      }
      
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setTo('');
        setContent('');
      }, 5000);
    } catch (err) {
      console.error("Failed to submit letter", err);
      setError(err instanceof Error ? err.message : "There was an issue submitting your letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-3xl mx-auto animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-bold font-serif text-center text-gray-900">Write a Letter</h1>
      <p className="mt-4 text-center text-gray-600">Pour your heart out. The world is listening.</p>
      
      {submitted ? (
        <div className="mt-12 text-center bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-800">Thank You!</h2>
          <p className="mt-2 text-green-700">Your letter has been sent out into the world. Your words have power and meaning. You can view it in your History.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
            {/* "To" Input Field styled like LetterCard header */}
            <div className="flex items-center text-gray-500 mb-4 border-b border-gray-200 pb-3">
              <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <label htmlFor="to" className="font-medium mr-2">To:</label>
              <input
                id="to"
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="someone special, my future self..."
                className="w-full bg-transparent focus:outline-none focus:ring-0 border-0 p-0 font-medium text-gray-700 placeholder-gray-400"
                aria-label="Recipient"
              />
            </div>

            {/* "Content" Textarea styled like LetterCard body */}
            <div>
              <label htmlFor="content" className="sr-only">Your Letter:</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                placeholder="Start writing your letter here..."
                className="w-full bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-gray-700 leading-relaxed resize-none placeholder-gray-400"
                aria-label="Letter content"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-end gap-4">
             <p className="text-xs text-gray-500 italic text-left max-w-sm">
                Note: Message deletion is not available. Once it's sent it can't be deleted, so it must be appropriate.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Letter'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WritePage;

import React, { useState, useEffect } from 'react';
import { api, type Letter, type ModerationWord } from '../api-client';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminRole, setAdminRole] = useState('');
  
  const [letters, setLetters] = useState<Letter[]>([]);
  const [moderationWords, setModerationWords] = useState<ModerationWord[]>([]);
  const [newWord, setNewWord] = useState('');
  
  const [activeTab, setActiveTab] = useState<'letters' | 'moderation'>('letters');

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    const savedUsername = sessionStorage.getItem('adminUsername');
    const savedRole = sessionStorage.getItem('adminRole');
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setAdminRole(savedRole || '');
      setIsAuthenticated(true);
      loadAdminData(savedToken);
    }
  }, []);

  const loadAdminData = async (authToken: string) => {
    try {
      const [fetchedLetters, fetchedWords] = await Promise.all([
        api.getLetters(),
        api.getModerationWords(authToken)
      ]);
      setLetters(fetchedLetters);
      setModerationWords(fetchedWords);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await api.adminLogin(username, password);
      setToken(result.token);
      setAdminRole(result.role || '');
      sessionStorage.setItem('adminToken', result.token);
      sessionStorage.setItem('adminUsername', username);
      sessionStorage.setItem('adminRole', result.role || '');
      setIsAuthenticated(true);
      await loadAdminData(result.token);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLetter = async (id: number) => {
    if (!confirm('Are you sure you want to delete this letter?')) return;
    
    try {
      await api.deleteLetter(id, token);
      setLetters(letters.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete letter');
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    
    try {
      const result = await api.addModerationWord(newWord.trim(), token);
      setModerationWords([...moderationWords, { id: result.id, word: newWord.trim() }]);
      setNewWord('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add word');
    }
  };

  const handleDeleteWord = async (id: number) => {
    try {
      await api.deleteModerationWord(id, token);
      setModerationWords(moderationWords.filter(w => w.id !== id));
    } catch (err) {
      alert('Failed to delete word');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminRole');
    setIsAuthenticated(false);
    setToken('');
    setUsername('');
    setAdminRole('');
    setLetters([]);
    setModerationWords([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 md:py-20 max-w-md mx-auto animate-fadeIn">
        <h1 className="text-4xl font-bold font-serif text-center text-gray-900">Admin Login</h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-full hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-serif text-gray-900">Admin Dashboard</h1>
          {adminRole && <p className="text-sm text-gray-600 mt-1">Role: {adminRole}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('letters')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'letters'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Letters ({letters.length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'moderation'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Moderation Words ({moderationWords.length})
          </button>
        </nav>
      </div>

      {activeTab === 'letters' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">All Letters</h2>
          {letters.length === 0 ? (
            <p className="text-gray-500">No letters found.</p>
          ) : (
            <div className="space-y-4">
              {letters.map((letter) => (
                <div key={letter.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">To: {letter.to}</p>
                      <p className="mt-2 text-gray-700">{letter.content}</p>
                      <p className="mt-2 text-sm text-gray-400">
                        By {letter.author} on {new Date(letter.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteLetter(letter.id)}
                      className="ml-4 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Moderation Words</h2>
            <p className="text-gray-600 mt-2">
              Letters containing these words will be automatically rejected.
            </p>
          </div>

          <form onSubmit={handleAddWord} className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Add a word to moderate..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-800 focus:border-gray-800"
            />
            <button
              type="submit"
              className="bg-gray-900 text-white py-2 px-6 rounded-md hover:bg-gray-700"
            >
              Add Word
            </button>
          </form>

          <div className="space-y-2">
            {moderationWords.length === 0 ? (
              <p className="text-gray-500">No moderation words added yet.</p>
            ) : (
              moderationWords.map((word) => (
                <div
                  key={word.id}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3"
                >
                  <span className="text-gray-700">{word.word}</span>
                  <button
                    onClick={() => handleDeleteWord(word.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

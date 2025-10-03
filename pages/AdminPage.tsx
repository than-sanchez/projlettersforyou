import React, { useState, useEffect } from 'react';
import { api, type Letter, type ModerationWord, type AdminUser } from '../api-client';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminRole, setAdminRole] = useState('');
  const [permissions, setPermissions] = useState<any>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const [letters, setLetters] = useState<Letter[]>([]);
  const [moderationWords, setModerationWords] = useState<ModerationWord[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newWord, setNewWord] = useState('');
  
  const [activeTab, setActiveTab] = useState<'letters' | 'moderation' | 'users'>('letters');
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'Admin',
    permissions: {
      manage_letters: false,
      manage_moderation: false,
      manage_admins: false,
      manage_blog: false
    }
  });
  const [userFormError, setUserFormError] = useState('');
  const [userFormLoading, setUserFormLoading] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    const savedUsername = sessionStorage.getItem('adminUsername');
    const savedRole = sessionStorage.getItem('adminRole');
    const savedPermissions = sessionStorage.getItem('adminPermissions');
    const savedUserId = sessionStorage.getItem('adminUserId');
    
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setAdminRole(savedRole || '');
      setPermissions(savedPermissions ? JSON.parse(savedPermissions) : {});
      setCurrentUserId(savedUserId ? parseInt(savedUserId) : null);
      setIsAuthenticated(true);
      loadAdminData(savedToken, savedPermissions ? JSON.parse(savedPermissions) : {});
    }
  }, []);

  const loadAdminData = async (authToken: string, perms: any) => {
    try {
      const promises: Promise<any>[] = [
        api.getLetters(),
        api.getModerationWords(authToken)
      ];
      
      if (perms.manage_admins) {
        promises.push(api.getAdminUsers(authToken));
      }
      
      const results = await Promise.all(promises);
      setLetters(results[0]);
      setModerationWords(results[1]);
      
      if (perms.manage_admins && results[2]) {
        setAdminUsers(results[2]);
      }
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
      setPermissions(result.permissions || {});
      
      sessionStorage.setItem('adminToken', result.token);
      sessionStorage.setItem('adminUsername', username);
      sessionStorage.setItem('adminRole', result.role || '');
      sessionStorage.setItem('adminPermissions', JSON.stringify(result.permissions || {}));
      
      if (result.permissions?.manage_admins) {
        const users = await api.getAdminUsers(result.token);
        const currentUser = users.find(u => u.username === username);
        if (currentUser) {
          setCurrentUserId(currentUser.id);
          sessionStorage.setItem('adminUserId', currentUser.id.toString());
        }
      }
      
      setIsAuthenticated(true);
      await loadAdminData(result.token, result.permissions || {});
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

  const handleOpenCreateUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      username: '',
      password: '',
      role: 'Admin',
      permissions: {
        manage_letters: false,
        manage_moderation: false,
        manage_admins: false,
        manage_blog: false
      }
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleOpenEditUserModal = (user: AdminUser) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      password: '',
      role: user.role,
      permissions: {
        manage_letters: user.permissions?.manage_letters || false,
        manage_moderation: user.permissions?.manage_moderation || false,
        manage_admins: user.permissions?.manage_admins || false,
        manage_blog: user.permissions?.manage_blog || false
      }
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserFormError('');
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError('');
    
    try {
      if (editingUser) {
        const updateData: any = {
          username: userFormData.username,
          role: userFormData.role,
          permissions: userFormData.permissions
        };
        
        if (userFormData.password) {
          updateData.password = userFormData.password;
        }
        
        await api.updateAdminUser(editingUser.id, updateData, token);
        
        const updatedUsers = await api.getAdminUsers(token);
        setAdminUsers(updatedUsers);
      } else {
        if (!userFormData.password) {
          setUserFormError('Password is required for new users');
          setUserFormLoading(false);
          return;
        }
        
        await api.createAdminUser({
          username: userFormData.username,
          password: userFormData.password,
          role: userFormData.role,
          permissions: userFormData.permissions
        }, token);
        
        const updatedUsers = await api.getAdminUsers(token);
        setAdminUsers(updatedUsers);
      }
      
      handleCloseUserModal();
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete admin user "${user.username}"?`)) return;
    
    try {
      await api.deleteAdminUser(user.id, token);
      setAdminUsers(adminUsers.filter(u => u.id !== user.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminRole');
    sessionStorage.removeItem('adminPermissions');
    sessionStorage.removeItem('adminUserId');
    setIsAuthenticated(false);
    setToken('');
    setUsername('');
    setAdminRole('');
    setPermissions({});
    setCurrentUserId(null);
    setLetters([]);
    setModerationWords([]);
    setAdminUsers([]);
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
          {permissions.manage_admins && (
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Admin Users ({adminUsers.length})
            </button>
          )}
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

      {activeTab === 'users' && permissions.manage_admins && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Users</h2>
              <p className="text-gray-600 mt-2">
                Manage administrator accounts and their permissions.
              </p>
            </div>
            <button
              onClick={handleOpenCreateUserModal}
              className="bg-gray-900 text-white py-2 px-6 rounded-md hover:bg-gray-700"
            >
              Create New Admin
            </button>
          </div>

          <div className="space-y-3">
            {adminUsers.length === 0 ? (
              <p className="text-gray-500">No admin users found.</p>
            ) : (
              adminUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.permissions?.manage_letters && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Manage Letters
                          </span>
                        )}
                        {user.permissions?.manage_moderation && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Manage Moderation
                          </span>
                        )}
                        {user.permissions?.manage_admins && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Manage Admins
                          </span>
                        )}
                        {user.permissions?.manage_blog && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Manage Blog
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleOpenEditUserModal(user)}
                        className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingUser ? 'Edit Admin User' : 'Create New Admin'}
              </h2>
              
              <form onSubmit={handleUserFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="user-username" className="block text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <input
                    id="user-username"
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="user-password" className="block text-sm font-medium text-gray-700">
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <input
                    id="user-role"
                    type="text"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userFormData.permissions.manage_letters}
                        onChange={(e) => setUserFormData({
                          ...userFormData,
                          permissions: { ...userFormData.permissions, manage_letters: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manage Letters</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userFormData.permissions.manage_moderation}
                        onChange={(e) => setUserFormData({
                          ...userFormData,
                          permissions: { ...userFormData.permissions, manage_moderation: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manage Moderation</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userFormData.permissions.manage_admins}
                        onChange={(e) => setUserFormData({
                          ...userFormData,
                          permissions: { ...userFormData.permissions, manage_admins: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manage Admins</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userFormData.permissions.manage_blog}
                        onChange={(e) => setUserFormData({
                          ...userFormData,
                          permissions: { ...userFormData.permissions, manage_blog: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manage Blog</span>
                    </label>
                  </div>
                </div>

                {userFormError && (
                  <p className="text-red-600 text-sm">{userFormError}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseUserModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                    disabled={userFormLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                    disabled={userFormLoading}
                  >
                    {userFormLoading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

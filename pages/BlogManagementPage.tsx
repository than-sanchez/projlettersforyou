import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type BlogPost } from '../api-client';

declare global {
  interface Window {
    Quill: any;
  }
}

const BlogManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [quillLoaded, setQuillLoaded] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    const savedPermissions = sessionStorage.getItem('adminPermissions');
    
    if (!savedToken) {
      navigate('/admin');
      return;
    }
    
    const permissions = savedPermissions ? JSON.parse(savedPermissions) : {};
    if (!permissions.manage_blog) {
      setError('You do not have permission to manage blog posts');
      setLoading(false);
      return;
    }
    
    setToken(savedToken);
    setIsAuthenticated(true);
    setHasPermission(true);
    loadPosts(savedToken);
    loadQuill();
  }, [navigate]);

  const loadQuill = () => {
    if (window.Quill) {
      setQuillLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
    script.onload = () => setQuillLoaded(true);
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (quillLoaded && showForm && editorRef.current && !quillRef.current) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }]
          ]
        },
        placeholder: 'Write your blog post content...'
      });
      
      if (editingPost) {
        quillRef.current.root.innerHTML = editingPost.content;
      }
    }
  }, [quillLoaded, showForm, editingPost]);

  const loadPosts = async (authToken: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBlogPosts(authToken);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      published: false
    });
    setFormError('');
    setShowForm(true);
    quillRef.current = null;
  };

  const handleOpenEditForm = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      published: post.published
    });
    setFormError('');
    setShowForm(true);
    quillRef.current = null;
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormError('');
    quillRef.current = null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setSuccessMessage('');
    
    if (!formData.title.trim()) {
      setFormError('Title is required');
      setFormLoading(false);
      return;
    }

    const content = quillRef.current ? quillRef.current.root.innerHTML : '';
    
    try {
      if (editingPost) {
        await api.updateBlogPost(editingPost.id, {
          title: formData.title,
          content: content,
          published: formData.published
        }, token);
        setSuccessMessage('Blog post updated successfully');
      } else {
        await api.createBlogPost({
          title: formData.title,
          content: content,
          published: formData.published
        }, token);
        setSuccessMessage('Blog post created successfully');
      }
      
      handleCloseForm();
      await loadPosts(token);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    
    try {
      await api.deleteBlogPost(post.id, token);
      setSuccessMessage('Blog post deleted successfully');
      await loadPosts(token);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  if (!isAuthenticated || !hasPermission) {
    return (
      <div className="py-12 md:py-20 max-w-2xl mx-auto text-center animate-fadeIn">
        <h1 className="text-4xl font-bold font-serif text-gray-900">Access Denied</h1>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <p className="mt-4 text-gray-600">You need proper permissions to access this page.</p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-6 bg-gray-900 text-white py-2 px-6 rounded-full hover:bg-gray-700"
        >
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-serif text-gray-900">Blog Management</h1>
        <button
          onClick={handleOpenCreateForm}
          className="bg-gray-900 text-white py-2 px-6 rounded-full hover:bg-gray-700"
        >
          Create New Post
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading blog posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded ${
                      post.published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    By {post.author_name} on {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  {post.published_at && (
                    <p className="text-sm text-gray-400 mt-1">
                      Published: {new Date(post.published_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenEditForm(post)}
                    className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  {quillLoaded ? (
                    <div ref={editorRef} style={{ height: '300px' }}></div>
                  ) : (
                    <p className="text-gray-500">Loading editor...</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="published"
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-800 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                    Published
                  </label>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formLoading || !quillLoaded}
                    className="bg-gray-900 text-white py-2 px-6 rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300"
                  >
                    Cancel
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

export default BlogManagementPage;

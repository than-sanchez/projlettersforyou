const API_BASE_URL = '/api';

export interface Letter {
  id: number;
  to: string;
  content: string;
  author: string;
  date: string;
}

export interface ModerationWord {
  id: number;
  word: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  permissions: {
    manage_letters?: boolean;
    manage_moderation?: boolean;
    manage_admins?: boolean;
    manage_blog?: boolean;
  };
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  author_name: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const api = {
  async getLetters(): Promise<Letter[]> {
    const response = await fetch(`${API_BASE_URL}/letters.php`);
    if (!response.ok) throw new Error('Failed to fetch letters');
    return response.json();
  },

  async submitLetter(letter: Omit<Letter, 'id'>): Promise<{ success: boolean; id: number }> {
    const response = await fetch(`${API_BASE_URL}/letters.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letter)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit letter');
    }
    return response.json();
  },

  async deleteLetter(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/letters.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete letter');
  },

  async adminLogin(username: string, password: string): Promise<{ success: boolean; token: string; username?: string; role?: string; permissions?: any }> {
    const response = await fetch(`${API_BASE_URL}/admin.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  async getModerationWords(token: string): Promise<ModerationWord[]> {
    const response = await fetch(`${API_BASE_URL}/moderation.php`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch moderation words');
    return response.json();
  },

  async addModerationWord(word: string, token: string): Promise<{ success: boolean; id: number }> {
    const response = await fetch(`${API_BASE_URL}/moderation.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ word })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add word');
    }
    return response.json();
  },

  async deleteModerationWord(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/moderation.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete word');
  },

  async getAdminUsers(token: string): Promise<AdminUser[]> {
    const response = await fetch(`${API_BASE_URL}/admin_users.php`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch admin users');
    return response.json();
  },

  async createAdminUser(data: { username: string; password: string; role: string; permissions: any }, token: string): Promise<{ success: boolean; id: number }> {
    const response = await fetch(`${API_BASE_URL}/admin_users.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create admin user');
    }
    return response.json();
  },

  async updateAdminUser(id: number, data: { username?: string; password?: string; role?: string; permissions?: any }, token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/admin_users.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...data })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update admin user');
    }
    return response.json();
  },

  async deleteAdminUser(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin_users.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete admin user');
    }
  },

  async getBlogPosts(token?: string): Promise<BlogPost[]> {
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/blog.php`, { headers });
    if (!response.ok) throw new Error('Failed to fetch blog posts');
    return response.json();
  },

  async getBlogPost(idOrSlug: string | number, token?: string): Promise<BlogPost> {
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const param = typeof idOrSlug === 'number' ? `id=${idOrSlug}` : `slug=${idOrSlug}`;
    const response = await fetch(`${API_BASE_URL}/blog.php?${param}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch blog post');
    return response.json();
  },

  async createBlogPost(data: { title: string; content: string; published: boolean }, token: string): Promise<{ success: boolean; id: number }> {
    const response = await fetch(`${API_BASE_URL}/blog.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create blog post');
    }
    return response.json();
  },

  async updateBlogPost(id: number, data: { title?: string; content?: string; published?: boolean }, token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/blog.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...data })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update blog post');
    }
    return response.json();
  },

  async deleteBlogPost(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blog.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete blog post');
    }
  }
};

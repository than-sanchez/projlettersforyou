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

  async adminLogin(username: string, password: string): Promise<{ success: boolean; token: string; username?: string; role?: string }> {
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
  }
};

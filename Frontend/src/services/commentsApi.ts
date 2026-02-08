const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Comment {
  id: number;
  item: number;
  author: number;
  author_email: string;
  author_name: string;
  parent: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  report_count: number;
  is_active: boolean;
  replies_count: number;
  replies: Comment[];
}

export interface CreateCommentData {
  item: number;
  parent?: number | null;
  content: string;
}

export interface CommentReportData {
  reason: 'inappropriate' | 'spam' | 'harassment' | 'other';
  description?: string;
}

export const commentsApi = {
  async getItemComments(itemId: number): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/comments/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    
    return response.json();
  },

  async getComment(id: number): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch comment');
    }
    
    return response.json();
  },

  async createComment(data: CreateCommentData, token: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || Object.values(error)[0] || 'Failed to create comment');
    }

    return response.json();
  },

  async updateComment(id: number, content: string, token: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || Object.values(error)[0] || 'Failed to update comment');
    }

    return response.json();
  },

  async deleteComment(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },

  async reportComment(id: number, data: CommentReportData, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}/report/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || Object.values(error)[0] || 'Failed to report comment');
    }

    return response.json();
  },
};


import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export interface Notification {
  id: number;
  sender_email: string;
  sender_name: string;
  item_title: string;
  notification_type: 'comment' | 'reply' | 'item_match';
  message: string;
  is_read: boolean;
  created_at: string;
  comment_preview?: string;
}

export interface NotificationsResponse {
  count: number;
  unread_count: number;
  notifications: Notification[];
}

export const notificationsApi = {
  async getNotifications(token: string): Promise<NotificationsResponse> {
    const response = await fetch(`${API_BASE_URL}/items/notifications/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },

  async markAllAsRead(token: string): Promise<{ marked_read: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/items/mark_all_read/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read');
    }

    return response.json();
  },
};
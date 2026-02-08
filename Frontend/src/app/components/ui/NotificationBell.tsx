import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationsApi, type Notification } from '../../../services/notificationsApi';
import { useAuth } from '../../auth/AuthProvider';

export default function NotificationBell() {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
      if (!token) return;
      
      const parsedToken = JSON.parse(token);
      const data = await notificationsApi.getNotifications(parsedToken.access);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
      if (!token) return;
      
      const parsedToken = JSON.parse(token);
      await notificationsApi.markAllAsRead(parsedToken.access);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'همین الان';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    return `${diffDays} روز پیش`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-200 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">اعلان‌ها</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    خواندن همه
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  در حال بارگذاری...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  هیچ اعلانی ندارید
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">
                          {notification.message}
                        </p>
                        {notification.comment_preview && (
                          <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2">
                            {notification.comment_preview}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {notification.notification_type === 'comment' ? 'کامنت' : 'پاسخ'}
                          </span>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  بستن
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
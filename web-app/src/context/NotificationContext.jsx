import React, { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../config/axios';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Socket.io connection
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.user_id) {
      console.warn('No user found in localStorage');
      setIsLoading(false);
      return;
    }

    console.log('Initializing notifications for user:', user.user_id);

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      // Join user room
      newSocket.emit('user_join', user.user_id);
      // Fetch initial notifications
      fetchNotifications(user.user_id);
      fetchUnreadCount(user.user_id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
    });

    newSocket.on('notification', (data) => {
      console.log('New notification received:', data);
      // Add new notification to the list
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      // Play notification sound
      playNotificationSound();
    });

    newSocket.on('notification_marked_read', (data) => {
      console.log('Notification marked as read:', data.notification_id);
      setNotifications(prev =>
        prev.map(n => n.notification_id === data.notification_id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    newSocket.on('all_notifications_marked_read', () => {
      console.log('All notifications marked as read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    });

    newSocket.on('unread_count', (data) => {
      console.log('Unread count updated:', data.count);
      setUnreadCount(data.count);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);
    setIsLoading(false);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (userId) => {
    try {
      console.log('Fetching notifications for user:', userId);
      const response = await api.get(`/notifications/user/${userId}?limit=20`);
      console.log('Notifications fetched:', response.data);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async (userId) => {
    try {
      console.log('Fetching unread count for user:', userId);
      const response = await api.get(`/notifications/user/${userId}/unread-count`);
      console.log('Unread count:', response.data.unread_count);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await api.put(`/notifications/${notificationId}/read`);
      if (socket) {
        socket.emit('mark_notification_read', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [socket]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      console.log('Marking all notifications as read for user:', user.user_id);
      await api.put(`/notifications/user/${user.user_id}/read-all`);
      if (socket) {
        socket.emit('mark_all_notifications_read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [socket]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      console.log('Deleting notification:', notificationId);
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      console.log('Deleting all notifications for user:', user.user_id);
      await api.delete(`/notifications/user/${user.user_id}/delete-all`);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotifications,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};


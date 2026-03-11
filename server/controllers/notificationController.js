const NotificationService = require('../services/notificationService');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const notifications = await NotificationService.getUserNotifications(userId, parseInt(limit));
    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationService.markNotificationAsRead(notificationId);
    res.json({
      message: 'Đánh dấu thông báo thành công',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await NotificationService.markAllNotificationsAsRead(userId);
    res.json({
      message: 'Đánh dấu tất cả thông báo thành công',
      count: notifications.length
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await NotificationService.getUnreadCount(userId);
    res.json({ unread_count: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const pool = require('../config/db');

    await pool.query('DELETE FROM notifications WHERE notification_id = $1', [notificationId]);
    res.json({ message: 'Xóa thông báo thành công' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = require('../config/db');

    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    res.json({ message: 'Xóa tất cả thông báo thành công' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

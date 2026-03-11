const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get user notifications
router.get('/user/:userId', notificationController.getUserNotifications);

// Get unread count
router.get('/user/:userId/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Mark all notifications as read
router.put('/user/:userId/read-all', notificationController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Delete all notifications
router.delete('/user/:userId/delete-all', notificationController.deleteAllNotifications);

module.exports = router;

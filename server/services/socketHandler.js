const NotificationService = require('./notificationService');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their user_id
    socket.on('user_join', (userId) => {
      console.log(`User ${userId} joined with socket ${socket.id}`);
      NotificationService.registerUserSocket(userId, socket.id);
      socket.userId = userId;
      socket.join(`user_${userId}`);
    });

    // User leaves
    socket.on('disconnect', () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
        NotificationService.unregisterUserSocket(socket.userId, socket.id);
      }
    });

    // Mark notification as read
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        await NotificationService.markNotificationAsRead(notificationId);
        socket.emit('notification_marked_read', { notification_id: notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('error', { message: 'Không thể đánh dấu thông báo' });
      }
    });

    // Mark all notifications as read
    socket.on('mark_all_notifications_read', async () => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }
        await NotificationService.markAllNotificationsAsRead(socket.userId);
        socket.emit('all_notifications_marked_read');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        socket.emit('error', { message: 'Không thể đánh dấu tất cả thông báo' });
      }
    });

    // Get unread count
    socket.on('get_unread_count', async () => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }
        const count = await NotificationService.getUnreadCount(socket.userId);
        socket.emit('unread_count', { count });
      } catch (error) {
        console.error('Error getting unread count:', error);
        socket.emit('error', { message: 'Không thể lấy số thông báo chưa đọc' });
      }
    });

    // Ping/Pong for connection check
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
}

module.exports = setupSocketHandlers;

import React, { useContext, useState, useRef, useEffect } from 'react';
import { Badge, Button, Empty, Space, Divider, message, Popover } from 'antd';
import { BellOutlined, DeleteOutlined, CheckOutlined, ClearOutlined } from '@ant-design/icons';
import { NotificationContext } from '../context/NotificationContext';
import '../styles/NotificationBell.css';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useContext(NotificationContext);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    message.success('Đánh dấu tất cả thông báo đã đọc');
  };

  const handleDeleteAll = () => {
    deleteAllNotifications();
    message.success('Xóa tất cả thông báo');
  };

  const notificationContent = (
    <div className="notification-popover-content">
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-title">{notification.title}</span>
                  {!notification.is_read && <span className="unread-dot"></span>}
                </div>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => handleDeleteNotification(e, notification.notification_id)}
                style={{ marginLeft: 8, flexShrink: 0 }}
              />
            </div>
          ))
        ) : (
          <Empty description="Không có thông báo" style={{ margin: '20px 0' }} />
        )}
      </div>

      {/* Notification footer */}
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ width: '100%', justifyContent: 'space-between', padding: '0 12px' }}>
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả
            </Button>
            <Button
              type="text"
              danger
              size="small"
              icon={<ClearOutlined />}
              onClick={handleDeleteAll}
            >
              Xóa tất cả
            </Button>
          </Space>
        </>
      )}
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      title="Thông báo"
      placement="bottomRight"
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      overlayClassName="notification-popover"
    >
      <div className="notification-bell-container" ref={popoverRef}>
        <Badge
          count={unreadCount}
          style={{
            backgroundColor: unreadCount > 0 ? '#ff4d4f' : '#d9d9d9',
            color: '#fff'
          }}
        >
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            className={`notification-bell ${isConnected ? 'connected' : 'disconnected'}`}
            aria-label={unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo chưa đọc'}
          />
        </Badge>
      </div>
    </Popover>
  );
};

export default NotificationBell;

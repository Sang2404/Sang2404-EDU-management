import React from 'react';
import { Modal, Button, Tag } from 'antd';

const UserDetailModal = ({ user, visible, onClose, onEdit }) => {
  // Generate avatar color from name
  const getAvatarColor = (name) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a', '#eb2f96'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <Modal
      title="Thông tin người dùng"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} aria-label="Đóng cửa sổ thông tin người dùng">
          Đóng
        </Button>,
        <Button key="edit" type="primary" onClick={() => {
          onClose();
          onEdit(user);
        }} aria-label={`Chỉnh sửa thông tin người dùng ${user.full_name}`}>
          Chỉnh sửa
        </Button>
      ]}
      width={500}
      aria-labelledby="user-detail-modal-title"
    >
      <div style={{ textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: getAvatarColor(user.full_name),
          color: 'white',
          fontSize: 36,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        aria-label={`Avatar của ${user.full_name}`}
        role="img"
        >
          {getInitials(user.full_name)}
        </div>

        {/* User Info */}
        <div style={{ textAlign: 'left', marginTop: 24 }}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Họ và tên</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{user.full_name}</div>
          </div>

          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 14 }}>{user.email}</div>
          </div>

          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Mã người dùng</div>
            <div style={{ fontSize: 14 }}>{user.username}</div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Vai trò</div>
              <Tag color={
                user.role === 'ADMIN' ? 'red' :
                user.role === 'LECTURER' ? 'green' : 'blue'
              }
              aria-label={
                user.role === 'ADMIN' ? 'Vai trò: Quản trị viên' :
                user.role === 'LECTURER' ? 'Vai trò: Giảng viên' : 'Vai trò: Sinh viên'
              }
              >
                {user.role === 'ADMIN' ? 'Quản trị viên' :
                 user.role === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
              </Tag>
            </div>

            <div style={{ flex: 1, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Trạng thái</div>
              <Tag color={user.is_active ? 'success' : 'error'} aria-label={user.is_active ? 'Trạng thái: Đang hoạt động' : 'Trạng thái: Đã khóa'}>
                {user.is_active ? 'Đang hoạt động' : 'Đã khóa'}
              </Tag>
            </div>
          </div>

          {user.created_at && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Ngày tạo</div>
              <div style={{ fontSize: 14 }}>
                {new Date(user.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;

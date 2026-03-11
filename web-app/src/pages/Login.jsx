import React from 'react';
import { Button, Card, Typography, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const token = await result.user.getIdToken();
      
      // Gọi Backend để xác thực và lấy vai trò (role)
      const response = await api.post('/auth/login', { token });
      
      const { user, message: msg } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      message.success(`Chào mừng trở lại, ${user.full_name}!`);
      
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'LECTURER') {
        navigate('/lecturer/schedule');
      } else {
        navigate('/student/schedule');
      }

    } catch (error) {
      if (error.response) {
        // Hiển thị lỗi chi tiết từ backend
        const ignored = message.error(`Đăng nhập thất bại: ${error.response.data.error || error.response.data.message}`);
      } else {
        message.error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Title level={2}>Quản lý Sinh viên</Title>
        <Text type="secondary">Đăng nhập để truy cập hệ thống</Text>
        <br /><br />
        <Button 
          type="primary" 
          icon={<GoogleOutlined />} 
          size="large" 
          onClick={handleGoogleLogin} 
          block
        >
          Đăng nhập bằng Google
        </Button>
      </Card>
    </div>
  );
};

export default Login;

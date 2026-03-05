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
      console.log('🚀 Bắt đầu đăng nhập Google...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Đăng nhập Google thành công');
      console.log('📧 Email:', result.user.email);
      
      const token = await result.user.getIdToken();
      console.log('🔑 Token đã lấy được (50 ký tự đầu):', token.substring(0, 50) + '...');
      
      // Gọi Backend để xác thực và lấy vai trò (role)
      console.log('📡 Đang gửi request đến backend...');
      const response = await api.post('/auth/login', { token });
      console.log('✅ Backend response:', response.data);
      
      const { user, message: msg } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      message.success(`Chào mừng trở lại, ${user.full_name}!`);
      
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'LECTURER') {
        navigate('/lecturer/my-sections');
      } else {
        navigate('/student/schedule');
      }

    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      if (error.response) {
        // Hiển thị lỗi chi tiết từ backend
        console.error('📛 Response data:', error.response.data);
        console.error('📛 Status:', error.response.status);
        const ignored = message.error(`Đăng nhập thất bại: ${error.response.data.error || error.response.data.message}`);
      } else {
        console.error('📛 Error message:', error.message);
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

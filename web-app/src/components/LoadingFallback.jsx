import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingFallback = ({ message = 'Đang tải...' }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Spin indicator={antIcon} size="large" />
      <p style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingFallback;

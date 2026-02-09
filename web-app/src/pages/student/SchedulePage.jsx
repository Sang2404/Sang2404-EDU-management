import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SchedulePage = () => {
  return (
    <div>
      <Title level={2}>
        <CalendarOutlined /> Lịch học của tôi
      </Title>
      <Card>
        <Empty 
          description="Tính năng đang được phát triển"
          style={{ padding: '50px 0' }}
        />
      </Card>
    </div>
  );
};

export default SchedulePage;

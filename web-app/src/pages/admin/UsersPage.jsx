import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Card, Button } from 'antd';
import api from '../../config/axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchUsers = async (page = 1, role = '') => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: {
          page,
          limit: pagination.pageSize,
          role: role || undefined
        }
      });
      const { users, totalUsers } = response.data;
      setUsers(users);
      setPagination(prev => ({ ...prev, current: page, total: totalUsers }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, roleFilter);
  }, [roleFilter]);

  const handleTableChange = (newPagination) => {
    fetchUsers(newPagination.current, roleFilter);
  };

  const columns = [
    {
      title: 'Họ và Tên',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'geekblue';
        let text = role;
        if (role === 'ADMIN') { color = 'red'; text = 'Quản trị viên'; }
        if (role === 'LECTURER') { color = 'green'; text = 'Giảng viên'; }
        if (role === 'STUDENT') { color = 'blue'; text = 'Sinh viên'; }
        return (
          <Tag color={color} key={role}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  return (
    <Card 
      title="Danh sách Người dùng" 
      extra={
        <Select 
          defaultValue="" 
          style={{ width: 150 }} 
          onChange={(value) => setRoleFilter(value)}
          options={[
            { value: '', label: 'Tất cả vai trò' },
            { value: 'STUDENT', label: 'Sinh viên' },
            { value: 'LECTURER', label: 'Giảng viên' },
            { value: 'ADMIN', label: 'Quản trị viên' },
          ]}
        />
      }
    >
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="user_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default UsersPage;

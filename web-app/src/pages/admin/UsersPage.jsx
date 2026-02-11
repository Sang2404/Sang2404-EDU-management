import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Card, Button, Modal, Form, Input, message, Space, Popconfirm, Switch, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../../config/axios';
import { showImportResults } from '../../utils/importResultModal.jsx';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

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
      message.error('Không thể tải danh sách người dùng');
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

  // Open modal for adding new user
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open modal for editing user
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active
    });
    setIsModalVisible(true);
  };

  // Handle form submission (Add or Edit)
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update existing user
        await api.put(`/users/${editingUser.user_id}`, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        // Create new user
        await api.post('/users', values);
        message.success('Thêm người dùng thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(pagination.current, roleFilter);
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error(error.response?.data?.error || 'Không thể lưu người dùng');
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      message.success('Xóa người dùng thành công');
      fetchUsers(pagination.current, roleFilter);
    } catch (error) {
      console.error('Failed to delete user:', error);
      message.error(error.response?.data?.error || 'Không thể xóa người dùng');
    }
  };

  // Toggle user active status (Lock/Unlock)
  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.user_id}`, {
        is_active: !user.is_active
      });
      message.success(user.is_active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      fetchUsers(pagination.current, roleFilter);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      message.error('Không thể thay đổi trạng thái tài khoản');
    }
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const template = [
      {
        email: 'example@gmail.com',
        username: '2224802010365',
        full_name: 'Nguyễn Văn A',
        role: 'STUDENT',
        is_active: true
      },
      {
        email: 'lecturer@gmail.com',
        username: 'GV001',
        full_name: 'Trần Thị B',
        role: 'LECTURER',
        is_active: true
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // email
      { wch: 15 }, // username
      { wch: 20 }, // full_name
      { wch: 10 }, // role
      { wch: 10 }  // is_active
    ];
    
    XLSX.writeFile(wb, 'users_template.xlsx');
    message.success('Đã tải xuống file mẫu');
  };

  // Handle Excel file upload
  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        setImportLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          message.error('File Excel không có dữ liệu');
          setImportLoading(false);
          return;
        }
        
        // Send to backend
        const response = await api.post('/admin/import/users', { users: jsonData });
        
        const { results } = response.data;
        
        // Show results
        const modalShown = showImportResults(results, 'người dùng');
        if (!modalShown) {
          message.success(`Nhập thành công ${results.success.length} người dùng`);
        }
        
        setImportModalVisible(false);
        fetchUsers(pagination.current, roleFilter);
        
      } catch (error) {
        console.error('Error importing Excel:', error);
        message.error(error.response?.data?.error || 'Không thể nhập dữ liệu từ Excel');
      } finally {
        setImportLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
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
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title={record.is_active ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"}
            onConfirm={() => handleToggleActive(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
              danger={record.is_active}
            >
              {record.is_active ? 'Khóa' : 'Mở'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.user_id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card 
        title="Danh sách Người dùng" 
        extra={
          <Space>
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
            <Button 
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              Nhập Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm người dùng
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="user_id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="example@gmail.com" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="username"
            label="Mã người dùng (MSSV/Mã GV)"
            rules={[{ required: true, message: 'Vui lòng nhập mã người dùng' }]}
          >
            <Input placeholder="212480201 hoặc GV001" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { value: 'STUDENT', label: 'Sinh viên' },
                { value: 'LECTURER', label: 'Giảng viên' },
                { value: 'ADMIN', label: 'Quản trị viên' },
              ]}
            />
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="is_active"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Đã khóa" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        title="Nhập người dùng từ Excel"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <p>Tải xuống file mẫu để xem định dạng dữ liệu:</p>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
            >
              Tải file mẫu
            </Button>
          </div>
          
          <div>
            <p>Cấu trúc file Excel:</p>
            <ul>
              <li><strong>email</strong>: Email người dùng (bắt buộc)</li>
              <li><strong>username</strong>: Mã sinh viên/giảng viên (bắt buộc)</li>
              <li><strong>full_name</strong>: Họ và tên (bắt buộc)</li>
              <li><strong>role</strong>: STUDENT, LECTURER hoặc ADMIN (bắt buộc)</li>
              <li><strong>is_active</strong>: true hoặc false (mặc định: true)</li>
            </ul>
          </div>
          
          <div>
            <p>Chọn file Excel để nhập:</p>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleExcelUpload}
              showUploadList={false}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={importLoading}
                type="primary"
              >
                {importLoading ? 'Đang xử lý...' : 'Chọn file Excel'}
              </Button>
            </Upload>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default UsersPage;

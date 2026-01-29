import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Card, message, Space, Popconfirm, Drawer, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const FacultiesPage = () => {
  // --- STATE CHO KHOA (FACULTIES) ---
  const [faculties, setFaculties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- STATE CHO NGÀNH (MAJORS) ---
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [majors, setMajors] = useState([]);
  const [majorForm] = Form.useForm();
  const [editingMajor, setEditingMajor] = useState(null);

  // --- API CALLS: KHOA ---
  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/faculties');
      setFaculties(res.data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách Khoa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleCreateOrUpdateFaculty = async (values) => {
    try {
      if (editingFaculty) {
        await api.put(`/academic/faculties/${editingFaculty.faculty_id}`, values);
        message.success('Cập nhật Khoa thành công');
      } else {
        await api.post('/academic/faculties', values);
        message.success('Tạo Khoa mới thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingFaculty(null);
      fetchFaculties();
    } catch (error) {
      message.error(editingFaculty ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
    }
  };

  const handleDeleteFaculty = async (id) => {
    try {
      await api.delete(`/academic/faculties/${id}`);
      message.success('Xóa Khoa thành công');
      fetchFaculties();
    } catch (error) {
      if (error.response && error.response.status === 500) {
         message.error('Không thể xóa Khoa này (Có thể đang chứa Ngành học)');
      } else {
         message.error('Xóa thất bại');
      }
    }
  };

  const openEditModal = (record) => {
    setEditingFaculty(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
    form.resetFields();
  };

  // --- API CALLS: NGÀNH ---
  const fetchMajors = async (facultyId) => {
    try {
      const res = await api.get(`/academic/faculties/${facultyId}/majors`);
      setMajors(res.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách Ngành');
    }
  };

  const openMajorsDrawer = (faculty) => {
    setSelectedFaculty(faculty);
    fetchMajors(faculty.faculty_id);
    setOpenDrawer(true);
  };

  const handleSaveMajor = async (values) => {
    try {
      if (editingMajor) {
        await api.put(`/academic/majors/${editingMajor.major_id}`, values);
        message.success('Cập nhật Ngành thành công');
      } else {
        await api.post('/academic/majors', { ...values, faculty_id: selectedFaculty.faculty_id });
        message.success('Thêm Ngành mới thành công');
      }
      majorForm.resetFields();
      setEditingMajor(null);
      fetchMajors(selectedFaculty.faculty_id);
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleDeleteMajor = async (id) => {
    try {
      await api.delete(`/academic/majors/${id}`);
      message.success('Xóa Ngành thành công');
      fetchMajors(selectedFaculty.faculty_id);
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const handleCancelMajorEdit = () => {
    setEditingMajor(null);
    majorForm.resetFields();
  }

  const handleEditMajor = (record) => {
    setEditingMajor(record);
    majorForm.setFieldsValue(record);
  };

  // --- COLUMNS ---
  const facultyColumns = [
    { title: 'Mã Khoa', dataIndex: 'faculty_id', key: 'faculty_id' },
    { title: 'Tên Khoa', dataIndex: 'faculty_name', key: 'faculty_name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<BookOutlined />} onClick={() => openMajorsDrawer(record)}>
            Ngành học
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Bạn có chắc muốn xóa Khoa này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteFaculty(record.faculty_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const majorColumns = [
    { title: 'Mã Ngành', dataIndex: 'major_id', key: 'major_id' },
    { title: 'Tên Ngành', dataIndex: 'major_name', key: 'major_name' },
    { title: 'Số Tín chỉ', dataIndex: 'total_credits', key: 'total_credits' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditMajor(record)} />
          <Popconfirm
            title="Xóa ngành này?"
            onConfirm={() => handleDeleteMajor(record.major_id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý Khoa"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm Khoa
        </Button>
      }
    >
      <Table 
        dataSource={faculties} 
        columns={facultyColumns} 
        rowKey="faculty_id" 
        loading={loading}
      />

      {/* MODAL THÊM / SỬA KHOA */}
      <Modal
        title={editingFaculty ? 'Cập nhật Khoa' : 'Thêm Khoa Mới'}
        open={isModalOpen}
        onCancel={handleCancelModal}
        onOk={() => form.submit()}
        okText={editingFaculty ? 'Lưu' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} onFinish={handleCreateOrUpdateFaculty} layout="vertical">
          <Form.Item
            name="faculty_id"
            label="Mã Khoa"
            rules={[{ required: true, message: 'Vui lòng nhập mã khoa!' }]}
          >
            <Input placeholder="VD: CNTT" disabled={!!editingFaculty} />
          </Form.Item>
          <Form.Item
            name="faculty_name"
            label="Tên Khoa"
            rules={[{ required: true, message: 'Vui lòng nhập tên khoa!' }]}
          >
            <Input placeholder="VD: Công nghệ Thông tin" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* DRAWER QUẢN LÝ NGÀNH */}
      <Drawer
        title={`Quản lý Ngành học - ${selectedFaculty?.faculty_name || ''}`}
        width={720}
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
      >
        <Card 
          title={editingMajor ? "Cập nhật Ngành" : "Thêm Ngành Mới"} 
          size="small" 
          style={{ marginBottom: 20 }}
          extra={editingMajor && <Button onClick={handleCancelMajorEdit}>Hủy chỉnh sửa</Button>}
        >
          <Form form={majorForm} onFinish={handleSaveMajor} layout="inline">
            <Form.Item
              name="major_id"
              rules={[{ required: true, message: 'Nhập mã ngành!' }]}
              style={{ width: 150 }}
            >
              <Input placeholder="Mã Ngành" disabled={!!editingMajor} />
            </Form.Item>
            <Form.Item
              name="major_name"
              rules={[{ required: true, message: 'Nhập tên ngành!' }]}
              style={{ width: 200 }}
            >
              <Input placeholder="Tên Ngành" />
            </Form.Item>
            <Form.Item
              name="total_credits"
              rules={[{ required: true, message: 'Credits?' }]}
              style={{ width: 100 }}
            >
              <InputNumber placeholder="Tín chỉ" min={0} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={editingMajor ? <EditOutlined /> : <PlusOutlined />}>
                {editingMajor ? 'Lưu' : 'Thêm'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Table
          dataSource={majors}
          columns={majorColumns}
          rowKey="major_id"
          pagination={false}
        />
      </Drawer>
    </Card>
  );
};

export default FacultiesPage;

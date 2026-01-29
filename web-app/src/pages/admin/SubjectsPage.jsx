import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Card, message, Space, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- API HELPER ---
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách Môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingSubject) {
        // Update
        await api.put(`/academic/subjects/${editingSubject.subject_id}`, values);
        message.success('Cập nhật Môn học thành công');
      } else {
        // Create
        await api.post('/academic/subjects', values);
        message.success('Tạo Môn học mới thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error(error);
      message.error(editingSubject ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/academic/subjects/${id}`);
      message.success('Xóa Môn học thành công');
      fetchSubjects();
    } catch (error) {
      console.error(error);
      message.error('Xóa thất bại (Có thể đang có Lớp học phần sử dụng môn này)');
    }
  };

  // --- MODAL CONTROLS ---
  const openCreateModal = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingSubject(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    form.resetFields();
  };

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: 'Mã Môn học',
      dataIndex: 'subject_id',
      key: 'subject_id',
      width: '15%',
    },
    {
      title: 'Tên Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: '30%',
    },
    {
      title: 'Số tín chỉ',
      dataIndex: 'credits',
      key: 'credits',
      width: '10%',
      render: (val) => <span style={{ fontWeight: 'bold' }}>{val}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xóa môn học này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.subject_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý Môn học (Subjects)"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm Môn học
        </Button>
      }
    >
      <Table 
        dataSource={subjects} 
        columns={columns} 
        rowKey="subject_id" 
        loading={loading}
        bordered
      />

      {/* MODAL FORM */}
      <Modal
        title={editingSubject ? "Cập nhật Môn học" : "Thêm Môn học mới"}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            name="subject_id"
            label="Mã Môn học"
            rules={[
              { required: true, message: 'Vui lòng nhập Mã môn học!' },
              { max: 20, message: 'Tối đa 20 ký tự' }
            ]}
          >
            <Input disabled={!!editingSubject} placeholder="VD: TIN01, GT1" />
          </Form.Item>

          <Form.Item
            name="subject_name"
            label="Tên Môn học"
            rules={[{ required: true, message: 'Vui lòng nhập Tên môn học!' }]}
          >
            <Input placeholder="VD: Nhập môn Lập trình" />
          </Form.Item>

          <Form.Item
            name="credits"
            label="Số tín chỉ"
            rules={[
              { required: true, message: 'Vui lòng nhập số tín chỉ!' },
              { type: 'number', min: 1, max: 20, message: 'Số tín chỉ không hợp lệ' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả / Đề cương"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={handleCancelModal} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingSubject ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SubjectsPage;

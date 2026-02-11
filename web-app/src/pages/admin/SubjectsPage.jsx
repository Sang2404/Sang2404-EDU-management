import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Card, message, Space, Popconfirm, InputNumber, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../../config/axios';
import { showImportResults } from '../../utils/importResultModal.jsx';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

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

  // Download Excel template
  const handleDownloadTemplate = () => {
    const template = [
      {
        subject_id: 'TIN01',
        subject_name: 'Nhập môn Lập trình',
        credits: 3,
        description: 'Môn học cơ bản về lập trình'
      },
      {
        subject_id: 'TOAN01',
        subject_name: 'Giải tích 1',
        credits: 4,
        description: 'Toán cao cấp A1'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
    
    ws['!cols'] = [
      { wch: 15 }, // subject_id
      { wch: 30 }, // subject_name
      { wch: 10 }, // credits
      { wch: 40 }  // description
    ];
    
    XLSX.writeFile(wb, 'subjects_template.xlsx');
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
        const response = await api.post('/admin/import/subjects', { subjects: jsonData });
        
        const { results } = response.data;
        
        // Show results
        const modalShown = showImportResults(results, 'môn học');
        if (!modalShown) {
          message.success(`Nhập thành công ${results.success.length} môn học`);
        }
        
        setImportModalVisible(false);
        fetchSubjects();
        
      } catch (error) {
        console.error('Error importing Excel:', error);
        message.error(error.response?.data?.error || 'Không thể nhập dữ liệu từ Excel');
      } finally {
        setImportLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
    return false;
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
        <Space>
          <Button 
            icon={<UploadOutlined />}
            onClick={() => setImportModalVisible(true)}
          >
            Nhập Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Thêm Môn học
          </Button>
        </Space>
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

      {/* Import Excel Modal */}
      <Modal
        title="Nhập môn học từ Excel"
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
              <li><strong>subject_id</strong>: Mã môn học (bắt buộc, tối đa 20 ký tự)</li>
              <li><strong>subject_name</strong>: Tên môn học (bắt buộc)</li>
              <li><strong>credits</strong>: Số tín chỉ (bắt buộc, từ 1-20)</li>
              <li><strong>description</strong>: Mô tả môn học (tùy chọn)</li>
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
    </Card>
  );
};

export default SubjectsPage;

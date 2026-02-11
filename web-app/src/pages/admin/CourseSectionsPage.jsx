import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Modal, Form, Input, Card, message, Space, 
  Popconfirm, Select, InputNumber, Switch, Tag, Upload 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../../config/axios';
import { showImportResults } from '../../utils/importResultModal.jsx';

const CourseSectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    semester: '',
    academic_year: '',
    subject_id: ''
  });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchSections();
    fetchSubjects();
    fetchLecturers();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.semester) params.semester = filters.semester;
      if (filters.academic_year) params.academic_year = filters.academic_year;
      if (filters.subject_id) params.subject_id = filters.subject_id;

      const res = await api.get('/academic/course-sections', { params });
      setSections(res.data);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách lớp học phần');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/academic/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'LECTURER' } });
      setLecturers(res.data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Apply filters
  useEffect(() => {
    fetchSections();
  }, [filters]);

  // Modal handlers
  const handleAdd = () => {
    setEditingSection(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      max_capacity: 40,
      is_locked: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingSection(record);
    form.setFieldsValue({
      subject_id: record.subject_id,
      lecturer_id: record.lecturer_id,
      semester: record.semester,
      academic_year: record.academic_year,
      section_code: record.section_code,
      max_capacity: record.max_capacity,
      room_default: record.room_default,
      is_locked: record.is_locked
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSection) {
        await api.put(`/academic/course-sections/${editingSection.section_id}`, values);
        message.success('Cập nhật lớp học phần thành công');
      } else {
        await api.post('/academic/course-sections', values);
        message.success('Tạo lớp học phần thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchSections();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.error || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (sectionId) => {
    try {
      await api.delete(`/academic/course-sections/${sectionId}`);
      message.success('Xóa lớp học phần thành công');
      fetchSections();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.error || 'Không thể xóa lớp học phần');
    }
  };

  const handleToggleLock = async (section) => {
    try {
      await api.put(`/academic/course-sections/${section.section_id}`, {
        is_locked: !section.is_locked
      });
      message.success(section.is_locked ? 'Đã mở khóa lớp' : 'Đã khóa lớp');
      fetchSections();
    } catch (error) {
      console.error(error);
      message.error('Không thể thay đổi trạng thái khóa');
    }
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const template = [
      {
        subject_id: 'TIN01',
        lecturer_id: 'GV001',
        semester: 'HK1',
        academic_year: '2024-2025',
        section_code: 'TIN01-01',
        max_capacity: 40,
        room_default: 'A101',
        is_locked: false
      },
      {
        subject_id: 'TOAN01',
        lecturer_id: 'GV002',
        semester: 'HK1',
        academic_year: '2024-2025',
        section_code: 'TOAN01-01',
        max_capacity: 50,
        room_default: 'B202',
        is_locked: false
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CourseSections');
    
    ws['!cols'] = [
      { wch: 12 }, // subject_id
      { wch: 12 }, // lecturer_id
      { wch: 10 }, // semester
      { wch: 15 }, // academic_year
      { wch: 15 }, // section_code
      { wch: 12 }, // max_capacity
      { wch: 12 }, // room_default
      { wch: 10 }  // is_locked
    ];
    
    XLSX.writeFile(wb, 'course_sections_template.xlsx');
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
        const response = await api.post('/admin/import/course-sections', { sections: jsonData });
        
        const { results } = response.data;
        
        // Show results
        const modalShown = showImportResults(results, 'lớp học phần');
        if (!modalShown) {
          message.success(`Nhập thành công ${results.success.length} lớp học phần`);
        }
        
        setImportModalVisible(false);
        fetchSections();
        
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

  // Table columns
  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'section_code',
      key: 'section_code',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 200,
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturer_name',
      key: 'lecturer_name',
      width: 150,
    },
    {
      title: 'Học kỳ',
      dataIndex: 'semester',
      key: 'semester',
      width: 80,
    },
    {
      title: 'Năm học',
      dataIndex: 'academic_year',
      key: 'academic_year',
      width: 100,
    },
    {
      title: 'Phòng',
      dataIndex: 'room_default',
      key: 'room_default',
      width: 80,
    },
    {
      title: 'Sĩ số',
      key: 'capacity',
      width: 100,
      render: (_, record) => (
        <span>
          <strong>{record.enrolled_count || 0}</strong> / {record.max_capacity}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_locked',
      key: 'is_locked',
      width: 100,
      render: (locked) => (
        <Tag color={locked ? 'red' : 'green'}>
          {locked ? 'Đã khóa' : 'Mở'}
        </Tag>
      ),
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
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title={record.is_locked ? "Mở khóa lớp này?" : "Khóa lớp này?"}
            description={record.is_locked ? "Sinh viên có thể đăng ký sau khi mở" : "Sinh viên không thể đăng ký"}
            onConfirm={() => handleToggleLock(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              size="small"
              icon={record.is_locked ? <UnlockOutlined /> : <LockOutlined />}
              danger={!record.is_locked}
            >
              {record.is_locked ? 'Mở' : 'Khóa'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa lớp học phần này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.section_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              size="small"
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
        title="Quản lý Lớp học phần"
        extra={
          <Space>
            <Select
              placeholder="Học kỳ"
              style={{ width: 100 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, semester: value || '' })}
              options={[
                { value: 'HK1', label: 'HK1' },
                { value: 'HK2', label: 'HK2' },
                { value: 'HK3', label: 'HK3' },
              ]}
            />
            <Input
              placeholder="Năm học (VD: 2024-2025)"
              style={{ width: 180 }}
              allowClear
              onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
            />
            <Select
              placeholder="Môn học"
              style={{ width: 200 }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => setFilters({ ...filters, subject_id: value || '' })}
              options={subjects.map(s => ({ value: s.subject_id, label: s.subject_name }))}
            />
            <Button 
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              Nhập Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Mở lớp mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={sections}
          rowKey="section_id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSection ? 'Chỉnh sửa lớp học phần' : 'Mở lớp học phần mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
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
            name="subject_id"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              placeholder="Chọn môn học"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={subjects.map(s => ({
                value: s.subject_id,
                label: `${s.subject_id} - ${s.subject_name}`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="lecturer_id"
            label="Giảng viên"
            rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={lecturers.map(l => ({
                value: l.username,
                label: l.full_name
              }))}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="semester"
              label="Học kỳ"
              rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
              style={{ width: 150 }}
            >
              <Select
                placeholder="Chọn học kỳ"
                options={[
                  { value: 'HK1', label: 'Học kỳ 1' },
                  { value: 'HK2', label: 'Học kỳ 2' },
                  { value: 'HK3', label: 'Học kỳ 3 (Hè)' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="academic_year"
              label="Năm học"
              rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
              style={{ width: 180 }}
            >
              <Input placeholder="VD: 2024-2025" />
            </Form.Item>
          </Space>

          <Form.Item
            name="section_code"
            label="Mã lớp học phần"
            rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}
          >
            <Input placeholder="VD: WEB-01, DB-02" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="max_capacity"
              label="Sĩ số tối đa"
              rules={[
                { required: true, message: 'Vui lòng nhập sĩ số' },
                { type: 'number', min: 1, message: 'Sĩ số phải lớn hơn 0' }
              ]}
              style={{ width: 150 }}
            >
              <InputNumber placeholder="40" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="room_default"
              label="Phòng học"
              style={{ width: 150 }}
            >
              <Input placeholder="VD: A101" />
            </Form.Item>
          </Space>

          <Form.Item
            name="is_locked"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Đã khóa"
              unCheckedChildren="Mở"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSection ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        title="Nhập lớp học phần từ Excel"
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
              <li><strong>subject_id</strong>: Mã môn học (bắt buộc, phải tồn tại)</li>
              <li><strong>lecturer_id</strong>: Mã giảng viên (bắt buộc, phải tồn tại)</li>
              <li><strong>semester</strong>: Học kỳ - HK1, HK2, HK3 (bắt buộc)</li>
              <li><strong>academic_year</strong>: Năm học VD: 2024-2025 (bắt buộc)</li>
              <li><strong>section_code</strong>: Mã lớp (bắt buộc, không trùng)</li>
              <li><strong>max_capacity</strong>: Sĩ số tối đa (bắt buộc)</li>
              <li><strong>room_default</strong>: Phòng học (tùy chọn)</li>
              <li><strong>is_locked</strong>: true/false (mặc định: false)</li>
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

export default CourseSectionsPage;

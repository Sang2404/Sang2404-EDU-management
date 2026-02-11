import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Input,
  message, 
  Popconfirm,
  Tag,
  Space,
  Upload
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from '../../config/axios';
import { showImportResults } from '../../utils/importResultModal.jsx';

const { Option } = Select;

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  // Filter states
  const [filterSectionId, setFilterSectionId] = useState(null);
  
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    fetchCourseSections();
    fetchSchedules();
  }, []);

  const fetchCourseSections = async () => {
    try {
      const response = await axios.get('/academic/course-sections');
      setCourseSections(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học phần');
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Fetch all schedules by getting schedules for each section
      const response = await axios.get('/academic/course-sections');
      const sections = response.data;
      
      const allSchedules = [];
      for (const section of sections) {
        try {
          const scheduleResponse = await axios.get(`/academic/course-sections/${section.section_id}/schedules`);
          const schedulesWithSection = scheduleResponse.data.map(schedule => ({
            ...schedule,
            section_code: section.section_code,
            subject_name: section.subject_name,
            lecturer_name: section.lecturer_name,
            semester: section.semester,
            academic_year: section.academic_year
          }));
          allSchedules.push(...schedulesWithSection);
        } catch (err) {
          // Section might not have schedules yet
        }
      }
      
      setSchedules(allSchedules);
    } catch (error) {
      message.error('Không thể tải danh sách lịch học');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSchedule(record);
    form.setFieldsValue({
      section_id: record.section_id,
      day_of_week: record.day_of_week,
      start_period: record.start_period,
      end_period: record.end_period,
      room: record.room
    });
    setModalVisible(true);
  };

  const handleDelete = async (scheduleId) => {
    try {
      await axios.delete(`/academic/schedules/${scheduleId}`);
      message.success('Xóa lịch học thành công');
      fetchSchedules();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể xóa lịch học');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSchedule) {
        await axios.put(`/academic/schedules/${editingSchedule.schedule_id}`, values);
        message.success('Cập nhật lịch học thành công');
      } else {
        await axios.post('/academic/schedules', values);
        message.success('Tạo lịch học thành công');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const getDayColor = (dayOfWeek) => {
    const colors = {
      2: 'blue',
      3: 'green',
      4: 'orange',
      5: 'purple',
      6: 'cyan',
      7: 'magenta',
      8: 'red'
    };
    return colors[dayOfWeek] || 'default';
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const template = [
      {
        section_code: 'TIN01-01',
        day_of_week: 2,
        start_period: 1,
        end_period: 3,
        room: 'A101'
      },
      {
        section_code: 'TIN01-01',
        day_of_week: 4,
        start_period: 7,
        end_period: 9,
        room: 'A101'
      },
      {
        section_code: 'TOAN01-01',
        day_of_week: 3,
        start_period: 4,
        end_period: 6,
        room: 'B202'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedules');
    
    ws['!cols'] = [
      { wch: 15 }, // section_code
      { wch: 12 }, // day_of_week
      { wch: 12 }, // start_period
      { wch: 12 }, // end_period
      { wch: 12 }  // room
    ];
    
    XLSX.writeFile(wb, 'schedules_template.xlsx');
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
        const response = await axios.post('/admin/import/schedules', { schedules: jsonData });
        
        const { results } = response.data;
        
        // Show results
        const modalShown = showImportResults(results, 'lịch học');
        if (!modalShown) {
          message.success(`Nhập thành công ${results.success.length} lịch học`);
        }
        
        setImportModalVisible(false);
        fetchSchedules();
        
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

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'section_code',
      key: 'section_code',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 200
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturer_name',
      key: 'lecturer_name',
      width: 150
    },
    {
      title: 'Học kỳ',
      key: 'semester_year',
      width: 150,
      render: (_, record) => `${record.semester} - ${record.academic_year}`
    },
    {
      title: 'Thứ',
      dataIndex: 'day_name',
      key: 'day_name',
      width: 100,
      render: (text, record) => (
        <Tag color={getDayColor(record.day_of_week)}>{text}</Tag>
      )
    },
    {
      title: 'Tiết',
      key: 'periods',
      width: 100,
      render: (_, record) => `${record.start_period} - ${record.end_period}`
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
      width: 100,
      render: (text) => text || <span style={{ color: '#999' }}>Chưa xác định</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa lịch học này?"
            onConfirm={() => handleDelete(record.schedule_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Filter schedules
  const filteredSchedules = filterSectionId 
    ? schedules.filter(s => s.section_id === filterSectionId)
    : schedules;

  return (
    <Card 
      title={
        <Space>
          <CalendarOutlined />
          <span>Quản lý Lịch học</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<UploadOutlined />}
            onClick={() => setImportModalVisible(true)}
          >
            Nhập Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm lịch học
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>Lọc theo lớp:</span>
          <Select
            style={{ width: 300 }}
            placeholder="Chọn lớp học phần"
            allowClear
            showSearch
            optionFilterProp="children"
            value={filterSectionId}
            onChange={setFilterSectionId}
          >
            {courseSections.map(section => (
              <Option key={section.section_id} value={section.section_id}>
                {section.section_code} - {section.subject_name} ({section.semester} - {section.academic_year})
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSchedules}
        rowKey="schedule_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng số ${total} lịch học`
        }}
      />

      <Modal
        title={editingSchedule ? 'Sửa lịch học' : 'Thêm lịch học'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingSchedule ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="section_id"
            label="Lớp học phần"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học phần' }]}
          >
            <Select
              placeholder="Chọn lớp học phần"
              showSearch
              optionFilterProp="children"
              disabled={!!editingSchedule}
            >
              {courseSections.map(section => (
                <Option key={section.section_id} value={section.section_id}>
                  {section.section_code} - {section.subject_name} ({section.semester} - {section.academic_year})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="day_of_week"
            label="Thứ"
            rules={[{ required: true, message: 'Vui lòng chọn thứ' }]}
          >
            <Select placeholder="Chọn thứ">
              <Option value={2}>Thứ 2</Option>
              <Option value={3}>Thứ 3</Option>
              <Option value={4}>Thứ 4</Option>
              <Option value={5}>Thứ 5</Option>
              <Option value={6}>Thứ 6</Option>
              <Option value={7}>Thứ 7</Option>
              <Option value={8}>Chủ nhật</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="start_period"
            label="Tiết bắt đầu"
            rules={[
              { required: true, message: 'Vui lòng nhập tiết bắt đầu' },
              { type: 'number', min: 1, max: 15, message: 'Tiết phải từ 1 đến 15' }
            ]}
          >
            <InputNumber 
              placeholder="Nhập tiết bắt đầu (1-15)" 
              style={{ width: '100%' }}
              min={1}
              max={15}
            />
          </Form.Item>

          <Form.Item
            name="end_period"
            label="Tiết kết thúc"
            rules={[
              { required: true, message: 'Vui lòng nhập tiết kết thúc' },
              { type: 'number', min: 1, max: 15, message: 'Tiết phải từ 1 đến 15' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('start_period') < value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Tiết kết thúc phải lớn hơn tiết bắt đầu'));
                },
              })
            ]}
          >
            <InputNumber 
              placeholder="Nhập tiết kết thúc (1-15)" 
              style={{ width: '100%' }}
              min={1}
              max={15}
            />
          </Form.Item>

          <Form.Item
            name="room"
            label="Phòng học"
          >
            <Input placeholder="Nhập phòng học (VD: A101, B205)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        title="Nhập lịch học từ Excel"
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
              <li><strong>section_code</strong>: Mã lớp học phần (bắt buộc, phải tồn tại)</li>
              <li><strong>day_of_week</strong>: Thứ từ 2-8 (8 là Chủ nhật) (bắt buộc)</li>
              <li><strong>start_period</strong>: Tiết bắt đầu từ 1-15 (bắt buộc)</li>
              <li><strong>end_period</strong>: Tiết kết thúc từ 1-15 (bắt buộc)</li>
              <li><strong>room</strong>: Phòng học (tùy chọn)</li>
            </ul>
            <p style={{ color: '#ff4d4f', marginTop: 8 }}>
              <strong>Lưu ý:</strong> Tiết kết thúc phải lớn hơn tiết bắt đầu. Hệ thống sẽ kiểm tra trùng lịch.
            </p>
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

export default SchedulesPage;

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
  Space
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from '../../config/axios';

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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm lịch học
        </Button>
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
    </Card>
  );
};

export default SchedulesPage;

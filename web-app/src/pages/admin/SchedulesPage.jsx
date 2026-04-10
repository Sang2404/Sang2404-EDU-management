import { useState, useEffect } from 'react';
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
  Empty
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../../config/axios';

const { Option } = Select;

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // Loading cho các thao tác
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [filters, setFilters] = useState({
    semester: 'HK2',
    academic_year: '2025-2026'
  });

  useEffect(() => {
    fetchCourseSections();
    fetchSchedules();
  }, [filters]);

  const fetchCourseSections = async () => {
    try {
      const response = await axios.get('/academic/course-sections', {
        params: filters
      });
      setCourseSections(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học phần');
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching schedules with filters:', filters);

      // 🚀 Sử dụng fast-schedules API mới
      const response = await axios.get('/fast-schedules', {
        params: filters
      });

      const scheduleData = response.data.data || [];
      console.log(`📊 Received ${scheduleData.length} schedules from API`);

      setSchedules(scheduleData);

      // Log performance
      if (response.data.performance) {
        console.log(`⚡ Schedules loaded in ${response.data.performance.duration}ms`);
      }
    } catch (error) {
      message.error('Không thể tải lịch học');
      console.error('Fetch schedules error:', error);
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
      room: record.room,
      week: record.week
    });
    setModalVisible(true);
  };

  // 🚀 Ultra-fast delete với better error handling
  const handleDelete = (scheduleId) => {
    // Tìm schedule để hiển thị thông tin chi tiết
    const scheduleToDelete = schedules.find(s => s.schedule_id === scheduleId);

    if (!scheduleToDelete) {
      message.error('Không tìm thấy lịch học để xóa');
      return;
    }

    const scheduleInfo = `${scheduleToDelete.section_code} - ${scheduleToDelete.subject_name} (Tuần ${scheduleToDelete.week})`;

    // Immediate UI update
    setSchedules(prev => prev.filter(s => s.schedule_id !== scheduleId));
    message.success(`✅ Đang xóa: ${scheduleInfo}`, 2);
    // Background cleanup với fast API
    axios.delete(`/fast-schedules/${scheduleId}`)
      .then((response) => {
        console.log(`⚡ Delete completed in ${response.data.performance?.duration || 0}ms`);
        // Khôi phục lại message thành công (không dùng duration tự biến mất nữa vì nó chồng lấp)
        message.destroy();
        message.success(`🗑️ Xóa thành công: ${scheduleInfo}`);
        // KHÔNG fetch lại - đã update UI rồi
      })
      .catch((error) => {
        console.error('Delete error:', error);
        message.destroy();

        if (error.response?.status === 404) {
          // Schedule không tồn tại - có thể đã bị xóa rồi
          message.warning(`⚠️ Lịch học đã được xóa trước đó: ${scheduleInfo}`);
          // Không cần rollback vì schedule thực sự không còn
        } else {
          // Lỗi khác - rollback UI
          setSchedules(prev => [...prev, scheduleToDelete].sort((a, b) => a.schedule_id - b.schedule_id));
          message.error(`❌ Lỗi khi xóa ${scheduleInfo} - đã khôi phục`);
        }
      });
  };

  const handleSubmit = async (values) => {
    setActionLoading(true);
    try {
      if (editingSchedule) {
        // Optimistic update cho edit
        const updatedSchedule = { ...editingSchedule, ...values };
        setSchedules(prev => prev.map(s =>
          s.schedule_id === editingSchedule.schedule_id
            ? updatedSchedule
            : s
        ));

        const response = await axios.put(`/fast-schedules/${editingSchedule.schedule_id}`, values);
        message.success(`✅ Cập nhật thành công: ${editingSchedule.section_code}`);

        // Log performance
        if (response.data.performance) {
          console.log(`⚡ Update completed in ${response.data.performance.duration}ms`);
        }
      } else {
        // Tạo mới
        const response = await axios.post('/fast-schedules', values);
        message.success('✅ Tạo lịch học thành công');

        // Log performance
        if (response.data.performance) {
          console.log(`⚡ Create completed in ${response.data.performance.duration}ms`);
        }

        const newScheduleData = response.data.schedule;
        // Optimistic append cho create
        const selectedSection = courseSections.find(sec => sec.section_id === values.section_id);

        if (selectedSection) {
          const newSchedule = {
            ...newScheduleData,
            section_code: selectedSection.section_code,
            subject_name: selectedSection.subject_name,
            lecturer_name: selectedSection.lecturer_name
          };
          setSchedules(prev => [...prev, newSchedule].sort((a, b) => {
            if (a.week !== b.week) return a.week - b.week;
            if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
            return a.start_period - b.start_period;
          }));
        } else {
          // Fallback nếu không tìm thấy section (ít khi xảy ra)
          fetchSchedules();
        }
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (editingSchedule) {
        // Rollback optimistic update
        fetchSchedules();
      }
      message.error(error.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const getDayColor = (dayOfWeek) => {
    const colors = {
      2: 'blue', 3: 'green', 4: 'orange', 5: 'purple',
      6: 'cyan', 7: 'magenta', 8: 'red'
    };
    return colors[dayOfWeek] || 'default';
  };

  const getDayName = (dayOfWeek) => {
    const names = {
      2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5',
      6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ nhật'
    };
    return names[dayOfWeek] || '';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'schedule_id',
      key: 'schedule_id',
      width: 60,
      fixed: 'left'
    },
    {
      title: 'Mã lớp',
      dataIndex: 'section_code',
      key: 'section_code',
      width: 100,
      fixed: 'left'
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturer_name',
      key: 'lecturer_name',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Thứ',
      dataIndex: 'day_of_week',
      key: 'day_of_week',
      width: 80,
      render: (dayOfWeek) => (
        <Tag color={getDayColor(dayOfWeek)}>
          {getDayName(dayOfWeek)}
        </Tag>
      )
    },
    {
      title: 'Tiết',
      key: 'periods',
      width: 80,
      render: (_, record) => `${record.start_period}-${record.end_period}`
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
      width: 80,
      render: (text) => text || <span style={{ color: '#999' }}>-</span>
    },
    {
      title: 'Tuần',
      dataIndex: 'week',
      key: 'week',
      width: 60,
      render: (week) => week || '-'
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title={
              <div>
                <div>Xóa lịch học này?</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ID: {record.schedule_id} - {record.section_code}
                </div>
              </div>
            }
            onConfirm={() => handleDelete(record.schedule_id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, size: 'small' }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

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
            icon={<ReloadOutlined />}
            onClick={fetchSchedules}
            loading={loading}
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm lịch
          </Button>
        </Space>
      }
    >
      {/* Filters */}
      <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <Space wrap>
          <span><strong>Bộ lọc:</strong></span>
          <span>Năm học:</span>
          <Select
            value={filters.academic_year}
            style={{ width: 120 }}
            onChange={(value) => setFilters({ ...filters, academic_year: value })}
          >
            <Option value="2024-2025">2024-2025</Option>
            <Option value="2025-2026">2025-2026</Option>
            <Option value="2026-2027">2026-2027</Option>
          </Select>

          <span>Học kỳ:</span>
          <Select
            value={filters.semester}
            style={{ width: 100 }}
            onChange={(value) => setFilters({ ...filters, semester: value })}
          >
            <Option value="HK1">HK1</Option>
            <Option value="HK2">HK2</Option>
            <Option value="HK3">HK3</Option>
          </Select>

          <span style={{ color: '#666', fontSize: '12px' }}>
            📊 Hiển thị: {schedules.length} lịch học
          </span>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={schedules}
        rowKey="schedule_id"
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} lịch học`
        }}
        locale={{
          emptyText: <Empty description="Chưa có lịch học nào" />
        }}
        size="small"
      />

      {/* Modal */}
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
        width={500}
        confirmLoading={actionLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="section_id"
            label="Lớp học phần"
            rules={[{ required: true, message: 'Chọn lớp học phần' }]}
          >
            <Select
              placeholder="Chọn lớp học phần"
              showSearch
              optionFilterProp="children"
              disabled={!!editingSchedule}
            >
              {courseSections.map(section => (
                <Option key={section.section_id} value={section.section_id}>
                  {section.section_code} - {section.subject_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="day_of_week"
            label="Thứ"
            rules={[{ required: true, message: 'Chọn thứ' }]}
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

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="start_period"
              label="Tiết bắt đầu"
              rules={[{ required: true, message: 'Nhập tiết bắt đầu' }]}
              style={{ width: '50%' }}
            >
              <InputNumber
                placeholder="Tiết bắt đầu"
                min={1} max={15}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="end_period"
              label="Tiết kết thúc"
              rules={[
                { required: true, message: 'Nhập tiết kết thúc' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('start_period') < value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Tiết kết thúc > tiết bắt đầu'));
                  },
                })
              ]}
              style={{ width: '50%' }}
            >
              <InputNumber
                placeholder="Tiết kết thúc"
                min={1} max={15}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Space.Compact>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="room"
              label="Phòng học"
              style={{ width: '60%' }}
            >
              <Input placeholder="VD: A101, B205" />
            </Form.Item>

            <Form.Item
              name="week"
              label="Tuần"
              rules={[{ required: true, message: 'Chọn tuần' }]}
              style={{ width: '40%' }}
            >
              <InputNumber
                placeholder="Tuần"
                min={1} max={16}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Space.Compact>
        </Form>
      </Modal>
    </Card>
  );
};

export default SchedulesPage;
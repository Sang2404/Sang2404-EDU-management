import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Select,
  Space,
  Tag,
  Button,
  Modal,
  Descriptions,
  Statistic,
  Row,
  Col,
  message
} from 'antd';
import { 
  BookOutlined,
  EyeOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import axios from '../../config/axios';

const { Option } = Select;

const MySectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // Filters
  const [semester, setSemester] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);

  // Get current user (lecturer)
  const user = JSON.parse(localStorage.getItem('user'));
  const lecturerId = user?.username; // Sử dụng username thay vì user_id

  useEffect(() => {
    if (lecturerId) {
      fetchSections();
      fetchStatistics();
    }
  }, [lecturerId, semester, academicYear]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      let url = `/lecturers/${lecturerId}/sections`;
      const params = [];
      if (semester) params.push(`semester=${semester}`);
      if (academicYear) params.push(`academic_year=${academicYear}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await axios.get(url);
      setSections(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      let url = `/lecturers/${lecturerId}/statistics`;
      const params = [];
      if (semester) params.push(`semester=${semester}`);
      if (academicYear) params.push(`academic_year=${academicYear}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await axios.get(url);
      setStatistics(response.data);
    } catch (error) {
      // Silent error for statistics - not critical
    }
  };

  const handleViewDetails = async (section) => {
    try {
      const response = await axios.get(`/lecturers/${lecturerId}/sections/${section.section_id}`);
      setSelectedSection(response.data.section);
      setStudents(response.data.students || []);
      setSchedules(response.data.schedules || []);
      setDetailModalVisible(true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải chi tiết lớp học';
      message.error(errorMsg);
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
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 250
    },
    {
      title: 'Học kỳ',
      key: 'semester_year',
      width: 150,
      render: (_, record) => `${record.semester} - ${record.academic_year}`
    },
    {
      title: 'Sĩ số',
      key: 'enrollment',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span>
          <TeamOutlined /> {record.enrolled_count}/{record.max_capacity}
        </span>
      )
    },
    {
      title: 'Số buổi',
      key: 'schedule_count',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const scheduleCount = record.schedules?.length || 0;
        return <Tag color="blue">{scheduleCount} buổi</Tag>;
      }
    }
  ];

  const studentColumns = [
    {
      title: 'Mã SV',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 120
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 200
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250
    },
    {
      title: 'Lớp',
      dataIndex: 'class_name',
      key: 'class_name',
      width: 120,
      render: (text) => text || <span style={{ color: '#999' }}>Chưa có</span>
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Statistics Cards */}
        {statistics && (
          <>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tổng số lớp" 
                  value={statistics.statistics?.total_sections || 0}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tổng số sinh viên" 
                  value={statistics.statistics?.total_students || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Sĩ số trung bình" 
                  value={statistics.statistics?.average_class_size || 0}
                  precision={1}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Điểm trung bình" 
                  value={statistics.statistics?.grade_statistics?.average_grade || 0}
                  precision={2}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tỷ lệ đậu" 
                  value={statistics.statistics?.grade_statistics?.pass_rate || 0}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Tỷ lệ rớt" 
                  value={statistics.statistics?.grade_statistics?.fail_rate || 0}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Số sinh viên đậu" 
                  value={statistics.statistics?.grade_statistics?.passed || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Số sinh viên rớt" 
                  value={statistics.statistics?.grade_statistics?.failed || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Card 
        title={
          <Space>
            <BookOutlined />
            <span>Danh sách Lớp Giảng dạy</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>Lọc theo:</span>
            <Select
              style={{ width: 150 }}
              placeholder="Học kỳ"
              allowClear
              value={semester}
              onChange={setSemester}
            >
              <Option value="HK1">HK1</Option>
              <Option value="HK2">HK2</Option>
              <Option value="HK3">HK3</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Năm học"
              allowClear
              value={academicYear}
              onChange={setAcademicYear}
            >
              <Option value="2023-2024">2023-2024</Option>
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={sections}
          rowKey="section_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} lớp học`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          selectedSection ? (
            <span>
              Chi tiết lớp {selectedSection.section_code} - {selectedSection.subject_name}
            </span>
          ) : 'Chi tiết lớp học'
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedSection(null);
          setStudents([]);
          setSchedules([]);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
      >
        {selectedSection && (
          <div>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã lớp">{selectedSection.section_code}</Descriptions.Item>
              <Descriptions.Item label="Môn học">{selectedSection.subject_name}</Descriptions.Item>
              <Descriptions.Item label="Học kỳ">
                {selectedSection.semester} - {selectedSection.academic_year}
              </Descriptions.Item>
              <Descriptions.Item label="Sĩ số">
                {selectedSection.enrolled_count}/{selectedSection.max_capacity}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng mặc định" span={2}>
                {selectedSection.room_default || <span style={{ color: '#999' }}>Chưa xác định</span>}
              </Descriptions.Item>
            </Descriptions>

            {/* Schedules */}
            <Card 
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Lịch học</span>
                </Space>
              }
              size="small" 
              style={{ marginBottom: 16 }}
            >
              {schedules && schedules.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {schedules.map((schedule, index) => (
                    <div key={index} style={{ padding: '8px 0', borderBottom: index < schedules.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <Space>
                        <Tag color={getDayColor(schedule.day_of_week)}>
                          {schedule.day_name}
                        </Tag>
                        <span><strong>Tiết:</strong> {schedule.start_period} - {schedule.end_period}</span>
                        {schedule.room && <span><strong>Phòng:</strong> {schedule.room}</span>}
                      </Space>
                    </div>
                  ))}
                </Space>
              ) : (
                <p style={{ color: '#999', margin: 0 }}>Chưa có lịch học</p>
              )}
            </Card>

            {/* Students */}
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  <span>Danh sách sinh viên ({students.length})</span>
                </Space>
              }
              size="small"
            >
              <Table
                columns={studentColumns}
                dataSource={students}
                rowKey="student_id"
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MySectionsPage;

import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Empty, Spin, Select, Descriptions, Modal, List, Button } from 'antd';
import { BookOutlined, TeamOutlined, CalendarOutlined, EyeOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const { Option } = Select;

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, [semesterFilter, yearFilter]);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/academic/students/${user.username}/sections`);
      let coursesData = response.data || [];

      // Apply filters
      if (semesterFilter) {
        coursesData = coursesData.filter(c => c.semester === semesterFilter);
      }
      if (yearFilter) {
        coursesData = coursesData.filter(c => c.academic_year === yearFilter);
      }

      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setDetailModalVisible(true);
  };

  const getDayName = (dayOfWeek) => {
    const days = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      8: 'Chủ nhật'
    };
    return days[dayOfWeek] || '';
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

  // Group courses by semester
  const groupedCourses = {};
  courses.forEach(course => {
    const key = `${course.semester} - ${course.academic_year}`;
    if (!groupedCourses[key]) {
      groupedCourses[key] = [];
    }
    groupedCourses[key].push(course);
  });

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
      width: 250
    },
    {
      title: 'Tín chỉ',
      dataIndex: 'credits',
      key: 'credits',
      width: 80,
      align: 'center'
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturer_name',
      key: 'lecturer_name',
      width: 150
    },
    {
      title: 'Sĩ số',
      key: 'enrollment',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span>
          <TeamOutlined /> {record.enrolled_count}/{record.max_capacity}
        </span>
      )
    },
    {
      title: 'Lịch học',
      key: 'schedules',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.schedules && record.schedules.length > 0 ? (
            record.schedules.map((schedule, index) => (
              <div key={index}>
                <Tag color={getDayColor(schedule.day_of_week)}>
                  {getDayName(schedule.day_of_week)}
                </Tag>
                <span>Tiết {schedule.start_period}-{schedule.end_period}</span>
                {schedule.room && <span> - Phòng {schedule.room}</span>}
              </div>
            ))
          ) : (
            <span style={{ color: '#999' }}>Chưa xếp lịch</span>
          )}
        </Space>
      )
    },
    {
      title: 'Phòng',
      dataIndex: 'room_default',
      key: 'room_default',
      width: 100,
      render: (room) => room || <span style={{ color: '#999' }}>-</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  // Calculate statistics
  const totalCourses = courses.length;
  const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
  const uniqueSemesters = [...new Set(courses.map(c => `${c.semester} ${c.academic_year}`))].length;

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải danh sách lớp...</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <div>
            <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalCourses}</div>
              <div style={{ color: '#666' }}>Tổng số lớp</div>
            </div>
          </div>
          <div>
            <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalCredits}</div>
              <div style={{ color: '#666' }}>Tổng tín chỉ</div>
            </div>
          </div>
          <div>
            <CalendarOutlined style={{ fontSize: 24, color: '#722ed1' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{uniqueSemesters}</div>
              <div style={{ color: '#666' }}>Số học kỳ</div>
            </div>
          </div>
        </Space>
      </Card>

      {/* Courses Table */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>Danh sách lớp đã đăng ký</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="Học kỳ"
              style={{ width: 120 }}
              allowClear
              onChange={setSemesterFilter}
            >
              <Option value="HK1">HK1</Option>
              <Option value="HK2">HK2</Option>
              <Option value="HK3">HK3</Option>
            </Select>
            <Select
              placeholder="Năm học"
              style={{ width: 150 }}
              allowClear
              onChange={setYearFilter}
            >
              <Option value="2023-2024">2023-2024</Option>
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
            </Select>
          </Space>
        }
      >
        {courses.length === 0 ? (
          <Empty description="Chưa đăng ký lớp học phần nào" />
        ) : (
          <>
            {Object.keys(groupedCourses).map(semester => (
              <div key={semester} style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  backgroundColor: '#f0f5ff', 
                  padding: '8px 16px', 
                  borderLeft: '4px solid #1890ff',
                  marginBottom: 16
                }}>
                  {semester}
                </h3>
                <Table
                  columns={columns}
                  dataSource={groupedCourses[semester]}
                  rowKey="section_id"
                  pagination={false}
                  scroll={{ x: 1200 }}
                  size="small"
                />
                <div style={{ 
                  marginTop: 8, 
                  padding: '8px 16px', 
                  backgroundColor: '#fafafa',
                  textAlign: 'right'
                }}>
                  <strong>
                    Tổng tín chỉ học kỳ: {
                      groupedCourses[semester].reduce((sum, c) => sum + c.credits, 0)
                    }
                  </strong>
                </div>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          selectedCourse ? (
            <span>
              Chi tiết lớp {selectedCourse.section_code} - {selectedCourse.subject_name}
            </span>
          ) : 'Chi tiết lớp học'
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedCourse(null);
        }}
        footer={null}
        width={800}
      >
        {selectedCourse && (
          <div>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã lớp">{selectedCourse.section_code}</Descriptions.Item>
              <Descriptions.Item label="Mã môn">{selectedCourse.subject_id}</Descriptions.Item>
              <Descriptions.Item label="Tên môn học" span={2}>
                {selectedCourse.subject_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số tín chỉ">{selectedCourse.credits}</Descriptions.Item>
              <Descriptions.Item label="Giảng viên">{selectedCourse.lecturer_name}</Descriptions.Item>
              <Descriptions.Item label="Học kỳ">
                {selectedCourse.semester} - {selectedCourse.academic_year}
              </Descriptions.Item>
              <Descriptions.Item label="Sĩ số">
                {selectedCourse.enrolled_count}/{selectedCourse.max_capacity}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng mặc định" span={2}>
                {selectedCourse.room_default || <span style={{ color: '#999' }}>Chưa xác định</span>}
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
            >
              {selectedCourse.schedules && selectedCourse.schedules.length > 0 ? (
                <List
                  dataSource={selectedCourse.schedules}
                  renderItem={schedule => (
                    <List.Item>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color={getDayColor(schedule.day_of_week)}>
                            {getDayName(schedule.day_of_week)}
                          </Tag>
                          <span>
                            <ClockCircleOutlined /> Tiết {schedule.start_period} - {schedule.end_period}
                          </span>
                          {schedule.room && (
                            <span>
                              <EnvironmentOutlined /> Phòng {schedule.room}
                            </span>
                          )}
                        </Space>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Chưa có lịch học" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCoursesPage;

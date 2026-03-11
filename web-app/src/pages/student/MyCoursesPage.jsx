import { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Empty, Spin, Select, Modal, Button, message } from 'antd';
import { BookOutlined, TeamOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
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
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách môn học';
      message.error(errorMsg);
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
      width: 120
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 300
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
      width: 200
    },
    {
      title: 'Số buổi',
      key: 'enrollment',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const scheduleCount = record.schedules?.length || 0;
        return <Tag color="blue">{scheduleCount} buổi</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
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
            <span>Danh sách môn học</span>
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
          <Empty description="Chưa có môn học nào" />
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
                  size="small"
                />
                <div style={{ 
                  marginTop: 8, 
                  padding: '8px 16px', 
                  backgroundColor: '#fafafa',
                  textAlign: 'right'
                }}>
                  <strong>
                    Tổng TC học kỳ: {
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
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>
              {selectedCourse?.subject_name}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              Mã lớp: {selectedCourse?.section_code} • Giảng viên: {selectedCourse?.lecturer_name}
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedCourse(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedCourse && (
          <div>
            <div style={{ 
              padding: '12px 16px', 
              background: '#f5f5f5', 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: '#666' }}>Mã môn: </span>
                  <span style={{ fontWeight: 600 }}>{selectedCourse.subject_id}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Tín chỉ: </span>
                  <span style={{ fontWeight: 600 }}>{selectedCourse.credits}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Học kỳ: </span>
                  <span style={{ fontWeight: 600 }}>{selectedCourse.semester}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Năm học: </span>
                  <span style={{ fontWeight: 600 }}>{selectedCourse.academic_year}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              📅 Lịch học
            </div>

            {selectedCourse.schedules && selectedCourse.schedules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedCourse.schedules
                  .sort((a, b) => {
                    if (a.week && b.week) return a.week - b.week;
                    return a.day_of_week - b.day_of_week;
                  })
                  .map((schedule, index) => {
                    const getPeriodLabel = (start, end) => {
                      if (start >= 1 && end <= 5) return 'Sáng';
                      if (start >= 6 && end <= 10) return 'Chiều';
                      if (start >= 11 && end <= 15) return 'Tối';
                      return '';
                    };

                    return (
                      <div 
                        key={index}
                        style={{ 
                          padding: '12px 16px',
                          background: '#e6f4ff',
                          border: '1px solid #91caff',
                          borderRadius: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            {schedule.week && `Tuần ${schedule.week} • `}
                            {getDayName(schedule.day_of_week)}
                          </div>
                          <div style={{ fontSize: 13, color: '#666' }}>
                            {getPeriodLabel(schedule.start_period, schedule.end_period)} • 
                            Tiết {schedule.start_period} - {schedule.end_period}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '6px 12px',
                          background: '#fff',
                          borderRadius: 6,
                          fontWeight: 600,
                          color: '#1677ff'
                        }}>
                          Phòng {schedule.room || 'TBA'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <Empty description="Chưa có lịch học" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCoursesPage;

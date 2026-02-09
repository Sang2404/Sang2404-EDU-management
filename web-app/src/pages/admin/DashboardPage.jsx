import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  FileTextOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import api from '../../config/axios';

const { Title } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [gradeStats, setGradeStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview statistics
      const overviewRes = await api.get('/admin/statistics/overview');
      setOverview(overviewRes.data);
      
      // Fetch student statistics
      const studentRes = await api.get('/admin/statistics/students');
      setStudentStats(studentRes.data);
      
      // Fetch grade statistics
      const gradeRes = await api.get('/admin/statistics/grades');
      setGradeStats(gradeRes.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!overview) {
    return <div>Không có dữ liệu</div>;
  }

  // GPA distribution columns
  const gpaColumns = [
    {
      title: 'Phân loại',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Khoảng điểm',
      dataIndex: 'range',
      key: 'range',
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val) => `${val}%`,
    },
  ];

  // Grade distribution columns
  const gradeColumns = [
    {
      title: 'Điểm chữ',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Phân loại',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val) => `${val}%`,
    },
  ];

  return (
    <div>
      <Title level={2}>Tổng quan hệ thống</Title>
      
      {/* Overview Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={overview.users.total}
              prefix={<UserOutlined />}
              suffix={`/ ${overview.users.active} hoạt động`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sinh viên"
              value={overview.students.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giảng viên"
              value={overview.lecturers.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Môn học"
              value={overview.subjects.total}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Lớp học phần"
              value={overview.sections.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Lớp học phần hiện tại"
              value={overview.sections.current_semester}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.45)', marginBottom: 8 }}>
              Học kỳ hiện tại
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {overview.current_semester.semester} - {overview.current_semester.academic_year}
            </div>
          </Card>
        </Col>
      </Row>

      {/* User Role Distribution */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Phân bổ người dùng theo vai trò">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Admin"
                  value={overview.users.by_role.ADMIN}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Giảng viên"
                  value={overview.users.by_role.LECTURER}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Sinh viên"
                  value={overview.users.by_role.STUDENT}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Student Status Distribution */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Trạng thái sinh viên">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Đang học"
                  value={overview.students.by_status.STUDYING}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<RiseOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Bảo lưu"
                  value={overview.students.by_status.RESERVED}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Đã tốt nghiệp"
                  value={overview.students.by_status.GRADUATED}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Đã thôi học"
                  value={overview.students.by_status.DROPPED}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<FallOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* GPA Distribution */}
      {studentStats && studentStats.gpa_distribution && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Phân bổ GPA sinh viên">
              <Table
                dataSource={studentStats.gpa_distribution}
                columns={gpaColumns}
                pagination={false}
                rowKey="range"
                size="small"
              />
            </Card>
          </Col>

          {/* Grade Distribution */}
          {gradeStats && gradeStats.distribution && (
            <Col span={12}>
              <Card title="Phân bổ điểm chữ">
                <Table
                  dataSource={gradeStats.distribution}
                  columns={gradeColumns}
                  pagination={false}
                  rowKey="grade"
                  size="small"
                />
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Overall Grade Statistics */}
      {gradeStats && gradeStats.overall && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Thống kê điểm tổng thể">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Điểm trung bình"
                    value={gradeStats.overall.average_grade}
                    precision={2}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Tổng số điểm"
                    value={gradeStats.overall.total_grades}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Tỷ lệ đậu"
                    value={gradeStats.overall.pass_rate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Đậu / Rớt"
                    value={`${gradeStats.overall.total_passed} / ${gradeStats.overall.total_failed}`}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Top Students */}
      {studentStats && studentStats.top_students && studentStats.top_students.length > 0 && (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Top 10 sinh viên xuất sắc">
              <Table
                dataSource={studentStats.top_students}
                columns={[
                  {
                    title: 'MSSV',
                    dataIndex: 'student_id',
                    key: 'student_id',
                  },
                  {
                    title: 'Họ và tên',
                    dataIndex: 'full_name',
                    key: 'full_name',
                  },
                  {
                    title: 'Lớp',
                    dataIndex: 'class_name',
                    key: 'class_name',
                  },
                  {
                    title: 'GPA',
                    dataIndex: 'gpa',
                    key: 'gpa',
                    render: (val) => <strong style={{ color: '#3f8600' }}>{val.toFixed(2)}</strong>,
                  },
                ]}
                pagination={false}
                rowKey="student_id"
                size="small"
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DashboardPage;

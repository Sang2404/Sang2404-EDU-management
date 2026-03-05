import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Statistic, Row, Col, Empty, Spin, Select } from 'antd';
import { TrophyOutlined, BookOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const { Option } = Select;

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/grades/students/${user.username}`);
      setGrades(response.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (gradeChar) => {
    const colors = {
      'A': 'green',
      'B+': 'blue',
      'B': 'blue',
      'C+': 'orange',
      'C': 'orange',
      'D+': 'red',
      'D': 'red',
      'F': 'red'
    };
    return colors[gradeChar] || 'default';
  };

  const getPassStatus = (gradeChar) => {
    return ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D'].includes(gradeChar);
  };

  // Filter grades
  const filteredGrades = grades.filter(grade => {
    if (semesterFilter && grade.semester !== semesterFilter) return false;
    if (yearFilter && grade.academic_year !== yearFilter) return false;
    return true;
  });

  // Calculate statistics
  const totalCredits = filteredGrades.reduce((sum, grade) => sum + (grade.credits || 0), 0);
  const passedCredits = filteredGrades
    .filter(grade => getPassStatus(grade.grade_char))
    .reduce((sum, grade) => sum + (grade.credits || 0), 0);
  
  const totalGradePoints = filteredGrades.reduce((sum, grade) => {
    const gradePoint = grade.total_4 != null && typeof grade.total_4 === 'number' ? grade.total_4 : 0;
    const credits = grade.credits || 0;
    return sum + (gradePoint * credits);
  }, 0);
  const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

  // Group by semester
  const groupedGrades = {};
  filteredGrades.forEach(grade => {
    const key = `${grade.semester} - ${grade.academic_year}`;
    if (!groupedGrades[key]) {
      groupedGrades[key] = [];
    }
    groupedGrades[key].push(grade);
  });

  const columns = [
    {
      title: 'Mã môn',
      dataIndex: 'subject_id',
      key: 'subject_id',
      width: 100
    },
    {
      title: 'Tên môn học',
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
      title: 'Chuyên cần',
      dataIndex: 'attendance',
      key: 'attendance',
      width: 100,
      align: 'center',
      render: (value) => value != null && typeof value === 'number' ? value.toFixed(1) : '-'
    },
    {
      title: 'Giữa kỳ',
      dataIndex: 'midterm',
      key: 'midterm',
      width: 100,
      align: 'center',
      render: (value) => value != null && typeof value === 'number' ? value.toFixed(1) : '-'
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'final',
      key: 'final',
      width: 100,
      align: 'center',
      render: (value) => value != null && typeof value === 'number' ? value.toFixed(1) : '-'
    },
    {
      title: 'Tổng kết',
      key: 'total',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>
            {record.total_10 != null && typeof record.total_10 === 'number' ? record.total_10.toFixed(1) : '-'}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            ({record.total_4 != null && typeof record.total_4 === 'number' ? record.total_4.toFixed(1) : '-'})
          </div>
        </div>
      )
    },
    {
      title: 'Điểm chữ',
      dataIndex: 'grade_char',
      key: 'grade_char',
      width: 100,
      align: 'center',
      render: (gradeChar) => (
        <Tag color={getGradeColor(gradeChar)} style={{ fontSize: 14, fontWeight: 'bold' }}>
          {gradeChar}
        </Tag>
      )
    },
    {
      title: 'Kết quả',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const passed = getPassStatus(record.grade_char);
        return passed ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Đạt</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">Không đạt</Tag>
        );
      }
    }
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải bảng điểm...</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="GPA tích lũy"
              value={gpa}
              precision={2}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: gpa >= 3.2 ? '#3f8600' : gpa >= 2.5 ? '#1890ff' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng tín chỉ"
              value={totalCredits}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tín chỉ đạt"
              value={passedCredits}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số môn"
              value={filteredGrades.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Grades Table */}
      <Card
        title="Bảng điểm"
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
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
          </div>
        }
      >
        {filteredGrades.length === 0 ? (
          <Empty description="Chưa có điểm" />
        ) : (
          <>
            {Object.keys(groupedGrades).map(semester => (
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
                  dataSource={groupedGrades[semester]}
                  rowKey="grade_id"
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
                    GPA học kỳ: {
                      (() => {
                        const semesterGrades = groupedGrades[semester];
                        const semesterCredits = semesterGrades.reduce((sum, g) => sum + (g.credits || 0), 0);
                        const semesterPoints = semesterGrades.reduce((sum, g) => {
                          const gradePoint = g.total_4 != null && typeof g.total_4 === 'number' ? g.total_4 : 0;
                          const credits = g.credits || 0;
                          return sum + (gradePoint * credits);
                        }, 0);
                        return semesterCredits > 0 ? (semesterPoints / semesterCredits).toFixed(2) : '0.00';
                      })()
                    }
                  </strong>
                </div>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Legend */}
      <Card title="Thang điểm" size="small" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div><Tag color="green">A+</Tag> 9.0 - 10 (Xuất sắc)</div>
          <div><Tag color="green">A</Tag> 8.0 - 8.9 (Giỏi)</div>
          <div><Tag color="blue">B+</Tag> 7.5 - 7.9 (Khá giỏi)</div>
          <div><Tag color="blue">B</Tag> 7.0 - 7.4 (Khá)</div>
          <div><Tag color="orange">C+</Tag> 6.0 - 6.9 (Trung bình khá)</div>
          <div><Tag color="orange">C</Tag> 5.0 - 5.9 (Trung bình)</div>
          <div><Tag color="red">D+</Tag> 4.5 - 4.9 (Trung bình yếu)</div>
          <div><Tag color="red">D</Tag> 4.0 - 4.4 (Yếu)</div>
          <div><Tag color="red">F</Tag> Dưới 4.0 (Kém)</div>
        </div>
      </Card>
    </div>
  );
};

export default GradesPage;

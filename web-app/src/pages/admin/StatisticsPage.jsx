import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row,
  Col,
  Select,
  Space,
  Table,
  Statistic,
  message,
  Button,
  Tabs
} from 'antd';
import { 
  BarChartOutlined,
  DownloadOutlined,
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from '../../config/axios';

const { Option } = Select;
const { TabPane } = Tabs;

const StatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  
  // Student statistics
  const [studentStats, setStudentStats] = useState(null);
  const [studentFilters, setStudentFilters] = useState({ faculty_id: null, major_id: null });
  
  // Course statistics
  const [courseStats, setCourseStats] = useState(null);
  const [courseFilters, setCourseFilters] = useState({ semester: null, academic_year: null, subject_id: null });
  
  // Grade statistics
  const [gradeStats, setGradeStats] = useState(null);
  const [gradeFilters, setGradeFilters] = useState({ semester: null, academic_year: null, subject_id: null });
  
  // Request statistics
  const [requestStats, setRequestStats] = useState(null);
  const [requestFilters, setRequestFilters] = useState({ start_date: null, end_date: null });
  
  // Filter options
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
    fetchAllStatistics();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [facultiesRes, subjectsRes] = await Promise.all([
        axios.get('/academic/faculties'),
        axios.get('/academic/subjects')
      ]);
      setFaculties(facultiesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudentStatistics(),
        fetchCourseStatistics(),
        fetchGradeStatistics(),
        fetchRequestStatistics()
      ]);
    } catch (error) {
      message.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStatistics = async () => {
    try {
      let url = '/admin/statistics/students';
      const params = [];
      if (studentFilters.faculty_id) params.push(`faculty_id=${studentFilters.faculty_id}`);
      if (studentFilters.major_id) params.push(`major_id=${studentFilters.major_id}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await axios.get(url);
      setStudentStats(response.data);
    } catch (error) {
      console.error('Error fetching student statistics:', error);
    }
  };

  const fetchCourseStatistics = async () => {
    try {
      let url = '/admin/statistics/courses';
      const params = [];
      if (courseFilters.semester) params.push(`semester=${courseFilters.semester}`);
      if (courseFilters.academic_year) params.push(`academic_year=${courseFilters.academic_year}`);
      if (courseFilters.subject_id) params.push(`subject_id=${courseFilters.subject_id}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await axios.get(url);
      setCourseStats(response.data);
    } catch (error) {
      console.error('Error fetching course statistics:', error);
    }
  };

  const fetchGradeStatistics = async () => {
    try {
      let url = '/admin/statistics/grades';
      const params = [];
      if (gradeFilters.semester) params.push(`semester=${gradeFilters.semester}`);
      if (gradeFilters.academic_year) params.push(`academic_year=${gradeFilters.academic_year}`);
      if (gradeFilters.subject_id) params.push(`subject_id=${gradeFilters.subject_id}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await axios.get(url);
      setGradeStats(response.data);
    } catch (error) {
      console.error('Error fetching grade statistics:', error);
    }
  };

  const fetchRequestStatistics = async () => {
    try {
      let url = '/admin/statistics/requests';
      const params = [];
      if (requestFilters.start_date) params.push(`start_date=${requestFilters.start_date}`);
      if (requestFilters.end_date) params.push(`end_date=${requestFilters.end_date}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await axios.get(url);
      setRequestStats(response.data);
    } catch (error) {
      console.error('Error fetching request statistics:', error);
    }
  };

  const handleFacultyChange = async (facultyId) => {
    setStudentFilters({ ...studentFilters, faculty_id: facultyId, major_id: null });
    if (facultyId) {
      try {
        const response = await axios.get(`/academic/faculties/${facultyId}/majors`);
        setMajors(response.data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      }
    } else {
      setMajors([]);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const gpaColumns = [
    { title: 'Khoảng GPA', dataIndex: 'range', key: 'range', width: 120 },
    { title: 'Xếp loại', dataIndex: 'label', key: 'label', width: 150 },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'center' },
    { 
      title: 'Tỷ lệ (%)', 
      dataIndex: 'percentage', 
      key: 'percentage', 
      width: 100, 
      align: 'center',
      render: (val) => val?.toFixed(1) || '0.0'
    }
  ];

  const topStudentsColumns = [
    { title: 'Mã SV', dataIndex: 'student_id', key: 'student_id', width: 120 },
    { title: 'Họ và tên', dataIndex: 'full_name', key: 'full_name', width: 200 },
    { 
      title: 'GPA', 
      dataIndex: 'gpa', 
      key: 'gpa', 
      width: 100, 
      align: 'center',
      render: (val) => <strong>{val?.toFixed(2) || '0.00'}</strong>
    }
  ];

  const gradeDistColumns = [
    { title: 'Xếp loại', dataIndex: 'grade', key: 'grade', width: 80, align: 'center' },
    { title: 'Mô tả', dataIndex: 'label', key: 'label', width: 150 },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'center' },
    { 
      title: 'Tỷ lệ (%)', 
      dataIndex: 'percentage', 
      key: 'percentage', 
      width: 100, 
      align: 'center',
      render: (val) => val?.toFixed(1) || '0.0'
    }
  ];

  const requestTypeColumns = [
    { title: 'Loại yêu cầu', dataIndex: 'type_display', key: 'type_display', width: 200 },
    { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'center' },
    { 
      title: 'Tỷ lệ (%)', 
      dataIndex: 'percentage', 
      key: 'percentage', 
      width: 100, 
      align: 'center',
      render: (val) => val?.toFixed(1) || '0.0'
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <BarChartOutlined />
          <span>Thống kê & Báo cáo</span>
        </Space>
      }
    >
      <Tabs defaultActiveKey="students">
        {/* Student Statistics Tab */}
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Sinh viên
            </span>
          } 
          key="students"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="Bộ lọc">
              <Space>
                <Select
                  style={{ width: 200 }}
                  placeholder="Chọn khoa"
                  allowClear
                  value={studentFilters.faculty_id}
                  onChange={handleFacultyChange}
                >
                  {faculties.map(f => (
                    <Option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 200 }}
                  placeholder="Chọn ngành"
                  allowClear
                  value={studentFilters.major_id}
                  onChange={(val) => setStudentFilters({ ...studentFilters, major_id: val })}
                  disabled={!studentFilters.faculty_id}
                >
                  {majors.map(m => (
                    <Option key={m.major_id} value={m.major_id}>{m.major_name}</Option>
                  ))}
                </Select>
                <Button type="primary" onClick={fetchStudentStatistics}>
                  Áp dụng
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => studentStats?.gpa_distribution && exportToCSV(studentStats.gpa_distribution, 'phan_bo_gpa')}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Card>

            {studentStats && (
              <>
                <Row gutter={16}>
                  <Col span={24}>
                    <Card title="Phân bố GPA" loading={loading}>
                      <Table
                        columns={gpaColumns}
                        dataSource={studentStats.gpa_distribution || []}
                        rowKey="range"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Card 
                      title={
                        <Space>
                          <TrophyOutlined style={{ color: '#faad14' }} />
                          <span>Top 10 Sinh viên Xuất sắc</span>
                        </Space>
                      }
                      loading={loading}
                    >
                      <Table
                        columns={topStudentsColumns}
                        dataSource={studentStats.top_students || []}
                        rowKey="student_id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Space>
        </TabPane>

        {/* Course Statistics Tab */}
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              Lớp học phần
            </span>
          } 
          key="courses"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="Bộ lọc">
              <Space>
                <Select
                  style={{ width: 150 }}
                  placeholder="Học kỳ"
                  allowClear
                  value={courseFilters.semester}
                  onChange={(val) => setCourseFilters({ ...courseFilters, semester: val })}
                >
                  <Option value="HK1">HK1</Option>
                  <Option value="HK2">HK2</Option>
                  <Option value="HK3">HK3</Option>
                </Select>
                <Select
                  style={{ width: 150 }}
                  placeholder="Năm học"
                  allowClear
                  value={courseFilters.academic_year}
                  onChange={(val) => setCourseFilters({ ...courseFilters, academic_year: val })}
                >
                  <Option value="2023-2024">2023-2024</Option>
                  <Option value="2024-2025">2024-2025</Option>
                  <Option value="2025-2026">2025-2026</Option>
                </Select>
                <Select
                  style={{ width: 200 }}
                  placeholder="Môn học"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={courseFilters.subject_id}
                  onChange={(val) => setCourseFilters({ ...courseFilters, subject_id: val })}
                >
                  {subjects.map(s => (
                    <Option key={s.subject_id} value={s.subject_id}>{s.subject_name}</Option>
                  ))}
                </Select>
                <Button type="primary" onClick={fetchCourseStatistics}>
                  Áp dụng
                </Button>
              </Space>
            </Card>

            {courseStats && (
              <>
                <Row gutter={16}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Tổng số sinh viên" 
                        value={courseStats.enrollment?.total_students || 0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Tổng số lớp" 
                        value={courseStats.enrollment?.total_sections || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="TB sinh viên/lớp" 
                        value={courseStats.enrollment?.average_per_section || 0}
                        precision={1}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Tỷ lệ lấp đầy" 
                        value={courseStats.enrollment?.capacity_utilization || 0}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Top 10 Lớp Đông Nhất" size="small">
                      <Table
                        columns={[
                          { title: 'Mã lớp', dataIndex: 'section_code', key: 'section_code', width: 100 },
                          { title: 'Môn học', dataIndex: 'subject_name', key: 'subject_name' },
                          { title: 'Sĩ số', key: 'enrollment', width: 100, align: 'center',
                            render: (_, record) => `${record.enrolled}/${record.capacity}` }
                        ]}
                        dataSource={courseStats.most_enrolled || []}
                        rowKey="section_id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Top 10 Lớp Ít Nhất" size="small">
                      <Table
                        columns={[
                          { title: 'Mã lớp', dataIndex: 'section_code', key: 'section_code', width: 100 },
                          { title: 'Môn học', dataIndex: 'subject_name', key: 'subject_name' },
                          { title: 'Sĩ số', key: 'enrollment', width: 100, align: 'center',
                            render: (_, record) => `${record.enrolled}/${record.capacity}` }
                        ]}
                        dataSource={courseStats.least_enrolled || []}
                        rowKey="section_id"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Space>
        </TabPane>

        {/* Grade Statistics Tab */}
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Điểm số
            </span>
          } 
          key="grades"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="Bộ lọc">
              <Space>
                <Select
                  style={{ width: 150 }}
                  placeholder="Học kỳ"
                  allowClear
                  value={gradeFilters.semester}
                  onChange={(val) => setGradeFilters({ ...gradeFilters, semester: val })}
                >
                  <Option value="HK1">HK1</Option>
                  <Option value="HK2">HK2</Option>
                  <Option value="HK3">HK3</Option>
                </Select>
                <Select
                  style={{ width: 150 }}
                  placeholder="Năm học"
                  allowClear
                  value={gradeFilters.academic_year}
                  onChange={(val) => setGradeFilters({ ...gradeFilters, academic_year: val })}
                >
                  <Option value="2023-2024">2023-2024</Option>
                  <Option value="2024-2025">2024-2025</Option>
                  <Option value="2025-2026">2025-2026</Option>
                </Select>
                <Select
                  style={{ width: 200 }}
                  placeholder="Môn học"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={gradeFilters.subject_id}
                  onChange={(val) => setGradeFilters({ ...gradeFilters, subject_id: val })}
                >
                  {subjects.map(s => (
                    <Option key={s.subject_id} value={s.subject_id}>{s.subject_name}</Option>
                  ))}
                </Select>
                <Button type="primary" onClick={fetchGradeStatistics}>
                  Áp dụng
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => gradeStats?.distribution && exportToCSV(gradeStats.distribution, 'phan_bo_diem')}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Card>

            {gradeStats && (
              <>
                <Row gutter={16}>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Điểm trung bình" 
                        value={gradeStats.overall?.average_grade || 0}
                        precision={2}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Tổng số điểm" 
                        value={gradeStats.overall?.total_grades || 0}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Tỷ lệ đạt" 
                        value={gradeStats.overall?.pass_rate || 0}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic 
                        title="Số lượng trượt" 
                        value={gradeStats.overall?.total_failed || 0}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Card title="Phân bố điểm" loading={loading}>
                      <Table
                        columns={gradeDistColumns}
                        dataSource={gradeStats.distribution || []}
                        rowKey="grade"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Space>
        </TabPane>

        {/* Request Statistics Tab */}
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Yêu cầu học vụ
            </span>
          } 
          key="requests"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="Bộ lọc">
              <Space>
                <input
                  type="date"
                  value={requestFilters.start_date || ''}
                  onChange={(e) => setRequestFilters({ ...requestFilters, start_date: e.target.value })}
                  style={{ padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 2 }}
                />
                <span>đến</span>
                <input
                  type="date"
                  value={requestFilters.end_date || ''}
                  onChange={(e) => setRequestFilters({ ...requestFilters, end_date: e.target.value })}
                  style={{ padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 2 }}
                />
                <Button type="primary" onClick={fetchRequestStatistics}>
                  Áp dụng
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => requestStats?.by_type && exportToCSV(requestStats.by_type, 'yeu_cau_hoc_vu')}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Card>

            {requestStats && (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="Tổng yêu cầu" 
                        value={requestStats.by_type?.reduce((sum, item) => sum + item.count, 0) || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="Thời gian xử lý TB" 
                        value={requestStats.processing_time?.average_days || 0}
                        precision={1}
                        suffix="ngày"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="Đã xử lý" 
                        value={requestStats.processing_time?.processed_count || 0}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Phân bố theo loại" size="small">
                      <Table
                        columns={requestTypeColumns}
                        dataSource={requestStats.by_type || []}
                        rowKey="type"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Phân bố theo trạng thái" size="small">
                      <Table
                        columns={[
                          { title: 'Trạng thái', dataIndex: 'status_display', key: 'status_display', width: 200 },
                          { title: 'Số lượng', dataIndex: 'count', key: 'count', width: 100, align: 'center' },
                          { 
                            title: 'Tỷ lệ (%)', 
                            dataIndex: 'percentage', 
                            key: 'percentage', 
                            width: 100, 
                            align: 'center',
                            render: (val) => val?.toFixed(1) || '0.0'
                          }
                        ]}
                        dataSource={requestStats.by_status || []}
                        rowKey="status"
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Space>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default StatisticsPage;

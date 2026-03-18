import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, InputNumber, message, Space, Tag, Select, Descriptions, Popconfirm, Alert, Tooltip, Spin, Skeleton, Tabs, Statistic, Row, Col } from 'antd';
import { EditOutlined, SaveOutlined, CheckCircleOutlined, SendOutlined, InfoCircleOutlined, DownloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const { Option } = Select;

const GradeEntryPage = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [semesterFilter, setSemesterFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [activeTab, setActiveTab] = useState('grades');
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceWeek, setAttendanceWeek] = useState(1);
  const [attendanceDay, setAttendanceDay] = useState(2);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [attendanceForm] = Form.useForm();

  useEffect(() => {
    fetchMySections();
  }, [semesterFilter, yearFilter]);

  const fetchMySections = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('DEBUG: User object in fetchMySections:', user);
      
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (yearFilter) params.academic_year = yearFilter;

      // Use lecturer_id instead of username
      const lecturerId = user.lecturer_id || user.username;
      console.log('DEBUG: Using lecturer_id for sections:', lecturerId);
      
      const response = await api.get(`/lecturers/${lecturerId}/sections`, { params });
      setSections(response.data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsWithGrades = async (sectionId) => {
    setLoading(true);
    console.log('DEBUG: fetchStudentsWithGrades called for section:', sectionId);
    try {
      // Add cache busting parameter to ensure fresh data
      const timestamp = Date.now();
      const response = await api.get(`/academic/course-sections/${sectionId}/students-with-grades?_t=${timestamp}`);
      console.log('DEBUG: fetchStudentsWithGrades response:', response.data);
      setStudents(response.data || []);
      console.log('DEBUG: Students state updated with:', response.data);
    } catch (error) {
      console.error('Error fetching students with grades:', error);
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = (section) => {
    console.log('DEBUG: handleSelectSection called with:', section);
    setSelectedSection(section);
    fetchStudentsWithGrades(section.section_id);
  };

  const handleEditGrade = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      attendance: student.attendance,
      midterm: student.midterm,
      final: student.final
    });
    setGradeModalVisible(true);
  };

  const handleSaveGrade = async (values) => {
    try {
      setSubmitLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Use lecturer_id instead of username
      const lecturerId = user.lecturer_id || user.username || 'GV002'; // Fallback to GV002 for testing
      
      console.log('DEBUG: User object:', user);
      console.log('DEBUG: Using lecturer_id:', lecturerId);
      
      console.log('Saving grade:', {
        section_id: selectedSection.section_id,
        student_id: editingStudent.student_id,
        attendance: values.attendance,
        midterm: values.midterm,
        final: values.final,
        lecturer_id: lecturerId
      });
      
      const response = await api.post('/grades', {
        section_id: selectedSection.section_id,
        student_id: editingStudent.student_id,
        attendance: values.attendance,
        midterm: values.midterm,
        final: values.final,
        lecturer_id: lecturerId
      });

      console.log('Grade saved response:', response.data);
      
      // Update local state immediately with response data
      const savedGrade = response.data.data;
      console.log('Updating local state with saved grade:', savedGrade);
      
      const updatedStudents = students.map(s => 
        s.student_id === editingStudent.student_id 
          ? {
              ...s,
              grade_id: savedGrade.grade_id,
              attendance: savedGrade.attendance,
              midterm: savedGrade.midterm,
              final: savedGrade.final,
              total_10: savedGrade.total_10,
              total_4: savedGrade.total_4,
              grade_char: savedGrade.grade_char,
              status: savedGrade.status || 'DRAFT'
            }
          : s
      );
      
      console.log('Updated students array:', updatedStudents);
      setStudents(updatedStudents);
      
      // Close modal and show success message
      setGradeModalVisible(false);
      form.resetFields();
      message.success('Lưu điểm thành công');
      
    } catch (error) {
      console.error('Error saving grade:', error);
      message.error(error.response?.data?.error || 'Không thể lưu điểm');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitGrades = async () => {
    try {
      setSubmitLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Check if all students have grades
      const ungradedStudents = students.filter(s => 
        s.attendance === null || s.attendance === undefined ||
        s.midterm === null || s.midterm === undefined ||
        s.final === null || s.final === undefined
      );
      
      if (ungradedStudents.length > 0) {
        Modal.warning({
          title: 'Chưa thể gửi bảng điểm',
          content: (
            <div>
              <p>Còn {ungradedStudents.length} sinh viên chưa nhập đủ điểm:</p>
              <ul style={{ maxHeight: 200, overflow: 'auto' }}>
                {ungradedStudents.slice(0, 10).map(s => (
                  <li key={s.student_id}>{s.student_id} - {s.full_name}</li>
                ))}
                {ungradedStudents.length > 10 && <li>... và {ungradedStudents.length - 10} sinh viên khác</li>}
              </ul>
            </div>
          )
        });
        setSubmitLoading(false);
        return;
      }
      
      await api.post('/grades/submit', {
        section_id: selectedSection.section_id,
        lecturer_id: user.lecturer_id || user.username || 'GV002'
      });
      
      message.success('Gửi bảng điểm thành công! Chờ Admin duyệt.');
      
      // Update local state to change status to SUBMITTED without losing data
      const updatedStudents = students.map(s => ({
        ...s,
        status: 'SUBMITTED'
      }));
      setStudents(updatedStudents);
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể gửi bảng điểm');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExportExcel = () => {
    // Tạo CSV content
    const headers = ['STT', 'Mã SV', 'Họ và tên', 'Chuyên cần', 'Giữa kỳ', 'Cuối kỳ', 'Tổng kết', 'Điểm chữ'];
    const rows = students.map((s, index) => [
      index + 1,
      s.student_id,
      s.full_name,
      s.attendance !== null ? s.attendance.toFixed(1) : '',
      s.midterm !== null ? s.midterm.toFixed(1) : '',
      s.final !== null ? s.final.toFixed(1) : '',
      s.total_10 !== null ? s.total_10.toFixed(1) : '',
      s.grade_char || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Thêm BOM để Excel hiển thị đúng tiếng Việt
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `BangDiem_${selectedSection.section_code}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Đã xuất file Excel');
  };

  const fetchAttendanceData = async () => {
    setAttendanceLoading(true);
    try {
      const response = await api.get(`/attendance/section/${selectedSection.section_id}/summary`);
      setAttendanceData(response.data || []);
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể tải danh sách điểm danh');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkAttendance = async (values) => {
    try {
      setSubmitLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Prepare records for bulk update
      const records = students.map(student => ({
        student_id: student.student_id,
        status: values[`attendance_${student.student_id}`] || 'PRESENT'
      }));

      await api.post('/attendance/bulk/update', {
        section_id: selectedSection.section_id,
        week: attendanceWeek,
        day_of_week: attendanceDay,
        records
      });

      message.success('Ghi danh thành công');
      setAttendanceModalVisible(false);
      attendanceForm.resetFields();
      fetchAttendanceData();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể ghi danh');
    } finally {
      setSubmitLoading(false);
    }
  };

  const attendanceColumns = [
    {
      title: 'Mã SV',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 120
    },
    {
      title: 'Họ và tên',
      dataIndex: 'student_name',
      key: 'student_name',
      width: 200
    },
    {
      title: 'Tổng buổi',
      dataIndex: 'total_classes',
      key: 'total_classes',
      width: 100,
      align: 'center'
    },
    {
      title: 'Có mặt',
      dataIndex: 'present_count',
      key: 'present_count',
      width: 100,
      align: 'center',
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: 'Muộn',
      dataIndex: 'late_count',
      key: 'late_count',
      width: 100,
      align: 'center',
      render: (value) => <Tag color="orange">{value}</Tag>
    },
    {
      title: 'Vắng',
      dataIndex: 'absent_count',
      key: 'absent_count',
      width: 100,
      align: 'center',
      render: (value) => <Tag color="red">{value}</Tag>
    },
    {
      title: 'Phép',
      dataIndex: 'excused_count',
      key: 'excused_count',
      width: 100,
      align: 'center',
      render: (value) => <Tag color="blue">{value}</Tag>
    },
    {
      title: 'Điểm chuyên cần',
      dataIndex: 'attendance_score',
      key: 'attendance_score',
      width: 120,
      align: 'center',
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: value >= 8 ? '#52c41a' : value >= 6 ? '#faad14' : '#f5222d' }}>
          {value.toFixed(2)}/10
        </span>
      )
    }
  ];

  const sectionColumns = [
    {
      title: 'Mã lớp',
      dataIndex: 'section_code',
      key: 'section_code',
      width: 150
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
      width: 100,
      align: 'center',
      render: (_, record) => `${record.enrolled_count}/${record.max_capacity}`
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button 
          type="primary"
          onClick={() => handleSelectSection(record)}
        >
          Nhập điểm
        </Button>
      )
    }
  ];

  const studentColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
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
      title: 'Chuyên cần',
      dataIndex: 'attendance',
      key: 'attendance',
      width: 100,
      align: 'center',
      render: (value) => {
        if (value === null || value === undefined) return '-';
        const num = Number(value);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
    },
    {
      title: 'Giữa kỳ',
      dataIndex: 'midterm',
      key: 'midterm',
      width: 100,
      align: 'center',
      render: (value) => {
        if (value === null || value === undefined) return '-';
        const num = Number(value);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'final',
      key: 'final',
      width: 100,
      align: 'center',
      render: (value) => {
        if (value === null || value === undefined) return '-';
        const num = Number(value);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
    },
    {
      title: 'Tổng kết',
      dataIndex: 'total_10',
      key: 'total_10',
      width: 100,
      align: 'center',
      render: (value, record) => {
        if (value === null || value === undefined) return '-';
        const num = Number(value);
        if (isNaN(num)) return '-';
        return (
          <Space>
            <span style={{ fontWeight: 'bold' }}>{num.toFixed(1)}</span>
            {record.grade_char && <Tag color={getGradeColor(record.grade_char)}>{record.grade_char}</Tag>}
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          DRAFT: { color: 'default', text: 'Nháp' },
          SUBMITTED: { color: 'processing', text: 'Đã nộp' },
          APPROVED: { color: 'success', text: 'Đã duyệt' }
        };
        const config = statusConfig[status] || statusConfig.DRAFT;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'APPROVED') {
          return <Tag color="green">Đã duyệt</Tag>;
        }
        if (record.status === 'SUBMITTED') {
          return <Tag color="blue">Đã nộp</Tag>;
        }
        return (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditGrade(record)}
            disabled={record.status === 'APPROVED' || record.status === 'SUBMITTED'}
          >
            {record.attendance !== null ? 'Sửa' : 'Nhập điểm'}
          </Button>
        );
      }
    }
  ];

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

  return (
    <div>
      {!selectedSection ? (
        <Card 
          title="Chọn lớp học để nhập điểm"
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
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0', flexDirection: 'column', alignItems: 'center' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px' }}>Đang tải danh sách lớp học...</p>
            </div>
          ) : (
            <Table
              columns={sectionColumns}
              dataSource={sections}
              rowKey="section_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ) : (
        <Card
          title={
            <Space direction="vertical" size="small">
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                Nhập điểm: {selectedSection.section_code} - {selectedSection.subject_name}
              </span>
              <span style={{ fontSize: 14, color: '#666' }}>
                {selectedSection.semester} - {selectedSection.academic_year}
              </span>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="Xuất danh sách điểm ra file Excel">
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={handleExportExcel}
                  disabled={loading}
                  aria-label="Xuất danh sách điểm ra file Excel"
                >
                  Xuất Excel
                </Button>
              </Tooltip>
              <Popconfirm
                title="Gửi bảng điểm để duyệt?"
                description="Sau khi gửi, bạn không thể sửa điểm cho đến khi Admin phê duyệt hoặc từ chối."
                onConfirm={handleSubmitGrades}
                okText="Gửi"
                cancelText="Hủy"
                disabled={students.some(s => s.status === 'SUBMITTED' || s.status === 'APPROVED')}
              >
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  loading={submitLoading}
                  disabled={students.some(s => s.status === 'SUBMITTED' || s.status === 'APPROVED') || loading}
                  aria-label="Gửi bảng điểm để duyệt"
                >
                  Gửi duyệt
                </Button>
              </Popconfirm>
              <Button 
                onClick={() => {
                  setSelectedSection(null);
                  setStudents([]);
                }} 
                disabled={loading || submitLoading}
                aria-label="Quay lại danh sách lớp học"
              >
                Quay lại
              </Button>
            </Space>
          }
        >
          {loading ? (
            <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px' }}>Đang tải danh sách sinh viên và điểm...</p>
            </div>
          ) : (
            <>
              <Alert
                message="Công thức tính điểm"
                description={
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>Điểm tổng kết (thang 10) = </strong>
                      Chuyên cần × 10% + Giữa kỳ × 30% + Cuối kỳ × 60%
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                      <InfoCircleOutlined /> Điểm chữ và kết quả sẽ được tính tự động sau khi nhập đủ 3 cột điểm
                    </p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {students.some(s => s.status === 'SUBMITTED') && (
                <Alert
                  message="Bảng điểm đã được gửi duyệt"
                  description="Bảng điểm này đã được gửi cho Admin duyệt. Bạn không thể chỉnh sửa điểm cho đến khi Admin phê duyệt hoặc từ chối."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {students.some(s => s.status === 'APPROVED') && (
                <Alert
                  message="Bảng điểm đã được duyệt"
                  description="Bảng điểm này đã được Admin phê duyệt. Điểm không thể chỉnh sửa."
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Tổng số sinh viên">{students.length}</Descriptions.Item>
                <Descriptions.Item label="Đã nhập điểm">
                  {students.filter(s => s.attendance !== null).length}
                </Descriptions.Item>
                <Descriptions.Item label="Chưa nhập">
                  {students.filter(s => s.attendance === null).length}
                </Descriptions.Item>
              </Descriptions>

              <Table
                columns={studentColumns}
                dataSource={students}
                rowKey="student_id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={false}
              />
            </>
          )}
        </Card>
      )}

      <Modal
        title={
          <Space>
            <span>Nhập điểm - {editingStudent?.full_name}</span>
            <Tag color="blue">{editingStudent?.student_id}</Tag>
          </Space>
        }
        open={gradeModalVisible}
        onCancel={() => {
          setGradeModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
        confirmLoading={submitLoading}
        aria-labelledby="grade-modal-title"
      >
        {submitLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang lưu điểm...</p>
          </div>
        ) : (
          <>
            <Alert
              message="Lưu ý"
              description="Điểm nhập vào phải từ 0 đến 10. Điểm tổng kết và điểm chữ sẽ được tính tự động."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveGrade}
            >
              <Form.Item
                name="attendance"
                label={
                  <span>
                    Điểm chuyên cần (0-10) 
                    <Tooltip title="Chiếm 10% điểm tổng kết">
                      <InfoCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm chuyên cần' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.resolve();
                      }
                      if (typeof value !== 'number' || value < 0 || value > 10) {
                        return Promise.reject(new Error('Điểm phải từ 0 đến 10'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập điểm chuyên cần (0-10)"
                  step={0.1}
                  precision={1}
                  min={0}
                  max={10}
                  disabled={submitLoading}
                  aria-label="Điểm chuyên cần"
                />
              </Form.Item>

              <Form.Item
                name="midterm"
                label={
                  <span>
                    Điểm giữa kỳ (0-10)
                    <Tooltip title="Chiếm 30% điểm tổng kết">
                      <InfoCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm giữa kỳ' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.resolve();
                      }
                      if (typeof value !== 'number' || value < 0 || value > 10) {
                        return Promise.reject(new Error('Điểm phải từ 0 đến 10'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập điểm giữa kỳ (0-10)"
                  step={0.1}
                  precision={1}
                  min={0}
                  max={10}
                  disabled={submitLoading}
                  aria-label="Điểm giữa kỳ"
                />
              </Form.Item>

              <Form.Item
                name="final"
                label={
                  <span>
                    Điểm cuối kỳ (0-10)
                    <Tooltip title="Chiếm 60% điểm tổng kết">
                      <InfoCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm cuối kỳ' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) {
                        return Promise.resolve();
                      }
                      if (typeof value !== 'number' || value < 0 || value > 10) {
                        return Promise.reject(new Error('Điểm phải từ 0 đến 10'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập điểm cuối kỳ (0-10)"
                  step={0.1}
                  precision={1}
                  min={0}
                  max={10}
                  disabled={submitLoading}
                  aria-label="Điểm cuối kỳ"
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={() => {
                      setGradeModalVisible(false);
                      form.resetFields();
                    }} 
                    disabled={submitLoading}
                    aria-label="Hủy bỏ"
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={submitLoading}
                    aria-label="Lưu điểm"
                  >
                    Lưu điểm
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Attendance Modal */}
      <Modal
        title="Ghi danh buổi học"
        open={attendanceModalVisible}
        onCancel={() => {
          setAttendanceModalVisible(false);
          attendanceForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={attendanceForm}
          layout="vertical"
          onFinish={handleMarkAttendance}
        >
          <Alert
            message="Hướng dẫn"
            description="Chọn trạng thái điểm danh cho từng sinh viên. Điểm chuyên cần sẽ được tính tự động dựa trên tỷ lệ có mặt."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Table
            dataSource={students}
            rowKey="student_id"
            pagination={false}
            columns={[
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
                title: 'Trạng thái',
                key: 'attendance_status',
                width: 150,
                render: (_, record) => (
                  <Form.Item
                    name={`attendance_${record.student_id}`}
                    initialValue="PRESENT"
                    style={{ margin: 0 }}
                  >
                    <Select
                      options={[
                        { value: 'PRESENT', label: 'Có mặt', icon: <CheckOutlined /> },
                        { value: 'LATE', label: 'Muộn' },
                        { value: 'ABSENT', label: 'Vắng' },
                        { value: 'EXCUSED', label: 'Phép' }
                      ]}
                    />
                  </Form.Item>
                )
              }
            ]}
          />

          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              Lưu danh sách
            </Button>
            <Button onClick={() => {
              setAttendanceModalVisible(false);
              attendanceForm.resetFields();
            }}>
              Hủy
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeEntryPage;

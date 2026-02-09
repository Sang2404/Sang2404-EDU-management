import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, InputNumber, message, Space, Tag, Select, Descriptions, Popconfirm } from 'antd';
import { EditOutlined, SaveOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const { Option } = Select;

const GradeEntryPage = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [semesterFilter, setSemesterFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    fetchMySections();
  }, [semesterFilter, yearFilter]);

  const fetchMySections = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (yearFilter) params.academic_year = yearFilter;

      const response = await api.get(`/lecturers/${user.username}/sections`, { params });
      setSections(response.data.sections || []);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsWithGrades = async (sectionId) => {
    setLoading(true);
    try {
      const response = await api.get(`/academic/course-sections/${sectionId}/students`);
      const studentsData = response.data;

      // Fetch grades for each student
      const studentsWithGrades = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const gradeResponse = await api.get(`/grades/students/${student.student_id}`);
            const grades = gradeResponse.data;
            const sectionGrade = grades.find(g => g.section_id === sectionId);
            return {
              ...student,
              grade_id: sectionGrade?.grade_id,
              attendance: sectionGrade?.attendance,
              midterm: sectionGrade?.midterm,
              final: sectionGrade?.final,
              total_10: sectionGrade?.total_10,
              grade_char: sectionGrade?.grade_char,
              status: sectionGrade?.status || 'DRAFT'
            };
          } catch (error) {
            return { ...student, status: 'DRAFT' };
          }
        })
      );

      setStudents(studentsWithGrades);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = (section) => {
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
      const user = JSON.parse(localStorage.getItem('user'));
      await api.post('/grades', {
        section_id: selectedSection.section_id,
        student_id: editingStudent.student_id,
        attendance: values.attendance,
        midterm: values.midterm,
        final: values.final,
        lecturer_id: user.username
      });

      message.success('Lưu điểm thành công');
      setGradeModalVisible(false);
      form.resetFields();
      fetchStudentsWithGrades(selectedSection.section_id);
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể lưu điểm');
    }
  };

  const handleSubmitGrades = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Check if all students have grades
      const ungradedStudents = students.filter(s => 
        s.attendance === null || s.midterm === null || s.final === null
      );
      
      if (ungradedStudents.length > 0) {
        message.warning(`Còn ${ungradedStudents.length} sinh viên chưa nhập điểm`);
        return;
      }
      
      await api.post('/grades/submit', {
        section_id: selectedSection.section_id,
        lecturer_id: user.username
      });
      
      message.success('Gửi bảng điểm thành công! Chờ Admin duyệt.');
      fetchStudentsWithGrades(selectedSection.section_id);
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể gửi bảng điểm');
    }
  };

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
      render: (value) => value !== null && value !== undefined ? value.toFixed(1) : '-'
    },
    {
      title: 'Giữa kỳ',
      dataIndex: 'midterm',
      key: 'midterm',
      width: 100,
      align: 'center',
      render: (value) => value !== null && value !== undefined ? value.toFixed(1) : '-'
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'final',
      key: 'final',
      width: 100,
      align: 'center',
      render: (value) => value !== null && value !== undefined ? value.toFixed(1) : '-'
    },
    {
      title: 'Tổng kết',
      dataIndex: 'total_10',
      key: 'total_10',
      width: 100,
      align: 'center',
      render: (value, record) => (
        <Space>
          {value !== null && value !== undefined ? (
            <>
              <span style={{ fontWeight: 'bold' }}>{value.toFixed(1)}</span>
              <Tag color={getGradeColor(record.grade_char)}>{record.grade_char}</Tag>
            </>
          ) : '-'}
        </Space>
      )
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
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditGrade(record)}
          disabled={record.status === 'APPROVED' || record.status === 'SUBMITTED'}
        >
          {record.attendance !== null ? 'Sửa' : 'Nhập điểm'}
        </Button>
      )
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
          <Table
            columns={sectionColumns}
            dataSource={sections}
            rowKey="section_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
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
                  disabled={students.some(s => s.status === 'SUBMITTED' || s.status === 'APPROVED')}
                >
                  Gửi duyệt
                </Button>
              </Popconfirm>
              <Button onClick={() => {
                setSelectedSection(null);
                setStudents([]);
              }}>
                Quay lại
              </Button>
            </Space>
          }
        >
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
        </Card>
      )}

      {/* Grade Entry Modal */}
      <Modal
        title={`Nhập điểm - ${editingStudent?.full_name}`}
        open={gradeModalVisible}
        onCancel={() => {
          setGradeModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveGrade}
        >
          <Form.Item
            name="attendance"
            label="Điểm chuyên cần (0-10)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm chuyên cần' },
              { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0 đến 10' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập điểm chuyên cần"
              step={0.1}
              precision={1}
            />
          </Form.Item>

          <Form.Item
            name="midterm"
            label="Điểm giữa kỳ (0-10)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm giữa kỳ' },
              { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0 đến 10' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập điểm giữa kỳ"
              step={0.1}
              precision={1}
            />
          </Form.Item>

          <Form.Item
            name="final"
            label="Điểm cuối kỳ (0-10)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm cuối kỳ' },
              { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0 đến 10' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập điểm cuối kỳ"
              step={0.1}
              precision={1}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Lưu điểm
              </Button>
              <Button onClick={() => {
                setGradeModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeEntryPage;

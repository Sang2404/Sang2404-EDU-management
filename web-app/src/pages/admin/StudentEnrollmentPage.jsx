import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  message, 
  Popconfirm,
  Tag,
  Space,
  Input,
  Divider,
  Alert,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  TeamOutlined, 
  UserAddOutlined,
  UsergroupAddOutlined 
} from '@ant-design/icons';
import axios from '../../config/axios';

const { Option } = Select;
const { TextArea } = Input;

const StudentEnrollmentPage = () => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();

  useEffect(() => {
    fetchCourseSections();
    fetchAllStudents();
  }, []);

  const fetchCourseSections = async () => {
    try {
      const response = await axios.get('/academic/course-sections');
      setCourseSections(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học phần');
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await axios.get('/users?role=STUDENT');
      // API trả về {users: [...], totalUsers, ...}
      setAllStudents(response.data.users || []);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên');
      setAllStudents([]);
    }
  };

  const fetchStudentsInSection = async (sectionId) => {
    if (!sectionId) {
      setStudents([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`/academic/course-sections/${sectionId}/students`);
      setStudents(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên trong lớp');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    fetchStudentsInSection(sectionId);
  };

  const handleAddStudent = () => {
    if (!selectedSection) {
      message.warning('Vui lòng chọn lớp học phần trước');
      return;
    }
    form.resetFields();
    setModalVisible(true);
  };

  const handleBulkAdd = () => {
    if (!selectedSection) {
      message.warning('Vui lòng chọn lớp học phần trước');
      return;
    }
    bulkForm.resetFields();
    setBulkModalVisible(true);
  };

  const handleSubmitSingle = async (values) => {
    try {
      await axios.post(`/academic/course-sections/${selectedSection}/students`, {
        student_id: values.student_id
      });
      message.success('Thêm sinh viên vào lớp thành công');
      setModalVisible(false);
      form.resetFields();
      fetchStudentsInSection(selectedSection);
      fetchCourseSections(); // Refresh to update enrollment count
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể thêm sinh viên');
    }
  };

  const handleSubmitBulk = async (values) => {
    try {
      // Parse student IDs from textarea (one per line)
      const studentIds = values.student_ids
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (studentIds.length === 0) {
        message.warning('Vui lòng nhập ít nhất một mã sinh viên');
        return;
      }

      const response = await axios.post(
        `/academic/course-sections/${selectedSection}/students/bulk`,
        { student_ids: studentIds }
      );

      const { successful, failed, skipped } = response.data;
      
      // Show detailed results
      Modal.info({
        title: 'Kết quả thêm sinh viên hàng loạt',
        width: 600,
        content: (
          <div>
            <p><strong>Thành công:</strong> {successful.length} sinh viên</p>
            <p><strong>Đã tồn tại:</strong> {skipped.length} sinh viên</p>
            <p><strong>Thất bại:</strong> {failed.length} sinh viên</p>
            
            {failed.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <p><strong>Chi tiết lỗi:</strong></p>
                <ul style={{ maxHeight: 200, overflow: 'auto' }}>
                  {failed.map((item, index) => (
                    <li key={index}>
                      {item.student_id}: {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      });

      setBulkModalVisible(false);
      bulkForm.resetFields();
      fetchStudentsInSection(selectedSection);
      fetchCourseSections(); // Refresh to update enrollment count
    } catch (error) {
      message.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/academic/course-sections/${selectedSection}/students/${studentId}`);
      message.success('Xóa sinh viên khỏi lớp thành công');
      fetchStudentsInSection(selectedSection);
      fetchCourseSections(); // Refresh to update enrollment count
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể xóa sinh viên');
    }
  };

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 120,
      fixed: 'left'
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
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolled_at',
      key: 'enrolled_at',
      width: 180,
      render: (text) => new Date(text).toLocaleString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa sinh viên này khỏi lớp?"
          onConfirm={() => handleRemoveStudent(record.student_id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      )
    }
  ];

  // Get selected section details
  const sectionDetails = courseSections.find(s => s.section_id === selectedSection);

  // Get available students (not yet enrolled)
  const enrolledStudentIds = students.map(s => s.student_id);
  const availableStudents = allStudents.filter(s => !enrolledStudentIds.includes(s.user_id));

  return (
    <div>
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>Quản lý Sinh viên trong Lớp</span>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <span style={{ marginRight: 8 }}>Chọn lớp học phần:</span>
              <Select
                style={{ width: 400 }}
                placeholder="Chọn lớp học phần"
                showSearch
                optionFilterProp="children"
                value={selectedSection}
                onChange={handleSectionChange}
                allowClear
              >
                {courseSections.map(section => (
                  <Option key={section.section_id} value={section.section_id}>
                    {section.section_code} - {section.subject_name} ({section.semester} - {section.academic_year})
                  </Option>
                ))}
              </Select>
            </div>

            {sectionDetails && (
              <Alert
                message={
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic 
                        title="Môn học" 
                        value={sectionDetails.subject_name}
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="Giảng viên" 
                        value={sectionDetails.lecturer_name}
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="Sĩ số" 
                        value={`${sectionDetails.enrolled_count || 0}/${sectionDetails.max_capacity}`}
                        valueStyle={{ 
                          fontSize: 16,
                          color: (sectionDetails.enrolled_count || 0) >= sectionDetails.max_capacity ? '#ff4d4f' : '#52c41a'
                        }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="Trạng thái" 
                        value={sectionDetails.is_locked ? 'Đã khóa' : 'Mở'}
                        valueStyle={{ 
                          fontSize: 16,
                          color: sectionDetails.is_locked ? '#ff4d4f' : '#52c41a'
                        }}
                      />
                    </Col>
                  </Row>
                }
                type="info"
              />
            )}
          </Space>
        </div>

        {selectedSection && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={handleAddStudent}
                disabled={sectionDetails?.is_locked}
              >
                Thêm sinh viên
              </Button>
              <Button 
                type="default" 
                icon={<UsergroupAddOutlined />} 
                onClick={handleBulkAdd}
                disabled={sectionDetails?.is_locked}
              >
                Thêm hàng loạt
              </Button>
            </Space>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={students}
          rowKey="student_id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} sinh viên`
          }}
          locale={{
            emptyText: selectedSection 
              ? 'Chưa có sinh viên nào trong lớp' 
              : 'Vui lòng chọn lớp học phần'
          }}
        />
      </Card>

      {/* Single Add Modal */}
      <Modal
        title="Thêm sinh viên vào lớp"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitSingle}
        >
          <Form.Item
            name="student_id"
            label="Sinh viên"
            rules={[{ required: true, message: 'Vui lòng chọn sinh viên' }]}
          >
            <Select
              placeholder="Chọn sinh viên"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableStudents.map(student => (
                <Option key={student.user_id} value={student.user_id}>
                  {student.user_id} - {student.full_name} ({student.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        title="Thêm sinh viên hàng loạt"
        open={bulkModalVisible}
        onCancel={() => {
          setBulkModalVisible(false);
          bulkForm.resetFields();
        }}
        onOk={() => bulkForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={bulkForm}
          layout="vertical"
          onFinish={handleSubmitBulk}
        >
          <Alert
            message="Hướng dẫn"
            description="Nhập mã sinh viên, mỗi mã trên một dòng. Hệ thống sẽ tự động kiểm tra và bỏ qua các sinh viên đã đăng ký."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="student_ids"
            label="Danh sách mã sinh viên"
            rules={[{ required: true, message: 'Vui lòng nhập danh sách mã sinh viên' }]}
          >
            <TextArea
              rows={10}
              placeholder="Ví dụ:&#10;SV001&#10;SV002&#10;SV003"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentEnrollmentPage;

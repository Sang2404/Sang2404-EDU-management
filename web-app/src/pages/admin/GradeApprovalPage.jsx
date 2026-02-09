import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input,
  message, 
  Tag,
  Space,
  Descriptions,
  Divider
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from '../../config/axios';

const { TextArea } = Input;

const GradeApprovalPage = () => {
  const [pendingSections, setPendingSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const fetchPendingGrades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/grades/pending');
      setPendingSections(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách bảng điểm chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionGrades = async (sectionId) => {
    setGradesLoading(true);
    try {
      // Get lecturer_id for the section first
      const sectionResponse = await axios.get(`/academic/course-sections/${sectionId}`);
      const lecturerId = sectionResponse.data.lecturer_id;
      
      // Fetch grades using lecturer endpoint
      const gradesResponse = await axios.get(`/lecturers/${lecturerId}/sections/${sectionId}/grades`);
      setGrades(gradesResponse.data);
    } catch (error) {
      message.error('Không thể tải chi tiết bảng điểm');
      setGrades([]);
    } finally {
      setGradesLoading(false);
    }
  };

  const handleViewGrades = (record) => {
    setSelectedSection(record);
    fetchSectionGrades(record.section_id);
    setViewModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedSection(record);
    setApproveModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedSection(record);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const confirmApprove = async () => {
    try {
      await axios.post(`/admin/sections/${selectedSection.section_id}/grades/approve`);
      message.success('Phê duyệt bảng điểm thành công');
      setApproveModalVisible(false);
      fetchPendingGrades();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể phê duyệt bảng điểm');
    }
  };

  const confirmReject = async (values) => {
    try {
      await axios.post(`/admin/sections/${selectedSection.section_id}/grades/reject`, {
        reason: values.reason
      });
      message.success('Từ chối bảng điểm thành công');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      fetchPendingGrades();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể từ chối bảng điểm');
    }
  };

  const getGradeColor = (gradeChar) => {
    const colors = {
      'A': 'green',
      'B+': 'cyan',
      'B': 'blue',
      'C+': 'geekblue',
      'C': 'purple',
      'D+': 'orange',
      'D': 'gold',
      'F': 'red'
    };
    return colors[gradeChar] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'default',
      'SUBMITTED': 'orange',
      'APPROVED': 'green'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'DRAFT': 'Nháp',
      'SUBMITTED': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt'
    };
    return texts[status] || status;
  };

  const pendingColumns = [
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
      width: 200
    },
    {
      title: 'Giảng viên',
      dataIndex: 'lecturer_name',
      key: 'lecturer_name',
      width: 180
    },
    {
      title: 'Học kỳ',
      key: 'semester_year',
      width: 150,
      render: (_, record) => `${record.semester} - ${record.academic_year}`
    },
    {
      title: 'Số điểm',
      dataIndex: 'total_grades',
      key: 'total_grades',
      width: 100,
      align: 'center'
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewGrades(record)}
          >
            Xem chi tiết
          </Button>
          <Button 
            type="link" 
            icon={<CheckOutlined />} 
            onClick={() => handleApprove(record)}
            style={{ color: '#52c41a' }}
          >
            Duyệt
          </Button>
          <Button 
            type="link" 
            danger
            icon={<CloseOutlined />} 
            onClick={() => handleReject(record)}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  const gradesColumns = [
    {
      title: 'Mã SV',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'student_name',
      key: 'student_name',
      width: 200
    },
    {
      title: 'Chuyên cần',
      dataIndex: 'attendance_score',
      key: 'attendance_score',
      width: 100,
      align: 'center',
      render: (score) => score?.toFixed(1) || '-'
    },
    {
      title: 'Giữa kỳ',
      dataIndex: 'midterm_score',
      key: 'midterm_score',
      width: 100,
      align: 'center',
      render: (score) => score?.toFixed(1) || '-'
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'final_score',
      key: 'final_score',
      width: 100,
      align: 'center',
      render: (score) => score?.toFixed(1) || '-'
    },
    {
      title: 'Tổng (10)',
      dataIndex: 'total_10',
      key: 'total_10',
      width: 100,
      align: 'center',
      render: (score) => <strong>{score?.toFixed(2) || '-'}</strong>
    },
    {
      title: 'Tổng (4)',
      dataIndex: 'total_4',
      key: 'total_4',
      width: 100,
      align: 'center',
      render: (score) => score?.toFixed(1) || '-'
    },
    {
      title: 'Xếp loại',
      dataIndex: 'grade_char',
      key: 'grade_char',
      width: 100,
      align: 'center',
      render: (grade) => (
        <Tag color={getGradeColor(grade)}>
          <strong>{grade || '-'}</strong>
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>Duyệt Bảng điểm</span>
        </Space>
      }
    >
      <Table
        columns={pendingColumns}
        dataSource={pendingSections}
        rowKey="section_id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng số ${total} bảng điểm chờ duyệt`
        }}
        locale={{
          emptyText: 'Không có bảng điểm nào chờ duyệt'
        }}
      />

      {/* View Grades Modal */}
      <Modal
        title={
          selectedSection ? (
            <span>
              Chi tiết bảng điểm - {selectedSection.section_code} ({selectedSection.subject_name})
            </span>
          ) : 'Chi tiết bảng điểm'
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedSection(null);
          setGrades([]);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="approve" 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              handleApprove(selectedSection);
            }}
          >
            Phê duyệt
          </Button>,
          <Button 
            key="reject" 
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              handleReject(selectedSection);
            }}
          >
            Từ chối
          </Button>
        ]}
        width={1200}
      >
        {selectedSection && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã lớp">{selectedSection.section_code}</Descriptions.Item>
              <Descriptions.Item label="Môn học">{selectedSection.subject_name}</Descriptions.Item>
              <Descriptions.Item label="Giảng viên">{selectedSection.lecturer_name}</Descriptions.Item>
              <Descriptions.Item label="Học kỳ">
                {selectedSection.semester} - {selectedSection.academic_year}
              </Descriptions.Item>
              <Descriptions.Item label="Số điểm" span={2}>
                {selectedSection.total_grades} sinh viên
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Table
              columns={gradesColumns}
              dataSource={grades}
              rowKey="grade_id"
              loading={gradesLoading}
              scroll={{ x: 1000 }}
              pagination={false}
              size="small"
            />
          </>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        title="Xác nhận phê duyệt"
        open={approveModalVisible}
        onOk={confirmApprove}
        onCancel={() => setApproveModalVisible(false)}
        okText="Phê duyệt"
        cancelText="Hủy"
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        {selectedSection && (
          <div>
            <p>Bạn có chắc chắn muốn phê duyệt bảng điểm này?</p>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã lớp">{selectedSection.section_code}</Descriptions.Item>
              <Descriptions.Item label="Môn học">{selectedSection.subject_name}</Descriptions.Item>
              <Descriptions.Item label="Giảng viên">{selectedSection.lecturer_name}</Descriptions.Item>
              <Descriptions.Item label="Số điểm">{selectedSection.total_grades} sinh viên</Descriptions.Item>
            </Descriptions>
            <p style={{ marginTop: 16, color: '#52c41a' }}>
              <CheckOutlined /> Sau khi phê duyệt, bảng điểm sẽ được công bố cho sinh viên và không thể chỉnh sửa.
            </p>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối bảng điểm"
        open={rejectModalVisible}
        onOk={() => rejectForm.submit()}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, icon: <CloseOutlined /> }}
      >
        {selectedSection && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã lớp">{selectedSection.section_code}</Descriptions.Item>
              <Descriptions.Item label="Môn học">{selectedSection.subject_name}</Descriptions.Item>
              <Descriptions.Item label="Giảng viên">{selectedSection.lecturer_name}</Descriptions.Item>
            </Descriptions>
            
            <Form
              form={rejectForm}
              layout="vertical"
              onFinish={confirmReject}
            >
              <Form.Item
                name="reason"
                label="Lý do từ chối"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do từ chối' },
                  { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối bảng điểm (ví dụ: Điểm chưa chính xác, cần kiểm tra lại...)"
                />
              </Form.Item>
            </Form>
            
            <p style={{ color: '#ff4d4f' }}>
              <CloseOutlined /> Sau khi từ chối, bảng điểm sẽ được chuyển về trạng thái nháp để giảng viên chỉnh sửa.
            </p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default GradeApprovalPage;

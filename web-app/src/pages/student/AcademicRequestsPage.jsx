import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Space, Descriptions } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import axios from '../../config/axios';

const { TextArea } = Input;
const { Option } = Select;

const AcademicRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [grades, setGrades] = useState([]);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user.username;

  useEffect(() => {
    fetchRequests();
    fetchGrades();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/academic-requests/students/${studentId}`);
      setRequests(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách yêu cầu');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`/academic/students/${studentId}/sections`);
      const sections = response.data;
      
      // Get grades for all sections
      const gradesPromises = sections.map(section =>
        axios.get(`/grades/section/${section.section_id}`)
          .then(res => res.data.filter(g => g.student_id === studentId))
          .catch(() => [])
      );
      
      const allGrades = await Promise.all(gradesPromises);
      const flatGrades = allGrades.flat().filter(g => g.status === 'APPROVED');
      setGrades(flatGrades);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await axios.post('/academic-requests', {
        student_id: studentId,
        request_type: values.request_type,
        reason: values.reason,
        grade_id: values.grade_id || null
      });
      
      message.success('Gửi yêu cầu thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể gửi yêu cầu');
    }
  };

  const showDetail = (record) => {
    setSelectedRequest(record);
    setIsDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'processing',
      'APPROVED': 'success',
      'REJECTED': 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'request_id',
      key: 'request_id',
      width: 100,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'request_type_display',
      key: 'request_type_display',
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      render: (text, record) => text || record.section_code || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={getStatusColor(status)}>
          {record.status_display}
        </Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Yêu cầu học vụ"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Gửi yêu cầu mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="request_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Request Modal */}
      <Modal
        title="Gửi yêu cầu học vụ"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="request_type"
            label="Loại yêu cầu"
            rules={[{ required: true, message: 'Vui lòng chọn loại yêu cầu' }]}
          >
            <Select placeholder="Chọn loại yêu cầu">
              <Option value="REVIEW">Phúc khảo điểm</Option>
              <Option value="RESERVE">Bảo lưu</Option>
              <Option value="RETAKE">Học lại</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.request_type !== currentValues.request_type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('request_type') === 'REVIEW' ? (
                <Form.Item
                  name="grade_id"
                  label="Chọn môn học cần phúc khảo"
                  rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                >
                  <Select placeholder="Chọn môn học">
                    {grades.map(grade => (
                      <Option key={grade.grade_id} value={grade.grade_id}>
                        {grade.subject_name} - {grade.section_code} (Điểm: {grade.grade_char})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do' },
              { min: 20, message: 'Lý do phải có ít nhất 20 ký tự' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do chi tiết (tối thiểu 20 ký tự)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Gửi yêu cầu
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRequest && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã yêu cầu">
              {selectedRequest.request_id}
            </Descriptions.Item>
            <Descriptions.Item label="Loại yêu cầu">
              {selectedRequest.request_type_display}
            </Descriptions.Item>
            {selectedRequest.subject_name && (
              <Descriptions.Item label="Môn học">
                {selectedRequest.subject_name} ({selectedRequest.section_code})
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedRequest.status)}>
                {selectedRequest.status_display}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">
              {selectedRequest.reason}
            </Descriptions.Item>
            {selectedRequest.admin_response && (
              <Descriptions.Item label="Phản hồi từ phòng đào tạo">
                {selectedRequest.admin_response}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày gửi">
              {new Date(selectedRequest.created_at).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
              <Descriptions.Item label="Ngày cập nhật">
                {new Date(selectedRequest.updated_at).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AcademicRequestsPage;

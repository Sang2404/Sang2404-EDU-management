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
  Select,
  Tabs
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined,
  FileSearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from '../../config/axios';

const { TextArea } = Input;
const { Option } = Select;

const AcademicRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  // Filter states - mặc định chỉ hiển thị yêu cầu cần xử lý (PENDING)
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [filterType, setFilterType] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterType]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/admin/academic-requests';
      const params = [];
      
      if (filterStatus) {
        params.push(`status=${filterStatus}`);
      }
      if (filterType) {
        params.push(`type=${filterType}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const response = await axios.get(url);
      setRequests(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách yêu cầu';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedRequest(record);
    approveForm.resetFields();
    setApproveModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedRequest(record);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const confirmApprove = async (values) => {
    try {
      await axios.post(`/admin/academic-requests/${selectedRequest.request_id}/approve`, {
        admin_response: values.admin_response
      });
      message.success('Phê duyệt yêu cầu thành công');
      setApproveModalVisible(false);
      approveForm.resetFields();
      // Làm mới danh sách để loại bỏ yêu cầu đã xử lý
      fetchRequests();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể phê duyệt yêu cầu');
    }
  };

  const confirmReject = async (values) => {
    try {
      await axios.post(`/admin/academic-requests/${selectedRequest.request_id}/reject`, {
        admin_response: values.admin_response
      });
      message.success('Từ chối yêu cầu thành công');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      // Làm mới danh sách để loại bỏ yêu cầu đã xử lý
      fetchRequests();
    } catch (error) {
      message.error(error.response?.data?.error || 'Không thể từ chối yêu cầu');
    }
  };

  const getRequestTypeColor = (type) => {
    const colors = {
      'REVIEW': 'blue',
      'RESERVE': 'orange',
      'RETAKE': 'purple'
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Mã YC',
      dataIndex: 'request_id',
      key: 'request_id',
      width: 80,
      fixed: 'left'
    },
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
      width: 180
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'request_type_display',
      key: 'request_type_display',
      width: 150,
      render: (text, record) => (
        <Tag color={getRequestTypeColor(record.request_type)}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Môn học',
      key: 'subject',
      width: 180,
      render: (_, record) => {
        if (record.section_code && record.subject_name) {
          return `${record.section_code} - ${record.subject_name}`;
        }
        return <span style={{ color: '#999' }}>Không liên quan môn học</span>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_display',
      key: 'status_display',
      width: 130,
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text) => new Date(text).toLocaleDateString('vi-VN')
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
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          {record.status === 'PENDING' && (
            <>
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
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <FileSearchOutlined />
          <span>Xử lý Yêu cầu Học vụ</span>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <FilterOutlined />
          <span>Lọc theo trạng thái:</span>
          <Select
            style={{ width: 150 }}
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            placeholder="Tất cả trạng thái"
          >
            <Option value="PENDING">Chờ xử lý</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Đã từ chối</Option>
          </Select>
          
          <span style={{ marginLeft: 16 }}>Loại yêu cầu:</span>
          <Select
            style={{ width: 180 }}
            value={filterType}
            onChange={setFilterType}
            allowClear
            placeholder="Tất cả loại yêu cầu"
          >
            <Option value="REVIEW">Phúc khảo điểm</Option>
            <Option value="RESERVE">Bảo lưu</Option>
            <Option value="RETAKE">Học lại</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={requests}
        rowKey="request_id"
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng số ${total} yêu cầu cần xử lý`
        }}
      />

      {/* View Details Modal */}
      <Modal
        title={`Chi tiết yêu cầu #${selectedRequest?.request_id || ''}`}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          ...(selectedRequest?.status === 'PENDING' ? [
            <Button 
              key="approve" 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={() => {
                setViewModalVisible(false);
                handleApprove(selectedRequest);
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
                handleReject(selectedRequest);
              }}
            >
              Từ chối
            </Button>
          ] : [])
        ]}
        width={700}
      >
        {selectedRequest && (
          <Tabs 
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Thông tin chung',
                children: (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Mã yêu cầu">
                      {selectedRequest.request_id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã sinh viên">
                      {selectedRequest.student_id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">
                      {selectedRequest.student_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedRequest.student_email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại yêu cầu">
                      <Tag color={getRequestTypeColor(selectedRequest.request_type)}>
                        {selectedRequest.request_type_display}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status_display}
                      </Tag>
                    </Descriptions.Item>
                    {selectedRequest.section_code && (
                      <>
                        <Descriptions.Item label="Mã lớp">
                          {selectedRequest.section_code}
                        </Descriptions.Item>
                        <Descriptions.Item label="Môn học">
                          {selectedRequest.subject_name}
                        </Descriptions.Item>
                      </>
                    )}
                    <Descriptions.Item label="Ngày gửi">
                      {new Date(selectedRequest.created_at).toLocaleString('vi-VN')}
                    </Descriptions.Item>
                    {selectedRequest.updated_at && (
                      <Descriptions.Item label="Ngày cập nhật">
                        {new Date(selectedRequest.updated_at).toLocaleString('vi-VN')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                )
              },
              {
                key: 'content',
                label: 'Nội dung yêu cầu',
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <h4>Lý do:</h4>
                    <div style={{ 
                      padding: 12, 
                      background: '#f5f5f5', 
                      borderRadius: 4,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedRequest.reason}
                    </div>
                    
                    {selectedRequest.admin_response && (
                      <>
                        <h4 style={{ marginTop: 24 }}>Phản hồi của Admin:</h4>
                        <div style={{ 
                          padding: 12, 
                          background: selectedRequest.status === 'APPROVED' ? '#f6ffed' : '#fff2e8',
                          border: `1px solid ${selectedRequest.status === 'APPROVED' ? '#b7eb8f' : '#ffbb96'}`,
                          borderRadius: 4,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {selectedRequest.admin_response}
                        </div>
                      </>
                    )}
                  </div>
                )
              }
            ]}
          />
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Phê duyệt yêu cầu"
        open={approveModalVisible}
        onOk={() => approveForm.submit()}
        onCancel={() => {
          setApproveModalVisible(false);
          approveForm.resetFields();
        }}
        okText="Phê duyệt"
        cancelText="Hủy"
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        {selectedRequest && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã SV">
                {selectedRequest.student_id} - {selectedRequest.student_name}
              </Descriptions.Item>
              <Descriptions.Item label="Loại yêu cầu">
                <Tag color={getRequestTypeColor(selectedRequest.request_type)}>
                  {selectedRequest.request_type_display}
                </Tag>
              </Descriptions.Item>
              {selectedRequest.section_code && (
                <Descriptions.Item label="Môn học">
                  {selectedRequest.section_code} - {selectedRequest.subject_name}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div style={{ 
              padding: 12, 
              background: '#f5f5f5', 
              borderRadius: 4,
              marginBottom: 16,
              maxHeight: 150,
              overflow: 'auto'
            }}>
              <strong>Lý do:</strong>
              <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {selectedRequest.reason}
              </div>
            </div>
            
            <Form
              form={approveForm}
              layout="vertical"
              onFinish={confirmApprove}
            >
              <Form.Item
                name="admin_response"
                label="Phản hồi"
                rules={[
                  { required: true, message: 'Vui lòng nhập phản hồi' },
                  { min: 10, message: 'Phản hồi phải có ít nhất 10 ký tự' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập phản hồi cho sinh viên (ví dụ: Yêu cầu đã được phê duyệt...)"
                />
              </Form.Item>
            </Form>
            
            <p style={{ color: '#52c41a', marginTop: 8 }}>
              <CheckOutlined /> Yêu cầu sẽ được phê duyệt và sinh viên sẽ nhận được thông báo.
            </p>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu"
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
        {selectedRequest && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã SV">
                {selectedRequest.student_id} - {selectedRequest.student_name}
              </Descriptions.Item>
              <Descriptions.Item label="Loại yêu cầu">
                <Tag color={getRequestTypeColor(selectedRequest.request_type)}>
                  {selectedRequest.request_type_display}
                </Tag>
              </Descriptions.Item>
              {selectedRequest.section_code && (
                <Descriptions.Item label="Môn học">
                  {selectedRequest.section_code} - {selectedRequest.subject_name}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div style={{ 
              padding: 12, 
              background: '#f5f5f5', 
              borderRadius: 4,
              marginBottom: 16,
              maxHeight: 150,
              overflow: 'auto'
            }}>
              <strong>Lý do:</strong>
              <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {selectedRequest.reason}
              </div>
            </div>
            
            <Form
              form={rejectForm}
              layout="vertical"
              onFinish={confirmReject}
            >
              <Form.Item
                name="admin_response"
                label="Lý do từ chối"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do từ chối' },
                  { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối (ví dụ: Không đủ điều kiện, thiếu chứng từ...)"
                />
              </Form.Item>
            </Form>
            
            <p style={{ color: '#ff4d4f', marginTop: 8 }}>
              <CloseOutlined /> Yêu cầu sẽ bị từ chối và sinh viên sẽ nhận được thông báo.
            </p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AcademicRequestsPage;


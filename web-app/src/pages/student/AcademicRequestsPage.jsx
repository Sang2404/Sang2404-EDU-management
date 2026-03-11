import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Descriptions, Alert, Spin, Tabs } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import axios from '../../config/axios';

const { TextArea } = Input;
const { Option } = Select;

const AcademicRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [grades, setGrades] = useState([]);
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [activeTab, setActiveTab] = useState('REVIEW');
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user.username;

  useEffect(() => {
    fetchRequests();
    fetchGrades();
    fetchEnrolledSections();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/academic-requests/students/${studentId}`);
      setRequests(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách yêu cầu';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`/grades/students/${studentId}`);
      // Chỉ lấy các môn đã có điểm được duyệt
      const approvedGrades = response.data.filter(g => 
        g.status === 'APPROVED' && 
        g.grade_char && 
        g.total_10 != null
      );
      setGrades(approvedGrades);
    } catch (error) {
      // Silent error for grades - not critical
    }
  };

  const fetchEnrolledSections = async () => {
    try {
      const response = await axios.get(`/academic/students/${studentId}/sections`);
      setEnrolledSections(response.data);
    } catch (error) {
      // Silent error for enrolled sections - not critical
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      const payload = {
        student_id: studentId,
        request_type: activeTab,
        reason: values.reason
      };

      // Add type-specific fields
      if (activeTab === 'REVIEW') {
        payload.grade_id = values.grade_id;
      } else if (activeTab === 'RESERVE') {
        payload.section_id = values.section_id;
      } else if (activeTab === 'RETAKE') {
        payload.grade_id = values.grade_id;
      }

      await axios.post('/academic-requests', payload);
      
      const typeText = {
        'REVIEW': 'phúc khảo',
        'RESERVE': 'bảo lưu',
        'RETAKE': 'học lại'
      };
      
      message.success(`Gửi yêu cầu ${typeText[activeTab]} thành công`);
      setIsModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể gửi yêu cầu';
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
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

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Đang xử lý',
      'APPROVED': 'Đã chấp nhận',
      'REJECTED': 'Đã từ chối'
    };
    return texts[status] || status;
  };

  const getRequestTypeText = (type) => {
    const texts = {
      'REVIEW': 'Phúc khảo',
      'RESERVE': 'Bảo lưu',
      'RETAKE': 'Học lại'
    };
    return texts[type] || type;
  };

  const columns = [
    {
      title: 'Mã YC',
      dataIndex: 'request_id',
      key: 'request_id',
      width: 80,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'request_type',
      key: 'request_type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'REVIEW' ? 'blue' : type === 'RESERVE' ? 'orange' : 'purple'}>
          {getRequestTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text || '-'}</div>
          {record.section_code && (
            <div style={{ fontSize: 12, color: '#666' }}>{record.section_code}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
          aria-label={`Xem chi tiết yêu cầu ${getRequestTypeText(record.request_type)}`}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const getModalTitle = () => {
    const titles = {
      'REVIEW': 'Gửi yêu cầu phúc khảo điểm',
      'RESERVE': 'Gửi yêu cầu bảo lưu',
      'RETAKE': 'Gửi yêu cầu học lại'
    };
    return titles[activeTab];
  };

  const getButtonText = () => {
    const texts = {
      'REVIEW': 'Gửi yêu cầu phúc khảo',
      'RESERVE': 'Gửi yêu cầu bảo lưu',
      'RETAKE': 'Gửi yêu cầu học lại'
    };
    return texts[activeTab];
  };

  const isButtonDisabled = () => {
    if (activeTab === 'REVIEW') return grades.length === 0 || loading;
    if (activeTab === 'RESERVE') return enrolledSections.length === 0 || loading;
    if (activeTab === 'RETAKE') return grades.filter(g => g.total_10 < 4.0).length === 0 || loading;
    return loading;
  };

  return (
    <div>
      <Card
        title="Yêu cầu học vụ"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            disabled={isButtonDisabled()}
            aria-label={getButtonText()}
          >
            {getButtonText()}
          </Button>
        }
      >
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang tải danh sách yêu cầu...</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="request_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Chưa có yêu cầu nào' }}
          />
        )}
      </Card>

      {/* Create Request Modal */}
      <Modal
        title={getModalTitle()}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        confirmLoading={submitLoading}
        aria-labelledby="academic-request-modal-title"
      >
        {submitLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang gửi yêu cầu...</p>
          </div>
        ) : (
          <>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                form.resetFields();
              }}
              items={[
                {
                  key: 'REVIEW',
                  label: 'Phúc khảo',
                  children: (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                    >
                      <Form.Item
                        name="grade_id"
                        label="Chọn môn học cần phúc khảo"
                        rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                      >
                        <Select 
                          placeholder="Chọn môn học"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                          disabled={submitLoading}
                          aria-label="Chọn môn học cần phúc khảo"
                        >
                          {grades.map(grade => (
                            <Option key={grade.grade_id} value={grade.grade_id}>
                              {grade.subject_name} - {grade.section_code} (Điểm: {grade.grade_char} - {grade.total_10 != null && typeof grade.total_10 === 'number' ? grade.total_10.toFixed(1) : parseFloat(grade.total_10).toFixed(1)})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="reason"
                        label="Lý do phúc khảo"
                        rules={[
                          { required: true, message: 'Vui lòng nhập lý do phúc khảo' },
                          { min: 20, message: 'Lý do phải có ít nhất 20 ký tự' }
                        ]}
                        extra="Vui lòng nêu rõ lý do và phần điểm cần phúc khảo (chuyên cần, giữa kỳ, cuối kỳ)"
                      >
                        <TextArea
                          rows={5}
                          placeholder="Ví dụ: Em xin phúc khảo điểm cuối kỳ môn Lập trình căn bản. Em đã làm đầy đủ các câu hỏi nhưng điểm cuối kỳ chỉ được 5.0, em cho rằng điểm này chưa phản ánh đúng kết quả làm bài của em..."
                          showCount
                          maxLength={500}
                          disabled={submitLoading}
                          aria-label="Lý do phúc khảo"
                        />
                      </Form.Item>

                      <Alert
                        message="Lưu ý"
                        description="Yêu cầu phúc khảo sẽ được phòng đào tạo xem xét và phản hồi trong vòng 7 ngày làm việc."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Form.Item style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Button onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                          }} disabled={submitLoading} aria-label="Hủy gửi yêu cầu phúc khảo">
                            Hủy
                          </Button>
                          <Button type="primary" htmlType="submit" loading={submitLoading} aria-label="Gửi yêu cầu phúc khảo">
                            Gửi yêu cầu
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  )
                },
                {
                  key: 'RESERVE',
                  label: 'Bảo lưu',
                  children: (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                    >
                      <Form.Item
                        name="section_id"
                        label="Chọn lớp học phần cần bảo lưu"
                        rules={[{ required: true, message: 'Vui lòng chọn lớp học phần' }]}
                      >
                        <Select 
                          placeholder="Chọn lớp học phần"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                          disabled={submitLoading}
                          aria-label="Chọn lớp học phần cần bảo lưu"
                        >
                          {enrolledSections.map(section => (
                            <Option key={section.section_id} value={section.section_id}>
                              {section.section_code} - {section.subject_name} ({section.semester} - {section.academic_year})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="reason"
                        label="Lý do bảo lưu"
                        rules={[
                          { required: true, message: 'Vui lòng nhập lý do bảo lưu' },
                          { min: 20, message: 'Lý do phải có ít nhất 20 ký tự' }
                        ]}
                        extra="Vui lòng nêu rõ lý do bảo lưu (ví dụ: lý do sức khỏe, hoàn cảnh gia đình, v.v.)"
                      >
                        <TextArea
                          rows={5}
                          placeholder="Ví dụ: Em xin bảo lưu môn Lập trình căn bản do em bị bệnh trong thời gian học kỳ này và không thể hoàn thành bài tập cuối kỳ..."
                          showCount
                          maxLength={500}
                          disabled={submitLoading}
                          aria-label="Lý do bảo lưu"
                        />
                      </Form.Item>

                      <Alert
                        message="Lưu ý"
                        description="Yêu cầu bảo lưu sẽ được phòng đào tạo xem xét. Nếu được chấp nhận, bạn sẽ được phép học lại môn này trong học kỳ tiếp theo mà không bị tính điểm F."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Form.Item style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Button onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                          }} disabled={submitLoading} aria-label="Hủy gửi yêu cầu bảo lưu">
                            Hủy
                          </Button>
                          <Button type="primary" htmlType="submit" loading={submitLoading} aria-label="Gửi yêu cầu bảo lưu">
                            Gửi yêu cầu
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  )
                },
                {
                  key: 'RETAKE',
                  label: 'Học lại',
                  children: (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                    >
                      <Form.Item
                        name="grade_id"
                        label="Chọn môn học cần học lại"
                        rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                      >
                        <Select 
                          placeholder="Chọn môn học"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                          disabled={submitLoading}
                          aria-label="Chọn môn học cần học lại"
                        >
                          {grades.filter(g => g.total_10 < 4.0).map(grade => (
                            <Option key={grade.grade_id} value={grade.grade_id}>
                              {grade.subject_name} - {grade.section_code} (Điểm: {grade.grade_char} - {grade.total_10 != null && typeof grade.total_10 === 'number' ? grade.total_10.toFixed(1) : parseFloat(grade.total_10).toFixed(1)})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="reason"
                        label="Lý do học lại"
                        rules={[
                          { required: true, message: 'Vui lòng nhập lý do học lại' },
                          { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
                        ]}
                        extra="Vui lòng nêu rõ lý do muốn học lại môn này"
                      >
                        <TextArea
                          rows={5}
                          placeholder="Ví dụ: Em muốn học lại môn Lập trình căn bản để cải thiện điểm số và nắm vững kiến thức cơ bản..."
                          showCount
                          maxLength={500}
                          disabled={submitLoading}
                          aria-label="Lý do học lại"
                        />
                      </Form.Item>

                      <Alert
                        message="Lưu ý"
                        description="Yêu cầu học lại sẽ được phòng đào tạo xem xét. Nếu được chấp nhận, bạn sẽ được phép đăng ký học lại môn này. Điểm mới sẽ thay thế điểm cũ."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Form.Item style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Button onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                          }} disabled={submitLoading} aria-label="Hủy gửi yêu cầu học lại">
                            Hủy
                          </Button>
                          <Button type="primary" htmlType="submit" loading={submitLoading} aria-label="Gửi yêu cầu học lại">
                            Gửi yêu cầu
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  )
                }
              ]}
            />
          </>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu học vụ"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalVisible(false)} aria-label="Đóng chi tiết yêu cầu">
            Đóng
          </Button>
        ]}
        width={700}
        aria-labelledby="academic-request-detail-modal-title"
      >
        {selectedRequest && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã yêu cầu">
              {selectedRequest.request_id}
            </Descriptions.Item>
            <Descriptions.Item label="Loại yêu cầu">
              <Tag color={selectedRequest.request_type === 'REVIEW' ? 'blue' : selectedRequest.request_type === 'RESERVE' ? 'orange' : 'purple'}>
                {getRequestTypeText(selectedRequest.request_type)}
              </Tag>
            </Descriptions.Item>
            {selectedRequest.subject_name && (
              <>
                <Descriptions.Item label="Môn học">
                  {selectedRequest.subject_name}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp học phần">
                  {selectedRequest.section_code}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedRequest.status)}>
                {getStatusText(selectedRequest.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRequest.reason}</div>
            </Descriptions.Item>
            {selectedRequest.admin_response && (
              <Descriptions.Item label="Phản hồi từ phòng đào tạo">
                <div style={{ whiteSpace: 'pre-wrap', color: '#1890ff' }}>
                  {selectedRequest.admin_response}
                </div>
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

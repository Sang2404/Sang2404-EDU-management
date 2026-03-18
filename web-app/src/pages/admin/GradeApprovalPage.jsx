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
  Divider,
  Alert
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [bulkApproveModalVisible, setBulkApproveModalVisible] = useState(false);
  const [bulkRejectModalVisible, setBulkRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [bulkRejectForm] = Form.useForm();

  useEffect(() => {
    // Force refresh with cache busting when component mounts
    const fetchWithCacheBusting = async () => {
      setLoading(true);
      try {
        console.log('🔄 Component mounted - fetching pending grades with cache busting...');
        
        // Clear current state first
        setPendingSections([]);
        setSelectedRowKeys([]);
        
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const response = await axios.get(`/admin/grades/pending?_t=${timestamp}`);
        console.log('📊 Fresh pending grades response:', response.data);
        
        // Force state update
        setPendingSections([...response.data]);
        console.log('✅ Component mounted with', response.data.length, 'sections');
        
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách bảng điểm chờ duyệt';
        console.error('❌ Error fetching pending grades on mount:', errorMsg);
        message.error(errorMsg);
        setPendingSections([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWithCacheBusting();
    
    // Set up auto-refresh every 30 seconds with cache busting
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered...');
      fetchWithCacheBusting();
    }, 30000);
    
    // Cleanup function
    return () => {
      console.log('🧹 Component unmounting - clearing state...');
      clearInterval(interval);
      setPendingSections([]);
      setSelectedRowKeys([]);
    };
  }, []);

  const fetchPendingGrades = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching pending grades with cache busting...');
      
      // Clear current state first to force re-render
      setPendingSections([]);
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(`/admin/grades/pending?_t=${timestamp}`);
      console.log('📊 Pending grades response:', response.data);
      
      // Force state update
      setPendingSections([...response.data]);
      
      console.log('✅ Updated pending sections state:', response.data.length, 'sections');
      
      // Also clear selected rows when refreshing
      setSelectedRowKeys([]);
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách bảng điểm chờ duyệt';
      console.error('❌ Error fetching pending grades:', errorMsg);
      message.error(errorMsg);
      // Clear state on error too
      setPendingSections([]);
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
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải chi tiết bảng điểm';
      message.error(errorMsg);
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
      console.log('🟢 Approving grades for section:', selectedSection.section_id);
      const response = await axios.post(`/admin/sections/${selectedSection.section_id}/grades/approve`);
      
      console.log('✅ Approval successful:', response.data);
      message.success('Phê duyệt bảng điểm thành công');
      
      // Close modal first
      setApproveModalVisible(false);
      
      console.log('🔄 Refreshing pending grades after approval...');
      
      // Force refresh with cache busting
      const timestamp = Date.now();
      const refreshResponse = await axios.get(`/admin/grades/pending?_t=${timestamp}`);
      console.log('🔄 Force refresh response:', refreshResponse.data);
      
      // Clear and update state
      setPendingSections([]);
      setTimeout(() => {
        setPendingSections([...refreshResponse.data]);
        console.log('✅ State forcefully updated:', refreshResponse.data.length, 'sections');
      }, 100);
      
      // Also clear any selected rows
      setSelectedRowKeys([]);
      
    } catch (error) {
      console.error('❌ Approve error:', error.response?.data);
      message.error(error.response?.data?.error || 'Không thể phê duyệt bảng điểm');
    }
  };

  const confirmReject = async (values) => {
    try {
      console.log('🔴 Rejecting grades for section:', selectedSection.section_id, 'with reason:', values.reason);
      const response = await axios.post(`/admin/sections/${selectedSection.section_id}/grades/reject`, {
        reason: values.reason
      });
      
      console.log('✅ Rejection successful:', response.data);
      message.success('Từ chối bảng điểm thành công');
      
      // Close modal and reset form first
      setRejectModalVisible(false);
      rejectForm.resetFields();
      
      console.log('🔄 Refreshing pending grades after rejection...');
      
      // Force refresh with cache busting
      const timestamp = Date.now();
      const refreshResponse = await axios.get(`/admin/grades/pending?_t=${timestamp}`);
      console.log('🔄 Force refresh response:', refreshResponse.data);
      
      // Clear and update state
      setPendingSections([]);
      setTimeout(() => {
        setPendingSections([...refreshResponse.data]);
        console.log('✅ State forcefully updated:', refreshResponse.data.length, 'sections');
      }, 100);
      
      // Also clear any selected rows
      setSelectedRowKeys([]);
      
    } catch (error) {
      console.error('❌ Reject error:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Không thể từ chối bảng điểm';
      message.error(errorMessage);
      
      // If the error is about status, show more details
      if (error.response?.data?.current_status) {
        console.log('📊 Current grade status:', error.response.data.current_status);
        const statusInfo = error.response.data.current_status
          .map(s => `${s.status}: ${s.count}`)
          .join(', ');
        message.warning(`Trạng thái hiện tại: ${statusInfo}`);
      }
      
      // Don't close modal on error so user can try again or see the error
    }
  };

  const handleBulkApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bảng điểm');
      return;
    }
    setBulkApproveModalVisible(true);
  };

  const handleBulkReject = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bảng điểm');
      return;
    }
    bulkRejectForm.resetFields();
    setBulkRejectModalVisible(true);
  };

  const confirmBulkApprove = async () => {
    try {
      setBulkLoading(true);
      const sectionIds = selectedRowKeys.map(key => {
        const section = pendingSections.find(s => s.section_id === key);
        return section?.section_id;
      }).filter(Boolean);

      console.log('🟢 Bulk approving sections:', sectionIds);
      await axios.post('/admin/grades/bulk-approve', {
        section_ids: sectionIds
      });

      message.success(`Phê duyệt ${sectionIds.length} bảng điểm thành công`);
      setBulkApproveModalVisible(false);
      setSelectedRowKeys([]);
      console.log('🔄 Refreshing pending grades after bulk approval...');
      // Refresh the pending grades list
      await fetchPendingGrades();
    } catch (error) {
      console.error('❌ Bulk approve error:', error.response?.data);
      message.error(error.response?.data?.error || 'Không thể phê duyệt bảng điểm');
    } finally {
      setBulkLoading(false);
    }
  };

  const confirmBulkReject = async (values) => {
    try {
      setBulkLoading(true);
      const sectionIds = selectedRowKeys.map(key => {
        const section = pendingSections.find(s => s.section_id === key);
        return section?.section_id;
      }).filter(Boolean);

      console.log('🔴 Bulk rejecting sections:', sectionIds, 'with reason:', values.reason);
      await axios.post('/admin/grades/bulk-reject', {
        section_ids: sectionIds,
        reason: values.reason
      });

      message.success(`Từ chối ${sectionIds.length} bảng điểm thành công`);
      setBulkRejectModalVisible(false);
      bulkRejectForm.resetFields();
      setSelectedRowKeys([]);
      console.log('🔄 Refreshing pending grades after bulk rejection...');
      // Refresh the pending grades list
      await fetchPendingGrades();
    } catch (error) {
      console.error('❌ Bulk reject error:', error.response?.data);
      message.error(error.response?.data?.error || 'Không thể từ chối bảng điểm');
    } finally {
      setBulkLoading(false);
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
      render: (score) => {
        if (score === null || score === undefined) return '-';
        const num = Number(score);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
    },
    {
      title: 'Giữa kỳ',
      dataIndex: 'midterm',
      key: 'midterm',
      width: 100,
      align: 'center',
      render: (score) => {
        if (score === null || score === undefined) return '-';
        const num = Number(score);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'final',
      key: 'final',
      width: 100,
      align: 'center',
      render: (score) => {
        if (score === null || score === undefined) return '-';
        const num = Number(score);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
    },
    {
      title: 'Tổng (10)',
      dataIndex: 'total_10',
      key: 'total_10',
      width: 100,
      align: 'center',
      render: (score) => {
        if (score === null || score === undefined) return '-';
        const num = Number(score);
        return isNaN(num) ? '-' : <strong>{num.toFixed(2)}</strong>;
      }
    },
    {
      title: 'Tổng (4)',
      dataIndex: 'total_4',
      key: 'total_4',
      width: 100,
      align: 'center',
      render: (score) => {
        if (score === null || score === undefined) return '-';
        const num = Number(score);
        return isNaN(num) ? '-' : num.toFixed(1);
      }
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

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  };

  return (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>Duyệt Bảng điểm</span>
        </Space>
      }
      extra={
        <Button 
          onClick={fetchPendingGrades} 
          loading={loading}
          icon={<FileTextOutlined />}
        >
          Làm mới
        </Button>
      }
    >
      {selectedRowKeys.length > 0 && (
        <Alert
          message={`Đã chọn ${selectedRowKeys.length} bảng điểm`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Space>
              <Button 
                size="small" 
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleBulkApprove}
              >
                Phê duyệt tất cả
              </Button>
              <Button 
                size="small" 
                danger
                icon={<CloseOutlined />}
                onClick={handleBulkReject}
              >
                Từ chối tất cả
              </Button>
            </Space>
          }
        />
      )}

      <Table
        columns={pendingColumns}
        dataSource={pendingSections}
        rowKey="section_id"
        loading={loading}
        rowSelection={rowSelection}
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

      {/* Bulk Approve Modal */}
      <Modal
        title="Xác nhận phê duyệt hàng loạt"
        open={bulkApproveModalVisible}
        onOk={confirmBulkApprove}
        onCancel={() => setBulkApproveModalVisible(false)}
        okText="Phê duyệt"
        cancelText="Hủy"
        okButtonProps={{ icon: <CheckOutlined />, loading: bulkLoading }}
        confirmLoading={bulkLoading}
      >
        <div>
          <p>Bạn có chắc chắn muốn phê duyệt <strong>{selectedRowKeys.length} bảng điểm</strong> này?</p>
          <Alert
            message="Lưu ý"
            description="Sau khi phê duyệt, tất cả các bảng điểm sẽ được công bố cho sinh viên và không thể chỉnh sửa."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      </Modal>

      {/* Bulk Reject Modal */}
      <Modal
        title="Xác nhận từ chối hàng loạt"
        open={bulkRejectModalVisible}
        onOk={() => bulkRejectForm.submit()}
        onCancel={() => {
          setBulkRejectModalVisible(false);
          bulkRejectForm.resetFields();
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, icon: <CloseOutlined />, loading: bulkLoading }}
        confirmLoading={bulkLoading}
      >
        <div>
          <p>Bạn có chắc chắn muốn từ chối <strong>{selectedRowKeys.length} bảng điểm</strong> này?</p>
          
          <Form
            form={bulkRejectForm}
            layout="vertical"
            onFinish={confirmBulkReject}
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
                placeholder="Nhập lý do từ chối các bảng điểm này..."
              />
            </Form.Item>
          </Form>
          
          <Alert
            message="Lưu ý"
            description="Sau khi từ chối, tất cả các bảng điểm sẽ được chuyển về trạng thái nháp để giảng viên chỉnh sửa."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default GradeApprovalPage;

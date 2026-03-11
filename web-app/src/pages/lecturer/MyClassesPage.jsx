import { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Button, Modal, Empty, message } from 'antd';
import { BookOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../config/axios';

const { Option } = Select;

const MyClassesPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    semester: 'HK2',
    academic_year: '2025-2026'
  });

  useEffect(() => {
    fetchSections();
  }, [filters]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Sử dụng lecturer_id nếu có, nếu không thì dùng username
      const lecturerId = user.lecturer_id || user.username;
      
      const response = await api.get(`/lecturers/${lecturerId}/sections`, {
        params: filters
      });
      setSections(response.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải danh sách lớp giảng dạy';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showScheduleDetail = (section) => {
    setSelectedSection(section);
    setModalVisible(true);
  };

  const getDayName = (dayOfWeek) => {
    const days = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      8: 'Chủ nhật'
    };
    return days[dayOfWeek] || '';
  };

  const getPeriodLabel = (start, end) => {
    if (start >= 1 && end <= 5) return 'Sáng';
    if (start >= 6 && end <= 10) return 'Chiều';
    if (start >= 11 && end <= 15) return 'Tối';
    return '';
  };

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'section_code',
      key: 'section_code',
      width: 120,
      render: (text) => <span style={{ fontWeight: 600, color: '#1677ff' }}>{text}</span>
    },
    {
      title: 'Môn học',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 300
    },
    {
      title: 'TC',
      dataIndex: 'credits',
      key: 'credits',
      width: 60,
      align: 'center'
    },
    {
      title: 'Số buổi',
      key: 'schedule_count',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const scheduleCount = record.schedules?.length || 0;
        return <Tag color="blue">{scheduleCount} buổi</Tag>;
      }
    },
    {
      title: 'Sĩ số',
      key: 'enrollment',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span>{record.enrolled_count}/{record.max_capacity}</span>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => showScheduleDetail(record)}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <Card 
      title={
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          Danh sách lớp giảng dạy
        </span>
      }
    >
      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24,
        padding: '16px',
        background: '#f5f5f5',
        borderRadius: 8
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
            Năm học
          </div>
          <Select
            value={filters.academic_year}
            style={{ width: '100%' }}
            onChange={(value) => setFilters({ ...filters, academic_year: value })}
            options={[
              { value: '2024-2025', label: '2024 - 2025' },
              { value: '2025-2026', label: '2025 - 2026' },
              { value: '2026-2027', label: '2026 - 2027' },
            ]}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
            Học kỳ
          </div>
          <Select
            value={filters.semester}
            style={{ width: '100%' }}
            onChange={(value) => setFilters({ ...filters, semester: value })}
            options={[
              { value: 'HK1', label: 'Học kỳ 1' },
              { value: 'HK2', label: 'Học kỳ 2' },
              { value: 'HK3', label: 'Học kỳ 3' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={sections}
        loading={loading}
        rowKey="section_id"
        pagination={false}
        locale={{
          emptyText: <Empty description="Chưa có lớp giảng dạy trong học kỳ này" />
        }}
      />

      {/* Schedule Detail Modal */}
      <Modal
        title={
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>
              {selectedSection?.subject_name}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              Mã lớp: {selectedSection?.section_code}
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedSection && (
          <div>
            <div style={{ 
              padding: '12px 16px', 
              background: '#f5f5f5', 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: '#666' }}>TC: </span>
                  <span style={{ fontWeight: 600 }}>{selectedSection.credits}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Học kỳ: </span>
                  <span style={{ fontWeight: 600 }}>{selectedSection.semester}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Năm học: </span>
                  <span style={{ fontWeight: 600 }}>{selectedSection.academic_year}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Sĩ số: </span>
                  <span style={{ fontWeight: 600 }}>
                    {selectedSection.enrolled_count}/{selectedSection.max_capacity}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              📅 Lịch giảng dạy
            </div>

            {selectedSection.schedules && selectedSection.schedules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedSection.schedules
                  .sort((a, b) => {
                    if (a.week && b.week) return a.week - b.week;
                    return a.day_of_week - b.day_of_week;
                  })
                  .map((schedule, index) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '12px 16px',
                        background: '#e6f4ff',
                        border: '1px solid #91caff',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {schedule.week && `Tuần ${schedule.week} • `}
                          {getDayName(schedule.day_of_week)}
                        </div>
                        <div style={{ fontSize: 13, color: '#666' }}>
                          {getPeriodLabel(schedule.start_period, schedule.end_period)} • 
                          Tiết {schedule.start_period} - {schedule.end_period}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '6px 12px',
                        background: '#fff',
                        borderRadius: 6,
                        fontWeight: 600,
                        color: '#1677ff'
                      }}>
                        Phòng {schedule.room || 'TBA'}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <Empty description="Chưa có lịch giảng dạy" />
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default MyClassesPage;

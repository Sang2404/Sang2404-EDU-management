import { useEffect, useState } from 'react';
import { 
  Card, Button, Modal, Form, Select, message, Space, Pagination, Empty, Spin, Upload
} from 'antd';
import { 
  PlusOutlined, SunOutlined, CloudOutlined, MoonOutlined,
  UserOutlined, LeftOutlined, ExclamationCircleOutlined,
  UploadOutlined, DownloadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../../config/axios';
import { showImportResults } from '../../utils/importResultModal.jsx';
import './SchedulesPage.css';

const { confirm } = Modal;

const RoomSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('morning');
  const [selectedDay, setSelectedDay] = useState(2);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showOverview, setShowOverview] = useState(true);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    semester: 'HK2',
    academic_year: '2025-2026',
    week: 'week2' // Tuần 16/03 - 22/03
  });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Định nghĩa các tuần theo năm học và học kỳ
  const getWeekOptions = (academicYear, semester) => {
    const yearParts = academicYear.split('-');
    const startYear = parseInt(yearParts[0]);
    const endYear = parseInt(yearParts[1]);
    
    // Định nghĩa thời gian bắt đầu mỗi học kỳ
    const semesterStarts = {
      'HK1': { month: 8, day: 15, year: startYear }, // Tháng 8 năm đầu
      'HK2': { month: 1, day: 10, year: endYear },   // Tháng 1 năm sau
      'HK3': { month: 5, day: 15, year: endYear }    // Tháng 5 năm sau
    };
    
    const start = semesterStarts[semester];
    if (!start) return [];
    
    // Tạo 16 tuần cho mỗi học kỳ
    const weeks = [];
    for (let i = 0; i < 16; i++) {
      const weekStart = new Date(start.year, start.month - 1, start.day + (i * 7));
      const weekEnd = new Date(start.year, start.month - 1, start.day + (i * 7) + 6);
      
      const formatDate = (date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      };
      
      weeks.push({
        value: `week${i + 1}`,
        label: `Từ ${formatDate(weekStart)} đến ${formatDate(weekEnd)}`
      });
    }
    
    return weeks;
  };

  const weekOptions = getWeekOptions(filters.academic_year, filters.semester);

  const pageSize = 24;
  const allRooms = [
    ...Array.from({ length: 10 }, (_, i) => `A${101 + i}`),
    ...Array.from({ length: 10 }, (_, i) => `B${201 + i}`),
    ...Array.from({ length: 10 }, (_, i) => `C${301 + i}`),
    ...Array.from({ length: 10 }, (_, i) => `D${401 + i}`),
    ...Array.from({ length: 10 }, (_, i) => `E${501 + i}`),
    ...Array.from({ length: 10 }, (_, i) => `G${101 + i}`),
    ...Array.from({ length: 10 }, (_, i) => `H${201 + i}`),
  ];

  const periods = {
    morning: { start: 1, end: 5, label: 'Sáng', time: '07:00 - 11:30', icon: <SunOutlined /> },
    afternoon: { start: 6, end: 10, label: 'Chiều', time: '12:30 - 17:00', icon: <CloudOutlined /> },
    evening: { start: 11, end: 15, label: 'Tối', time: '17:15 - 21:15', icon: <MoonOutlined /> }
  };

  const days = [
    { value: 2, label: 'Thứ 2', shortLabel: 'Thứ 2' },
    { value: 3, label: 'Thứ 3', shortLabel: 'Thứ 3' },
    { value: 4, label: 'Thứ 4', shortLabel: 'Thứ 4' },
    { value: 5, label: 'Thứ 5', shortLabel: 'Thứ 5' },
    { value: 6, label: 'Thứ 6', shortLabel: 'Thứ 6' },
    { value: 7, label: 'Thứ 7', shortLabel: 'Thứ 7' },
    { value: 8, label: 'Chủ nhật', shortLabel: 'Chủ Nhật' }
  ];

  useEffect(() => {
    fetchSchedules();
    fetchSections();
  }, [filters]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/schedules', { 
        params: {
          semester: filters.semester,
          academic_year: filters.academic_year
        }
      });
      setSchedules(res.data);
    } catch (error) {
      message.error('Không thể tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await api.get('/academic/course-sections', { 
        params: {
          semester: filters.semester,
          academic_year: filters.academic_year
        }
      });
      setSections(res.data);
    } catch (error) {
      // Error handling silently
    }
  };

  const getSchedulesForDayAndPeriod = (day, periodKey) => {
    const periodRange = periods[periodKey];
    const weekNumber = parseInt(filters.week.replace('week', ''));
    
    return schedules.filter(s => {
      // Lịch học phải đúng tuần, đúng thứ, và nằm HOÀN TOÀN trong khung giờ
      return s.week === weekNumber &&
             s.day_of_week === day && 
             s.period_start >= periodRange.start && 
             s.period_end <= periodRange.end;
    });
  };

  const getAvailableRoomsCount = (day, periodKey) => {
    const schedulesInPeriod = getSchedulesForDayAndPeriod(day, periodKey);
    const occupiedRooms = new Set(schedulesInPeriod.map(s => s.room));
    return allRooms.length - occupiedRooms.size;
  };

  const getRoomSchedule = (room) => {
    const periodRange = periods[selectedPeriod];
    const weekNumber = parseInt(filters.week.replace('week', ''));
    
    return schedules.find(s => {
      // Lịch học phải đúng tuần, đúng phòng, đúng thứ, và nằm HOÀN TOÀN trong khung giờ
      return s.week === weekNumber &&
             s.room === room && 
             s.day_of_week === selectedDay &&
             s.period_start >= periodRange.start && 
             s.period_end <= periodRange.end;
    });
  };

  const getRoomsByStatus = () => {
    const roomsWithStatus = allRooms.map(room => ({
      room,
      schedule: getRoomSchedule(room),
      isOccupied: !!getRoomSchedule(room)
    }));

    if (activeTab === 'available') {
      return roomsWithStatus.filter(r => !r.isOccupied);
    } else if (activeTab === 'occupied') {
      return roomsWithStatus.filter(r => r.isOccupied);
    }
    return roomsWithStatus;
  };

  const getPaginatedRooms = () => {
    const rooms = getRoomsByStatus();
    const startIndex = (currentPage - 1) * pageSize;
    return rooms.slice(startIndex, startIndex + pageSize);
  };

  const handlePeriodClick = (day, periodKey) => {
    setSelectedDay(day);
    setSelectedPeriod(periodKey);
    setShowOverview(false);
    setActiveTab('all');
    setCurrentPage(1);
  };

  const handleRoomClick = (room, schedule) => {
    setSelectedRoom(room);
    if (schedule) {
      form.setFieldsValue({
        section_id: schedule.section_id,
        period_start: schedule.period_start,
        period_end: schedule.period_end
      });
    } else {
      const periodRange = periods[selectedPeriod];
      form.setFieldsValue({
        period_start: periodRange.start,
        period_end: periodRange.end
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const existingSchedule = getRoomSchedule(selectedRoom);
      
      // Get current week number from filter
      const weekNumber = parseInt(filters.week.replace('week', ''));
      
      // Map frontend field names to backend field names
      const payload = {
        section_id: values.section_id,
        room: selectedRoom,
        day_of_week: selectedDay,
        start_period: values.period_start,
        end_period: values.period_end,
        week: weekNumber
      };
      
      if (existingSchedule) {
        await api.put(`/academic/schedules/${existingSchedule.schedule_id}`, payload);
        message.success('Cập nhật lịch học thành công');
      } else {
        await api.post('/academic/schedules', payload);
        message.success('Thêm lịch học thành công');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      message.error(error.response?.data?.error || 'Thao tác thất bại');
    }
  };

  const handleDelete = () => {
    const schedule = getRoomSchedule(selectedRoom);
    if (!schedule) return;

    confirm({
      title: 'Xác nhận xóa lịch học',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa lịch học này?</p>
          <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div><strong>Phòng:</strong> {selectedRoom}</div>
            <div><strong>Lớp:</strong> {schedule.section_code}</div>
            <div><strong>Môn:</strong> {schedule.subject_name}</div>
            <div><strong>Thời gian:</strong> {days.find(d => d.value === selectedDay)?.label} - {periods[selectedPeriod]?.label}</div>
            <div><strong>Tiết:</strong> {schedule.period_start} - {schedule.period_end}</div>
          </div>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await api.delete(`/academic/schedules/${schedule.schedule_id}`);
          message.success('Xóa lịch học thành công');
          setIsModalOpen(false);
          fetchSchedules();
        } catch (error) {
          message.error('Không thể xóa lịch học');
        }
      }
    });
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const template = [
      {
        section_code: 'TIN101-01',
        room: 'C301',
        day_of_week: 2,
        period_start: 1,
        period_end: 5,
        week: 1
      },
      {
        section_code: 'TIN102-01',
        room: 'C302',
        day_of_week: 3,
        period_start: 6,
        period_end: 10,
        week: 1
      },
      {
        section_code: 'TIN103-01',
        room: 'C303',
        day_of_week: 4,
        period_start: 11,
        period_end: 15,
        week: 2
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedules');
    
    ws['!cols'] = [
      { wch: 15 }, // section_code
      { wch: 10 }, // room
      { wch: 13 }, // day_of_week
      { wch: 13 }, // period_start
      { wch: 12 }, // period_end
      { wch: 8 }   // week
    ];
    
    XLSX.writeFile(wb, 'schedules_template.xlsx');
    message.success('Đã tải xuống file mẫu');
  };

  // Handle Excel file upload
  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        setImportLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          message.error('File Excel không có dữ liệu');
          setImportLoading(false);
          return;
        }
        
        // Send to backend with current semester and academic_year
        const response = await api.post('/admin/import/schedules', { 
          schedules: jsonData,
          semester: filters.semester,
          academic_year: filters.academic_year
        });
        
        const { results } = response.data;
        
        // Show results
        const modalShown = showImportResults(results, 'lịch học');
        if (!modalShown) {
          message.success(`Nhập thành công ${results.success.length} lịch học`);
        }
        
        setImportModalVisible(false);
        fetchSchedules();
        
      } catch (error) {
        message.error(error.response?.data?.error || 'Không thể nhập dữ liệu từ Excel');
      } finally {
        setImportLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
    return false;
  };

  const roomsData = getRoomsByStatus();
  const paginatedRooms = getPaginatedRooms();

  // Hàm tính ngày tháng cho mỗi thứ trong tuần
  const getDateForDay = (dayOfWeek) => {
    const weekNumber = parseInt(filters.week.replace('week', ''));
    const yearParts = filters.academic_year.split('-');
    const startYear = parseInt(yearParts[0]);
    const endYear = parseInt(yearParts[1]);
    
    const semesterStarts = {
      'HK1': { month: 8, day: 15, year: startYear },
      'HK2': { month: 1, day: 10, year: endYear },
      'HK3': { month: 5, day: 15, year: endYear }
    };
    
    const start = semesterStarts[filters.semester];
    if (!start) return '';
    
    // Tính ngày bắt đầu của tuần
    const weekStartDate = new Date(start.year, start.month - 1, start.day + ((weekNumber - 1) * 7));
    
    // Tính ngày cho thứ cụ thể (dayOfWeek: 2=Thứ 2, 3=Thứ 3, ..., 8=Chủ nhật)
    const dayOffset = dayOfWeek === 8 ? 6 : (dayOfWeek - 2); // Thứ 2 = 0, Thứ 3 = 1, ..., CN = 6
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + dayOffset);
    
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Render content based on view
  const renderContent = () => {
    // Overview Screen
    if (showOverview) {
      return (
        <Card
          extra={
            <Button 
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              Nhập Excel
            </Button>
          }
        >
        <div className="schedule-filters" style={{ 
          display: 'flex', 
          gap: 16, 
          alignItems: 'flex-end',
          marginBottom: 24,
          padding: '16px 0'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
              NĂM HỌC
            </div>
            <Select
              value={filters.academic_year}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, academic_year: value, week: 'week1' })}
              options={[
                { value: '2023-2024', label: '2023 - 2024' },
                { value: '2024-2025', label: '2024 - 2025' },
                { value: '2025-2026', label: '2025 - 2026' },
                { value: '2026-2027', label: '2026 - 2027' },
              ]}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
              HỌC KỲ
            </div>
            <Select
              value={filters.semester}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, semester: value, week: 'week1' })}
              options={[
                { value: 'HK1', label: 'Học kỳ 1' },
                { value: 'HK2', label: 'Học kỳ 2' },
                { value: 'HK3', label: 'Học kỳ 3' },
              ]}
            />
          </div>

          <div style={{ flex: 2 }}>
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
              CHỌN TUẦN
            </div>
            <Select
              value={filters.week}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, week: value })}
              options={weekOptions}
            />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            marginBottom: 16,
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: 12
          }}>
            <div style={{ width: 120, fontWeight: 600, color: '#666', fontSize: 13 }}>THỜI GIAN / CA</div>
            {days.map(day => (
              <div key={day.value} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1677ff', marginBottom: 4 }}>
                  {day.shortLabel}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {getDateForDay(day.value)}
                </div>
              </div>
            ))}
          </div>

          {Object.entries(periods).map(([periodKey, period]) => (
            <div key={periodKey} style={{ 
              display: 'flex', 
              gap: 16, 
              marginBottom: 16,
              alignItems: 'stretch'
            }}>
              <div style={{ 
                width: 120, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{period.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{period.label}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{period.time}</div>
              </div>
              
              {days.map(day => {
                const available = getAvailableRoomsCount(day.value, periodKey);
                const total = allRooms.length;
                return (
                  <div 
                    key={day.value}
                    style={{ 
                      flex: 1,
                      background: '#e6f4ff',
                      border: '2px solid #91caff',
                      borderRadius: 8,
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onClick={() => handlePeriodClick(day.value, periodKey)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#bae0ff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#e6f4ff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Phòng trống</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>
                      {available} / {total}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
      );
    }

    // Detail Screen
    return (
      <>
        <Card>
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => {
              setShowOverview(true);
              setActiveTab('all');
              setCurrentPage(1);
            }}
            style={{ marginBottom: 16 }}
          >
            QUAY LẠI LỊCH
          </Button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                type={activeTab === 'all' ? 'primary' : 'default'}
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              >
                Tất cả
              </Button>
              <Button
                type={activeTab === 'available' ? 'primary' : 'default'}
                onClick={() => { setActiveTab('available'); setCurrentPage(1); }}
              >
                Phòng trống
              </Button>
              <Button
                type={activeTab === 'occupied' ? 'primary' : 'default'}
                onClick={() => { setActiveTab('occupied'); setCurrentPage(1); }}
              >
                Phòng đã có lớp
              </Button>
            </div>

            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {periods[selectedPeriod].label.toUpperCase()} — {days.find(d => d.value === selectedDay)?.label.toUpperCase()}
              <div style={{ fontSize: 13, color: '#666', fontWeight: 400, marginTop: 4 }}>
                {getDateForDay(selectedDay)} • {periods[selectedPeriod].time}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : paginatedRooms.length === 0 ? (
          <Empty description="Không có phòng học nào" />
        ) : (
          <>
            <div className="rooms-grid">
              {paginatedRooms.map(({ room, schedule, isOccupied }) => (
                <div
                  key={room}
                  className={`room-card ${isOccupied ? 'occupied' : 'available'}`}
                  onClick={() => handleRoomClick(room, schedule)}
                >
                  <div className="room-card-header">
                    <div className="room-name">{room}</div>
                    <div className={`room-status-badge ${isOccupied ? 'occupied' : 'available'}`}>
                      {isOccupied ? 'ĐÃ CÓ LỚP' : 'TRỐNG'}
                    </div>
                  </div>
                  
                  <div className="room-card-body">
                    {schedule ? (
                      <div className="room-schedule-info">
                        <div className="schedule-label">HỌC PHẦN</div>
                        <div className="schedule-section-code">{schedule.section_code}</div>
                        <div className="schedule-subject-name">{schedule.subject_name}</div>
                        <div className="schedule-lecturer">
                          <UserOutlined />
                          GV: {schedule.lecturer_name}
                        </div>
                      </div>
                    ) : (
                      <div className="room-empty">
                        <PlusOutlined className="room-empty-icon" />
                        <div className="room-empty-text">Gán môn học</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                total={roomsData.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `Hiện thị ${paginatedRooms.length} trong tổng số ${total} phòng học`}
              />
            </div>
          </>
        )}
      </Card>
      
      {/* Room Assignment Modal */}
      <Modal
        title={`Phòng ${selectedRoom} - ${days.find(d => d.value === selectedDay)?.label} - ${periods[selectedPeriod]?.label}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
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
            name="section_id"
            label="Lớp học phần"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học phần' }]}
          >
            <Select
              placeholder="Chọn lớp học phần"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={sections.map(s => ({
                value: s.section_id,
                label: `${s.section_code} - ${s.subject_name} (${s.lecturer_name})`
              }))}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="period_start"
              label="Tiết bắt đầu"
              rules={[{ required: true, message: 'Vui lòng nhập tiết' }]}
              style={{ width: 200 }}
            >
              <Select
                placeholder="Chọn tiết"
                options={Array.from(
                  { length: periods[selectedPeriod].end - periods[selectedPeriod].start + 1 }, 
                  (_, i) => ({
                    value: periods[selectedPeriod].start + i,
                    label: `Tiết ${periods[selectedPeriod].start + i}`
                  })
                )}
              />
            </Form.Item>

            <Form.Item
              name="period_end"
              label="Tiết kết thúc"
              rules={[{ required: true, message: 'Vui lòng nhập tiết' }]}
              style={{ width: 200 }}
            >
              <Select
                placeholder="Chọn tiết"
                options={Array.from(
                  { length: periods[selectedPeriod].end - periods[selectedPeriod].start + 1 }, 
                  (_, i) => ({
                    value: periods[selectedPeriod].start + i,
                    label: `Tiết ${periods[selectedPeriod].start + i}`
                  })
                )}
              />
            </Form.Item>
          </Space>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Space>
              {getRoomSchedule(selectedRoom) && (
                <Button danger onClick={handleDelete}>
                  Xóa lịch học
                </Button>
              )}
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {getRoomSchedule(selectedRoom) ? 'Cập nhật' : 'Thêm lịch'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Import Excel Modal */}
      <Modal
        title="Nhập lịch học từ Excel"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <p>Tải xuống file mẫu để xem định dạng dữ liệu:</p>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
            >
              Tải file mẫu
            </Button>
          </div>
          
          <div>
            <p><strong>Cấu trúc file Excel:</strong></p>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>section_code</strong>: Mã lớp học phần (bắt buộc, phải tồn tại trong hệ thống)</li>
              <li><strong>room</strong>: Phòng học (bắt buộc, VD: A101, B201)</li>
              <li><strong>day_of_week</strong>: Thứ trong tuần (bắt buộc, 2-8, với 8 là Chủ nhật)</li>
              <li><strong>period_start</strong>: Tiết bắt đầu (bắt buộc, 1-15)</li>
              <li><strong>period_end</strong>: Tiết kết thúc (bắt buộc, 1-15)</li>
              <li><strong>week</strong>: Tuần học (bắt buộc, 1-16)</li>
            </ul>
            
            <div style={{ 
              marginTop: 12, 
              padding: 12, 
              background: '#e6f4ff', 
              border: '1px solid #91caff',
              borderRadius: 8 
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>📌 Lưu ý quan trọng:</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Khung giờ: Sáng (1-5), Chiều (6-10), Tối (11-15)</li>
                <li>Thứ: 2=Thứ 2, 3=Thứ 3, ..., 7=Thứ 7, 8=Chủ nhật</li>
                <li>Tuần: 1-16 (Tuần 1 là tuần đầu tiên của học kỳ)</li>
                <li>Lịch học sẽ được gán vào học kỳ: <strong>{filters.semester} {filters.academic_year}</strong></li>
                <li>Hệ thống tự động kiểm tra xung đột phòng học và giảng viên</li>
              </ul>
            </div>
          </div>
          
          <div>
            <p>Chọn file Excel để nhập:</p>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleExcelUpload}
              showUploadList={false}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={importLoading}
                type="primary"
                size="large"
              >
                {importLoading ? 'Đang xử lý...' : 'Chọn file Excel'}
              </Button>
            </Upload>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default RoomSchedulePage;

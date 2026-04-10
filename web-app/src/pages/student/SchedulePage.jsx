import { useState, useEffect, useContext } from 'react';
import { Card, Select, Spin, Empty, message } from 'antd';
import { SunOutlined, CloudOutlined, MoonOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import '../admin/SchedulesPage.css';
import { NotificationContext } from '../../context/NotificationContext';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [allSemesterSchedules, setAllSemesterSchedules] = useState([]); // Bộ nhớ đệm toàn bộ semester
  const [loading, setLoading] = useState(false);
  const { socket } = useContext(NotificationContext);
  const [filters, setFilters] = useState({
    semester: 'HK2',
    academic_year: '2025-2026',
    week: 'week1'
  });

  const periods = {
    morning: { start: 1, end: 5, label: 'Sáng', time: '07:00 - 11:30', icon: <SunOutlined /> },
    afternoon: { start: 6, end: 10, label: 'Chiều', time: '12:30 - 17:00', icon: <CloudOutlined /> },
    evening: { start: 11, end: 15, label: 'Tối', time: '17:15 - 21:15', icon: <MoonOutlined /> }
  };

  const days = [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
    { value: 8, label: 'Chủ Nhật' }
  ];

  // Tính ngày tháng cho mỗi thứ
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

    const weekStartDate = new Date(start.year, start.month - 1, start.day + ((weekNumber - 1) * 7));
    const dayOffset = dayOfWeek === 8 ? 6 : (dayOfWeek - 2);
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + dayOffset);

    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Tạo options cho tuần
  const getWeekOptions = (academicYear, semester) => {
    const yearParts = academicYear.split('-');
    const startYear = parseInt(yearParts[0]);
    const endYear = parseInt(yearParts[1]);

    const semesterStarts = {
      'HK1': { month: 8, day: 15, year: startYear },
      'HK2': { month: 1, day: 10, year: endYear },
      'HK3': { month: 5, day: 15, year: endYear }
    };

    const start = semesterStarts[semester];
    if (!start) return [];

    const weeks = [];
    for (let i = 0; i < 16; i++) {
      const weekStart = new Date(start.year, start.month - 1, start.day + (i * 7));
      const weekEnd = new Date(start.year, start.month - 1, start.day + (i * 7) + 6);

      const formatDate = (date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${d}/${m}`;
      };

      weeks.push({
        value: `week${i + 1}`,
        label: `Tuần ${i + 1} (${formatDate(weekStart)} - ${formatDate(weekEnd)})`
      });
    }

    return weeks;
  };

  const weekOptions = getWeekOptions(filters.academic_year, filters.semester);

  // Gọi API mỗi khi Thay đổi Học kỳ / Năm học
  useEffect(() => {
    fetchSchedules();
  }, [filters.semester, filters.academic_year]);

  // Cập nhật lại UI mỗi khi thay đổi tuần học, filter tại local không cần call API
  useEffect(() => {
    if (allSemesterSchedules.length > 0) {
      const weekNumber = parseInt(filters.week.replace('week', ''));
      setSchedules(allSemesterSchedules.filter(s => s.week === weekNumber));
    } else {
      setSchedules([]);
    }
  }, [filters.week, allSemesterSchedules]);

  // Real-time cập nhật khi Admin sửa lịch
  useEffect(() => {
    if (!socket) return;

    const handleScheduleUpdate = () => {
      console.log("⚡ Nhận tín hiệu đổi lịch từ admin, làm mới dữ liệu dưới nền...");
      message.info({
        content: "🔔 Lịch học vừa có sự thay đổi từ Giáo vụ. Đang hiển thị bản mới nhất!",
        duration: 4,
        key: 'schedule_update_toast'
      });
      fetchSchedules(false);
    };

    socket.on('schedule_updated', handleScheduleUpdate);

    return () => {
      socket.off('schedule_updated', handleScheduleUpdate);
    };
  }, [socket, filters.semester, filters.academic_year]);

  const fetchSchedules = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user || !user.student_id) {
        throw new Error('Không tìm thấy thông tin sinh viên');
      }

      // Get all schedules for the entire semester by omitting week filter
      const params = new URLSearchParams({
        semester: filters.semester,
        academic_year: filters.academic_year,
        _t: new Date().getTime() // Cache buster để vượt qua bộ đệm của trình duyệt
      });

      const schedulesResponse = await api.get(`/schedules/student/${user.student_id}?${params}`);
      const data = schedulesResponse.data || [];

      setAllSemesterSchedules(data); // Lưu full vào cache local

      // Lọc ra dữ liệu tuần hiện tại để hiển thị lần đầu
      const weekNumber = parseInt(filters.week.replace('week', ''));
      setSchedules(data.filter(s => s.week === weekNumber));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải lịch học';
      console.error(errorMsg);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Lấy lịch học cho ngày và ca cụ thể
  const getScheduleForDayAndPeriod = (day, periodKey) => {
    const periodRange = periods[periodKey];

    // Vì backend đã filter theo week rồi, chỉ cần check day và period
    return schedules.find(s =>
      s.day_of_week === day &&
      s.start_period >= periodRange.start &&
      s.start_period <= periodRange.end
    );
  };

  // Màu sắc theo ca học
  const getPeriodColor = (periodKey) => {
    const colors = {
      morning: { bg: '#e6f4ff', border: '#91caff' },    // Xanh nhạt
      afternoon: { bg: '#fff7e6', border: '#ffd591' },  // Vàng nhạt
      evening: { bg: '#f9f0ff', border: '#d3adf7' }     // Tím nhạt
    };
    return colors[periodKey];
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title="📅 Thời khóa biểu"
    >
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        padding: '16px 0'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
            Năm học
          </div>
          <Select
            value={filters.academic_year}
            style={{ width: '100%' }}
            onChange={(value) => setFilters({ ...filters, academic_year: value, week: 'week1' })}
            aria-label="Chọn năm học"
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
            onChange={(value) => setFilters({ ...filters, semester: value, week: 'week1' })}
            aria-label="Chọn học kỳ"
            options={[
              { value: 'HK1', label: 'Học kỳ 1' },
              { value: 'HK2', label: 'Học kỳ 2' },
              { value: 'HK3', label: 'Học kỳ 3' },
            ]}
          />
        </div>

        <div style={{ flex: 2 }}>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
            Chọn tuần
          </div>
          <Select
            value={filters.week}
            style={{ width: '100%' }}
            onChange={(value) => setFilters({ ...filters, week: value })}
            aria-label="Chọn tuần học"
            options={weekOptions}
          />
        </div>
      </div>

      {/* Schedule Table */}
      <div style={{ marginTop: 24 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 16,
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: 12
        }}>
          <div style={{ width: 100, fontWeight: 600, color: '#666', fontSize: 13 }}>Ca học</div>
          {days.map(day => (
            <div key={day.value} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1677ff', marginBottom: 4 }}>
                {day.label}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {getDateForDay(day.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {Object.entries(periods).map(([periodKey, period]) => (
          <div key={periodKey} style={{
            display: 'flex',
            gap: 16,
            marginBottom: 16,
            alignItems: 'stretch'
          }}>
            {/* Period Label */}
            <div style={{
              width: 100,
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
              <div style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>{period.time}</div>
            </div>

            {/* Schedule Cells */}
            {days.map(day => {
              const schedule = getScheduleForDayAndPeriod(day.value, periodKey);
              const colors = getPeriodColor(periodKey);

              return (
                <div
                  key={day.value}
                  style={{
                    flex: 1,
                    background: schedule ? colors.bg : '#fafafa',
                    border: schedule ? `2px solid ${colors.border}` : '2px dashed #d9d9d9',
                    borderRadius: 8,
                    padding: '12px',
                    minHeight: '110px',
                    maxHeight: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    overflow: 'hidden'
                  }}
                >
                  {schedule ? (
                    <>
                      <div style={{
                        fontSize: 11,
                        color: '#666',
                        marginBottom: 4,
                        fontWeight: 600
                      }}>
                        {schedule.section_code}
                      </div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: '#1677ff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {schedule.subject_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 3 }}>
                        Phòng: {schedule.room}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        GV: {schedule.lecturer_name}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {schedules.length === 0 && !loading && (
        <Empty
          description="Bạn chưa đăng ký lớp học phần nào"
          style={{ marginTop: 50 }}
        />
      )}
    </Card>
  );
};

export default SchedulePage;

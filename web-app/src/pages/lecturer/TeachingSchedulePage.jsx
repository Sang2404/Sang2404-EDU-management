import { useState, useEffect } from 'react';
import { Card, Select, Empty, Spin, message } from 'antd';
import api from '../../config/axios';

const { Option } = Select;

const TeachingSchedulePage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    semester: 'HK2',
    academic_year: '2025-2026',
    week: 1
  });

  useEffect(() => {
    fetchSections();
  }, [filters]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/lecturers/${user.username}/sections`, {
        params: {
          semester: filters.semester,
          academic_year: filters.academic_year
        }
      });
      setSections(response.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể tải lịch giảng dạy';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = {
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7',
      8: 'Chủ Nhật'
    };
    return days[dayNum] || '';
  };

  const getDateForDay = (dayOfWeek) => {
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
    
    const weekStartDate = new Date(start.year, start.month - 1, start.day + ((filters.week - 1) * 7));
    const dayOffset = dayOfWeek === 8 ? 6 : (dayOfWeek - 2);
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + dayOffset);
    
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getSchedulesForDayAndPeriod = (day, periodType) => {
    const periodRanges = {
      morning: { start: 1, end: 5 },
      afternoon: { start: 6, end: 10 },
      evening: { start: 11, end: 15 }
    };
    
    const range = periodRanges[periodType];
    const schedules = [];
    
    sections.forEach(section => {
      if (section.schedules && section.schedules.length > 0) {
        section.schedules.forEach(schedule => {
          if (
            schedule.week === filters.week &&
            schedule.day_of_week === day &&
            schedule.start_period >= range.start &&
            schedule.end_period <= range.end
          ) {
            schedules.push({
              ...schedule,
              section_code: section.section_code,
              subject_name: section.subject_name
            });
          }
        });
      }
    });
    
    return schedules;
  };

  const getPeriodColor = (periodType) => {
    const colors = {
      morning: { bg: '#e6f4ff', border: '#91caff', text: '#0958d9' },
      afternoon: { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' },
      evening: { bg: '#f9f0ff', border: '#d3adf7', text: '#531dab' }
    };
    return colors[periodType];
  };

  const days = [2, 3, 4, 5, 6, 7, 8];
  const periods = [
    { key: 'morning', label: 'Sáng', time: '07:00 - 11:30' },
    { key: 'afternoon', label: 'Chiều', time: '12:30 - 17:00' },
    { key: 'evening', label: 'Tối', time: '17:15 - 21:15' }
  ];

  const getWeekOptions = () => {
    const weeks = [];
    for (let i = 1; i <= 16; i++) {
      weeks.push({ value: i, label: `Tuần ${i}` });
    }
    return weeks;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải lịch giảng dạy...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="📅 Lịch dạy">
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
          >
            <Option value="2024-2025">2024 - 2025</Option>
            <Option value="2025-2026">2025 - 2026</Option>
            <Option value="2026-2027">2026 - 2027</Option>
          </Select>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
            Học kỳ
          </div>
          <Select
            value={filters.semester}
            style={{ width: '100%' }}
            onChange={(value) => setFilters({ ...filters, semester: value })}
          >
            <Option value="HK1">Học kỳ 1</Option>
            <Option value="HK2">Học kỳ 2</Option>
            <Option value="HK3">Học kỳ 3</Option>
          </Select>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#666' }}>
            Chọn tuần
          </div>
          <Select
            value={filters.week}
            style={{ width: '100%' }}
            onChange={(value) => setFilters({ ...filters, week: value })}
            options={getWeekOptions()}
          />
        </div>
      </div>

      {/* Schedule Grid */}
      <div>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 16,
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: 12
        }}>
          <div style={{ width: 80, fontWeight: 600, color: '#666', fontSize: 13 }}>Ca học</div>
          {days.map(day => (
            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1677ff', marginBottom: 4 }}>
                {getDayName(day)}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {getDateForDay(day)}
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {periods.map(period => {
          const colors = getPeriodColor(period.key);
          
          return (
            <div key={period.key} style={{ 
              display: 'flex', 
              gap: 12, 
              marginBottom: 16,
              alignItems: 'stretch'
            }}>
              {/* Period Label */}
              <div style={{ 
                width: 80, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: 8
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{period.label}</div>
                <div style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 }}>
                  {period.time}
                </div>
              </div>
              
              {/* Schedule Cells */}
              {days.map(day => {
                const schedules = getSchedulesForDayAndPeriod(day, period.key);
                
                return (
                  <div 
                    key={day}
                    style={{ 
                      flex: 1,
                      background: schedules.length > 0 ? colors.bg : '#fafafa',
                      border: schedules.length > 0 ? `2px solid ${colors.border}` : '2px dashed #d9d9d9',
                      borderRadius: 8,
                      padding: '12px',
                      minHeight: '120px',
                      maxHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {schedules.length > 0 && (
                      <div>
                        <div style={{ 
                          fontSize: 11, 
                          color: '#666', 
                          marginBottom: 4,
                          fontWeight: 600
                        }}>
                          {schedules[0].section_code}
                        </div>
                        <div style={{ 
                          fontSize: 13, 
                          fontWeight: 600, 
                          marginBottom: 6,
                          color: colors.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {schedules[0].subject_name}
                        </div>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 3 }}>
                          Phòng: {schedules[0].room}
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                          Tiết {schedules[0].start_period}-{schedules[0].end_period}
                        </div>
                        {schedules.length > 1 && (
                          <div style={{ 
                            fontSize: 10, 
                            color: '#ff4d4f', 
                            marginTop: 6,
                            fontWeight: 600
                          }}>
                            ⚠️ Trùng lịch ({schedules.length} lớp)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {sections.length === 0 && !loading && (
        <Empty 
          description="Chưa có lịch giảng dạy"
          style={{ marginTop: 50 }}
        />
      )}
    </Card>
  );
};

export default TeachingSchedulePage;

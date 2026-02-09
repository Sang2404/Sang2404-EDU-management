import React, { useState, useEffect } from 'react';
import { Card, Calendar, Badge, List, Tag, Space, Select, Empty, Spin } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Option } = Select;

const TeachingSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [semesterFilter, setSemesterFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, [semesterFilter, yearFilter]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (yearFilter) params.academic_year = yearFilter;

      const response = await api.get(`/lecturers/${user.username}/sections`, { params });
      const sections = response.data.sections || [];

      // Flatten schedules from all sections
      const allSchedules = [];
      sections.forEach(section => {
        if (section.schedules && section.schedules.length > 0) {
          section.schedules.forEach(schedule => {
            allSchedules.push({
              ...schedule,
              section_code: section.section_code,
              subject_name: section.subject_name,
              semester: section.semester,
              academic_year: section.academic_year,
              enrolled_count: section.enrolled_count,
              max_capacity: section.max_capacity
            });
          });
        }
      });

      setSchedules(allSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
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

  const getDayColor = (dayOfWeek) => {
    const colors = {
      2: 'blue',
      3: 'green',
      4: 'orange',
      5: 'purple',
      6: 'cyan',
      7: 'magenta',
      8: 'red'
    };
    return colors[dayOfWeek] || 'default';
  };

  const getSchedulesForDate = (date) => {
    const dayOfWeek = date.day() === 0 ? 8 : date.day() + 1; // Convert to our format
    return schedules.filter(s => s.day_of_week === dayOfWeek);
  };

  const dateCellRender = (value) => {
    const daySchedules = getSchedulesForDate(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {daySchedules.map((schedule, index) => (
          <li key={index}>
            <Badge 
              status="processing" 
              text={
                <span style={{ fontSize: 11 }}>
                  {schedule.subject_name.substring(0, 15)}...
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const onDateSelect = (date) => {
    setSelectedDate(date);
  };

  const selectedDateSchedules = getSchedulesForDate(selectedDate);

  // Group schedules by day for weekly view
  const schedulesByDay = {};
  [2, 3, 4, 5, 6, 7, 8].forEach(day => {
    schedulesByDay[day] = schedules.filter(s => s.day_of_week === day);
  });

  return (
    <div>
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            <span>Lịch giảng dạy</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="Học kỳ"
              style={{ width: 120 }}
              allowClear
              onChange={setSemesterFilter}
            >
              <Option value="HK1">HK1</Option>
              <Option value="HK2">HK2</Option>
              <Option value="HK3">HK3</Option>
            </Select>
            <Select
              placeholder="Năm học"
              style={{ width: 150 }}
              allowClear
              onChange={setYearFilter}
            >
              <Option value="2023-2024">2023-2024</Option>
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
            </Select>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Weekly Schedule View */}
            <Card 
              title="Lịch theo tuần" 
              size="small" 
              style={{ marginBottom: 16 }}
            >
              {Object.keys(schedulesByDay).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                  {[2, 3, 4, 5, 6, 7, 8].map(day => (
                    <Card 
                      key={day}
                      size="small"
                      title={
                        <div style={{ textAlign: 'center', fontSize: 12 }}>
                          {getDayName(day)}
                        </div>
                      }
                      headStyle={{ 
                        backgroundColor: schedulesByDay[day].length > 0 ? '#f0f5ff' : '#fafafa',
                        minHeight: 40
                      }}
                      bodyStyle={{ padding: 8 }}
                    >
                      {schedulesByDay[day].length > 0 ? (
                        <List
                          size="small"
                          dataSource={schedulesByDay[day]}
                          renderItem={schedule => (
                            <List.Item style={{ padding: '4px 0', border: 'none' }}>
                              <div style={{ width: '100%' }}>
                                <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
                                  {schedule.subject_name}
                                </div>
                                <div style={{ fontSize: 10, color: '#666' }}>
                                  <ClockCircleOutlined /> Tiết {schedule.start_period}-{schedule.end_period}
                                </div>
                                {schedule.room && (
                                  <div style={{ fontSize: 10, color: '#666' }}>
                                    <EnvironmentOutlined /> {schedule.room}
                                  </div>
                                )}
                                <Tag size="small" style={{ fontSize: 9, marginTop: 2 }}>
                                  {schedule.section_code}
                                </Tag>
                              </div>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#999', fontSize: 11, padding: 8 }}>
                          Không có lịch
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty description="Chưa có lịch giảng dạy" />
              )}
            </Card>

            {/* Calendar View */}
            <Card title="Lịch theo tháng" size="small">
              <Calendar 
                dateCellRender={dateCellRender}
                onSelect={onDateSelect}
              />
            </Card>

            {/* Selected Date Details */}
            {selectedDateSchedules.length > 0 && (
              <Card 
                title={`Lịch ngày ${selectedDate.format('DD/MM/YYYY')} - ${getDayName(selectedDate.day() === 0 ? 8 : selectedDate.day() + 1)}`}
                size="small"
                style={{ marginTop: 16 }}
              >
                <List
                  dataSource={selectedDateSchedules}
                  renderItem={schedule => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color={getDayColor(schedule.day_of_week)}>
                              {getDayName(schedule.day_of_week)}
                            </Tag>
                            <span>{schedule.subject_name}</span>
                            <Tag>{schedule.section_code}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <span>
                              <ClockCircleOutlined /> Tiết {schedule.start_period} - {schedule.end_period}
                            </span>
                            {schedule.room && (
                              <span>
                                <EnvironmentOutlined /> Phòng: {schedule.room}
                              </span>
                            )}
                            <span>
                              Sĩ số: {schedule.enrolled_count}/{schedule.max_capacity}
                            </span>
                            <span>
                              {schedule.semester} - {schedule.academic_year}
                            </span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default TeachingSchedulePage;

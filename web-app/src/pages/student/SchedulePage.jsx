import React from 'react';
import { Card, Typography, Empty, Calendar, Badge, List, Tag, Space, Spin } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, BookOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import api from '../../config/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title } = Typography;

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get student's enrolled sections
      const sectionsResponse = await api.get(`/academic/students/${user.username}/sections`);
      const sections = sectionsResponse.data || [];

      // Flatten schedules from all sections
      const allSchedules = [];
      sections.forEach(section => {
        if (section.schedules && section.schedules.length > 0) {
          section.schedules.forEach(schedule => {
            allSchedules.push({
              ...schedule,
              section_code: section.section_code,
              subject_name: section.subject_name,
              lecturer_name: section.lecturer_name,
              credits: section.credits
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
    const dayOfWeek = date.day() === 0 ? 8 : date.day() + 1;
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

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải thời khóa biểu...</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Title level={2}>
        <CalendarOutlined /> Thời khóa biểu
      </Title>

      {schedules.length === 0 ? (
        <Card>
          <Empty 
            description="Bạn chưa đăng ký lớp học phần nào"
            style={{ padding: '50px 0' }}
          />
        </Card>
      ) : (
        <>
          {/* Weekly Schedule View */}
          <Card 
            title={
              <Space>
                <BookOutlined />
                <span>Lịch học theo tuần</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {[2, 3, 4, 5, 6, 7, 8].map(day => (
                <Card 
                  key={day}
                  size="small"
                  title={
                    <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold' }}>
                      {getDayName(day)}
                    </div>
                  }
                  headStyle={{ 
                    backgroundColor: schedulesByDay[day].length > 0 ? '#e6f7ff' : '#fafafa',
                    minHeight: 40
                  }}
                  bodyStyle={{ padding: 8 }}
                >
                  {schedulesByDay[day].length > 0 ? (
                    <List
                      size="small"
                      dataSource={schedulesByDay[day]}
                      renderItem={schedule => (
                        <List.Item style={{ padding: '6px 0', border: 'none' }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#1890ff' }}>
                              {schedule.subject_name}
                            </div>
                            <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>
                              <ClockCircleOutlined /> Tiết {schedule.start_period}-{schedule.end_period}
                            </div>
                            {schedule.room && (
                              <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>
                                <EnvironmentOutlined /> {schedule.room}
                              </div>
                            )}
                            <div style={{ fontSize: 10, color: '#999' }}>
                              GV: {schedule.lecturer_name}
                            </div>
                            <Tag size="small" color="blue" style={{ fontSize: 9, marginTop: 4 }}>
                              {schedule.section_code}
                            </Tag>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#999', fontSize: 11, padding: 16 }}>
                      Không có lịch
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>

          {/* Calendar View */}
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Lịch theo tháng</span>
              </Space>
            }
          >
            <Calendar 
              dateCellRender={dateCellRender}
              onSelect={onDateSelect}
            />
          </Card>

          {/* Selected Date Details */}
          {selectedDateSchedules.length > 0 && (
            <Card 
              title={`Lịch học ngày ${selectedDate.format('DD/MM/YYYY')} - ${getDayName(selectedDate.day() === 0 ? 8 : selectedDate.day() + 1)}`}
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
                          <span style={{ fontWeight: 'bold' }}>{schedule.subject_name}</span>
                          <Tag color="blue">{schedule.section_code}</Tag>
                          <Tag>{schedule.credits} tín chỉ</Tag>
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
                            Giảng viên: {schedule.lecturer_name}
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
    </div>
  );
};

export default SchedulePage;

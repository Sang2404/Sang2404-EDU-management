import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Input,
  message, 
  Popconfirm,
  Tag,
  Space
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from '../../config/axios';

const { Option } = Select;

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [courseSections, setCourseSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  // Filter states
  const [filterSectionId, setFilterSectionId] = useState(null);

  useEffect(() => {
    fetchCourseSections();
    fetchSchedules();
  }, []);

  const fetchCourseSections = async () => {
    try {
      const response = await axios.get('/academic/course-sections');
      setCourseSections(response.data);
    } catch (error) {
      message.error('Kh├┤ng thß╗â tß║úi danh s├ích lß╗¢p hß╗ìc phß║ºn');
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Fetch all schedules by getting schedules for each section
      const response = await axios.get('/academic/course-sections');
      const sections = response.data;
      
      const allSchedules = [];
      for (const section of sections) {
        try {
          const scheduleResponse = await axios.get(`/academic/course-sections/${section.section_id}/schedules`);
          const schedulesWithSection = scheduleResponse.data.map(schedule => ({
            ...schedule,
            section_code: section.section_code,
            subject_name: section.subject_name,
            lecturer_name: section.lecturer_name,
            semester: section.semester,
            academic_year: section.academic_year
          }));
          allSchedules.push(...schedulesWithSection);
        } catch (err) {
          // Section might not have schedules yet
        }
      }
      
      setSchedules(allSchedules);
    } catch (error) {
      message.error('Kh├┤ng thß╗â tß║úi danh s├ích lß╗ïch hß╗ìc');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSchedule(record);
    form.setFieldsValue({
      section_id: record.section_id,
      day_of_week: record.day_of_week,
      start_period: record.start_period,
      end_period: record.end_period,
      room: record.room
    });
    setModalVisible(true);
  };

  const handleDelete = async (scheduleId) => {
    try {
      await axios.delete(`/academic/schedules/${scheduleId}`);
      message.success('X├│a lß╗ïch hß╗ìc th├ánh c├┤ng');
      fetchSchedules();
    } catch (error) {
      message.error(error.response?.data?.error || 'Kh├┤ng thß╗â x├│a lß╗ïch hß╗ìc');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSchedule) {
        await axios.put(`/academic/schedules/${editingSchedule.schedule_id}`, values);
        message.success('Cß║¡p nhß║¡t lß╗ïch hß╗ìc th├ánh c├┤ng');
      } else {
        await axios.post('/academic/schedules', values);
        message.success('Tß║ío lß╗ïch hß╗ìc th├ánh c├┤ng');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      message.error(error.response?.data?.error || 'C├│ lß╗ùi xß║úy ra');
    }
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

  const columns = [
    {
      title: 'M├ú lß╗¢p',
      dataIndex: 'section_code',
      key: 'section_code',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'M├┤n hß╗ìc',
      dataIndex: 'subject_name',
      key: 'subject_name',
      width: 200
    },
    {
      title: 'Giß║úng vi├¬n',
      dataIndex: 'lecturer_name',
      key: 'lecturer_name',
      width: 150
    },
    {
      title: 'Hß╗ìc kß╗│',
      key: 'semester_year',
      width: 150,
      render: (_, record) => `${record.semester} - ${record.academic_year}`
    },
    {
      title: 'Thß╗⌐',
      dataIndex: 'day_name',
      key: 'day_name',
      width: 100,
      render: (text, record) => (
        <Tag color={getDayColor(record.day_of_week)}>{text}</Tag>
      )
    },
    {
      title: 'Tiß║┐t',
      key: 'periods',
      width: 100,
      render: (_, record) => `${record.start_period} - ${record.end_period}`
    },
    {
      title: 'Ph├▓ng',
      dataIndex: 'room',
      key: 'room',
      width: 100,
      render: (text) => text || <span style={{ color: '#999' }}>Ch╞░a x├íc ─æß╗ïnh</span>
    },
    {
      title: 'Thao t├íc',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sß╗¡a
          </Button>
          <Popconfirm
            title="Bß║ín c├│ chß║»c muß╗æn x├│a lß╗ïch hß╗ìc n├áy?"
            onConfirm={() => handleDelete(record.schedule_id)}
            okText="X├│a"
            cancelText="Hß╗ºy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              X├│a
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Filter schedules
  const filteredSchedules = filterSectionId 
    ? schedules.filter(s => s.section_id === filterSectionId)
    : schedules;

  return (
    <Card 
      title={
        <Space>
          <CalendarOutlined />
          <span>Quß║ún l├╜ Lß╗ïch hß╗ìc</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Th├¬m lß╗ïch hß╗ìc
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>Lß╗ìc theo lß╗¢p:</span>
          <Select
            style={{ width: 300 }}
            placeholder="Chß╗ìn lß╗¢p hß╗ìc phß║ºn"
            allowClear
            showSearch
            optionFilterProp="children"
            value={filterSectionId}
            onChange={setFilterSectionId}
          >
            {courseSections.map(section => (
              <Option key={section.section_id} value={section.section_id}>
                {section.section_code} - {section.subject_name} ({section.semester} - {section.academic_year})
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSchedules}
        rowKey="schedule_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tß╗òng sß╗æ ${total} lß╗ïch hß╗ìc`
        }}
      />

      <Modal
        title={editingSchedule ? 'Sß╗¡a lß╗ïch hß╗ìc' : 'Th├¬m lß╗ïch hß╗ìc'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingSchedule ? 'Cß║¡p nhß║¡t' : 'Th├¬m'}
        cancelText="Hß╗ºy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="section_id"
            label="Lß╗¢p hß╗ìc phß║ºn"
            rules={[{ required: true, message: 'Vui l├▓ng chß╗ìn lß╗¢p hß╗ìc phß║ºn' }]}
          >
            <Select
              placeholder="Chß╗ìn lß╗¢p hß╗ìc phß║ºn"
              showSearch
              optionFilterProp="children"
              disabled={!!editingSchedule}
            >
              {courseSections.map(section => (
                <Option key={section.section_id} value={section.section_id}>
                  {section.section_code} - {section.subject_name} ({section.semester} - {section.academic_year})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="day_of_week"
            label="Thß╗⌐"
            rules={[{ required: true, message: 'Vui l├▓ng chß╗ìn thß╗⌐' }]}
          >
            <Select placeholder="Chß╗ìn thß╗⌐">
              <Option value={2}>Thß╗⌐ 2</Option>
              <Option value={3}>Thß╗⌐ 3</Option>
              <Option value={4}>Thß╗⌐ 4</Option>
              <Option value={5}>Thß╗⌐ 5</Option>
              <Option value={6}>Thß╗⌐ 6</Option>
              <Option value={7}>Thß╗⌐ 7</Option>
              <Option value={8}>Chß╗º nhß║¡t</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="start_period"
            label="Tiß║┐t bß║»t ─æß║ºu"
            rules={[
              { required: true, message: 'Vui l├▓ng nhß║¡p tiß║┐t bß║»t ─æß║ºu' },
              { type: 'number', min: 1, max: 15, message: 'Tiß║┐t phß║úi tß╗½ 1 ─æß║┐n 15' }
            ]}
          >
            <InputNumber 
              placeholder="Nhß║¡p tiß║┐t bß║»t ─æß║ºu (1-15)" 
              style={{ width: '100%' }}
              min={1}
              max={15}
            />
          </Form.Item>

          <Form.Item
            name="end_period"
            label="Tiß║┐t kß║┐t th├║c"
            rules={[
              { required: true, message: 'Vui l├▓ng nhß║¡p tiß║┐t kß║┐t th├║c' },
              { type: 'number', min: 1, max: 15, message: 'Tiß║┐t phß║úi tß╗½ 1 ─æß║┐n 15' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('start_period') < value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Tiß║┐t kß║┐t th├║c phß║úi lß╗¢n h╞ín tiß║┐t bß║»t ─æß║ºu'));
                },
              })
            ]}
          >
            <InputNumber 
              placeholder="Nhß║¡p tiß║┐t kß║┐t th├║c (1-15)" 
              style={{ width: '100%' }}
              min={1}
              max={15}
            />
          </Form.Item>

          <Form.Item
            name="room"
            label="Ph├▓ng hß╗ìc"
          >
            <Input placeholder="Nhß║¡p ph├▓ng hß╗ìc (VD: A101, B205)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SchedulesPage;

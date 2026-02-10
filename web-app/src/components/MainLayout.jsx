import React from 'react';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined,
  DashboardOutlined,
  BankOutlined,
  BookOutlined,
  ReadOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
    console.log('Current user:', user);
  } catch (e) {
    console.error('Error parsing user from localstorage', e);
    localStorage.removeItem('user');
  }

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Hoặc một vòng quay loading
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Định nghĩa menu dựa trên Role
  const getMenuItems = () => {
    const items = [
      // Admin menu items
      {
        key: '/admin/dashboard',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/users',
        icon: <UserOutlined />,
        label: 'Quản lý Người dùng',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/faculties',
        icon: <BankOutlined />,
        label: 'Khoa & Ngành học',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/subjects',
        icon: <BookOutlined />,
        label: 'Quản lý Môn học',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/course-sections',
        icon: <ReadOutlined />,
        label: 'Lớp học phần',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/schedules',
        icon: <CalendarOutlined />,
        label: 'Xếp lịch học',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/student-enrollment',
        icon: <TeamOutlined />,
        label: 'Gán sinh viên',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/grade-approval',
        icon: <FileTextOutlined />,
        label: 'Duyệt bảng điểm',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/academic-requests',
        icon: <FileSearchOutlined />,
        label: 'Yêu cầu học vụ',
        hidden: user.role !== 'ADMIN',
      },
      {
        key: '/admin/statistics',
        icon: <BarChartOutlined />,
        label: 'Thống kê & Báo cáo',
        hidden: user.role !== 'ADMIN',
      },
      // Lecturer menu items
      {
        key: '/lecturer/my-sections',
        icon: <BookOutlined />,
        label: 'Lớp giảng dạy',
        hidden: user.role !== 'LECTURER',
      },
      {
        key: '/lecturer/grade-entry',
        icon: <FileTextOutlined />,
        label: 'Nhập điểm',
        hidden: user.role !== 'LECTURER',
      },
      {
        key: '/lecturer/schedule',
        icon: <CalendarOutlined />,
        label: 'Lịch giảng dạy',
        hidden: user.role !== 'LECTURER',
      },
      // Student menu items
      {
        key: '/student/schedule',
        icon: <CalendarOutlined />,
        label: 'Lịch học',
        hidden: user.role !== 'STUDENT',
      },
      {
        key: '/student/courses',
        icon: <BookOutlined />,
        label: 'Lớp học phần',
        hidden: user.role !== 'STUDENT',
      },
      {
        key: '/student/grades',
        icon: <FileTextOutlined />,
        label: 'Bảng điểm',
        hidden: user.role !== 'STUDENT',
      },
      {
        key: '/student/requests',
        icon: <FileSearchOutlined />,
        label: 'Yêu cầu học vụ',
        hidden: user.role !== 'STUDENT',
      },
    ];
    return items.filter(item => !item.hidden);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ 
          height: 120, 
          padding: '20px 8px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img 
            src={collapsed ? '/logo-icon.png' : '/logo-full.png'} 
            alt="EDU Management" 
            style={{ 
              height: collapsed ? '45px' : 'auto',
              width: collapsed ? 'auto' : '100%',
              maxHeight: '120px',
              objectFit: 'contain',
              transition: 'all 0.2s'
            }} 
          />
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={[location.pathname]} 
          items={getMenuItems()} 
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
           <Title level={4} style={{ margin: '0 20px' }}>Quản lý Sinh viên</Title>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Xin chào, <strong>{user.full_name} ({user.role})</strong></span>
              <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>Đăng xuất</Button>
           </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

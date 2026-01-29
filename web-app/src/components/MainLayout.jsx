import React from 'react';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  UploadOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BankOutlined,
  BookOutlined
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
    ];
    return items.filter(item => !item.hidden);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
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

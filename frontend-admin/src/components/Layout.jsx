import React from 'react';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  OrderedListOutlined,
  NotificationOutlined,
  FileTextOutlined,
  MessageOutlined,
  PictureOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/stats',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: '/product-types',
      icon: <TagsOutlined />,
      label: '商品类型',
    },
    {
      key: '/orders',
      icon: <OrderedListOutlined />,
      label: '订单管理',
    },
    {
      key: '/announcements',
      icon: <NotificationOutlined />,
      label: '公告管理',
    },
    {
      key: '/news',
      icon: <FileTextOutlined />,
      label: '资讯管理',
    },
    {
      key: '/forums',
      icon: <MessageOutlined />,
      label: '论坛管理',
    },
    {
      key: '/carousels',
      icon: <PictureOutlined />,
      label: '轮播图管理',
    },
    {
      key: '/admins',
      icon: <TeamOutlined />,
      label: '管理员管理',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    message.success('退出登录成功');
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: '1',
        label: (
          <span>
            <UserOutlined /> 个人信息
          </span>
        ),
      },
      {
        key: '2',
        label: (
          <span onClick={handleLogout}>
            <LogoutOutlined /> 退出登录
          </span>
        ),
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.1)', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          非遗文创管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <Dropdown menu={userMenu}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{adminInfo.username || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

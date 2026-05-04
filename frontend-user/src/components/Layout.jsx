import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import { 
  HomeOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  MessageOutlined,
  NewspaperOutlined,
  LogoutOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      label: '我的订单',
      icon: <ShoppingOutlined />,
      onClick: () => navigate('/orders'),
    },
    {
      key: 'favorites',
      label: '我的收藏',
      icon: <HeartOutlined />,
      onClick: () => navigate('/favorites'),
    },
    {
      key: 'recharge',
      label: '余额充值',
      icon: <WalletOutlined />,
      onClick: () => navigate('/recharge'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/products',
      icon: <ShoppingCartOutlined />,
      label: '商品商城',
      onClick: () => navigate('/products'),
    },
    {
      key: '/forum',
      icon: <MessageOutlined />,
      label: '交流论坛',
      onClick: () => navigate('/forum'),
    },
    {
      key: '/news',
      icon: <NewspaperOutlined />,
      label: '新闻资讯',
      onClick: () => navigate('/news'),
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path.startsWith('/products')) return '/products';
    if (path.startsWith('/forum')) return '/forum';
    if (path.startsWith('/news')) return '/news';
    return '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#1890ff',
          color: 'white',
          fontSize: collapsed ? 12 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '非遗' : '非遗文创商城'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
            欢迎来到非遗文创商城
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <>
                <Badge count={0}>
                  <Button type="text" icon={<HeartOutlined style={{ fontSize: 18 }} />} onClick={() => navigate('/favorites')} />
                </Badge>
                <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                  <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar icon={<UserOutlined />} />
                    <span>{user.username}</span>
                    <span style={{ color: '#1890ff', fontSize: 12 }}>
                      余额: ¥{user.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </Dropdown>
              </>
            ) : (
              <>
                <Button type="link" onClick={() => navigate('/login')}>登录</Button>
                <Button type="primary" onClick={() => navigate('/login')}>注册</Button>
              </>
            )}
          </div>
        </Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

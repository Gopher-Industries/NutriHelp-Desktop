import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Space,
  Badge,
  Tooltip
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  HeartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FireOutlined,
  QuestionCircleOutlined,
  SecurityScanOutlined,
  SwapOutlined,
} from '../../icons/PaperIcons';
import { signOut, selectUserProfile } from '../../store/slices/authSlice';
import { setSidebarCollapsed } from '../../store/slices/appSlice';
import { setShowAccountSwitcher } from '../../store/slices/accountSwitchSlice';
import authMiddleware from '../../services/authMiddleware';
import AccountSwitcher from '../AccountSwitcher';
import '../../styles/AppLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const userProfile = useSelector(selectUserProfile);
  const { sidebarCollapsed } = useSelector(state => state.app);

 

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: '/nutrition',
      icon: <FireOutlined />,
      label: 'Nutrition Analysis'
    },
    {
      key: '/meal-plan',
      icon: <CalendarOutlined />,
      label: 'Meal Plan'
    },
    {
      key: '/recipes',
      icon: <BookOutlined />,
      label: 'Recipe Library'
    },
    {
      key: '/health',
      icon: <HeartOutlined />,
      label: 'Health Monitoring'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    {
      key: '/security',
      icon: <SecurityScanOutlined />,
      label: 'Security Center'
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: 'Help'
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      key: 'security',
      icon: <SecurityScanOutlined />,
      label: 'Security Center',
      onClick: () => navigate('/security')
    },
    {
      type: 'divider'
    },
    {
      key: 'switch-account',
      icon: <SwapOutlined />,
      label: 'Switch Account',
      onClick: () => dispatch(setShowAccountSwitcher(true))
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login page
      navigate('/login', { replace: true });
    }
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const toggleSidebar = () => {
    dispatch(setSidebarCollapsed(!sidebarCollapsed));
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.key === location.pathname);
    return currentItem?.label || 'Dashboard';
  };

  return (
    <Layout className="app-layout">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={240}
        collapsedWidth={80}
      >
        {/* Logo Area */}
        <div className="sidebar-logo">
          {sidebarCollapsed ? (
            <div className="logo-collapsed">
              <Text className="logo-letter">N</Text>
            </div>
          ) : (
            <div className="logo-expanded">
              <div className="logo-icon">
                <Text className="logo-letter">N</Text>
              </div>
              <Text className="logo-text">NutriHelp</Text>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none"
          style={{ height: 'calc(100vh - 64px)', borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header className="px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              className="header-toggle-btn"
            />
            <div>
              <Text className="header-title text-xl font-semibold">
                {getPageTitle()}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-4">


            {/* User Info */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="header-user-section flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  className="bg-gray-800"
                  icon={<UserOutlined />}
                >
                  {userProfile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <div className="hidden sm:block">
                  <Text className="header-user-name text-sm font-medium">
                    {userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User' : user?.email || 'User'}
                  </Text>
                  <br />
                  <Text className="header-user-email text-xs">
                    {user?.email || 'user@example.com'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content>
          <Outlet />
        </Content>
      </Layout>
      
      <AccountSwitcher />
    </Layout>
  );
};

export default AppLayout;
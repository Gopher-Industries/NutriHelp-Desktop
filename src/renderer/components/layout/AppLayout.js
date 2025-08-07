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
  QuestionCircleOutlined
} from '@ant-design/icons';
import { logoutUser } from '../../store/slices/authSlice';
import { setSidebarCollapsed } from '../../store/slices/appSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { sidebarCollapsed } = useSelector(state => state.app);
  const [notificationCount] = useState(3); 

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
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  function handleLogout() {
    dispatch(logoutUser());
    navigate('/login');
  }

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
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        className="bg-white shadow-lg"
        width={240}
        collapsedWidth={80}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {sidebarCollapsed ? (
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Text className="text-white font-bold text-lg">N</Text>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Text className="text-white font-bold text-lg">N</Text>
              </div>
              <Text className="text-xl font-bold text-green-600">NutriHelp</Text>
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
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              className="text-lg"
            />
            <div>
              <Text className="text-xl font-semibold text-gray-800">
                {getPageTitle()}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <Badge count={notificationCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="text-lg"
                  onClick={() => {
                    // Handle notification click
                    console.log('Show notifications');
                  }}
                />
              </Badge>
            </Tooltip>

            {/* User Info */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  className="bg-green-600"
                  icon={<UserOutlined />}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
                <div className="hidden sm:block">
                  <Text className="text-sm font-medium text-gray-800">
                    {user?.fullName || 'User'}
                  </Text>
                  <br />
                  <Text className="text-xs text-gray-500">
                    {user?.email || 'user@example.com'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content className="bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
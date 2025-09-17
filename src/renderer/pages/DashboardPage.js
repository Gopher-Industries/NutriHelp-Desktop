import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Typography,
  Space,
  Dropdown,
  App,
  Tooltip,
  Badge
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CalendarOutlined,
  BarChartOutlined,
  BellOutlined,
  DashboardOutlined,
  SecurityScanOutlined,
  RobotOutlined,
  LineChartOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  SwapOutlined
} from '../../components/icons/PaperIcons';
import { signOut } from '../store/slices/authSlice';
import { setShowAccountSwitcher } from '../store/slices/accountSwitchSlice';
import authMiddleware from '../services/authMiddleware';
import SecurityCenterPage from './SecurityCenterPage';
import ProfilePage from './ProfilePage';
import AccountSwitcher from '../components/AccountSwitcher';
import {
  getUnreadCount,
  selectUnreadCount,
  refreshForAccountSwitch,
  fetchNotifications
} from '../store/slices/notificationSlice';
import { selectUserProfile, fetchUserProfile } from '../store/slices/authSlice';
import { selectGeneralSettings } from '../store/slices/settingsSlice';
import '../styles/DashboardPage.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const userProfile = useSelector(selectUserProfile);
  const unreadCount = useSelector(selectUnreadCount);
  const generalSettings = useSelector(selectGeneralSettings);
  const userRole = userProfile?.role;

  const [currentTime, setCurrentTime] = useState(new Date());
  const { message } = App.useApp();

  const [coreModules] = useState([
    {
      id: 'nutrition-analysis',
      title: 'Nutrition Analysis',
      description: 'Food Database, Nutrition Tracking, Reports',
      icon: <BarChartOutlined />,
      path: '/nutrition-analysis',
      features: ['Food Nutrition Query', 'Meal Nutrition Analysis', 'Nutrition Intake Tracking', 'Nutrition Report Generation']
    },
    {
      id: 'meal-planning',
      title: 'Meal Planning',
      description: 'Personalized Plans, Recipes, Shopping Lists',
      icon: <CalendarOutlined />,
      path: '/meal-planning',
      features: ['Personalized Meal Plans', 'Recipe Recommendations', 'Shopping List Generation', 'Meal Calendar']
    },
    {
      id: 'health-monitoring',
      title: 'Health Monitoring',
      description: 'Weight Tracking, Health Metrics, Progress',
      icon: <HeartOutlined />,
      path: '/health-monitoring',
      features: ['Weight Tracking', 'Health Indicator Recording', 'Progress Visualization', 'Health Recommendations']
    },
    {
      id: 'smart-assistant',
      title: 'Smart Assistant',
      description: 'AI Consultation, Personalized Advice, Q&A',
      icon: <RobotOutlined />,
      path: '/smart-assistant',
      features: ['AI Nutrition Consultation', 'Personalized Recommendations', 'Health Reminders', 'Q&A System']
    },
    {
      id: 'reports-analytics',
      title: 'Reports & Analytics',
      description: 'Data Insights, Trends, Performance',
      icon: <LineChartOutlined />,
      path: '/reports',
      features: ['Comprehensive Reports', 'Trend Analysis', 'Performance Metrics', 'Data Export']
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && !userProfile) {
      dispatch(fetchUserProfile());
    }
  }, [user, userProfile, dispatch]);

  useEffect(() => {
    if (user && userRole && userRole !== 'admin') {
      dispatch(getUnreadCount());
    }
  }, [user, userRole, dispatch]);

  useEffect(() => {
    if (user && userRole && userRole !== 'admin') {
      dispatch(refreshForAccountSwitch());
      dispatch(getUnreadCount());
    }
  }, [user?.id, userRole, dispatch]);





  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      message.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      message.error('Logout failed');
    }
  };

  const handleNotificationClick = () => {
    if (userRole === 'admin') {
      navigate('/admin/notifications');
    } else {
      navigate('/notifications');
    }
  };

  const userMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      type: 'divider'
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Personal Profile Management',
      onClick: () => navigate('/profile')
    },
    {
      key: '/health-records',
      icon: <HeartOutlined />,
      label: 'Health Records Setup',
      onClick: () => navigate('/health-records')
    },
    {
      key: '/security',
      icon: <SecurityScanOutlined />,
      label: 'Security',
      onClick: () => navigate('/security')
    },
    ...(userRole === 'admin' ? [
      {
        key: '/admin/notifications',
        icon: <BellOutlined />,
        label: 'Notification Management',
        onClick: () => navigate('/admin/notifications')
      }
    ] : []),
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



  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getGreeting = () => {
    const { language = 'en' } = generalSettings;
    const hour = currentTime.getHours();
    
    const greetings = {
      'en': {
        morning: 'Good Morning',
        afternoon: 'Good Afternoon', 
        evening: 'Good Evening'
      },
      'es': {
        morning: 'Buenos Días',
        afternoon: 'Buenas Tardes',
        evening: 'Buenas Noches'
      },
      'fr': {
        morning: 'Bonjour',
        afternoon: 'Bon Après-midi',
        evening: 'Bonsoir'
      },
      'de': {
        morning: 'Guten Morgen',
        afternoon: 'Guten Tag',
        evening: 'Guten Abend'
      },
      'zh': {
        morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening'
      },
      'ja': {
        morning: 'おはようございます',
        afternoon: 'こんにちは',
        evening: 'こんばんは'
      }
    };
    
    const langGreetings = greetings[language] || greetings['en'];
    
    if (hour < 12) return langGreetings.morning;
    if (hour < 17) return langGreetings.afternoon;
    return langGreetings.evening;
  };

  const renderDashboardContent = () => {
    return (
      <div className="dashboard-container">
        <div className="particles-background">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={`particle particle-${i + 1}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 12}s`
              }}
            />
          ))}
        </div>
        
        <div className="welcome-section">
          <Title level={1} className="welcome-title">
            NutriHelp Dashboard
          </Title>
          <Text className="welcome-subtitle">
            Your Gateway to Comprehensive Nutrition Management
          </Text>
        </div>

        <div className="futuristic-modules-container">
          <div className="modules-hexagon-grid">
            {coreModules.map((module, index) => (
              <div 
                key={module.id}
                className={`hexagon-module hexagon-module-${index + 1}`}
                onClick={() => navigate(module.path)}
              >
                <div className="hexagon-inner">
                  <div className="hexagon-content">
                    <div className="module-icon-futuristic">
                      {module.icon}
                      <div className="icon-glow"></div>
                    </div>
                    <div className="module-title-futuristic">
                      {module.title}
                    </div>
                    <div className="module-subtitle">
                      {module.description}
                    </div>
                    <div className="feature-count">
                      {module.features.length} Features
                    </div>
                    <div className="hover-overlay">
                      <div className="feature-preview">
                        {module.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="feature-preview-item">
                            <span className="feature-bullet">●</span>
                            {feature}
                          </div>
                        ))}
                        {module.features.length > 2 && (
                          <div className="more-features">
                            +{module.features.length - 2} more
                          </div>
                        )}
                      </div>
                      <div className="explore-arrow">→</div>
                    </div>
                  </div>
                </div>
                <div className="hexagon-border"></div>
              </div>
            ))}
          </div>
        </div>


      </div>
    );
  };

  const renderPageContent = () => {
    switch (location.pathname) {
      case '/profile':
        return <ProfilePage />;
      case '/security':
        return <SecurityCenterPage />;
      default:
        return renderDashboardContent();
    }
  };



  const formatTime = (date) => {
    const { language = 'en', timeFormat = '12h' } = generalSettings;
    
    const localeMap = {
      'en': 'en-US',
      'es': 'es-ES', 
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ja': 'ja-JP'
    };
    
    const locale = localeMap[language] || 'en-US';
    const hour12 = timeFormat === '12h';
    
    return date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: hour12
    });
  };

  const formatDate = (date) => {
    const { language = 'en', dateFormat = 'MM/DD/YYYY', firstDayOfWeek = 0 } = generalSettings;
    
    const localeMap = {
      'en': 'en-US',
      'es': 'es-ES', 
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ja': 'ja-JP'
    };
    
    const locale = localeMap[language] || 'en-US';
    
    if (dateFormat === 'DD/MM/YYYY') {
      return date.toLocaleDateString(locale, { 
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else if (dateFormat === 'YYYY-MM-DD') {
      return date.toLocaleDateString(locale, { 
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } else if (dateFormat === 'MMM DD, YYYY') {
      return date.toLocaleDateString(locale, { 
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString(locale, { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatCurrency = (amount) => {
    const { language = 'en', currency = 'USD' } = generalSettings;
    
    const localeMap = {
      'en': 'en-US',
      'es': 'es-ES', 
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ja': 'ja-JP'
    };
    
    const locale = localeMap[language] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };



  return (
    <Layout className="modern-dashboard">
      <style>
        {`
          .modern-content::-webkit-scrollbar {
            display: none;
          }
          .modern-content {
            scrollbar-width: none;
            -ms-overflow-style: none;
            overflow-y: auto;
          }
        `}
      </style>
      <Header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="brand-section">
              <img 
                src={require('../assets/images/dashboard_page/logo.png')} 
                alt="Logo" 
                className="brand-logo-img"
              />
            </div>
          </div>
          
          <div className="header-center">
            <div className="time-display" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Typography.Text className="current-time" style={{ letterSpacing: '0.5px', fontWeight: 500 }}>
                {formatTime(currentTime)}
              </Typography.Text>
              <Typography.Text className="current-date" style={{ letterSpacing: '0.3px', fontSize: '12px' }}>
                {formatDate(currentTime)}
              </Typography.Text>
            </div>
          </div>
          
          <div className="header-right">
            <Space size="medium">
              <Tooltip title="Notifications">
                <Badge count={userRole === 'admin' ? 0 : unreadCount} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={handleNotificationClick}
                    style={{
                      color: '#fff',
                      fontSize: '16px',
                      height: '40px',
                      width: '40px'
                    }}
                  />
                </Badge>
              </Tooltip>
              
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Button type="text" className="user-profile-btn">
                  <Space>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      className="user-avatar"
                    />
                    <Typography.Text className="username">
                      {userProfile && (userProfile.first_name || userProfile.last_name) 
                        ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() 
                        : user?.email || 'User'}
                    </Typography.Text>
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </div>
      </Header>

      <Content className="modern-content">
        {renderPageContent()}
      </Content>
      
      <AccountSwitcher />
    </Layout>
  );
};

export default DashboardPage;
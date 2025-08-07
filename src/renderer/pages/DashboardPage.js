import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Badge,
  Progress,
  Statistic,
  message,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
  FireOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  RightOutlined,
  StarOutlined
} from '@ant-design/icons';
import { signOut } from '../store/slices/authSlice';
import '../styles/DashboardPage.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data for demonstration
  const [dashboardData] = useState({
    todayCalories: 1850,
    targetCalories: 2200,
    protein: 85,
    targetProtein: 120,
    carbs: 220,
    targetCarbs: 275,
    fat: 65,
    targetFat: 73,
    water: 6,
    targetWater: 8,
    weight: 70.5,
    targetWeight: 68.0,
    streak: 7,
    weeklyGoal: 85
  });

  const [todayMeals] = useState([
    { name: 'Avocado Toast', time: '08:30', calories: 320, type: 'breakfast' },
    { name: 'Greek Salad', time: '12:45', calories: 450, type: 'lunch' },
    { name: 'Protein Smoothie', time: '15:30', calories: 280, type: 'snack' }
  ]);

  const [quickActions] = useState([
    { icon: <PlusOutlined />, title: 'Log Meal', color: '#52c41a', path: '/add-meal' },
    { icon: <ExperimentOutlined />, title: 'Add Water', color: '#1890ff', path: '/water' },
    { icon: <BarChartOutlined />, title: 'View Reports', color: '#722ed1', path: '/reports' },
    { icon: <CalendarOutlined />, title: 'Meal Plan', color: '#fa8c16', path: '/meal-plan' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      message.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      message.error('Logout failed');
    }
  };

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCalorieProgress = () => {
    return Math.round((dashboardData.todayCalories / dashboardData.targetCalories) * 100);
  };

  const getMacroProgress = (current, target) => {
    return Math.round((current / target) * 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout className="modern-dashboard">
      <Header className="modern-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-icon">
              <span>🥗</span>
            </div>
            <Title level={4} className="brand-title">NutriHelp</Title>
          </div>
          
          <div className="header-actions">
            <Space size="large">
              <div className="time-display">
                <Text className="current-time">{formatTime(currentTime)}</Text>
                <Text className="current-date">{formatDate(currentTime)}</Text>
              </div>
              
              <Tooltip title="Notifications">
                <Badge count={3} size="small">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    className="action-btn"
                  />
                </Badge>
              </Tooltip>
              
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="user-profile">
                  <Avatar 
                    size={40} 
                    icon={<UserOutlined />} 
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <Text className="user-name">
                      {user?.user_metadata?.firstName || 'User'}
                    </Text>
                    <Text className="user-status">Premium Member</Text>
                  </div>
                </div>
              </Dropdown>
            </Space>
          </div>
        </div>
      </Header>

      <Content className="modern-content">
        <div className="dashboard-container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="greeting-section">
                <Title level={1} className="greeting-title">
                  {getGreeting()}, {user?.user_metadata?.firstName || 'User'}!
                </Title>
                <Text className="greeting-subtitle">
                  Ready to crush your nutrition goals today?
                </Text>
              </div>
              
              <div className="daily-overview">
                <div className="overview-card calories-overview">
                  <div className="overview-icon">
                    <FireOutlined />
                  </div>
                  <div className="overview-content">
                    <Text className="overview-label">Calories Today</Text>
                    <Title level={2} className="overview-value">
                      {dashboardData.todayCalories}
                      <span className="overview-target">/{dashboardData.targetCalories}</span>
                    </Title>
                    <Progress 
                      percent={getCalorieProgress()} 
                      strokeColor="#ff6b35"
                      trailColor="rgba(255, 107, 53, 0.1)"
                      strokeWidth={6}
                      showInfo={false}
                    />
                  </div>
                </div>
                
                <div className="overview-card water-overview">
                  <div className="overview-icon">
                    <ExperimentOutlined />
                  </div>
                  <div className="overview-content">
                    <Text className="overview-label">Water Intake</Text>
                    <Title level={2} className="overview-value">
                      {dashboardData.water}
                      <span className="overview-target">/{dashboardData.targetWater} glasses</span>
                    </Title>
                    <Progress 
                      percent={getMacroProgress(dashboardData.water, dashboardData.targetWater)} 
                      strokeColor="#1890ff"
                      trailColor="rgba(24, 144, 255, 0.1)"
                      strokeWidth={6}
                      showInfo={false}
                    />
                  </div>
                </div>
                
                <div className="overview-card streak-overview">
                  <div className="overview-icon">
                    <TrophyOutlined />
                  </div>
                  <div className="overview-content">
                    <Text className="overview-label">Current Streak</Text>
                    <Title level={2} className="overview-value">
                      {dashboardData.streak}
                      <span className="overview-target">days</span>
                    </Title>
                    <div className="streak-indicator">
                      <StarOutlined className="streak-star" />
                      <Text className="streak-text">Amazing progress!</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <Title level={3} className="section-title">Quick Actions</Title>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card 
                    className="action-card"
                    hoverable
                    onClick={() => navigate(action.path)}
                  >
                    <div className="action-content">
                      <div 
                        className="action-icon"
                        style={{ backgroundColor: `${action.color}15`, color: action.color }}
                      >
                        {action.icon}
                      </div>
                      <Text className="action-title">{action.title}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Main Content Grid */}
          <Row gutter={[24, 24]} className="main-grid">
            {/* Macronutrients */}
            <Col xs={24} lg={12}>
              <Card className="macro-card" title="Macronutrients">
                <div className="macro-grid">
                  <div className="macro-item protein">
                    <div className="macro-header">
                      <ThunderboltOutlined className="macro-icon" />
                      <Text className="macro-name">Protein</Text>
                    </div>
                    <div className="macro-progress">
                      <Text className="macro-value">
                        {dashboardData.protein}g / {dashboardData.targetProtein}g
                      </Text>
                      <Progress 
                        percent={getMacroProgress(dashboardData.protein, dashboardData.targetProtein)}
                        strokeColor="#52c41a"
                        trailColor="rgba(82, 196, 26, 0.1)"
                        strokeWidth={8}
                        showInfo={false}
                      />
                    </div>
                  </div>
                  
                  <div className="macro-item carbs">
                    <div className="macro-header">
                      <HeartOutlined className="macro-icon" />
                      <Text className="macro-name">Carbs</Text>
                    </div>
                    <div className="macro-progress">
                      <Text className="macro-value">
                        {dashboardData.carbs}g / {dashboardData.targetCarbs}g
                      </Text>
                      <Progress 
                        percent={getMacroProgress(dashboardData.carbs, dashboardData.targetCarbs)}
                        strokeColor="#faad14"
                        trailColor="rgba(250, 173, 20, 0.1)"
                        strokeWidth={8}
                        showInfo={false}
                      />
                    </div>
                  </div>
                  
                  <div className="macro-item fat">
                    <div className="macro-header">
                      <ExperimentOutlined className="macro-icon" />
                      <Text className="macro-name">Fat</Text>
                    </div>
                    <div className="macro-progress">
                      <Text className="macro-value">
                        {dashboardData.fat}g / {dashboardData.targetFat}g
                      </Text>
                      <Progress 
                        percent={getMacroProgress(dashboardData.fat, dashboardData.targetFat)}
                        strokeColor="#f759ab"
                        trailColor="rgba(247, 89, 171, 0.1)"
                        strokeWidth={8}
                        showInfo={false}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Today's Meals */}
            <Col xs={24} lg={12}>
              <Card 
                className="meals-card" 
                title="Today's Meals"
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    className="add-meal-btn"
                    onClick={() => navigate('/add-meal')}
                  >
                    Add Meal
                  </Button>
                }
              >
                <div className="meals-list">
                  {todayMeals.map((meal, index) => (
                    <div key={index} className="meal-item">
                      <div className="meal-info">
                        <div className="meal-header">
                          <Text className="meal-name">{meal.name}</Text>
                          <Text className="meal-time">{meal.time}</Text>
                        </div>
                        <div className="meal-details">
                          <Text className="meal-calories">{meal.calories} cal</Text>
                          <div className={`meal-type ${meal.type}`}>
                            {meal.type}
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="text" 
                        icon={<RightOutlined />} 
                        className="meal-action"
                      />
                    </div>
                  ))}
                  
                  {todayMeals.length === 0 && (
                    <div className="empty-meals">
                      <Text type="secondary">No meals logged today</Text>
                      <Button 
                        type="link" 
                        onClick={() => navigate('/add-meal')}
                      >
                        Add your first meal
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default DashboardPage;